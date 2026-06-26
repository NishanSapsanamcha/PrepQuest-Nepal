/**
 * Centralized coin engine. The single source of truth for the coin economy.
 *
 * Every coin change in the app MUST go through this service — components and
 * activity utils never mutate coin numbers directly. Coins are real, user-
 * specific, validated, and recorded in a transaction ledger
 * (`prepquest_coin_transactions`, wiped per-account on login so balances can
 * never leak between users — see storageUtils PER_ACCOUNT_KEYS).
 *
 * Balance is DERIVED from the transaction ledger (earn = +, spend = -); the
 * legacy `user.coins` field is kept in sync after every change purely so older
 * display code keeps working. Never trust `user.coins` as the source of truth.
 *
 * Idempotency: every reward carries a deterministic `idempotencyKey`. Awarding
 * the same key twice is a no-op, so refreshing a result page, reopening an old
 * result, or double-submitting can never duplicate coins.
 *
 * NOTE: daily-login coins are intentionally NOT implemented yet (future work).
 */
import {
  getActiveAccountId,
  getCoinTransactions,
  getUser,
  saveCoinTransactions,
  saveUser,
} from "../utils/storageUtils";

// Canonical reward amounts for the current MVP. One place to read/tune them.
export const COIN_REWARDS = {
  DAILY_QUICK_COMPLETE: 30,
  DAILY_QUICK_SCORE_BONUS: 20,
  PRACTICE_SCORE_BONUS: 20,
  RECOMMENDED_PRACTICE_BONUS: 20,
  SUBJECT_LEVEL_UP: 30,
  SUBJECT_MASTERY: 100,
  MOCK_COMPLETE: 40,
  MOCK_SCORE_BONUS: 30,
  STREAK_MILESTONES: { 3: 50, 7: 150, 15: 250, 30: 500 },
  TOURNAMENT_PARTICIPATION: 50,
  TOURNAMENT_RANK: { 1: 500, 2: 300, 3: 150 },
};

// Allowed `source` values. Earning sources + the two existing spend sources.
export const COIN_SOURCES = new Set([
  // earn
  "daily_quick_challenge",
  "practice_session",
  "recommended_practice",
  "subject_level_up",
  "subject_mastery",
  "mock_test",
  "streak_milestone",
  "friday_tournament",
  "badge_reward",
  // spend (already in the app)
  "extra_mock_unlock",
  "detailed_report_unlock",
]);

const PENDING_KEY = "prepquest_coin_reward_pending";

function readJson(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** The active (logged-in) account id, used to scope/stamp transactions. */
export function getActiveUserId() {
  return getActiveAccountId() || "";
}

/** All coin transactions for the current user, newest first. */
export function getUserCoinTransactions() {
  return getCoinTransactions();
}

/**
 * Real coin balance = sum of every ledger entry (earn +, spend -).
 * A user with no transactions has a balance of 0. Never hardcoded.
 */
export function getUserCoinBalance() {
  return getUserCoinTransactions().reduce((total, transaction) => {
    const amount = Number(transaction?.amount);
    return Number.isFinite(amount) ? total + amount : total;
  }, 0);
}

/** True if a transaction with this idempotency key (or legacy id) already exists. */
export function hasCoinTransaction(idempotencyKey) {
  if (!idempotencyKey) return false;
  return getCoinTransactions().some(
    (transaction) => transaction.idempotencyKey === idempotencyKey || transaction.id === idempotencyKey
  );
}

// Keep the legacy `user.coins` field equal to the derived ledger balance so any
// older UI still reading `user.coins` shows the real, correct number.
function syncUserCoinField() {
  const balance = Math.max(0, getUserCoinBalance());
  const user = getUser();
  if ((user.coins || 0) !== balance) {
    saveUser({ ...user, coins: balance });
  }
}

/**
 * Low-level append of a fully-formed transaction to the ledger, then re-sync
 * the legacy balance field. Prefer awardCoins() / spendCoins() over this.
 */
export function createCoinTransaction(transaction) {
  saveCoinTransactions([transaction, ...getCoinTransactions()]);
  syncUserCoinField();
  return transaction;
}

function buildKey({ idempotencyKey, source, sourceId, reason }) {
  if (idempotencyKey) return idempotencyKey;
  const userId = getActiveUserId();
  return [userId, source, sourceId, reason].filter(Boolean).join(":");
}

/**
 * Award (or, with direction "spend", deduct) coins for a completed activity.
 *
 * Validates: source is allowed, amount is a positive number, and the
 * idempotency key has not already been used. Returns
 * `{ awarded, duplicate, rejected, reason, transaction }`.
 *
 * @param {object}  params
 * @param {number}  params.amount         positive coin amount
 * @param {string}  params.source         one of COIN_SOURCES
 * @param {string}  [params.sourceId]     id of the activity (attemptId, badgeId…)
 * @param {string}  [params.reason]       human-readable reason (popup/history)
 * @param {string}  [params.idempotencyKey] stable unique key; built from
 *                                          source+sourceId when omitted
 * @param {object}  [params.metadata]
 * @param {string}  [params.createdAt]
 * @param {"earn"|"spend"} [params.direction="earn"]
 */
export function awardCoins({
  amount,
  source,
  sourceId = "",
  reason = "",
  idempotencyKey,
  metadata = {},
  createdAt,
  direction = "earn",
}) {
  const numericAmount = Number(amount);

  if (!COIN_SOURCES.has(source)) {
    return { awarded: false, duplicate: false, rejected: true, reason: "invalid_source", transaction: null };
  }
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return { awarded: false, duplicate: false, rejected: true, reason: "invalid_amount", transaction: null };
  }

  const key = buildKey({ idempotencyKey, source, sourceId, reason });
  if (hasCoinTransaction(key)) {
    return { awarded: false, duplicate: true, rejected: false, reason: "duplicate", transaction: null };
  }

  const transaction = {
    id: key,
    idempotencyKey: key,
    userId: getActiveUserId(),
    amount: direction === "spend" ? -Math.abs(numericAmount) : Math.abs(numericAmount),
    direction,
    source,
    sourceId,
    reason,
    metadata,
    date: localDateKey(),
    createdAt: createdAt || new Date().toISOString(),
  };

  createCoinTransaction(transaction);
  return { awarded: true, duplicate: false, rejected: false, reason: "", transaction };
}

/** Convenience wrapper for deductions (extra mock, detailed report, …). */
export function spendCoins({ amount, source, sourceId = "", reason = "", idempotencyKey, metadata = {} }) {
  if (getUserCoinBalance() < Number(amount)) {
    return { awarded: false, duplicate: false, rejected: true, reason: "not_enough_coins", transaction: null };
  }
  return awardCoins({ amount, source, sourceId, reason, idempotencyKey, metadata, direction: "spend" });
}

/**
 * Turn a list of attempted rewards into a single popup-ready breakdown.
 * Only rewards that were actually newly awarded (not duplicates) are included.
 *
 * @param {Array<{label:string, amount:number, awarded:boolean}>} awards
 * @returns {{ total:number, items:Array<{label:string, amount:number}> }}
 */
export function buildCoinRewardBreakdown(awards = []) {
  const earned = (awards || []).filter((item) => item && item.awarded && Number(item.amount) > 0);
  return {
    total: earned.reduce((sum, item) => sum + Number(item.amount), 0),
    items: earned.map(({ label, amount }) => ({ label, amount: Number(amount) })),
  };
}

/**
 * Stash a freshly-earned reward breakdown so the next result screen can show
 * one combined Coin Earned popup. Cleared as soon as it is consumed, so a page
 * refresh never re-shows it. No-op for empty breakdowns.
 */
export function queueCoinReward(breakdown) {
  if (!breakdown || !breakdown.total || !breakdown.items?.length) return;
  writeJson(PENDING_KEY, { ...breakdown, balance: getUserCoinBalance(), createdAt: new Date().toISOString() });
}

/** Read and clear the pending reward breakdown (used by the popup provider). */
export function consumePendingCoinReward() {
  const pending = readJson(PENDING_KEY, null);
  if (pending) localStorage.removeItem(PENDING_KEY);
  return pending;
}

export function hasPendingCoinReward() {
  return Boolean(readJson(PENDING_KEY, null));
}

/**
 * Award several reward components for one activity and queue a single combined
 * popup. Each component: { amount, source, sourceId, reason, idempotencyKey,
 * label, condition }. Components whose `condition` is false are skipped.
 * Returns the breakdown that was queued.
 */
export function awardActivityCoins(components = []) {
  const awards = components
    .filter((component) => component && component.condition !== false)
    .map((component) => {
      const result = awardCoins(component);
      return {
        label: component.label || component.reason || "Coins",
        amount: component.amount,
        awarded: result.awarded,
        transaction: result.transaction,
      };
    });
  const breakdown = buildCoinRewardBreakdown(awards);
  queueCoinReward(breakdown);
  return breakdown;
}

/**
 * The label shown for each transaction source in history/popups.
 */
export const COIN_SOURCE_LABELS = {
  daily_quick_challenge: "Daily Quick Challenge",
  practice_session: "Subject Practice",
  recommended_practice: "Recommended Practice",
  subject_level_up: "Subject Level-Up",
  subject_mastery: "Subject Mastery",
  mock_test: "Mock Test",
  streak_milestone: "Streak Milestone",
  friday_tournament: "Friday Tournament",
  badge_reward: "Badge Reward",
  extra_mock_unlock: "Extra Mock Unlock",
  detailed_report_unlock: "Detailed Report",
};

export function getCoinSourceLabel(source) {
  return COIN_SOURCE_LABELS[source] || "Coins";
}
