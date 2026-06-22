const keys = {
  user: "prepquest_user",
  subjectProgress: "prepquest_subject_progress",
  practiceHistory: "prepquest_practice_history",
  reviewQuestions: "prepquest_review_questions",
  lastPracticeResult: "prepquest_last_practice_result",
  xpTransactions: "prepquest_xp_transactions",
  coinTransactions: "prepquest_coin_transactions",
  rewardedSessions: "prepquest_rewarded_sessions",
};

const sampleUser = {
  name: "Prajal Danai",
  selectedExam: "Sakha Adhikrit",
  preferredLanguage: "English",
  totalXp: 1250,
  coins: 340,
  level: 5,
  rank: "Focused Learner",
  streak: 4,
  freeMocksLeft: 2,
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

export function normalizeUser(user) {
  return {
    ...sampleUser,
    ...(user || {}),
    totalXp: Number.isFinite(user?.totalXp) && user.totalXp >= 0 ? user.totalXp : sampleUser.totalXp,
    coins: Number.isFinite(user?.coins) && user.coins >= 0 ? user.coins : sampleUser.coins,
    streak: Number.isFinite(user?.streak) && user.streak >= 0 ? user.streak : sampleUser.streak,
    freeMocksLeft: Number.isFinite(user?.freeMocksLeft) && user.freeMocksLeft >= 0 ? user.freeMocksLeft : sampleUser.freeMocksLeft,
  };
}

export function normalizeSubjectProgress(progress = {}) {
  return Object.entries(progress || {}).reduce((normalized, [subjectId, subjectProgress]) => {
    const correctAnswers = Number.isFinite(subjectProgress?.correctAnswers)
      ? subjectProgress.correctAnswers
      : Number.isFinite(subjectProgress?.correct)
        ? subjectProgress.correct
        : 0;
    const wrongAnswers = Number.isFinite(subjectProgress?.wrongAnswers)
      ? subjectProgress.wrongAnswers
      : Number.isFinite(subjectProgress?.wrong)
        ? subjectProgress.wrong
        : 0;
    const questionsSolved = Number.isFinite(subjectProgress?.questionsSolved)
      ? subjectProgress.questionsSolved
      : correctAnswers + wrongAnswers;
    const xp = Number.isFinite(subjectProgress?.xp) ? subjectProgress.xp : 0;

    normalized[subjectId] = {
      xp: Math.max(0, xp),
      questionsSolved: Math.max(0, questionsSolved),
      correctAnswers: Math.max(0, correctAnswers),
      wrongAnswers: Math.max(0, wrongAnswers),
      savedForReview: Number.isFinite(subjectProgress?.savedForReview) ? Math.max(0, subjectProgress.savedForReview) : 0,
      lastPracticedAt: subjectProgress?.lastPracticedAt || null,
    };

    return normalized;
  }, {});
}

export function getUser() {
  const user = readJson(keys.user, null);
  if (user) return normalizeUser(user);

  writeJson(keys.user, sampleUser);
  localStorage.setItem("selectedExam", "sakha-adhikrit");
  localStorage.setItem("preferredLanguage", "english");
  localStorage.setItem("userName", sampleUser.name);
  return sampleUser;
}

export function saveUser(user) {
  writeJson(keys.user, normalizeUser(user));
}

export function getSubjectProgress() {
  return normalizeSubjectProgress(readJson(keys.subjectProgress, {}));
}

export function saveSubjectProgress(progress) {
  writeJson(keys.subjectProgress, progress);
}

export function getPracticeHistory() {
  return readJson(keys.practiceHistory, []);
}

export function savePracticeHistory(history) {
  writeJson(keys.practiceHistory, history);
}

export function getReviewQuestions() {
  return readJson(keys.reviewQuestions, []);
}

export function saveReviewQuestions(questions) {
  writeJson(keys.reviewQuestions, questions);
}

export function getLastPracticeResult() {
  return readJson(keys.lastPracticeResult, null);
}

export function saveLastPracticeResult(result) {
  writeJson(keys.lastPracticeResult, result);
}

export function getXpTransactions() {
  return readJson(keys.xpTransactions, []);
}

export function saveXpTransactions(transactions) {
  writeJson(keys.xpTransactions, transactions);
}

export function getCoinTransactions() {
  return readJson(keys.coinTransactions, []);
}

export function saveCoinTransactions(transactions) {
  writeJson(keys.coinTransactions, transactions);
}

export function getRewardedSessions() {
  return readJson(keys.rewardedSessions, []);
}

export function saveRewardedSessions(sessionIds) {
  writeJson(keys.rewardedSessions, sessionIds);
}

export function hasSessionBeenRewarded(sessionId) {
  return getRewardedSessions().includes(sessionId);
}

export function markSessionAsRewarded(sessionId) {
  if (!sessionId || hasSessionBeenRewarded(sessionId)) return;
  saveRewardedSessions([sessionId, ...getRewardedSessions()]);
}
