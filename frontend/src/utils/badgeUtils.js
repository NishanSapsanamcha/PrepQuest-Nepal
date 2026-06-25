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
import { getCompletedMockAttempts } from "./mockTestUtils";
import { getTournamentAttempts } from "./tournamentUtils";
import {
  buildSubjectCardData,
  getExamSubjects,
  getNormalizedSubjectProgress,
  normalizeExamId,
} from "./practiceUtils";
import { getPracticeHistory, getUser } from "./storageUtils";

const EARNED_KEY = "prepquest_earned_badges"; // { [id]: { earnedAt } }
const UNSEEN_KEY = "prepquest_badge_unseen"; // [id, ...] awaiting a celebration toast

// Minimum sample sizes so accuracy badges can't be won off a single question.
const MIN_SUBJECT_SAMPLE = 10;
const MIN_OVERALL_SAMPLE = 20;
const MASTERY_ACCURACY = 85;
const MASTERY_QUESTIONS = 50;

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
    constitutionSolved: subjectCards.find((c) => c.id === "constitution")?.progress.questionsSolved || 0,
    gkAccuracy: subjectAccuracy("general-knowledge"),
    constitutionAccuracy: subjectAccuracy("constitution"),
    overallAccuracy: totalAttempted >= MIN_OVERALL_SAMPLE ? overallAccuracy : 0,
    flawlessQuestions: totalWrong === 0 ? totalAttempted : 0,
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
  flawless_mind: (s) => s.flawlessQuestions,
  streak_centurion: (s) => s.longestStreak,
  omnischolar: (s) => s.masteredCount,
  tournament_apex: (s) => (s.tournamentTopOnePercent ? 1 : 0),
};

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

    if (!existing && value >= target) {
      earnedAt = today;
      status = "earned";
      store[def.id] = { earnedAt };
      unseen.add(def.id);
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
