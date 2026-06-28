// Daily Login Reward + Streak engine.
//
// A 30-day reward cycle, reset every day at 7:00 AM Nepal Time (not midnight,
// not the browser's local midnight). Streak only advances when the user
// actually clicks "Claim Reward" - opening the app does not count.
//
// Business logic lives entirely here; the modal component just reads/calls
// these and renders the result. Coins/XP are credited through the existing
// coin engine (coinService.js) and XP ledger (xpUtils.js) so balances stay a
// single source of truth - this file never touches localStorage for those.
import { awardCoins } from "../services/coinService";
import { addXPTransaction } from "./xpUtils";
import { getActiveAccountId } from "./storageUtils";

const STATE_KEY = "prepquest_daily_login_reward";
// Fired after a successful claim so any already-mounted page (the modal lives
// outside every page's component tree) can refresh its streak/coin/XP display
// immediately instead of waiting for the next navigation.
export const DAILY_REWARD_CLAIMED_EVENT = "prepquest:daily-reward-claimed";
const CYCLE_LENGTH = 30;
const NEPAL_OFFSET_MS = (5 * 60 + 45) * 60 * 1000; // UTC+5:45
const RESET_HOUR_MS = 7 * 60 * 60 * 1000; // reset point: 7:00 AM Nepal time
const DAY_MS = 24 * 60 * 60 * 1000;
// Cap stored claim-date history so the array can't grow forever for a
// long-lived account; only recent dates are ever displayed.
const MAX_CLAIMED_DATES = 60;

export const DAILY_REWARD_CONFIG = [
  { day: 1, type: "xp", amount: 5 },
  { day: 2, type: "coins", amount: 10 },
  { day: 3, type: "coins", amount: 15 },
  { day: 4, type: "coins", amount: 20 },
  { day: 5, type: "coins", amount: 25 },
  { day: 6, type: "coins", amount: 30 },
  { day: 7, type: "coins", amount: 50 },
  { day: 8, type: "coins", amount: 20 },
  { day: 9, type: "coins", amount: 25 },
  { day: 10, type: "coins", amount: 30 },
  { day: 11, type: "coins", amount: 35 },
  { day: 12, type: "coins", amount: 40 },
  { day: 13, type: "coins", amount: 45 },
  { day: 14, type: "coins", amount: 75 },
  { day: 15, type: "coins", amount: 35 },
  { day: 16, type: "coins", amount: 40 },
  { day: 17, type: "coins", amount: 45 },
  { day: 18, type: "coins", amount: 50 },
  { day: 19, type: "coins", amount: 55 },
  { day: 20, type: "coins", amount: 60 },
  { day: 21, type: "coins", amount: 100 },
  { day: 22, type: "coins", amount: 50 },
  { day: 23, type: "coins", amount: 55 },
  { day: 24, type: "coins", amount: 60 },
  { day: 25, type: "coins", amount: 65 },
  { day: 26, type: "coins", amount: 70 },
  { day: 27, type: "coins", amount: 75 },
  { day: 28, type: "coins", amount: 125 },
  { day: 29, type: "coins", amount: 150 },
  { day: 30, type: "coins", amount: 200, badge: "30-Day Streak Champion" },
];

const DEFAULT_STATE = {
  lastClaimedRewardDate: null,
  currentStreak: 0,
  bestStreak: 0,
  currentCycleDay: 0,
  totalClaims: 0,
  claimedRewardDates: [],
};

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

/**
 * Nepal-time reward date (YYYY-MM-DD) with a 7:00 AM reset, independent of
 * the browser's own timezone. Before 7 AM Nepal time it is still "yesterday".
 *
 * Production note: this trusts the device clock, which a user can change.
 * A production deployment should compute this server-side instead.
 */
export function getNepalRewardDate(date = new Date()) {
  const shifted = new Date(date.getTime() + NEPAL_OFFSET_MS - RESET_HOUR_MS);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Whole-day gap between two "YYYY-MM-DD" reward-date keys (b - a). Infinity
// when there is no previous date (never claimed before).
function dayGap(fromKey, toKey) {
  if (!fromKey) return Infinity;
  const from = Date.parse(`${fromKey}T00:00:00Z`);
  const to = Date.parse(`${toKey}T00:00:00Z`);
  return Math.round((to - from) / DAY_MS);
}

export function getDailyRewardState() {
  return { ...DEFAULT_STATE, ...readJson(STATE_KEY, {}) };
}

function saveDailyRewardState(state) {
  writeJson(STATE_KEY, state);
}

export function getRewardForDay(cycleDay) {
  const index = Math.min(CYCLE_LENGTH, Math.max(1, cycleDay)) - 1;
  return DAILY_REWARD_CONFIG[index];
}

/** True once the 30-day cycle has actually been completed at least once. */
export function hasCompletedFullCycle(state = getDailyRewardState()) {
  return state.totalClaims >= CYCLE_LENGTH && state.currentCycleDay === CYCLE_LENGTH;
}

export function canClaimDailyReward(state = getDailyRewardState(), todayKey = getNepalRewardDate()) {
  return state.lastClaimedRewardDate !== todayKey;
}

/** Show the popup whenever today's reward hasn't been claimed yet. */
export function shouldShowDailyRewardModal() {
  return canClaimDailyReward();
}

/**
 * Pure projection: what would today's cycle day / streak become if claimed
 * right now? Does not mutate or persist anything.
 */
export function calculateStreakAfterClaim(state = getDailyRewardState(), todayKey = getNepalRewardDate()) {
  const gap = dayGap(state.lastClaimedRewardDate, todayKey);

  let currentStreak;
  let cycleDay;
  if (!state.lastClaimedRewardDate) {
    currentStreak = 1;
    cycleDay = 1;
  } else if (gap === 1) {
    currentStreak = state.currentStreak + 1;
    cycleDay = state.currentCycleDay >= CYCLE_LENGTH ? 1 : state.currentCycleDay + 1;
  } else if (gap === 0) {
    // Already claimed today - projecting "again" is a no-op preview.
    currentStreak = state.currentStreak;
    cycleDay = state.currentCycleDay;
  } else {
    // Missed one or more reward days.
    currentStreak = 1;
    cycleDay = 1;
  }

  return {
    currentStreak,
    bestStreak: Math.max(state.bestStreak, currentStreak),
    cycleDay,
    missedStreak: gap > 1,
  };
}

/** What today's reward would be without claiming it (for display). */
export function getTodayReward(state = getDailyRewardState(), todayKey = getNepalRewardDate()) {
  const projection = calculateStreakAfterClaim(state, todayKey);
  return { ...getRewardForDay(projection.cycleDay), cycleDay: projection.cycleDay };
}

/** Tomorrow's reward day/amount, for the "come back tomorrow" footer copy. */
export function getNextRewardPreview(state = getDailyRewardState(), todayKey = getNepalRewardDate()) {
  const todayProjection = calculateStreakAfterClaim(state, todayKey);
  const nextCycleDay = todayProjection.cycleDay >= CYCLE_LENGTH ? 1 : todayProjection.cycleDay + 1;
  return { ...getRewardForDay(nextCycleDay), cycleDay: nextCycleDay };
}

/**
 * 7-day window of the current cycle ("this week" of the 30-day cycle) for the
 * mini progress tracker, e.g. cycle day 3 -> days 1-7, cycle day 16 -> 15-21.
 * Each node reports its own day/reward/status so the UI never has to re-derive it.
 */
export function getMiniTrackerWeek(cycleDay) {
  const safeDay = Math.min(CYCLE_LENGTH, Math.max(1, cycleDay || 1));
  const weekStart = Math.floor((safeDay - 1) / 7) * 7 + 1;
  const weekEnd = Math.min(CYCLE_LENGTH, weekStart + 6);
  const nodes = [];
  for (let day = weekStart; day <= weekEnd; day += 1) {
    nodes.push({
      day,
      reward: getRewardForDay(day),
      status: day < safeDay ? "claimed" : day === safeDay ? "active" : "locked",
    });
  }
  return nodes;
}

/**
 * Claim today's reward. No-op (claimed: false) if already claimed today.
 * Credits coins/XP through the existing engines and persists the new streak
 * state. Caller is responsible for triggering badge re-sync/celebration
 * afterwards (same pattern every other activity-completion flow follows).
 */
export function claimDailyReward() {
  const todayKey = getNepalRewardDate();
  const state = getDailyRewardState();

  if (!canClaimDailyReward(state, todayKey)) {
    return { claimed: false, reason: "already_claimed", state, todayKey };
  }

  const projection = calculateStreakAfterClaim(state, todayKey);
  const reward = getRewardForDay(projection.cycleDay);
  const accountId = getActiveAccountId() || "anon";
  const idempotencyKey = `daily_login_reward:${accountId}:${todayKey}`;
  const reason = `Daily Login Reward - Day ${projection.cycleDay}`;

  if (reward.type === "coins") {
    awardCoins({
      amount: reward.amount,
      source: "daily_login_reward",
      sourceId: todayKey,
      reason,
      idempotencyKey,
      metadata: { cycleDay: projection.cycleDay },
    });
  } else if (reward.type === "xp") {
    addXPTransaction({
      id: idempotencyKey,
      type: "daily_login_bonus",
      amount: reward.amount,
      date: todayKey,
      source: "Daily Login Reward",
      reason,
      metadata: { cycleDay: projection.cycleDay },
    });
  }

  const claimedRewardDates = [todayKey, ...state.claimedRewardDates.filter((date) => date !== todayKey)].slice(
    0,
    MAX_CLAIMED_DATES
  );

  const nextState = {
    lastClaimedRewardDate: todayKey,
    currentStreak: projection.currentStreak,
    bestStreak: projection.bestStreak,
    currentCycleDay: projection.cycleDay,
    totalClaims: state.totalClaims + 1,
    claimedRewardDates,
  };
  saveDailyRewardState(nextState);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(DAILY_REWARD_CLAIMED_EVENT, { detail: nextState }));
  }

  return {
    claimed: true,
    reward,
    cycleDay: projection.cycleDay,
    currentStreak: projection.currentStreak,
    bestStreak: projection.bestStreak,
    isNewBest: projection.bestStreak > state.bestStreak,
    missedStreak: projection.missedStreak,
    state: nextState,
    todayKey,
  };
}

/** Best daily-login streak ever reached - used by the badge engine. */
export function getBestDailyLoginStreak() {
  return getDailyRewardState().bestStreak;
}
