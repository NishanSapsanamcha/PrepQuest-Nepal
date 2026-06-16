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
      percent: 100,
      currentXp: xp,
      nextLevelXp: currentLevel.requiredXp,
      remainingXp: 0,
    };
  }

  const levelSpan = nextLevel.requiredXp - currentLevel.requiredXp;
  const earnedInLevel = xp - currentLevel.requiredXp;
  const percent = Math.min(100, Math.round((earnedInLevel / levelSpan) * 100));

  return {
    currentLevel,
    nextLevel,
    percent,
    currentXp: xp,
    nextLevelXp: nextLevel.requiredXp,
    remainingXp: Math.max(0, nextLevel.requiredXp - xp),
  };
}

export function calculatePracticeRewards(correctCount, totalQuestions, maxStreak) {
  const baseXp = correctCount * 10;
  const completionXp = totalQuestions >= 10 ? 30 : 0;
  const comboBonus = maxStreak >= 5 ? 15 : maxStreak >= 3 ? 5 : 0;
  const accuracy = calculateAccuracy(correctCount, totalQuestions);
  const accuracyCoins = accuracy >= 80 ? 20 : 0;

  return {
    xpEarned: baseXp + completionXp + comboBonus,
    coinsEarned: accuracyCoins,
    comboBonus,
    accuracyCoins,
  };
}

export function calculateAccuracy(correct, total) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
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
