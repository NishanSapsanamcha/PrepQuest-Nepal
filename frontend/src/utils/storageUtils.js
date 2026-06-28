const keys = {
  user: "prepquest_user",
  subjectProgress: "prepquest_subject_progress",
  practiceHistory: "prepquest_practice_history",
  reviewQuestions: "prepquest_review_questions",
  savedReviewQuestions: "prepquest_saved_review_questions",
  wrongAnswerReview: "prepquest_wrong_answer_review",
  lastPracticeResult: "prepquest_last_practice_result",
  xpTransactions: "prepquest_xp_transactions",
  coinTransactions: "prepquest_coin_transactions",
  rewardedSessions: "prepquest_rewarded_sessions",
  activeAccountId: "prepquest_active_account_id",
};

// Every localStorage key that holds progress/identity data tied to one
// account. Wiped whenever a different account logs in on this browser so
// one person's XP/coins/streak/tournament history can never leak into the
// next account's session.
const PER_ACCOUNT_KEYS = [
  keys.user,
  keys.subjectProgress,
  keys.practiceHistory,
  keys.reviewQuestions,
  keys.savedReviewQuestions,
  keys.wrongAnswerReview,
  keys.lastPracticeResult,
  keys.xpTransactions,
  keys.coinTransactions,
  keys.rewardedSessions,
  "prepquest_coin_reward_pending",
  "prepquest_daily_quiz_attempts",
  "prepquest_daily_quiz_active",
  "prepquest_daily_quiz_latest_result",
  "prepquest_tournament_attempts",
  "prepquest_tournament_active",
  "prepquest_tournament_latest_result",
  "prepquest_tournament_joined_preview",
  "prepquest_earned_badges",
  "prepquest_badge_unseen",
  "prepquest_badge_rewards",
  "prepquest_daily_login_reward",
  "selectedExam",
  "preferredLanguage",
  "onboardingCompleted",
  "userName",
  "prepquest_profile",
];

const defaultUser = {
  name: "Aspirant",
  selectedExam: "Sakha Adhikrit",
  preferredLanguage: "English",
  totalXp: 0,
  coins: 0,
  level: 1,
  rank: "New Aspirant",
  streak: 0,
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
    ...defaultUser,
    ...(user || {}),
    totalXp: Number.isFinite(user?.totalXp) && user.totalXp >= 0 ? user.totalXp : defaultUser.totalXp,
    coins: Number.isFinite(user?.coins) && user.coins >= 0 ? user.coins : defaultUser.coins,
    streak: Number.isFinite(user?.streak) && user.streak >= 0 ? user.streak : defaultUser.streak,
    freeMocksLeft: Number.isFinite(user?.freeMocksLeft) && user.freeMocksLeft >= 0 ? user.freeMocksLeft : defaultUser.freeMocksLeft,
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

  writeJson(keys.user, defaultUser);
  localStorage.setItem("selectedExam", "sakha-adhikrit");
  localStorage.setItem("preferredLanguage", "english");
  localStorage.setItem("userName", defaultUser.name);
  return defaultUser;
}

export function saveUser(user) {
  writeJson(keys.user, normalizeUser(user));
}

export function getActiveAccountId() {
  return localStorage.getItem(keys.activeAccountId);
}

export function setActiveAccountId(accountId) {
  if (accountId) localStorage.setItem(keys.activeAccountId, accountId);
}

export function resetLocalGamificationData() {
  PER_ACCOUNT_KEYS.forEach((key) => localStorage.removeItem(key));
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

function buildReviewQuestionRecord(question, selectedOptionKey, languageMode, timestamp) {
  return {
    reviewId: `${question.id}-${timestamp}`,
    questionId: question.id,
    subjectId: question.subjectId,
    subjectName: question.subject,
    topic: question.topic,
    difficulty: question.difficulty,
    examTracks: question.examTracks || [],
    question_en: question.question_en,
    question_np: question.question_np,
    options: question.options || [],
    correctOption: question.correctOption,
    selectedOptionKey: selectedOptionKey || "",
    explanation_en: question.explanation_en,
    explanation_np: question.explanation_np,
    languageMode,
    question,
  };
}

export function getSavedReviewQuestions() {
  return readJson(keys.savedReviewQuestions, []);
}

export function saveSavedReviewQuestions(questions) {
  writeJson(keys.savedReviewQuestions, questions);
}

export function isQuestionSaved(questionId) {
  return getSavedReviewQuestions().some((item) => item.questionId === questionId);
}

export function saveReviewQuestion(question, selectedOptionKey = "", languageMode = "english") {
  if (!question?.id) return { saved: false, alreadySaved: false, item: null };

  const savedAt = new Date().toISOString();
  const existing = getSavedReviewQuestions();
  const existingIndex = existing.findIndex((item) => item.questionId === question.id);
  const item = {
    ...buildReviewQuestionRecord(question, selectedOptionKey, languageMode, savedAt),
    reviewId: existing[existingIndex]?.reviewId || `saved-${question.id}`,
    savedAt,
    source: "practice",
  };

  if (existingIndex >= 0) {
    const nextItems = [...existing];
    nextItems[existingIndex] = { ...existing[existingIndex], ...item };
    saveSavedReviewQuestions(nextItems);
    saveReviewQuestions(nextItems);
    return { saved: true, alreadySaved: true, item: nextItems[existingIndex] };
  }

  const nextItems = [item, ...existing];
  saveSavedReviewQuestions(nextItems);
  saveReviewQuestions(nextItems);
  return { saved: true, alreadySaved: false, item };
}

export function removeSavedReviewQuestion(questionId) {
  const nextItems = getSavedReviewQuestions().filter((item) => item.questionId !== questionId);
  saveSavedReviewQuestions(nextItems);
  saveReviewQuestions(nextItems);
}

export function getWrongAnswerReview() {
  return readJson(keys.wrongAnswerReview, []);
}

export function saveWrongAnswerReview(items) {
  writeJson(keys.wrongAnswerReview, items);
}

export function saveWrongAnswer(question, selectedOptionKey = "", languageMode = "english") {
  if (!question?.id) return null;

  const answeredAt = new Date().toISOString();
  const existing = getWrongAnswerReview();
  const existingIndex = existing.findIndex((item) => item.questionId === question.id);
  const baseItem = {
    ...buildReviewQuestionRecord(question, selectedOptionKey, languageMode, answeredAt),
    reviewId: existing[existingIndex]?.reviewId || `wrong-${question.id}`,
    answeredAt,
    attemptsCount: 1,
    mastered: false,
  };

  if (existingIndex >= 0) {
    const nextItems = [...existing];
    nextItems[existingIndex] = {
      ...nextItems[existingIndex],
      ...baseItem,
      attemptsCount: (nextItems[existingIndex].attemptsCount || 1) + 1,
      mastered: false,
    };
    saveWrongAnswerReview(nextItems);
    return nextItems[existingIndex];
  }

  saveWrongAnswerReview([baseItem, ...existing]);
  return baseItem;
}

export function removeWrongAnswer(questionId) {
  saveWrongAnswerReview(getWrongAnswerReview().filter((item) => item.questionId !== questionId));
}

export function markWrongAnswerMastered(questionId) {
  saveWrongAnswerReview(
    getWrongAnswerReview().map((item) =>
      item.questionId === questionId ? { ...item, mastered: true, masteredAt: new Date().toISOString() } : item
    )
  );
}

export function getWrongAnswerCountBySubject(subjectId) {
  return getWrongAnswerReview().filter((item) => item.subjectId === subjectId && !item.mastered).length;
}

export function getSavedCountBySubject(subjectId) {
  return getSavedReviewQuestions().filter((item) => item.subjectId === subjectId).length;
}

export function getWeakTopicsFromWrongAnswers() {
  const counts = getWrongAnswerReview()
    .filter((item) => !item.mastered)
    .reduce((topics, item) => {
      const key = `${item.subjectId || "unknown"}::${item.topic || "Core concepts"}`;
      const existing = topics[key] || {
        subjectId: item.subjectId,
        subjectName: item.subjectName,
        topic: item.topic || "Core concepts",
        count: 0,
      };
      topics[key] = { ...existing, count: existing.count + 1 };
      return topics;
    }, {});

  return Object.values(counts).sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));
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
