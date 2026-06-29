import { subjectLevels } from "../data/subjectLevels";
import { rankThresholds } from "../data/gamificationMockData";

const XP_TRANSACTION_KEY = "prepquest_xp_transactions";
const VALID_XP_TYPES = new Set([
  "practice_correct_answer",
  "daily_quiz",
  "daily_quiz_bonus",
  "mock_test_complete",
  "mock_test_score_bonus",
  "tournament_participation",
  "tournament_rank_bonus",
  "daily_login_bonus",
]);

export const XP_REWARDS = {
  PRACTICE_CORRECT_ANSWER: 10,
  DAILY_QUIZ_COMPLETE: 50,
  DAILY_QUIZ_PERFECT_BONUS: 30,
  MOCK_TEST_COMPLETE: 100,
  MOCK_TEST_SCORE_BONUS: 50,
  TOURNAMENT_PARTICIPATION: 100,
  TOURNAMENT_RANK_1: 500,
  TOURNAMENT_RANK_2: 300,
  TOURNAMENT_RANK_3: 200,
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

export function getCorrectAnswerXP() {
  return XP_REWARDS.PRACTICE_CORRECT_ANSWER;
}

export function calculatePracticeQuestionXP({ isCorrect, alreadySubmitted }) {
  return isCorrect && !alreadySubmitted ? getCorrectAnswerXP() : 0;
}

export function getSubjectLevelFromXP(subjectXP = 0) {
  return subjectLevels.reduce((current, level) => (subjectXP >= level.requiredXp ? level : current), subjectLevels[0]);
}

export function getSubjectLevel(xp = 0) {
  return getSubjectLevelFromXP(xp);
}

export function getNextSubjectLevelProgress(subjectXP = 0) {
  const currentLevel = getSubjectLevelFromXP(subjectXP);
  const nextLevel = subjectLevels.find((level) => level.level === currentLevel.level + 1);

  if (!nextLevel) {
    return {
      currentLevel,
      nextLevel: null,
      currentXp: subjectXP,
      nextRequiredXp: currentLevel.requiredXp,
      progressPercent: 100,
      xpNeeded: 0,
      percent: 100,
      nextLevelXp: currentLevel.requiredXp,
      remainingXp: 0,
    };
  }

  const levelSpan = nextLevel.requiredXp - currentLevel.requiredXp;
  const earnedInLevel = subjectXP - currentLevel.requiredXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((earnedInLevel / levelSpan) * 100)));

  return {
    currentLevel,
    nextLevel,
    currentXp: subjectXP,
    nextRequiredXp: nextLevel.requiredXp,
    progressPercent,
    xpNeeded: Math.max(0, nextLevel.requiredXp - subjectXP),
    percent: progressPercent,
    nextLevelXp: nextLevel.requiredXp,
    remainingXp: Math.max(0, nextLevel.requiredXp - subjectXP),
  };
}

export function getNextLevelProgress(xp = 0) {
  return getNextSubjectLevelProgress(xp);
}

// Account-wide rank (New Aspirant -> PrepQuest Legend), distinct from the
// per-subject "Level" above. Single source of truth for rank name/progress
// so Dashboard and Profile never drift out of sync with each other.
export function getOverallRankProgress(totalXp = 0) {
  let currentIndex = 0;
  rankThresholds.forEach((rank, index) => {
    if (totalXp >= rank.xp) currentIndex = index;
  });

  const current = rankThresholds[currentIndex];
  const next = rankThresholds[currentIndex + 1] || null;
  const span = next ? next.xp - current.xp : 0;
  const percent = next ? Math.min(100, Math.max(0, Math.round(((totalXp - current.xp) / span) * 100))) : 100;

  return {
    rankIndex: currentIndex,
    level: currentIndex + 1, // account Level == rank tier (same XP ladder)
    currentRank: current.rank,
    nextRank: next ? next.rank : "Highest rank reached",
    currentRankXp: current.xp,
    nextRankXp: next ? next.xp : current.xp,
    xpToNextRank: next ? Math.max(0, next.xp - totalXp) : 0,
    percent,
  };
}

// Account-wide Level number derived from the same rank ladder. Use this anywhere
// a "Level N" is shown for the logged-in user / a leaderboard learner so it never
// disagrees with their rank name. (Per-subject levels stay separate.)
export function getAccountLevelFromXP(totalXp = 0) {
  return getOverallRankProgress(totalXp).level;
}

export function getXPTransactions() {
  return readJson(XP_TRANSACTION_KEY, []).filter(isValidXPTransaction);
}

export function saveXPTransactions(transactions) {
  writeJson(XP_TRANSACTION_KEY, transactions.filter(isValidXPTransaction));
}

export function addXPTransaction(transaction) {
  const amount = Number(transaction?.amount);
  const type = transaction?.type;
  const subjectId = transaction?.subjectId;
  const questionId = transaction?.questionId;
  const practiceSessionId = transaction?.practiceSessionId;

  if (!VALID_XP_TYPES.has(type) || !Number.isFinite(amount) || amount <= 0) {
    return { added: false, duplicate: false, transaction: null };
  }

  if (type === "practice_correct_answer" && (!subjectId || !questionId || !practiceSessionId)) {
    return { added: false, duplicate: false, transaction: null };
  }

  const transactions = getXPTransactions();
  const duplicate = type === "practice_correct_answer"
    ? transactions.some(
        (item) =>
          item.type === type &&
          item.practiceSessionId === practiceSessionId &&
          item.questionId === questionId
      )
    : type.startsWith("mock_test_")
      ? transactions.some((item) => item.id === transaction.id || (item.type === type && item.mockAttemptId === transaction.mockAttemptId))
      : transactions.some((item) => item.id === transaction.id || (item.type === type && item.date === transaction.date));

  if (duplicate) return { added: false, duplicate: true, transaction: null };

  const createdAt = transaction.createdAt || new Date().toISOString();
  const nextTransaction = {
    id: transaction.id || `xp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    amount,
    subjectId: subjectId || "",
    subjectName: transaction.subjectName || "",
    questionId: questionId || "",
    practiceSessionId: practiceSessionId || transaction.sessionId || "",
    sessionId: practiceSessionId || transaction.sessionId || "",
    date: transaction.date || "",
    source: transaction.source || "",
    reason: transaction.reason || "",
    mockAttemptId: transaction.mockAttemptId || "",
    createdAt,
    metadata: transaction.metadata || {},
  };

  saveXPTransactions([nextTransaction, ...transactions]);
  return { added: true, duplicate: false, transaction: nextTransaction };
}

export function calculateTotalXPFromTransactions() {
  return getXPTransactions().reduce((total, transaction) => total + transaction.amount, 0);
}

export function calculateSubjectXPFromTransactions(subjectId) {
  return getXPTransactions()
    .filter((transaction) => transaction.subjectId === subjectId)
    .reduce((total, transaction) => total + transaction.amount, 0);
}

export function getTotalUserXP() {
  return calculateTotalXPFromTransactions();
}

export function getSubjectXP(subjectId) {
  return calculateSubjectXPFromTransactions(subjectId);
}

export function getPracticeSessionXP(practiceSessionId) {
  return getXPTransactions()
    .filter((transaction) => transaction.practiceSessionId === practiceSessionId || transaction.sessionId === practiceSessionId)
    .reduce((total, transaction) => total + transaction.amount, 0);
}

export function getPracticeSessionXPTransactions(practiceSessionId) {
  return getXPTransactions().filter(
    (transaction) => transaction.practiceSessionId === practiceSessionId || transaction.sessionId === practiceSessionId
  );
}

export function calculateAccuracy(correct, total) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

export function calculateMaxCorrectStreak(answerRecords = []) {
  return answerRecords.reduce(
    (state, answer) => {
      const current = answer.isCorrect ? state.current + 1 : 0;
      return { current, max: Math.max(state.max, current) };
    },
    { current: 0, max: 0 }
  ).max;
}

export function calculatePracticeRewards({ correctCount }) {
  const correctAnswerXp = Math.max(0, correctCount || 0) * getCorrectAnswerXP();
  return {
    xp: {
      correctAnswerXp,
      totalXp: correctAnswerXp,
    },
    coins: {},
    summary: correctAnswerXp > 0 ? [{ label: "Correct Answers", amount: `+${correctAnswerXp} XP` }] : [],
  };
}

export function checkLevelUp(previousXp, newXp) {
  const previousLevel = getSubjectLevelFromXP(previousXp);
  const newLevel = getSubjectLevelFromXP(newXp);
  return {
    didLevelUp: newLevel.level > previousLevel.level,
    previousLevel,
    newLevel,
    unlockedPractice: newLevel.level > previousLevel.level ? newLevel.unlock : null,
  };
}

function isValidXPTransaction(transaction) {
  if (!transaction || !VALID_XP_TYPES.has(transaction.type) || !Number.isFinite(transaction.amount) || transaction.amount <= 0) {
    return false;
  }
  if (transaction.type === "practice_correct_answer") {
    return Boolean(transaction.subjectId) && Boolean(transaction.questionId) && Boolean(transaction.practiceSessionId || transaction.sessionId);
  }
  return true;
}
