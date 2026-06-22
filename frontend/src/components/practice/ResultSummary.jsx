import { FaCoins, FaFire, FaStar, FaTrophy } from "react-icons/fa";
import { getNextLevelProgress } from "../../utils/xpUtils";

function ResultSummary({ result }) {
  const progress = getNextLevelProgress(result.newSubjectXp);
  const rewardXp = result.rewards?.xp || {};
  const rewardCoins = result.rewards?.coins || {};
  const xpRows = [
    { label: "Correct Answer XP", amount: rewardXp.correctAnswerXp || 0, show: true },
    { label: "Completion Bonus", amount: rewardXp.completionXp || 0, show: (rewardXp.completionXp || 0) > 0 },
    { label: "Combo Bonus", amount: rewardXp.comboXp || result.comboBonus || 0, show: (rewardXp.comboXp || result.comboBonus || 0) > 0 },
    { label: "Recommended Practice Bonus", amount: rewardXp.recommendedPracticeXp || 0, show: (rewardXp.recommendedPracticeXp || 0) > 0 },
    { label: "Level-up Bonus", amount: rewardXp.levelUpXp || 0, show: (rewardXp.levelUpXp || 0) > 0 },
  ].filter((row) => row.show);
  const coinRows = [
    { label: "Accuracy Coins", amount: rewardCoins.accuracyBonusCoins || 0 },
    { label: "Recommended Practice Coins", amount: rewardCoins.recommendedPracticeCoins || 0 },
    { label: "Level-up Coins", amount: rewardCoins.levelUpCoins || 0 },
    { label: "Perfect Score Coins", amount: rewardCoins.perfectScoreCoins || 0 },
  ].filter((row) => row.amount > 0);

  if (result.rewardValidationFailed) {
    return (
      <section className="dashboard-card result-summary">
        <div className="result-hero-icon"><FaTrophy /></div>
        <p className="eyebrow">Practice Complete</p>
        <h1>Reward validation failed</h1>
        <p className="card-copy">Reward validation failed. Please retry the practice session.</p>
      </section>
    );
  }

  return (
    <section className="dashboard-card result-summary">
      <div className="result-hero-icon"><FaTrophy /></div>
      <p className="eyebrow">Practice Complete!</p>
      <h1>{result.subjectName}</h1>
      <div className="result-metrics">
        <div><span>Practice Type</span><strong>{result.practiceType}</strong></div>
        <div><span>Score</span><strong>{result.score} / {result.totalQuestions}</strong></div>
        <div><span>Accuracy</span><strong>{result.accuracy}%</strong></div>
        <div><span>Correct</span><strong>{result.correctCount}</strong></div>
        <div><span>Wrong</span><strong>{result.wrongCount}</strong></div>
      </div>
      <div className="reward-pills result-rewards">
        <span><FaStar /> +{result.rewards?.xp?.totalXp || result.xpEarned} XP</span>
        <span><FaCoins /> +{result.rewards?.coins?.totalCoins || result.coinsEarned} Coins</span>
        <span><FaFire /> Combo +{result.rewards?.xp?.comboXp || result.comboBonus || 0} XP</span>
      </div>
      <div className="reward-breakdown">
        <h2>Rewards Earned</h2>
        <div className="reward-breakdown-list">
          {xpRows.map((item) => (
            <div className="reward-breakdown-row" key={item.label}>
              <span>{item.label}</span>
              <strong>+{item.amount} XP</strong>
            </div>
          ))}
          {coinRows.map((item) => (
            <div className="reward-breakdown-row" key={item.label}>
              <span>{item.label}</span>
              <strong>+{item.amount} Coins</strong>
            </div>
          ))}
          <div className="reward-breakdown-total">
            <span>Total XP Earned</span>
            <strong>+{result.rewards?.xp?.totalXp || result.xpEarned} XP</strong>
          </div>
          <div className="reward-breakdown-total coins-total">
            <span>Coins Earned</span>
            <strong>+{result.rewards?.coins?.totalCoins || result.coinsEarned} Coins</strong>
          </div>
        </div>
      </div>
      <div className="reward-ledger">
        <div><span>Total XP</span><strong>{result.previousUserXp?.toLocaleString()}{" -> "}{result.newUserXp?.toLocaleString()}</strong></div>
        <div><span>Coins</span><strong>{result.previousCoins?.toLocaleString()}{" -> "}{result.newCoins?.toLocaleString()}</strong></div>
        <div><span>Subject XP Before / After</span><strong>{result.previousSubjectXp?.toLocaleString()}{" -> "}{result.newSubjectXp?.toLocaleString()}</strong></div>
      </div>
      <div className="subject-result-progress">
        <div className="preview-progress-row">
          <span>{result.subjectName} XP: {result.newSubjectXp} / {progress.nextLevelXp} XP</span>
          <span>Level {progress.currentLevel.level} - {progress.currentLevel.name}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
        </div>
      </div>
      {result.levelUp?.didLevelUp && (
        <div className="level-up-panel">
          <strong>Level Up!</strong>
          <span>You reached {result.subjectName} Level {result.levelUp.newLevel.level}.</span>
          <span>New Practice Unlocked: {result.levelUp.unlockedPractice}</span>
        </div>
      )}
    </section>
  );
}

export default ResultSummary;
