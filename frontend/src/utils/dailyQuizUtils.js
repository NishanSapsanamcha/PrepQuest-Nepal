import { examTracks } from "../data/examTracks";
import { getOptionLabel, getText, getValidatedQuestions, normalizeExamId, normalizeLanguageMode } from "./practiceUtils";
import {
  getUser,
  getWrongAnswerReview,
  saveSavedReviewQuestions,
  saveUser,
  saveWrongAnswerReview,
  getSavedReviewQuestions,
} from "./storageUtils";
import { addXPTransaction, calculateTotalXPFromTransactions, XP_REWARDS } from "./xpUtils";
import { awardActivityCoins, COIN_REWARDS, getActiveUserId } from "../services/coinService";

const ATTEMPTS_KEY = "prepquest_daily_quiz_attempts";
const ACTIVE_KEY = "prepquest_daily_quiz_active";
const RESULT_KEY = "prepquest_daily_quiz_latest_result";
const REQUIRED_QUESTION_COUNT = 10;

const subjectAliases = {
  "iq-mental-ability": "general-ability-iq",
  "nepali-grammar": "nepali",
  "english-grammar": "english",
};

const preferredDistribution = {
  "nayab-subba": ["constitution", "constitution", "general-knowledge", "general-knowledge", "current-affairs", "general-ability-iq", "nepali", "english"],
  "sakha-adhikrit": ["constitution", "constitution", "general-knowledge", "general-knowledge", "current-affairs", "general-ability-iq", "nepali", "english"],
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

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDailyQuizAttempts() {
  return readJson(ATTEMPTS_KEY, []);
}

export function saveDailyQuizAttempts(attempts) {
  writeJson(ATTEMPTS_KEY, attempts);
}

export function getTodayDailyQuizAttempt(date = getLocalDateKey()) {
  return getDailyQuizAttempts().find((attempt) => attempt.date === date) || null;
}

export function hasCompletedDailyQuizToday(date = getLocalDateKey()) {
  return Boolean(getTodayDailyQuizAttempt(date));
}

// Counts consecutive calendar days (ending today or yesterday) that have a
// completed daily quiz attempt, so the streak shown in the UI reflects real
// activity instead of a static placeholder.
export function calculateCurrentStreak(attemptDates = [], today = new Date()) {
  const dates = new Set(attemptDates);
  if (!dates.size) return 0;

  const cursor = new Date(today);
  if (!dates.has(getLocalDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (dates.has(getLocalDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getCurrentStreak() {
  return calculateCurrentStreak(getDailyQuizAttempts().map((attempt) => attempt.date));
}

export function getActiveDailyQuizSession() {
  return readJson(ACTIVE_KEY, null);
}

export function saveActiveDailyQuizSession(session) {
  writeJson(ACTIVE_KEY, session);
}

export function clearActiveDailyQuizSession() {
  localStorage.removeItem(ACTIVE_KEY);
}

export function getLatestDailyQuizResult() {
  return readJson(RESULT_KEY, null);
}

export function saveLatestDailyQuizResult(result) {
  writeJson(RESULT_KEY, result);
}

export function getDailyQuizContext() {
  const user = getUser();
  const selectedExam = normalizeExamId(localStorage.getItem("selectedExam") || user.selectedExam);
  const preferredLanguage = normalizeLanguageMode(localStorage.getItem("preferredLanguage") || user.preferredLanguage);
  return {
    user,
    selectedExam,
    selectedExamLabel: examTracks[selectedExam]?.name || "Sakha Adhikrit",
    preferredLanguage,
  };
}

function examMatches(question, selectedExamLabel) {
  return !question.examTracks?.length || question.examTracks.includes(selectedExamLabel);
}

function deterministicShuffle(items, seed) {
  return [...items]
    .map((item, index) => {
      const text = `${seed}-${item.id}-${index}`;
      const score = Array.from(text).reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) % 1000003, 7);
      return { item, score };
    })
    .sort((a, b) => a.score - b.score)
    .map(({ item }) => item);
}

function getWeakSubjectIds() {
  const counts = getWrongAnswerReview()
    .filter((item) => !item.mastered && item.subjectId)
    .reduce((state, item) => {
      const id = subjectAliases[item.subjectId] || item.subjectId;
      state[id] = (state[id] || 0) + 1;
      return state;
    }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([subjectId]) => subjectId);
}

export function selectDailyQuizQuestions(selectedExam, date = getLocalDateKey()) {
  const examId = normalizeExamId(selectedExam);
  const selectedExamLabel = examTracks[examId]?.name || "Sakha Adhikrit";
  const validQuestions = getValidatedQuestions().filter((question) => examMatches(question, selectedExamLabel));
  const bySubject = validQuestions.reduce((state, question) => {
    const id = subjectAliases[question.subjectId] || question.subjectId;
    state[id] = state[id] || [];
    state[id].push(question);
    return state;
  }, {});
  const selected = [];
  const usedIds = new Set();
  const weakSubjects = getWeakSubjectIds().filter((id) => bySubject[id]?.length);
  const distribution = [...(preferredDistribution[examId] || preferredDistribution["sakha-adhikrit"]), ...weakSubjects.slice(0, 2)];

  distribution.forEach((subjectId) => {
    const pool = deterministicShuffle(bySubject[subjectId] || [], `${date}-${subjectId}`);
    const question = pool.find((item) => !usedIds.has(item.id));
    if (question) {
      selected.push(question);
      usedIds.add(question.id);
    }
  });

  deterministicShuffle(validQuestions, `${date}-fill`).forEach((question) => {
    if (selected.length < REQUIRED_QUESTION_COUNT && !usedIds.has(question.id)) {
      selected.push(question);
      usedIds.add(question.id);
    }
  });

  return selected.slice(0, REQUIRED_QUESTION_COUNT);
}

export function buildDailyQuizSession() {
  const { selectedExam, preferredLanguage } = getDailyQuizContext();
  const date = getLocalDateKey();
  const questions = selectDailyQuizQuestions(selectedExam, date);

  if (questions.length < REQUIRED_QUESTION_COUNT) {
    return { ok: false, reason: "not_enough_questions", questions };
  }

  const session = {
    id: `daily-${date}`,
    date,
    selectedExam,
    preferredLanguage,
    startedAt: new Date().toISOString(),
    currentIndex: 0,
    questions,
    answers: [],
  };

  saveActiveDailyQuizSession(session);
  return { ok: true, session };
}

export function formatElapsedTime(seconds = 0) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${remaining}`;
}

export function getSubjectInsights(answers = []) {
  const subjectStats = answers.reduce((state, answer) => {
    const key = answer.subject || "Unknown";
    state[key] = state[key] || { subject: key, correct: 0, wrong: 0, total: 0 };
    state[key].total += 1;
    if (answer.isCorrect) state[key].correct += 1;
    else state[key].wrong += 1;
    return state;
  }, {});
  const stats = Object.values(subjectStats);
  const strongest = [...stats].sort((a, b) => (b.correct / b.total) - (a.correct / a.total) || b.correct - a.correct)[0]?.subject || "Balanced";
  const weakest = [...stats].filter((item) => item.wrong > 0).sort((a, b) => b.wrong - a.wrong || (a.correct / a.total) - (b.correct / b.total))[0]?.subject || "";

  return { strongestSubject: strongest, weakestSubject: weakest };
}

function buildReviewRecord(question, selectedOptionKey, languageMode, source) {
  const timestamp = new Date().toISOString();
  const text = getText(question, languageMode);
  return {
    questionId: question.id,
    question: text.question,
    question_en: question.question_en,
    question_np: question.question_np,
    options: question.options || [],
    subjectId: question.subjectId,
    subject: question.subject,
    subjectName: question.subject,
    topic: question.topic,
    difficulty: question.difficulty,
    selectedOptionKey: selectedOptionKey || "",
    correctOption: question.correctOption,
    explanation: text.explanation,
    explanation_en: question.explanation_en,
    explanation_np: question.explanation_np,
    source,
    date: getLocalDateKey(),
    savedAt: timestamp,
    createdAt: timestamp,
    question,
  };
}

export function saveDailyQuizReviewQuestion(question, selectedOptionKey, languageMode) {
  const existing = getSavedReviewQuestions();
  const item = {
    ...buildReviewRecord(question, selectedOptionKey, languageMode, "Daily Quiz"),
    reviewId: `saved-${question.id}`,
  };
  const existingIndex = existing.findIndex((record) => record.questionId === question.id);
  const next = existingIndex >= 0 ? [...existing] : [item, ...existing];
  if (existingIndex >= 0) next[existingIndex] = { ...existing[existingIndex], ...item };
  saveSavedReviewQuestions(next);
  return item;
}

export function saveDailyQuizWrongAnswers(answers, questions, languageMode) {
  const existing = getWrongAnswerReview();
  const next = [...existing];

  answers.filter((answer) => !answer.isCorrect).forEach((answer) => {
    const question = questions.find((item) => item.id === answer.questionId);
    if (!question) return;
    const item = {
      ...buildReviewRecord(question, answer.selectedOptionKey, languageMode, "Daily Quiz"),
      reviewId: `wrong-${question.id}`,
      mastered: false,
      attempts: 1,
    };
    const existingIndex = next.findIndex((record) => record.questionId === question.id);
    if (existingIndex >= 0) {
      next[existingIndex] = {
        ...next[existingIndex],
        ...item,
        attempts: (next[existingIndex].attempts || next[existingIndex].attemptsCount || 1) + 1,
        attemptsCount: (next[existingIndex].attemptsCount || 1) + 1,
      };
    } else {
      next.unshift(item);
    }
  });

  saveWrongAnswerReview(next);
}

export function completeDailyQuiz(session, elapsedSeconds) {
  const today = getLocalDateKey();
  const existingAttempt = getTodayDailyQuizAttempt(today);
  if (existingAttempt) {
    saveLatestDailyQuizResult(existingAttempt);
    clearActiveDailyQuizSession();
    return existingAttempt;
  }

  const completedAt = new Date().toISOString();
  const answers = session.answers.map((answer) => {
    const question = session.questions.find((item) => item.id === answer.questionId);
    const isCorrect = answer.selectedOptionKey === question?.correctOption;
    return {
      questionId: answer.questionId,
      subject: question?.subject || "",
      subjectId: question?.subjectId || "",
      topic: question?.topic || "",
      difficulty: question?.difficulty || "",
      selectedOptionKey: answer.selectedOptionKey,
      correctOption: question?.correctOption || "",
      isCorrect,
      explanation_en: question?.explanation_en || "",
      explanation_np: question?.explanation_np || "",
    };
  });
  const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
  const wrongAnswers = answers.length - correctAnswers;
  const accuracy = Math.round((correctAnswers / REQUIRED_QUESTION_COUNT) * 100);
  const xpEarned = XP_REWARDS.DAILY_QUIZ_COMPLETE + (correctAnswers === REQUIRED_QUESTION_COUNT ? XP_REWARDS.DAILY_QUIZ_PERFECT_BONUS : 0);
  const coinsEarned = COIN_REWARDS.DAILY_QUICK_COMPLETE + (accuracy >= 80 ? COIN_REWARDS.DAILY_QUICK_SCORE_BONUS : 0);
  const { strongestSubject, weakestSubject } = getSubjectInsights(answers);
  const attempt = {
    id: session.id,
    date: today,
    selectedExam: session.selectedExam,
    preferredLanguage: session.preferredLanguage,
    score: correctAnswers,
    totalQuestions: REQUIRED_QUESTION_COUNT,
    correctAnswers,
    wrongAnswers,
    accuracy,
    xpEarned,
    coinsEarned,
    timeTakenSeconds: Math.max(0, Math.floor(elapsedSeconds || 0)),
    completedAt,
    strongestSubject,
    weakestSubject,
    answers,
  };

  addXPTransaction({
    id: `daily_quiz_${today}`,
    type: "daily_quiz",
    amount: XP_REWARDS.DAILY_QUIZ_COMPLETE,
    date: today,
    source: "Daily Quiz",
    reason: "Completed Daily Quiz",
    createdAt: completedAt,
  });

  if (correctAnswers === REQUIRED_QUESTION_COUNT) {
    addXPTransaction({
      id: `daily_quiz_bonus_${today}`,
      type: "daily_quiz_bonus",
      amount: XP_REWARDS.DAILY_QUIZ_PERFECT_BONUS,
      date: today,
      source: "Daily Quiz",
      reason: "Perfect Daily Quiz Score",
      createdAt: completedAt,
    });
  }

  const user = getUser();
  saveUser({
    ...user,
    totalXp: calculateTotalXPFromTransactions(),
    lastDailyQuizDate: today,
  });

  saveDailyQuizWrongAnswers(answers, session.questions, session.preferredLanguage);
  saveDailyQuizAttempts([attempt, ...getDailyQuizAttempts()]);
  saveLatestDailyQuizResult(attempt);
  clearActiveDailyQuizSession();

  // Award coins through the central engine (idempotent). Streak milestones are
  // evaluated AFTER today's attempt is saved so today counts toward the streak.
  const userId = getActiveUserId();
  const streak = getCurrentStreak();
  const streakComponents = Object.entries(COIN_REWARDS.STREAK_MILESTONES)
    .filter(([milestone]) => streak >= Number(milestone))
    .map(([milestone, reward]) => ({
      amount: reward,
      source: "streak_milestone",
      sourceId: String(milestone),
      reason: `${milestone}-Day Streak Milestone`,
      label: `${milestone}-Day Streak Milestone`,
      idempotencyKey: `${userId}:streak_milestone:${milestone}`,
    }));

  awardActivityCoins([
    {
      amount: COIN_REWARDS.DAILY_QUICK_COMPLETE,
      source: "daily_quick_challenge",
      sourceId: today,
      reason: "Daily Quick Challenge Complete",
      label: "Daily Quick Challenge Complete",
      idempotencyKey: `${userId}:daily_quick_challenge:${today}:complete`,
    },
    {
      condition: accuracy >= 80,
      amount: COIN_REWARDS.DAILY_QUICK_SCORE_BONUS,
      source: "daily_quick_challenge",
      sourceId: today,
      reason: "80% Score Bonus",
      label: "80% Score Bonus",
      idempotencyKey: `${userId}:daily_quick_challenge:${today}:score_80_bonus`,
    },
    ...streakComponents,
  ]);

  return attempt;
}

export function getDailyQuizAnswerDisplay(question, answer, languageMode) {
  return {
    question: getText(question, languageMode).question,
    selectedAnswer: getOptionLabel(question, answer.selectedOptionKey, languageMode),
    correctAnswer: getOptionLabel(question, question.correctOption, languageMode),
    explanation: getText(question, languageMode).explanation,
  };
}

