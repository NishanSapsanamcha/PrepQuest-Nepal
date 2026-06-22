import { useMemo } from "react";
import { FaStar, FaTrophy } from "react-icons/fa";
import { getNextLevelProgress } from "../../utils/xpUtils";

function ResultSummary({ result }) {
  const progress = getNextLevelProgress(result.newSubjectXp);
  const rewardXp = result.rewards?.xp || {};
  const milestones = useMemo(() => {
    const items = ["Practice completed"];
    if (result.accuracy >= 80) items.push("Score 80% or higher");
    if (result.totalQuestions === 10 && result.score === 10) items.push("Perfect score 10/10");
    if (result.accuracy === 100 && result.totalQuestions !== 10) items.push("Perfect score");
    if (result.levelUp?.didLevelUp) items.push(`Subject level up: Level ${result.levelUp.newLevel.level}`);
    if (result.maxCorrectStreak === 3) items.push("3 correct answers in a row");
    if (result.maxCorrectStreak >= 5) items.push("5 correct answers in a row");
    return items;
  }, [result]);
  const isMajorMilestone = result.accuracy >= 80 || result.levelUp?.didLevelUp || result.maxCorrectStreak >= 3;
  const xpRows = [
    { label: "Correct Answer XP", amount: rewardXp.correctAnswerXp || 0, show: true },
  ].filter((row) => row.show);
  const sessionXp = result.sessionXp ?? rewardXp.totalXp ?? result.xpEarned ?? 0;

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
      <div className={`result-celebration ${isMajorMilestone ? "major" : ""}`} aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => <span key={index} />)}
      </div>
      <div className="result-hero-icon"><FaTrophy /></div>
      <p className="eyebrow">Practice Complete!</p>
      <h1>{result.subjectName}</h1>
      <div className="milestone-toast" role="status" aria-live="polite">
        <strong>{isMajorMilestone ? "Milestone reached" : "Session complete"}</strong>
        <span>{milestones.join(" - ")}</span>
      </div>
      <div className="result-metrics">
        <div><span>Practice Type</span><strong>{result.practiceType}</strong></div>
        <div><span>Score</span><strong>{result.score} / {result.totalQuestions}</strong></div>
        <div><span>Accuracy</span><strong>{result.accuracy}%</strong></div>
        <div><span>Correct</span><strong>{result.correctCount}</strong></div>
        <div><span>Wrong</span><strong>{result.wrongCount}</strong></div>
      </div>
      <div className="reward-pills result-rewards">
        <span><FaStar /> +{sessionXp} XP</span>
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
          <div className="reward-breakdown-total">
            <span>Total XP Earned</span>
            <strong>+{sessionXp} XP</strong>
          </div>
        </div>
      </div>
      <div className="reward-ledger">
        <div><span>Total XP</span><strong>{result.previousUserXp?.toLocaleString()}{" -> "}{result.newUserXp?.toLocaleString()}</strong></div>
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
