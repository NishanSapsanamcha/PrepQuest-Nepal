import { examNameToId, examTracks } from "../data/examTracks";
import { practiceQuestions } from "../data/practiceQuestions";
import { getSubjectById, subjects } from "../data/subjects";
import {
  calculateAccuracy,
  calculateSubjectXPFromTransactions,
  calculateTotalXPFromTransactions,
  calculateMaxCorrectStreak,
  calculatePracticeRewards,
  checkLevelUp,
  getPracticeSessionXP,
  getPracticeSessionXPTransactions,
  getNextLevelProgress,
  getSubjectLevel,
} from "./xpUtils";
import {
  getPracticeHistory,
  getReviewQuestions,
  getRewardedSessions,
  getSubjectProgress,
  getUser,
  getSavedCountBySubject,
  getWrongAnswerCountBySubject,
  hasSessionBeenRewarded,
  markSessionAsRewarded,
  savePracticeHistory,
  saveReviewQuestions,
  saveRewardedSessions,
  saveSubjectProgress,
  saveUser,
} from "./storageUtils";

export function normalizeExamId(exam) {
  return examNameToId[exam] || exam || "sakha-adhikrit";
}

export function normalizeLanguageMode(language) {
  const value = String(language || "english").toLowerCase();
  if (value.includes("both")) return "both";
  if (value.includes("nepali")) return "nepali";
  return "english";
}

export const normalizeLanguage = normalizeLanguageMode;

const placeholderPattern = /distractor|placeholder|sample|fake|lorem|test question|option a|option b|option c|option d/i;
const validOptionKeys = new Set(["A", "B", "C", "D"]);
const requiredOptionKeys = ["A", "B", "C", "D"];

export const defaultSubjectProgress = {
  xp: 0,
  questionsSolved: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  savedForReview: 0,
  lastPracticedAt: null,
};

export function validateQuestionBank(questions) {
  const warnings = [];

  questions.forEach((question, index) => {
    const label = question?.id || `question at index ${index}`;
    if (!question?.id) warnings.push(`${label}: missing id`);
    if (!Array.isArray(question?.examTracks)) warnings.push(`${label}: examTracks must be an array`);
    if (!question?.subjectId) warnings.push(`${label}: missing subjectId`);
    if (!question?.subject) warnings.push(`${label}: missing subject`);
    if (!question?.topic) warnings.push(`${label}: missing topic`);
    if (!question?.difficulty) warnings.push(`${label}: missing difficulty`);
    if (!question?.question_en) warnings.push(`${label}: missing question_en`);
    if (!question?.question_np) warnings.push(`${label}: missing question_np`);
    if (!Array.isArray(question?.options) || question.options.length !== 4) warnings.push(`${label}: must have exactly 4 options`);
    const optionKeys = question?.options?.map((option) => option.key) || [];
    if (requiredOptionKeys.some((key) => !optionKeys.includes(key))) warnings.push(`${label}: option keys must be A, B, C, and D`);
    question?.options?.forEach((option) => {
      if (!option?.key || !option?.en || !option?.np) warnings.push(`${label}: every option needs key, en, and np`);
      if (!validOptionKeys.has(option?.key)) warnings.push(`${label}: option key must be A, B, C, or D`);
      if ([option?.en, option?.np].some((value) => placeholderPattern.test(String(value || "")))) {
        warnings.push(`${label}: option contains placeholder text`);
      }
    });
    if (!validOptionKeys.has(question?.correctOption)) warnings.push(`${label}: correctOption must be A, B, C, or D`);
    if (question?.correctOption && !optionKeys.includes(question.correctOption)) warnings.push(`${label}: correctOption does not match an option key`);
    if (!question?.explanation_en) warnings.push(`${label}: missing explanation_en`);
    if (!question?.explanation_np) warnings.push(`${label}: missing explanation_np`);
    if (question?.reviewed !== true) warnings.push(`${label}: reviewed must be true`);
    if ([question?.explanation_en, question?.explanation_np, question?.question_en, question?.question_np].some((value) => placeholderPattern.test(String(value || "")))) {
      warnings.push(`${label}: question or explanation contains placeholder text`);
    }
  });

  if (warnings.length && import.meta.env.DEV) {
    console.warn("Practice question bank validation warnings:", warnings);
  }

  return { valid: warnings.length === 0, warnings };
}

function isQuestionValid(question) {
  return validateQuestionBank([question]).valid;
}

export function getExamSubjects(exam) {
  const examId = normalizeExamId(exam);
  const track = examTracks[examId] || examTracks["sakha-adhikrit"];
  return track.subjectIds.map(getSubjectById).filter(Boolean);
}

export function getValidatedQuestions() {
  validateQuestionBank(practiceQuestions);
  return practiceQuestions.filter(isQuestionValid);
}

const subjectAliases = {
  "iq-mental-ability": "general-ability-iq",
  "nepali-grammar": "nepali",
  "english-grammar": "english",
};

export function getQuestionsBySubject(subjectId, selectedExam) {
  const examId = normalizeExamId(selectedExam);
  const examLabel = examTracks[examId]?.name || "Sakha Adhikrit";
  const questionSubjectId = subjectAliases[subjectId] || subjectId;
  return getValidatedQuestions().filter(
    (question) =>
      question.subjectId === questionSubjectId &&
      (!question.examTracks?.length || question.examTracks.includes(examLabel))
  );
}

export function getSubjectQuestions(subjectId, exam) {
  return getQuestionsBySubject(subjectId, exam).slice(0, 10);
}

export function getValidatedQuestionCountBySubject(subjectId, selectedExam) {
  return getQuestionsBySubject(subjectId, selectedExam).length;
}

export function getAvailableSubjectsForExam(selectedExam) {
  return getExamSubjects(selectedExam).filter((subject) => getValidatedQuestionCountBySubject(subject.id, selectedExam) > 0);
}

export function normalizeSubjectProgress(progress = {}) {
  const normalized = {};
  const history = getPracticeHistory();

  subjects.forEach((subject) => {
    const existing = progress[subject.id] || {};
    const subjectHistory = history.filter((session) => session.subjectId === subject.id);
    const correctAnswers = subjectHistory.reduce((sum, session) => sum + (Number.isFinite(session.correctCount) ? session.correctCount : 0), 0);
    const wrongAnswers = subjectHistory.reduce((sum, session) => sum + (Number.isFinite(session.wrongCount) ? session.wrongCount : 0), 0);
    const questionsSolved = correctAnswers + wrongAnswers;
    const xp = calculateSubjectXPFromTransactions(subject.id);
    const impossible =
      correctAnswers < 0 ||
      wrongAnswers < 0 ||
      questionsSolved < 0;
    const oldSeededProgress =
      (existing.xp === 80 && existing.questionsSolved === 12 && (existing.correct === 8 || existing.correctAnswers === 8)) ||
      (subject.id === "constitution" && existing.xp === 160 && existing.questionsSolved === 30 && (existing.correct === 19 || existing.correctAnswers === 19));

    normalized[subject.id] = impossible || oldSeededProgress
      ? { ...defaultSubjectProgress }
      : {
          ...defaultSubjectProgress,
          xp,
          questionsSolved: Math.max(0, questionsSolved),
          correctAnswers: Math.max(0, correctAnswers),
          wrongAnswers: Math.max(0, wrongAnswers),
          savedForReview: Number.isFinite(existing.savedForReview) ? Math.max(0, existing.savedForReview) : 0,
          lastPracticedAt: existing.lastPracticedAt || null,
        };
  });

  return normalized;
}

export function getNormalizedSubjectProgress() {
  const normalized = normalizeSubjectProgress(getSubjectProgress());
  saveSubjectProgress(normalized);
  return normalized;
}

export function buildSubjectCardData(subject, userProgress, selectedExam) {
  const displayProgress = getSubjectDisplayProgress(subject.id);
  const progress = {
    ...defaultSubjectProgress,
    ...(userProgress?.[subject.id] || {}),
    xp: displayProgress.subjectXP,
    questionsSolved: displayProgress.attemptedCount,
    correctAnswers: displayProgress.correctAnswers,
    wrongAnswers: displayProgress.wrongAnswers,
  };
  const questionsAvailable = getValidatedQuestionCountBySubject(subject.id, selectedExam);
  const levelProgress = displayProgress.levelProgress;
  const accuracy = displayProgress.accuracy;
  const masteryStatus = displayProgress.masteryLabel;

  return {
    ...subject,
    progress,
    questionsAvailable,
    levelProgress,
    currentLevel: levelProgress.currentLevel,
    accuracy,
    accuracyLabel: displayProgress.accuracyLabel,
    masteryStatus,
    savedReviewCount: displayProgress.savedCount,
    wrongReviewCount: displayProgress.mistakeCount,
    hasStarted: displayProgress.hasStarted,
    canPractice: questionsAvailable > 0,
  };
}

export function getSubjectDisplayProgress(subjectId) {
  const subjectXP = calculateSubjectXPFromTransactions(subjectId);
  const history = getPracticeHistory();
  const subjectAttempts = history.filter((session) => session.subjectId === subjectId);
  const totals = subjectAttempts.reduce(
    (state, session) => ({
      attemptedCount: state.attemptedCount + (session.answerRecords?.length || session.totalQuestions || 0),
      correctAnswers: state.correctAnswers + (Number.isFinite(session.correctCount) ? session.correctCount : 0),
      wrongAnswers: state.wrongAnswers + (Number.isFinite(session.wrongCount) ? session.wrongCount : 0),
    }),
    { attemptedCount: 0, correctAnswers: 0, wrongAnswers: 0 }
  );
  const attemptedCount = Math.max(0, totals.correctAnswers + totals.wrongAnswers || totals.attemptedCount);
  const correctAnswers = Math.max(0, totals.correctAnswers);
  const wrongAnswers = Math.max(0, attemptedCount - correctAnswers);
  const hasStarted = attemptedCount > 0;
  const accuracy = hasStarted ? calculateAccuracy(correctAnswers, attemptedCount) : null;
  const masteryLabel =
    !hasStarted ? "Not Started"
    : accuracy < 50 ? "Needs Practice"
    : accuracy < 70 ? "Developing"
    : accuracy < 85 ? "Strong"
    : "Exam Ready";
  const levelProgress = getNextLevelProgress(subjectXP);

  return {
    subjectXP,
    currentLevel: levelProgress.currentLevel,
    nextLevel: levelProgress.nextLevel,
    xpToNextLevel: levelProgress.remainingXp,
    progressPercent: levelProgress.percent,
    levelProgress,
    attemptedCount,
    correctAnswers,
    wrongAnswers,
    accuracy,
    accuracyLabel: hasStarted ? `${accuracy}%` : "Not Started Yet",
    masteryLabel,
    savedCount: getSavedCountBySubject(subjectId),
    mistakeCount: getWrongAnswerCountBySubject(subjectId),
    hasStarted,
  };
}

export function getText(question, language) {
  const mode = normalizeLanguageMode(language);
  const normalizedOptions = Array.isArray(question.options)
    ? question.options
    : (question.options_en || []).map((en, index) => ({
        key: ["A", "B", "C", "D"][index],
        en,
        np: question.options_np?.[index] || en,
      }));
  const normalizedCorrectOption =
    question.correctOption ||
    normalizedOptions.find((option) => option.en === question.correctAnswer || option.np === question.correctAnswerNp)?.key ||
    "A";
  const correctOption = normalizedOptions.find((option) => option.key === normalizedCorrectOption) || normalizedOptions[0];
  const english = {
    question: question.question_en,
    options: normalizedOptions.map((option) => ({ key: option.key, label: `${option.key}. ${option.en}` })),
    correctAnswer: correctOption?.en,
    explanation: question.explanation_en,
  };
  const nepali = {
    question: question.question_np || question.question_en,
    options: normalizedOptions.map((option) => ({ key: option.key, label: `${option.key}. ${option.np || option.en}` })),
    correctAnswer: correctOption?.np || correctOption?.en,
    explanation: question.explanation_np || question.explanation_en,
  };

  if (mode === "nepali") return nepali;
  if (mode === "both") {
    return {
      question: `${english.question}\n${nepali.question}`,
      options: normalizedOptions.map((option) => ({
        key: option.key,
        label: `${option.key}. ${option.en}\n   ${option.np || option.en}`,
      })),
      correctAnswer: `${english.correctAnswer} / ${nepali.correctAnswer}`,
      explanation: `${english.explanation}\n${nepali.explanation}`,
    };
  }
  return english;
}

export function getOptionLabel(question, optionKey, language) {
  if (!optionKey || optionKey === "SKIPPED") return "Skipped";
  const mode = normalizeLanguageMode(language);
  const normalizedOptions = Array.isArray(question.options)
    ? question.options
    : (question.options_en || []).map((en, index) => ({
        key: ["A", "B", "C", "D"][index],
        en,
        np: question.options_np?.[index] || en,
      }));
  const option = normalizedOptions.find((item) => item.key === optionKey);
  if (!option) return optionKey;
  if (mode === "nepali") return option.np || option.en;
  if (mode === "both") return `${option.en} / ${option.np || option.en}`;
  return option.en;
}

export function buildSubjectProgress(subjectId) {
  const progress = getNormalizedSubjectProgress();
  return progress[subjectId] || { ...defaultSubjectProgress };
}

export function validateRewardCalculation(result) {
  const warnings = [];
  const expectedAccuracy = calculateAccuracy(result.correctCount, result.totalQuestions);
  const expectedRewards = calculatePracticeRewards({
    totalQuestions: result.totalQuestions,
    correctCount: result.correctCount,
    maxCorrectStreak: result.maxCorrectStreak,
    isRecommendedPractice: result.isRecommendedPractice,
    didLevelUp: result.didLevelUp,
    isPerfectScore: result.accuracy === 100,
  });

  if (result.correctCount > result.totalQuestions) warnings.push("correctCount cannot be greater than totalQuestions");
  if (result.wrongCount > result.totalQuestions) warnings.push("wrongCount cannot be greater than totalQuestions");
  if (result.correctCount + result.wrongCount > result.totalQuestions) warnings.push("answered count cannot exceed totalQuestions");
  if (result.accuracy !== expectedAccuracy) warnings.push("accuracy does not match correctCount / totalQuestions");
  if (result.rewards?.xp?.totalXp !== expectedRewards.xp.totalXp) warnings.push("XP total does not match reward rules");
  if (result.newUserXp < result.previousUserXp) warnings.push("total XP cannot decrease");
  if (result.newCoins < result.previousCoins) warnings.push("coins cannot decrease");
  if (result.newSubjectXp < result.previousSubjectXp) warnings.push("subject XP cannot decrease");
  if (hasSessionBeenRewarded(result.sessionId)) warnings.push("session reward has already been applied");

  if (warnings.length && import.meta.env.DEV) {
    console.warn("Practice reward validation failed:", warnings, result);
  }

  return { valid: warnings.length === 0, warnings };
}

export function applyPracticeRewards({ user, subjectProgress, subjectId, sessionId, rewards, result }) {
  if (hasSessionBeenRewarded(sessionId)) {
    return { applied: false, user, subjectProgress, result: { ...result, alreadyRewarded: true } };
  }

  const createdAt = result.createdAt;
  const currentSubjectProgress = subjectProgress[subjectId] || { ...defaultSubjectProgress };
  const previousSubjectXp = result.previousSubjectXp || 0;
  const newSubjectXp = calculateSubjectXPFromTransactions(subjectId);
  const totalUserXp = calculateTotalXPFromTransactions();
  const xpTransactions = getPracticeSessionXPTransactions(sessionId);
  const updatedUser = {
    ...user,
    totalXp: totalUserXp,
  };
  const updatedSubjectProgress = {
    ...currentSubjectProgress,
    xp: newSubjectXp,
    questionsSolved: (currentSubjectProgress.questionsSolved || 0) + result.totalQuestions,
    correctAnswers: (currentSubjectProgress.correctAnswers || 0) + result.correctCount,
    wrongAnswers: (currentSubjectProgress.wrongAnswers || 0) + result.wrongCount,
    lastPracticedAt: createdAt,
  };
  updatedSubjectProgress.accuracy = calculateAccuracy(updatedSubjectProgress.correctAnswers, updatedSubjectProgress.questionsSolved);

  const nextSubjectProgress = { ...subjectProgress, [subjectId]: updatedSubjectProgress };
  const levelUp = checkLevelUp(previousSubjectXp, newSubjectXp);

  saveUser(updatedUser);
  saveSubjectProgress(nextSubjectProgress);
  markSessionAsRewarded(sessionId);

  return {
    applied: true,
    user: updatedUser,
    subjectProgress: nextSubjectProgress,
    result: {
      ...result,
      newUserXp: updatedUser.totalXp,
      newCoins: user.coins || 0,
      newSubjectXp,
      didLevelUp: levelUp.didLevelUp,
      levelUp,
      subjectProgress: updatedSubjectProgress,
      xpTransactions,
      coinTransactions: [],
    },
  };
}

export function completePracticeSession({
  subjectId,
  subjectName,
  answers,
  questions,
  practiceSessionId,
  practiceType = "Quick Practice",
  isRecommendedPractice = false,
}) {
  const user = getUser();
  const subjectProgress = getNormalizedSubjectProgress();
  const previousProgress = subjectProgress[subjectId] || { ...defaultSubjectProgress };
  const sessionId = practiceSessionId || `practice-${subjectId}-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const correctCount = answers.filter((answer) => answer.isCorrect).length;
  const wrongCount = answers.length - correctCount;
  const totalQuestions = questions.length;
  const accuracy = calculateAccuracy(correctCount, totalQuestions);
  const maxCorrectStreak = calculateMaxCorrectStreak(answers);
  const sessionXp = getPracticeSessionXP(sessionId);
  const newSubjectXp = calculateSubjectXPFromTransactions(subjectId);
  const previousSubjectXp = Math.max(0, newSubjectXp - sessionXp);
  const previousSubjectLevel = getSubjectLevel(previousSubjectXp);
  const levelPreview = checkLevelUp(previousSubjectXp, newSubjectXp);
  const didLevelUp = levelPreview.didLevelUp;
  const rewards = calculatePracticeRewards({
    correctCount,
  });
  rewards.xp.correctAnswerXp = sessionXp;
  rewards.xp.totalXp = sessionXp;
  const newSubjectLevel = getSubjectLevel(newSubjectXp);
  const wrongAnswers = answers
    .filter((answer) => !answer.isCorrect)
    .map((answer) => {
      const question = questions.find((item) => item.id === answer.questionId);
      return {
        questionId: question.id,
        question_en: question.question_en,
        question_np: question.question_np,
        selectedOptionKey: answer.selectedOptionKey,
        correctOption: question.correctOption,
        explanation_en: question.explanation_en,
        explanation_np: question.explanation_np,
        topic: question.topic,
        subjectId,
        subjectName,
        languageMode: answer.languageMode,
        question,
        savedAt: new Date().toISOString(),
      };
    });
  const topicCounts = wrongAnswers.reduce((counts, answer) => {
    const topic = answer.question?.topic || "Core concepts";
    counts[topic] = (counts[topic] || 0) + 1;
    return counts;
  }, {});
  const weakTopic = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Revision";
  const result = {
    id: sessionId,
    sessionId,
    completedAt: createdAt,
    createdAt,
    subjectId,
    subjectName,
    practiceType,
    score: correctCount,
    totalQuestions,
    accuracy,
    correctCount,
    wrongCount,
    maxCorrectStreak,
    answerRecords: answers,
    isRecommendedPractice,
    didLevelUp,
    rewards,
    xpEarned: rewards.xp.totalXp,
    sessionXp,
    coinsEarned: 0,
    comboBonus: 0,
    levelCoins: 0,
    previousUserXp: calculateTotalXPFromTransactions() - sessionXp,
    newUserXp: calculateTotalXPFromTransactions(),
    previousCoins: user.coins || 0,
    newCoins: user.coins || 0,
    previousSubjectXp,
    newSubjectXp,
    previousSubjectLevel,
    newSubjectLevel,
    levelUp: {
      didLevelUp,
      previousLevel: previousSubjectLevel,
      newLevel: newSubjectLevel,
      unlockedPractice: didLevelUp ? newSubjectLevel.unlock : null,
    },
    weakTopic,
    recommendation: `Practice 10 more ${weakTopic} questions.`,
    wrongAnswers,
  };
  const rewarded = applyPracticeRewards({
    user,
    subjectProgress,
    subjectId,
    sessionId,
    rewards,
    result,
  });
  const finalResult = rewarded.result;

  saveReviewQuestions([...wrongAnswers, ...getReviewQuestions()]);
  savePracticeHistory([finalResult, ...getPracticeHistory()]);
  return finalResult;
}

if (typeof window !== "undefined" && import.meta.env.DEV) {
  window.resetPrepQuestPracticeProgress = () => {
    [
      "prepquest_subject_progress",
      "prepquest_practice_history",
      "prepquest_review_questions",
      "prepquest_last_practice_result",
      "prepquest_xp_transactions",
      "prepquest_coin_transactions",
      "prepquest_rewarded_sessions",
    ].forEach((key) => localStorage.removeItem(key));
    console.info("PrepQuest practice progress has been reset.");
  };
}
