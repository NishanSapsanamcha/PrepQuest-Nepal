// Badge earning engine.
//
// `mockBadges` is treated as the badge *catalog* (definition + requirement
// target). This module computes each badge's real progress from the user's
// stored activity (XP, streaks, daily quizzes, mock tests, subjects,
// tournaments), decides whether it is earned, and persists earned state +
// earned date in localStorage so a badge stays earned even if the underlying
// stat later regresses (e.g. a streak breaks).
import { mockBadges } from "../data/gamificationMockData";
import { calculateTotalXPFromTransactions } from "./xpUtils";
import { getCurrentStreak, getDailyQuizAttempts, getLocalDateKey } from "./dailyQuizUtils";
import { getBestDailyLoginStreak } from "./dailyRewardUtils";
import { getCompletedMockAttempts } from "./mockTestUtils";
import { getTournamentAttempts } from "./tournamentUtils";
import {
  buildSubjectCardData,
  getExamSubjects,
  getNormalizedSubjectProgress,
  normalizeExamId,
} from "./practiceUtils";
import {
  getActiveAccountId,
  getPracticeHistory,
  getUser,
} from "./storageUtils";
import { awardCoins } from "../services/coinService";

const EARNED_KEY = "prepquest_earned_badges"; // { [id]: { earnedAt } }
const UNSEEN_KEY = "prepquest_badge_unseen"; // [id, ...] awaiting a celebration toast
const REWARD_LOG_KEY = "prepquest_badge_rewards"; // [{ badgeId, rewardType, amount, label, appliedAt }]

// Minimum sample sizes so accuracy badges can't be won off a single question.
const MIN_SUBJECT_SAMPLE = 10;
const MIN_OVERALL_SAMPLE = 20;
const MASTERY_ACCURACY = 85;
const MASTERY_QUESTIONS = 50;
// Flawless Mind unlocks at 500 questions with this accuracy or better. Using a
// 95% gate (not literal 100%) keeps it achievable after an early mistake.
const FLAWLESS_MIN_ACCURACY = 95;

const DAY_MS = 86400000;

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / serialization errors */
  }
}

// Longest run of consecutive calendar days present in the given date keys.
function computeLongestStreak(dateKeys) {
  const unique = [...new Set(dateKeys.filter(Boolean))].sort();
  if (!unique.length) return 0;
  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i += 1) {
    const diff = Math.round((new Date(unique[i]) - new Date(unique[i - 1])) / DAY_MS);
    if (diff === 1) {
      run += 1;
      longest = Math.max(longest, run);
    } else if (diff > 1) {
      run = 1;
    }
  }
  return longest;
}

function hourOf(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date.getHours();
}

// Collect every metric the evaluators need, derived from real stored activity.
function buildBadgeStats() {
  const storedUser = getUser();
  const examId = normalizeExamId(localStorage.getItem("selectedExam") || storedUser.selectedExam);
  const subjectProgress = getNormalizedSubjectProgress();
  const subjectCards = getExamSubjects(examId).map((subject) =>
    buildSubjectCardData(subject, subjectProgress, examId)
  );

  const totalCorrect = subjectCards.reduce((sum, c) => sum + (c.progress.correctAnswers || 0), 0);
  const totalWrong = subjectCards.reduce((sum, c) => sum + (c.progress.wrongAnswers || 0), 0);
  const totalAttempted = totalCorrect + totalWrong;
  const overallAccuracy = totalAttempted ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const maxQuestionsInSubject = subjectCards.reduce((max, c) => Math.max(max, c.progress.questionsSolved || 0), 0);
  const masteredCount = subjectCards.filter(
    (c) => (c.accuracy || 0) >= MASTERY_ACCURACY && (c.progress.questionsSolved || 0) >= MASTERY_QUESTIONS
  ).length;
  const savedReviewTotal = subjectCards.reduce((sum, c) => sum + (c.savedReviewCount || 0), 0);

  const subjectAccuracy = (id) => {
    const card = subjectCards.find((c) => c.id === id);
    if (!card || (card.progress.questionsSolved || 0) < MIN_SUBJECT_SAMPLE) return 0;
    return card.accuracy || 0;
  };

  const dailyAttempts = getDailyQuizAttempts();
  const dailyDates = [...new Set(dailyAttempts.map((a) => a.date))].sort();
  const mockAttempts = getCompletedMockAttempts();
  const tournamentAttempts = getTournamentAttempts();
  const practiceHistory = getPracticeHistory();

  // Returned after a gap of 3+ missed days between two completed daily quizzes.
  let madeComeback = false;
  for (let i = 1; i < dailyDates.length; i += 1) {
    const diff = Math.round((new Date(dailyDates[i]) - new Date(dailyDates[i - 1])) / DAY_MS);
    if (diff >= 4) {
      madeComeback = true;
      break;
    }
  }

  const nightDates = new Set();
  let earlyBird = false;
  dailyAttempts.forEach((a) => {
    const h = hourOf(a.completedAt);
    if (h === null) return;
    if (h < 8) earlyBird = true;
    if (h >= 22) nightDates.add(a.date);
  });

  return {
    totalXp: calculateTotalXPFromTransactions(),
    currentStreak: getCurrentStreak(),
    longestStreak: computeLongestStreak(dailyDates),
    dailyCount: dailyAttempts.length,
    perfectDailyMax: dailyAttempts.reduce((max, a) => Math.max(max, a.correctAnswers || a.score || 0), 0),
    noMistakeRun:
      practiceHistory.some((s) => (s.wrongCount || 0) === 0 && (s.correctCount || 0) > 0) ||
      dailyAttempts.some((a) => (a.wrongAnswers || 0) === 0 && (a.correctAnswers || 0) > 0),
    earlyBird,
    nightOwlDays: nightDates.size,
    madeComeback,
    mockCount: mockAttempts.length,
    tournamentJoined: tournamentAttempts.length,
    tournamentWon: tournamentAttempts.some((a) => a.rank === 1),
    tournamentTop10: tournamentAttempts.some((a) => a.rank > 0 && a.rank <= 10),
    tournamentTopOnePercent: tournamentAttempts.some(
      (a) => a.totalParticipants > 0 && a.rank > 0 && a.rank / a.totalParticipants <= 0.01
    ),
    anyActivity: dailyAttempts.length > 0 || mockAttempts.length > 0 || practiceHistory.length > 0,
    dailyLoginBestStreak: getBestDailyLoginStreak(),
    constitutionSolved: subjectCards.find((c) => c.id === "constitution")?.progress.questionsSolved || 0,
    gkAccuracy: subjectAccuracy("general-knowledge"),
    constitutionAccuracy: subjectAccuracy("constitution"),
    overallAccuracy: totalAttempted >= MIN_OVERALL_SAMPLE ? overallAccuracy : 0,
    // Ungated accuracy + raw question volume drive the Flawless Mind gate below.
    rawOverallAccuracy: overallAccuracy,
    totalAttempted,
    maxQuestionsInSubject,
    masteredCount,
    savedReviewTotal,
  };
}

// id -> current value toward the badge's target.
const EVALUATORS = {
  first_step: (s) => (s.anyActivity ? 1 : 0),
  constitution_starter: (s) => s.constitutionSolved,
  daily_learner: (s) => s.dailyCount,
  seven_day_warrior: (s) => s.longestStreak,
  thirty_day_legend: (s) => s.longestStreak,
  mock_beginner: (s) => s.mockCount,
  mock_master: (s) => s.mockCount,
  gk_champion: (s) => s.gkAccuracy,
  constitution_expert: (s) => s.constitutionAccuracy,
  accuracy_master: (s) => s.overallAccuracy,
  friday_fighter: (s) => s.tournamentJoined,
  friday_champion: (s) => (s.tournamentWon ? 1 : 0),
  top_10_contender: (s) => (s.tournamentTop10 ? 1 : 0),
  comeback_learner: (s) => (s.madeComeback ? 1 : 0),
  subject_specialist: (s) => s.maxQuestionsInSubject,
  public_service_master: (s) => s.totalXp,
  perfect_daily: (s) => s.perfectDailyMax,
  review_hero: (s) => s.savedReviewTotal,
  no_mistake_run: (s) => (s.noMistakeRun ? 1 : 0),
  early_bird: (s) => (s.earlyBird ? 1 : 0),
  night_owl: (s) => s.nightOwlDays,
  loksewa_warrior: (s) => s.totalXp,
  rare_climber: () => 0, // no leaderboard-movement history is tracked yet
  prepquest_legend: (s) => s.totalXp,
  // Progress tracks question volume; the 95%+ accuracy requirement is enforced
  // separately via ELIGIBILITY so one early mistake can't make it impossible.
  flawless_mind: (s) => s.totalAttempted,
  streak_centurion: (s) => s.longestStreak,
  omnischolar: (s) => s.masteredCount,
  tournament_apex: (s) => (s.tournamentTopOnePercent ? 1 : 0),
  daily_login_streak_30: (s) => s.dailyLoginBestStreak,
};

// Extra unlock gates for badges whose requirement is more than "value >= target".
// A badge with an eligibility gate only unlocks when BOTH its progress reaches
// target AND the gate passes — progress can still display honestly meanwhile.
const ELIGIBILITY = {
  // Flawless Mind: 500 questions answered (the target) AND >= 95% accuracy.
  flawless_mind: (s) => s.rawOverallAccuracy >= FLAWLESS_MIN_ACCURACY,
};

// --- Reward ledger -------------------------------------------------------
// Records each badge's reward exactly once, so XP/coins/titles/frames/themes
// can never be granted twice (e.g. on a page refresh or a re-sync). This is
// the durable "applied once" source of truth for idempotency.
//
// Live-economy wiring (deliberately partial):
//   - COINS    -> credited to the real coin economy (coinTransactions + user.coins).
//                 Safe: no badge unlock condition gates on coins.
//   - XP       -> recorded only. NOT added to live total XP, because XP-based
//                 badges (PrepQuest Legend, Public Service Master, Loksewa
//                 Warrior, Accuracy/rank tiers) would risk circular unlocks.
//   - COSMETIC -> recorded only. Titles/frames/themes/auras await a profile
//                 inventory/equip system before they can be applied.

// Best-effort parse of a human reward string into structured components.
function parseReward(rewardText = "") {
  const text = String(rewardText);
  const components = [];
  const xp = text.match(/([\d,]+)\s*XP/i);
  const coins = text.match(/([\d,]+)\s*coins?/i);
  if (xp) components.push({ rewardType: "xp", amount: Number(xp[1].replace(/,/g, "")) });
  if (coins) components.push({ rewardType: "coins", amount: Number(coins[1].replace(/,/g, "")) });
  // Titles, frames, profile themes/auras have no numeric amount.
  if (!components.length && text.trim()) components.push({ rewardType: "cosmetic", amount: 0 });
  return components;
}

export function getBadgeRewardLog() {
  return readJson(REWARD_LOG_KEY, []);
}

/**
 * Credit a badge's coin reward into the live economy exactly once.
 * Idempotent on its own via a stable transaction id (one credit per badge),
 * in addition to the reward-ledger guard in applyBadgeReward(). Updates both
 * the coinTransactions ledger and the user's coin balance.
 * @returns true if a new credit was written, false if it was a no-op.
 */
function creditBadgeCoins(badge, amount) {
  if (!Number.isFinite(amount) || amount <= 0) return false;
  const userId = getActiveAccountId() || "";
  // Routed through the central coin engine so the ledger + balance stay
  // authoritative. Idempotent: one coin credit per badge, ever.
  const result = awardCoins({
    amount,
    source: "badge_reward",
    sourceId: badge.id,
    reason: `Badge reward: ${badge.name || badge.id}`,
    idempotencyKey: `${userId}:${badge.id}:coin_reward`,
    metadata: { badgeId: badge.id, badgeName: badge.name || "" },
  });
  return result.awarded;
}

/**
 * Apply a badge's reward once. The reward ledger is the source of truth for
 * idempotency: if this badge already has a ledger record, this is a no-op.
 * Coin rewards are credited live; XP and cosmetic rewards are recorded only.
 */
export function applyBadgeReward(badge) {
  if (!badge?.id) return [];
  const log = getBadgeRewardLog();
  if (log.some((entry) => entry.badgeId === badge.id)) return []; // already applied — never duplicate
  const appliedAt = new Date().toISOString();
  const entries = parseReward(badge.reward).map((component) => {
    // Only coin rewards reach the live economy for now (see header note).
    const credited = component.rewardType === "coins" && creditBadgeCoins(badge, component.amount);
    return {
      badgeId: badge.id,
      ...component,
      label: badge.reward || "",
      applied: Boolean(credited), // true only when added to the live economy (coins)
      appliedAt,
    };
  });
  if (entries.length) writeJson(REWARD_LOG_KEY, [...entries, ...log]);
  return entries;
}

/**
 * Evaluate every badge against real user data, persist newly earned badges,
 * and return the enriched catalog. Each returned badge has fully validated
 * fields: numeric value/progress/percent, status, and earnedAt.
 */
export function syncBadges() {
  const stats = buildBadgeStats();
  const store = readJson(EARNED_KEY, {});
  const unseen = new Set(readJson(UNSEEN_KEY, []));
  const today = getLocalDateKey();
  let storeChanged = false;

  const badges = mockBadges.map((def) => {
    const target = Math.max(1, Number(def.target) || 1);
    const evaluator = EVALUATORS[def.id] || (() => 0);
    const value = Math.max(0, Math.round(evaluator(stats) || 0));
    const existing = store[def.id];
    let earnedAt = existing?.earnedAt || null;
    let status = existing ? "earned" : "locked";

    const eligible = ELIGIBILITY[def.id] ? ELIGIBILITY[def.id](stats) : true;
    if (!existing && value >= target && eligible) {
      earnedAt = today;
      status = "earned";
      store[def.id] = { earnedAt };
      unseen.add(def.id);
      // Record the reward exactly once, the moment the badge is first earned
      // (also credits coin rewards to the live economy).
      applyBadgeReward({ id: def.id, name: def.name, reward: def.reward });
      storeChanged = true;
    }

    const progress = Math.min(value, target);
    const percent = Math.min(100, Math.round((value / target) * 100));

    return {
      id: def.id,
      name: def.name,
      description: def.description,
      category: def.category,
      rarity: def.rarity,
      shape: def.shape,
      iconKind: def.iconKind,
      isSecret: Boolean(def.isSecret),
      target,
      reward: def.reward,
      value,
      progress,
      percent,
      status,
      earnedAt,
    };
  });

  if (storeChanged) {
    writeJson(EARNED_KEY, store);
    writeJson(UNSEEN_KEY, [...unseen]);
  }

  return badges;
}

/** Earned badges only. */
export function getEarnedBadges(badges = syncBadges()) {
  return badges.filter((badge) => badge.status === "earned");
}

/** Locked (not-yet-earned) badges only. */
export function getLockedBadges(badges = syncBadges()) {
  return badges.filter((badge) => badge.status !== "earned");
}

// Resolve a badge argument that may be an id or a catalog/enriched object.
function resolveDef(badge) {
  if (!badge) return null;
  if (typeof badge === "string") return mockBadges.find((b) => b.id === badge) || null;
  return badge;
}

/** Real progress for one badge from live stats: { value, target, progress, percent }. */
export function getBadgeProgress(badge, stats = buildBadgeStats()) {
  const def = resolveDef(badge);
  if (!def) return { value: 0, target: 1, progress: 0, percent: 0 };
  const target = Math.max(1, Number(def.target) || 1);
  const value = Math.max(0, Math.round((EVALUATORS[def.id] || (() => 0))(stats) || 0));
  return {
    value,
    target,
    progress: Math.min(value, target),
    percent: Math.min(100, Math.round((value / target) * 100)),
  };
}

/** Whether a badge is unlocked: already earned, or meets its target + eligibility gate. */
export function isBadgeUnlocked(badge, stats = buildBadgeStats()) {
  const def = resolveDef(badge);
  if (!def) return false;
  const store = readJson(EARNED_KEY, {});
  if (store[def.id]) return true;
  const { value, target } = getBadgeProgress(def, stats);
  const eligible = ELIGIBILITY[def.id] ? ELIGIBILITY[def.id](stats) : true;
  return value >= target && eligible;
}

/**
 * Centralized entry point to run after any activity completes. Persists newly
 * earned badges (and their one-time rewards) and reports what just unlocked.
 * `activityResult` is accepted for call-site clarity / future routing; unlocks
 * are derived from the real saved progress, never from the passed payload.
 *
 *   const { badges, newlyUnlocked } = checkAndUnlockBadges({ activityType });
 */
export function checkAndUnlockBadges(/* activityResult */) {
  const before = new Set(Object.keys(readJson(EARNED_KEY, {})));
  const badges = syncBadges();
  const newlyUnlocked = badges.filter((b) => b.status === "earned" && !before.has(b.id));
  return { badges, newlyUnlocked };
}

/** The unearned badge closest to completion (for "Next Badge" widgets). */
export function getNextBadge(badges = syncBadges()) {
  const locked = badges.filter((badge) => badge.status !== "earned");
  if (!locked.length) return null;
  return locked.reduce((best, badge) => (badge.percent > best.percent ? badge : best), locked[0]);
}

/**
 * Pop the list of badges earned since the last call (for celebration toasts),
 * highest rarity first, and clear the queue. Pass the already-synced badge
 * list to avoid re-evaluating.
 */
const RARITY_ORDER = { Common: 0, Rare: 1, Epic: 2, Legendary: 3, Mythic: 4 };

export function consumeNewlyEarnedBadges(badges = syncBadges()) {
  const unseen = readJson(UNSEEN_KEY, []);
  if (!unseen.length) return [];
  writeJson(UNSEEN_KEY, []);
  const byId = new Map(badges.map((badge) => [badge.id, badge]));
  return unseen
    .map((id) => byId.get(id))
    .filter(Boolean)
    .sort((a, b) => (RARITY_ORDER[b.rarity] || 0) - (RARITY_ORDER[a.rarity] || 0));
}
