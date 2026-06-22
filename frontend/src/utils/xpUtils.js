import { subjectLevels } from "../data/subjectLevels";

export function getSubjectLevel(xp = 0) {
  return subjectLevels.reduce((current, level) => (xp >= level.requiredXp ? level : current), subjectLevels[0]);
}

export function getNextLevelProgress(xp = 0) {
  const currentLevel = getSubjectLevel(xp);
  const nextLevel = subjectLevels.find((level) => level.level === currentLevel.level + 1);

  if (!nextLevel) {
    return {
      currentLevel,
      nextLevel: null,
      currentXp: xp,
      nextRequiredXp: currentLevel.requiredXp,
      progressPercent: 100,
      xpNeeded: 0,
      percent: 100,
      nextLevelXp: currentLevel.requiredXp,
      remainingXp: 0,
    };
  }

  const levelSpan = nextLevel.requiredXp - currentLevel.requiredXp;
  const earnedInLevel = xp - currentLevel.requiredXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((earnedInLevel / levelSpan) * 100)));

  return {
    currentLevel,
    nextLevel,
    currentXp: xp,
    nextRequiredXp: nextLevel.requiredXp,
    progressPercent,
    xpNeeded: Math.max(0, nextLevel.requiredXp - xp),
    percent: progressPercent,
    nextLevelXp: nextLevel.requiredXp,
    remainingXp: Math.max(0, nextLevel.requiredXp - xp),
  };
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

export function calculatePracticeRewards({
  totalQuestions,
  correctCount,
  maxCorrectStreak,
  isRecommendedPractice = false,
  didLevelUp = false,
  isPerfectScore = false,
}) {
  const accuracy = calculateAccuracy(correctCount, totalQuestions);
  const correctAnswerXp = correctCount * 10;
  const completionXp = totalQuestions > 0 ? 30 : 0;
  const comboXp = maxCorrectStreak >= 5 ? 10 : maxCorrectStreak >= 3 ? 5 : 0;
  const recommendedPracticeXp = isRecommendedPractice ? 20 : 0;
  const levelUpXp = didLevelUp ? 50 : 0;
  const accuracyBonusCoins = accuracy >= 80 ? 20 : 0;
  const recommendedPracticeCoins = isRecommendedPractice ? 20 : 0;
  const levelUpCoins = didLevelUp ? 30 : 0;
  const perfectScoreCoins = isPerfectScore || accuracy === 100 ? 25 : 0;
  const xp = {
    correctAnswerXp,
    completionXp,
    comboXp,
    recommendedPracticeXp,
    levelUpXp,
    totalXp: correctAnswerXp + completionXp + comboXp + recommendedPracticeXp + levelUpXp,
  };
  const coins = {
    accuracyBonusCoins,
    recommendedPracticeCoins,
    levelUpCoins,
    perfectScoreCoins,
    totalCoins: accuracyBonusCoins + recommendedPracticeCoins + levelUpCoins + perfectScoreCoins,
  };
  const summary = [
    correctAnswerXp > 0 && { label: "Correct Answers", amount: `+${correctAnswerXp} XP` },
    completionXp > 0 && { label: "Completion Bonus", amount: `+${completionXp} XP` },
    comboXp > 0 && { label: "Combo Bonus", amount: `+${comboXp} XP` },
    recommendedPracticeXp > 0 && { label: "Recommended Practice", amount: `+${recommendedPracticeXp} XP` },
    levelUpXp > 0 && { label: "Level Up Bonus", amount: `+${levelUpXp} XP` },
    accuracyBonusCoins > 0 && { label: "Score 80%+", amount: `+${accuracyBonusCoins} Coins` },
    recommendedPracticeCoins > 0 && { label: "Recommended Practice", amount: `+${recommendedPracticeCoins} Coins` },
    levelUpCoins > 0 && { label: "Level Up Bonus", amount: `+${levelUpCoins} Coins` },
    perfectScoreCoins > 0 && { label: "Perfect Score", amount: `+${perfectScoreCoins} Coins` },
  ].filter(Boolean);

  return { xp, coins, summary };
}

export function checkLevelUp(previousXp, newXp) {
  const previousLevel = getSubjectLevel(previousXp);
  const newLevel = getSubjectLevel(newXp);
  return {
    didLevelUp: newLevel.level > previousLevel.level,
    previousLevel,
    newLevel,
    unlockedPractice: newLevel.level > previousLevel.level ? newLevel.unlock : null,
  };
}
