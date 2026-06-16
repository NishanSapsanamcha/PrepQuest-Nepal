import { examNameToId, examTracks } from "../data/examTracks";
import { practiceQuestions } from "../data/practiceQuestions";
import { getSubjectById } from "../data/subjects";
import { calculateAccuracy, calculatePracticeRewards, checkLevelUp, getSubjectLevel } from "./xpUtils";
import {
  getPracticeHistory,
  getReviewQuestions,
  getSubjectProgress,
  getUser,
  savePracticeHistory,
  saveReviewQuestions,
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

const placeholderPattern = /distractor|placeholder|sample question|lorem|fake explanation|generic practice item|practice item/i;
const validOptionKeys = new Set(["A", "B", "C", "D"]);

export function validateQuestionBank(questions) {
  const warnings = [];

  questions.forEach((question, index) => {
    const label = question?.id || `question at index ${index}`;
    if (!question?.id) warnings.push(`${label}: missing id`);
    if (!question?.subjectId) warnings.push(`${label}: missing subjectId`);
    if (!question?.question_en) warnings.push(`${label}: missing question_en`);
    if (!question?.question_np) warnings.push(`${label}: missing question_np`);
    if (!Array.isArray(question?.options) || question.options.length !== 4) warnings.push(`${label}: must have exactly 4 options`);
    question?.options?.forEach((option) => {
      if (!option?.key || !option?.en || !option?.np) warnings.push(`${label}: every option needs key, en, and np`);
      if ([option?.en, option?.np].some((value) => placeholderPattern.test(String(value || "")))) {
        warnings.push(`${label}: option contains placeholder text`);
      }
    });
    if (!validOptionKeys.has(question?.correctOption)) warnings.push(`${label}: correctOption must be A, B, C, or D`);
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

export function getExamSubjects(exam) {
  const examId = normalizeExamId(exam);
  const track = examTracks[examId] || examTracks["sakha-adhikrit"];
  return track.subjectIds.map(getSubjectById).filter(Boolean);
}

export function getSubjectQuestions(subjectId, exam) {
  validateQuestionBank(practiceQuestions);
  const examId = normalizeExamId(exam);
  const examLabel = examTracks[examId]?.name || "Sakha Adhikrit";
  const subjectAliases = {
    "iq-mental-ability": "general-ability-iq",
    "nepali-grammar": "nepali",
    "english-grammar": "english",
  };
  const questionSubjectId = subjectAliases[subjectId] || subjectId;
  const questions = practiceQuestions.filter(
    (question) =>
      question.subjectId === questionSubjectId &&
      (!question.examTracks?.length || question.examTracks.includes(examLabel))
  );
  if (questions.length >= 10) return questions.slice(0, 10);
  if (!questions.length) return [];

  return Array.from({ length: 10 }, (_, index) => {
    const question = questions[index % questions.length];
    return index < questions.length ? question : { ...question, id: `${question.id}-repeat-${index}` };
  });
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
  const progress = getSubjectProgress();
  return progress[subjectId] || {
    xp: subjectId === "constitution" ? 160 : 80,
    questionsSolved: subjectId === "constitution" ? 30 : 12,
    correct: subjectId === "constitution" ? 19 : 8,
    wrong: subjectId === "constitution" ? 11 : 4,
    accuracy: subjectId === "constitution" ? 62 : 67,
    level: getSubjectLevel(subjectId === "constitution" ? 160 : 80).level,
  };
}

export function completePracticeSession({ subjectId, subjectName, answers, questions, practiceType = "Quick Practice" }) {
  const user = getUser();
  const previousProgress = buildSubjectProgress(subjectId);
  const correctCount = answers.filter((answer) => answer.isCorrect).length;
  const wrongCount = answers.length - correctCount;
  const maxStreak = answers.reduce(
    (state, answer) => {
      const current = answer.isCorrect ? state.current + 1 : 0;
      return { current, max: Math.max(state.max, current) };
    },
    { current: 0, max: 0 }
  ).max;
  const rewards = calculatePracticeRewards(correctCount, questions.length, maxStreak);
  const previousXp = previousProgress.xp || 0;
  const newSubjectXp = previousXp + rewards.xpEarned;
  const levelUp = checkLevelUp(previousXp, newSubjectXp);
  const levelCoins = levelUp.didLevelUp ? 30 : 0;
  const totalCoinsEarned = rewards.coinsEarned + levelCoins;
  const newCorrect = (previousProgress.correct || 0) + correctCount;
  const newWrong = (previousProgress.wrong || 0) + wrongCount;
  const questionsSolved = (previousProgress.questionsSolved || 0) + questions.length;
  const updatedProgress = {
    ...previousProgress,
    xp: newSubjectXp,
    questionsSolved,
    correct: newCorrect,
    wrong: newWrong,
    accuracy: calculateAccuracy(newCorrect, newCorrect + newWrong),
    level: levelUp.newLevel.level,
  };
  const progressMap = { ...getSubjectProgress(), [subjectId]: updatedProgress };
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
    id: `practice-${Date.now()}`,
    completedAt: new Date().toISOString(),
    subjectId,
    subjectName,
    practiceType,
    score: correctCount,
    totalQuestions: questions.length,
    accuracy: calculateAccuracy(correctCount, questions.length),
    correctCount,
    wrongCount,
    xpEarned: rewards.xpEarned,
    coinsEarned: totalCoinsEarned,
    comboBonus: rewards.comboBonus,
    levelCoins,
    previousSubjectXp: previousXp,
    newSubjectXp,
    subjectProgress: updatedProgress,
    levelUp,
    weakTopic,
    recommendation: `Practice 10 more ${weakTopic} questions.`,
    wrongAnswers,
  };

  saveUser({ ...user, totalXp: (user.totalXp || 0) + rewards.xpEarned, coins: (user.coins || 0) + totalCoinsEarned });
  saveSubjectProgress(progressMap);
  saveReviewQuestions([...wrongAnswers, ...getReviewQuestions()]);
  savePracticeHistory([result, ...getPracticeHistory()]);
  return result;
}
