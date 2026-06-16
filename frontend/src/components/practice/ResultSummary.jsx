import { FaCoins, FaFire, FaStar, FaTrophy } from "react-icons/fa";
import { getNextLevelProgress } from "../../utils/xpUtils";

function ResultSummary({ result }) {
  const progress = getNextLevelProgress(result.newSubjectXp);

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
        <span><FaStar /> +{result.xpEarned} XP</span>
        <span><FaCoins /> +{result.coinsEarned} Coins</span>
        <span><FaFire /> Combo +{result.comboBonus} XP</span>
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
