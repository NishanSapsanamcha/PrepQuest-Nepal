import { examTracks } from "../data/examTracks";
import { mockBadgeProgress, mockTestTypes, readinessLevels } from "../data/mockTestMockData";
import { getOptionLabel, getText, getValidatedQuestions, normalizeExamId, normalizeLanguageMode } from "./practiceUtils";
import {
  getSavedReviewQuestions,
  getUser,
  getWrongAnswerReview,
  saveSavedReviewQuestions,
  saveUser,
  saveWrongAnswerReview,
} from "./storageUtils";
import { addXPTransaction, calculateTotalXPFromTransactions, XP_REWARDS } from "./xpUtils";
import { awardActivityCoins, COIN_REWARDS, getActiveUserId, spendCoins } from "../services/coinService";

export const MOCK_ATTEMPTS_KEY = "prepquest_mock_attempts";
export const MOCK_USAGE_KEY = "prepquest_mock_usage_today";
export const ACTIVE_MOCK_KEY = "prepquest_mock_active_session";
export const LATEST_MOCK_RESULT_KEY = "prepquest_mock_latest_result";
export const STREAK_KEY = "prepquest_streak_progress";
export const BADGE_KEY = "prepquest_badge_progress";
export const FREE_MOCKS_TOTAL = 3;
export const EXTRA_MOCK_COST = 100;
export const DETAILED_REPORT_COST = 80;

const aliases = {
  "iq-mental-ability": "general-ability-iq",
  "nepali-grammar": "nepali",
  "english-grammar": "english",
};

const fullDistributions = {
  "sakha-adhikrit": [
    ["general-knowledge", 4],
    ["constitution", 4],
    ["current-affairs", 3],
    ["general-ability-iq", 4],
    ["governance-basics", 4],
    ["public-administration-basics", 3],
    ["nepali", 2],
    ["english", 1],
  ],
  "nayab-subba": [
    ["general-knowledge", 5],
    ["constitution", 5],
    ["current-affairs", 4],
    ["general-ability-iq", 4],
    ["nepali", 4],
    ["english", 3],
  ],
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

export function formatMockTime(seconds = 0) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${remaining}`;
}

export function formatMockDuration(seconds = 0) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = safeSeconds % 60;
  return `${minutes} min ${remaining} sec`;
}

function shuffle(items, seed) {
  return [...items]
    .map((item, index) => {
      const text = `${seed}-${item.id}-${index}`;
      const score = Array.from(text).reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) % 1000003, 11);
      return { item, score };
    })
    .sort((a, b) => a.score - b.score)
    .map(({ item }) => item);
}

function questionExamMatches(question, selectedExam) {
  const examId = normalizeExamId(selectedExam);
  const label = examTracks[examId]?.name || "Sakha Adhikrit";
  return !question.examTracks?.length || question.examTracks.includes(label);
}

function normalizeSubjectId(subjectId) {
  return aliases[subjectId] || subjectId;
}

export function getMockAttempts() {
  return readJson(MOCK_ATTEMPTS_KEY, []);
}

export function saveMockAttempts(attempts) {
  writeJson(MOCK_ATTEMPTS_KEY, attempts);
}

export function getCompletedMockAttempts() {
  return getMockAttempts().filter((attempt) => attempt.completedAt);
}

export function getActiveMockSession() {
  return readJson(ACTIVE_MOCK_KEY, null);
}

export function saveActiveMockSession(session) {
  writeJson(ACTIVE_MOCK_KEY, session);
}

export function clearActiveMockSession() {
  localStorage.removeItem(ACTIVE_MOCK_KEY);
}

export function getLatestMockResult() {
  return readJson(LATEST_MOCK_RESULT_KEY, null);
}

export function saveLatestMockResult(result) {
  writeJson(LATEST_MOCK_RESULT_KEY, result);
}

export function getMockUsageToday(date = getLocalDateKey()) {
  const usage = readJson(MOCK_USAGE_KEY, null);
  if (!usage || usage.date !== date) {
    const reset = { date, used: 0, paidAttempts: [], completedAttemptIds: [], freeAttemptIds: [] };
    writeJson(MOCK_USAGE_KEY, reset);
    return reset;
  }
  return {
    date,
    used: Math.max(0, usage.used || 0),
    paidAttempts: usage.paidAttempts || [],
    completedAttemptIds: usage.completedAttemptIds || [],
    freeAttemptIds: usage.freeAttemptIds || [],
  };
}

export function getMockAllowance(date = getLocalDateKey()) {
  const usage = getMockUsageToday(date);
  return {
    date,
    freeMocksTotal: FREE_MOCKS_TOTAL,
    freeMocksUsedToday: Math.min(FREE_MOCKS_TOTAL, usage.used),
    freeMocksLeft: Math.max(0, FREE_MOCKS_TOTAL - usage.used),
    extraMockCost: EXTRA_MOCK_COST,
    usedToday: usage.used,
  };
}

export function getMockContext() {
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

export function getMockTypesForExam(selectedExam) {
  const label = examTracks[normalizeExamId(selectedExam)]?.name || "Sakha Adhikrit";
  return mockTestTypes.filter((type) => type.examTrack === label);
}

export function getDefaultMockType(selectedExam) {
  return getMockTypesForExam(selectedExam).find((type) => type.type === "full") || getMockTypesForExam(selectedExam)[0];
}

export function getAvailableMockQuestions(mockType, selectedExam, seed = getLocalDateKey()) {
  if (!mockType) return [];
  const examId = normalizeExamId(selectedExam);
  const valid = getValidatedQuestions().filter((question) => questionExamMatches(question, examId));
  const bySubject = valid.reduce((state, question) => {
    const subjectId = normalizeSubjectId(question.subjectId);
    state[subjectId] = state[subjectId] || [];
    state[subjectId].push(question);
    return state;
  }, {});
  const selected = [];
  const used = new Set();

  if (mockType.type === "subject") {
    return shuffle(bySubject[normalizeSubjectId(mockType.subjectId)] || [], `${seed}-${mockType.id}`).slice(0, mockType.questions);
  }

  (fullDistributions[examId] || fullDistributions["sakha-adhikrit"]).forEach(([subjectId, count]) => {
    shuffle(bySubject[normalizeSubjectId(subjectId)] || [], `${seed}-${mockType.id}-${subjectId}`).forEach((question) => {
      if (selected.length >= mockType.questions || used.has(question.id)) return;
      const currentCount = selected.filter((item) => normalizeSubjectId(item.subjectId) === normalizeSubjectId(subjectId)).length;
      if (currentCount < count) {
        selected.push(question);
        used.add(question.id);
      }
    });
  });

  shuffle(valid, `${seed}-${mockType.id}-fill`).forEach((question) => {
    if (selected.length < mockType.questions && !used.has(question.id)) {
      selected.push(question);
      used.add(question.id);
    }
  });

  return shuffle(selected.slice(0, mockType.questions), `${seed}-${mockType.id}-final`);
}

export function getMockReadiness(mockType, selectedExam) {
  const questions = getAvailableMockQuestions(mockType, selectedExam);
  const subjectsAvailable = new Set(questions.map((question) => normalizeSubjectId(question.subjectId))).size;
  const ready = mockType.type === "full"
    ? questions.length >= mockType.questions && subjectsAvailable >= 4
    : questions.length >= mockType.questions;
  return {
    required: mockType.questions,
    available: Math.min(questions.length, mockType.questions),
    ready,
    missing: Math.max(0, mockType.questions - questions.length),
    subjectsAvailable,
    balanced: mockType.type !== "full" || subjectsAvailable >= 4,
  };
}

// Deduct coins for an optional paid feature, routed through the central engine
// so the ledger and balance stay authoritative. `type` maps to a spend source.
function spendCoinsOnce({ id, type, amount, reason, mockAttemptId = "" }) {
  const result = spendCoins({
    amount,
    source: type,
    sourceId: mockAttemptId,
    reason,
    idempotencyKey: id,
    metadata: { mockAttemptId },
  });
  if (result.duplicate) return { ok: true, duplicate: true };
  if (!result.awarded) return { ok: false, reason: result.reason || "not_enough_coins" };
  return { ok: true, duplicate: false };
}

export function startMockSession(mockTypeId, options = {}) {
  const context = getMockContext();
  const mockType = getMockTypesForExam(context.selectedExam).find((type) => type.id === mockTypeId) || getDefaultMockType(context.selectedExam);
  const questions = getAvailableMockQuestions(mockType, context.selectedExam, `${getLocalDateKey()}-${Date.now()}`);
  const readiness = getMockReadiness(mockType, context.selectedExam);

  if (!readiness.ready) {
    return { ok: false, reason: "not_enough_questions", questions, required: mockType.questions, mockType };
  }

  const usage = getMockUsageToday();
  const isFreeAttempt = usage.used < FREE_MOCKS_TOTAL;
  const attemptId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (!isFreeAttempt && (context.user.coins || 0) < EXTRA_MOCK_COST) return { ok: false, reason: "not_enough_coins", mockType };
  if (!isFreeAttempt && !options.confirmPaid) return { ok: false, reason: "paid_confirmation_required", mockType };
  if (!isFreeAttempt) {
    const spend = spendCoinsOnce({
      id: `extra_mock_unlock_${attemptId}`,
      type: "extra_mock_unlock",
      amount: EXTRA_MOCK_COST,
      reason: "Unlocked extra mock after using 3 free mocks",
      mockAttemptId: attemptId,
    });
    if (!spend.ok) return { ok: false, reason: "not_enough_coins", mockType };
    writeJson(MOCK_USAGE_KEY, {
      ...usage,
      paidAttempts: [attemptId, ...(usage.paidAttempts || [])],
    });
  }

  const session = {
    id: attemptId,
    date: getLocalDateKey(),
    selectedExam: context.selectedExam,
    selectedExamLabel: context.selectedExamLabel,
    preferredLanguage: context.preferredLanguage,
    mockTypeId: mockType.id,
    mockTitle: mockType.title,
    mockType,
    questions,
    answers: [],
    savedQuestionIds: [],
    currentIndex: 0,
    startedAt: new Date().toISOString(),
    durationMinutes: mockType.durationMinutes,
    isFreeAttemptPreview: isFreeAttempt,
    isPaidAttempt: !isFreeAttempt,
  };
  saveActiveMockSession(session);
  return { ok: true, session };
}

function recordMockCompletionUsage(attemptId) {
  const usage = getMockUsageToday();
  if ((usage.completedAttemptIds || []).includes(attemptId)) {
    return { ok: true, isFreeCompletion: usage.freeAttemptIds?.includes(attemptId), duplicate: true };
  }

  const isFreeCompletion = usage.used < FREE_MOCKS_TOTAL;
  if (!isFreeCompletion) {
    const spend = spendCoinsOnce({
      id: `extra_mock_unlock_${attemptId}`,
      type: "extra_mock_unlock",
      amount: EXTRA_MOCK_COST,
      reason: "Unlocked extra mock after using 3 free mocks",
      mockAttemptId: attemptId,
    });
    if (!spend.ok) return { ok: false, reason: "not_enough_coins" };
  }

  writeJson(MOCK_USAGE_KEY, {
    ...usage,
    used: usage.used + 1,
    completedAttemptIds: [attemptId, ...(usage.completedAttemptIds || [])],
    freeAttemptIds: isFreeCompletion ? [attemptId, ...(usage.freeAttemptIds || [])] : (usage.freeAttemptIds || []),
    paidAttempts: isFreeCompletion ? (usage.paidAttempts || []) : [attemptId, ...(usage.paidAttempts || [])],
  });
  return { ok: true, isFreeCompletion, duplicate: false };
}

export function getMockDashboardStats() {
  const attempts = getCompletedMockAttempts();
  const allowance = getMockAllowance();
  const accuracies = attempts.map((attempt) => attempt.accuracy);
  const averageAccuracy = accuracies.length ? Math.round(accuracies.reduce((sum, item) => sum + item, 0) / accuracies.length) : null;
  const bestScore = accuracies.length ? Math.max(...accuracies) : null;
  const recent = attempts.slice(0, 3);
  const examReadiness = recent.length ? Math.round(recent.reduce((sum, item) => sum + item.accuracy, 0) / recent.length) : null;

  return {
    ...allowance,
    bestScore,
    averageAccuracy,
    totalMocksCompleted: attempts.length,
    examReadiness,
    hasRealAttempts: attempts.length > 0,
  };
}

export function getReadinessLevel(accuracy = 0) {
  return readinessLevels.find((level) => accuracy >= level.min && accuracy <= level.max) || readinessLevels[0];
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
  const stats = Object.values(subjectStats).map((item) => ({
    ...item,
    accuracy: item.total ? Math.round((item.correct / item.total) * 100) : 0,
  }));
  const strongest = [...stats].sort((a, b) => b.accuracy - a.accuracy || b.correct - a.correct)[0];
  const weakest = [...stats].filter((item) => item.wrong > 0).sort((a, b) => a.accuracy - b.accuracy || b.wrong - a.wrong)[0];
  return {
    stats,
    strongestSubject: strongest?.subject || "Balanced",
    weakestSubject: weakest?.subject || "",
  };
}

function getWeakestTopic(answers = []) {
  const topics = answers
    .filter((answer) => !answer.isCorrect && answer.topic)
    .reduce((state, answer) => {
      const key = `${answer.subject || "Unknown"}::${answer.topic}`;
      state[key] = state[key] || { subject: answer.subject, topic: answer.topic, wrong: 0 };
      state[key].wrong += 1;
      return state;
    }, {});
  return Object.values(topics).sort((a, b) => b.wrong - a.wrong)[0]?.topic || "";
}

function saveMockWrongAnswers(answers, questions, languageMode, mockAttemptId) {
  const existing = getWrongAnswerReview();
  const next = [...existing];

  answers.filter((answer) => !answer.isCorrect && !answer.isUnanswered).forEach((answer) => {
    const question = questions.find((item) => item.id === answer.questionId);
    if (!question) return;
    const text = getText(question, languageMode);
    const createdAt = new Date().toISOString();
    const item = {
      id: `mock-wrong-${question.id}`,
      reviewId: `wrong-${question.id}`,
      source: "Mock Test",
      mockAttemptId,
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
      selectedOptionKey: answer.selectedOptionKey,
      correctOption: question.correctOption,
      explanation: text.explanation,
      explanation_en: question.explanation_en,
      explanation_np: question.explanation_np,
      date: getLocalDateKey(),
      mastered: false,
      attempts: 1,
      attemptsCount: 1,
      createdAt,
      question,
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

export function saveMockReviewQuestion(question, selectedOptionKey, languageMode, mockAttemptId) {
  const existing = getSavedReviewQuestions();
  const text = getText(question, languageMode);
  const savedAt = new Date().toISOString();
  const item = {
    id: `mock-saved-${question.id}`,
    reviewId: `saved-${question.id}`,
    source: "Mock Test",
    mockAttemptId,
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
    savedAt,
    question,
  };
  const existingIndex = existing.findIndex((record) => record.questionId === question.id);
  const next = existingIndex >= 0 ? [...existing] : [item, ...existing];
  if (existingIndex >= 0) next[existingIndex] = { ...existing[existingIndex], ...item };
  saveSavedReviewQuestions(next);
  return item;
}

function applyMockRewards(attempt) {
  if (attempt.rewardsApplied) return attempt;
  const createdAt = attempt.completedAt;
  addXPTransaction({
    id: `mock_complete_xp_${attempt.id}`,
    type: "mock_test_complete",
    amount: XP_REWARDS.MOCK_TEST_COMPLETE,
    source: "Mock Test",
    reason: "Completed mock test",
    mockAttemptId: attempt.id,
    date: attempt.date,
    createdAt,
  });
  if (attempt.accuracy >= 80) {
    addXPTransaction({
      id: `mock_bonus_xp_${attempt.id}`,
      type: "mock_test_score_bonus",
      amount: XP_REWARDS.MOCK_TEST_SCORE_BONUS,
      source: "Mock Test",
      reason: "Scored 80% or above in mock test",
      mockAttemptId: attempt.id,
      date: attempt.date,
      createdAt,
    });
  }

  // Real coin rewards through the central engine (idempotent per attempt).
  const userId = getActiveUserId();
  awardActivityCoins([
    {
      amount: COIN_REWARDS.MOCK_COMPLETE,
      source: "mock_test",
      sourceId: attempt.id,
      reason: "Mock Test Complete",
      label: "Mock Test Complete",
      idempotencyKey: `${userId}:mock_test:${attempt.id}:complete`,
      createdAt,
      metadata: { mockAttemptId: attempt.id },
    },
    {
      condition: attempt.accuracy >= 80,
      amount: COIN_REWARDS.MOCK_SCORE_BONUS,
      source: "mock_test",
      sourceId: attempt.id,
      reason: "80% Score Bonus",
      label: "80% Score Bonus",
      idempotencyKey: `${userId}:mock_test:${attempt.id}:score_80_bonus`,
      createdAt,
      metadata: { mockAttemptId: attempt.id },
    },
  ]);

  const user = getUser();
  saveUser({
    ...user,
    totalXp: calculateTotalXPFromTransactions(),
    lastMockDate: attempt.date,
    streak: updateMockStreak().currentStreak,
  });
  return { ...attempt, rewardsApplied: true };
}

export function updateMockStreak(date = getLocalDateKey()) {
  const existing = readJson(STREAK_KEY, { currentStreak: getUser().streak || 0, lastActivityDate: "" });
  if (existing.lastActivityDate === date) return existing;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getLocalDateKey(yesterday);
  const currentStreak = existing.lastActivityDate === yesterdayKey ? (existing.currentStreak || 0) + 1 : Math.max(1, existing.currentStreak || 0);
  const next = { ...existing, currentStreak, lastActivityDate: date, mockCompletedToday: true };
  writeJson(STREAK_KEY, next);
  return next;
}

export function getMockBadgeProgress(attempts = getCompletedMockAttempts()) {
  const completed = attempts.length;
  const average = completed ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.accuracy, 0) / completed) : 0;
  const above80 = attempts.filter((attempt) => attempt.accuracy >= 80).length;
  return mockBadgeProgress.map((badge) => {
    if (badge.id === "mock_beginner") return { ...badge, progress: Math.min(completed, 1), unlocked: completed >= 1 };
    if (badge.id === "mock_master") return { ...badge, progress: Math.min(completed, badge.target), unlocked: completed >= badge.target };
    if (badge.id === "accuracy_master") return { ...badge, progress: Math.min(average, badge.target), unlocked: average >= badge.target };
    if (badge.id === "exam_ready_performer") return { ...badge, progress: Math.min(above80, badge.target), unlocked: above80 >= badge.target };
    return badge;
  });
}

export function completeMockSession(session, elapsedSeconds) {
  const existingAttempt = getMockAttempts().find((attempt) => attempt.id === session.id);
  if (existingAttempt?.completedAt) {
    saveLatestMockResult(existingAttempt);
    clearActiveMockSession();
    return existingAttempt;
  }

  const usageResult = recordMockCompletionUsage(session.id);
  if (!usageResult.ok) return { id: session.id, error: usageResult.reason };

  const completedAt = new Date().toISOString();
  const answerMap = new Map((session.answers || []).map((answer) => [answer.questionId, answer]));
  const answers = session.questions.map((question) => {
    const answer = answerMap.get(question.id);
    const selectedOptionKey = answer?.selectedOptionKey || "";
    const isUnanswered = !selectedOptionKey;
    const isCorrect = !isUnanswered && selectedOptionKey === question.correctOption;
    return {
      questionId: question.id,
      subject: question.subject,
      subjectId: question.subjectId,
      topic: question.topic,
      difficulty: question.difficulty,
      selectedOptionKey,
      correctOption: question.correctOption,
      isCorrect,
      isUnanswered,
      explanation_en: question.explanation_en,
      explanation_np: question.explanation_np,
      timeSpentSeconds: answer?.timeSpentSeconds || 0,
    };
  });
  const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
  const unansweredCount = answers.filter((answer) => answer.isUnanswered).length;
  const wrongAnswers = answers.length - correctAnswers - unansweredCount;
  const accuracy = Math.round((correctAnswers / session.questions.length) * 100);
  const readiness = getReadinessLevel(accuracy);
  const subjectInsights = getSubjectInsights(answers);
  const previous = getCompletedMockAttempts().find((attempt) => attempt.mockTypeId === session.mockTypeId);
  const xpEarned = XP_REWARDS.MOCK_TEST_COMPLETE + (accuracy >= 80 ? XP_REWARDS.MOCK_TEST_SCORE_BONUS : 0);
  const coinsEarned = 40 + (accuracy >= 80 ? 30 : 0);
  const completedAttempts = getCompletedMockAttempts();
  const attempt = applyMockRewards({
    id: session.id,
    date: session.date,
    selectedExam: session.selectedExam,
    preferredLanguage: session.preferredLanguage,
    mockTypeId: session.mockTypeId,
    mockTitle: session.mockTitle,
    totalQuestions: session.questions.length,
    answeredCount: session.questions.length - unansweredCount,
    unansweredCount,
    correctAnswers,
    wrongAnswers,
    score: correctAnswers,
    accuracy,
    timeTakenSeconds: Math.max(0, Math.floor(elapsedSeconds || 0)),
    durationMinutes: session.durationMinutes,
    xpEarned,
    coinsEarned,
    readinessLabel: readiness.label,
    readinessMessage: readiness.message,
    strongestSubject: subjectInsights.strongestSubject,
    weakestSubject: subjectInsights.weakestSubject,
    weakestTopic: getWeakestTopic(answers),
    subjectStats: subjectInsights.stats,
    badgeProgress: getMockBadgeProgress([{ accuracy }, ...completedAttempts]),
    completedAt,
    rewardsApplied: false,
    previousAccuracy: previous?.accuracy ?? null,
    improvement: previous ? accuracy - previous.accuracy : null,
    streakStatus: "Active",
    answers,
    questions: session.questions,
    savedQuestionIds: session.savedQuestionIds || [],
  });

  saveMockWrongAnswers(answers, session.questions, session.preferredLanguage, attempt.id);
  (session.savedQuestionIds || []).forEach((questionId) => {
    const question = session.questions.find((item) => item.id === questionId);
    if (question) saveMockReviewQuestion(question, answerMap.get(questionId)?.selectedOptionKey || "", session.preferredLanguage, attempt.id);
  });
  const nextAttempts = [attempt, ...getMockAttempts().filter((item) => item.id !== attempt.id)];
  saveMockAttempts(nextAttempts);
  saveLatestMockResult(attempt);
  writeJson(BADGE_KEY, { mockTests: attempt.badgeProgress, updatedAt: completedAt });
  clearActiveMockSession();
  return attempt;
}

export function getMockAnswerDisplay(question, answer, languageMode) {
  return {
    question: getText(question, languageMode).question,
    selectedAnswer: answer.isUnanswered ? "Unanswered" : getOptionLabel(question, answer.selectedOptionKey, languageMode),
    correctAnswer: getOptionLabel(question, question.correctOption, languageMode),
    explanation: getText(question, languageMode).explanation,
  };
}

export function unlockDetailedReport(attemptId) {
  return spendCoinsOnce({
    id: `detailed_report_unlock_${attemptId}`,
    type: "detailed_report_unlock",
    amount: DETAILED_REPORT_COST,
    reason: "Unlocked detailed mock performance report",
    mockAttemptId: attemptId,
  });
}

export function hasCompletedMockToday(date = getLocalDateKey()) {
  return getCompletedMockAttempts().some((attempt) => attempt.date === date);
}
