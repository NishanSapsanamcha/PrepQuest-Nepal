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

export function normalizeLanguage(language) {
  const value = String(language || "english").toLowerCase();
  if (value.includes("both")) return "both";
  if (value.includes("nepali")) return "nepali";
  return "english";
}

export function getExamSubjects(exam) {
  const examId = normalizeExamId(exam);
  const track = examTracks[examId] || examTracks["sakha-adhikrit"];
  return track.subjectIds.map(getSubjectById).filter(Boolean);
}

export function getSubjectQuestions(subjectId, exam) {
  const examId = normalizeExamId(exam);
  const examLabel = examTracks[examId]?.name || "Sakha Adhikrit";
  const questions = practiceQuestions.filter(
    (question) => question.subjectId === subjectId && (!question.examTrack || question.examTrack === examLabel)
  );
  return questions.length >= 10 ? questions.slice(0, 10) : [...questions, ...questions].slice(0, 10);
}

export function getText(question, language) {
  const mode = normalizeLanguage(language);
  const english = {
    question: question.question_en,
    options: question.options_en,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation_en,
  };
  const nepali = {
    question: question.question_np || question.question_en,
    options: question.options_np || question.options_en,
    correctAnswer: question.correctAnswerNp || question.correctAnswer,
    explanation: question.explanation_np || question.explanation_en,
  };

  if (mode === "nepali") return nepali;
  if (mode === "both") {
    return {
      question: `${english.question}\n${nepali.question}`,
      options: english.options.map((option, index) => `${option} / ${nepali.options[index] || option}`),
      correctAnswer: `${english.correctAnswer} / ${nepali.correctAnswer}`,
      explanation: `${english.explanation}\n${nepali.explanation}`,
    };
  }
  return english;
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
      return { ...answer, question, subjectId, subjectName, savedAt: new Date().toISOString() };
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
