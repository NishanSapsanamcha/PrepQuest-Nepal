import { FaArrowRight } from "react-icons/fa";
import { getNextLevelProgress } from "../../utils/xpUtils";

function SubjectCard({ subject, progress, onPractice }) {
  const Icon = subject.icon;
  const levelProgress = getNextLevelProgress(progress.xp);
  const currentLevel = levelProgress.currentLevel;

  return (
    <article className="subject-card practice-subject-card">
      <div className="practice-card-top">
        <span className="stat-icon"><Icon /></span>
        <span className="subject-badge">Level {currentLevel.level}</span>
      </div>
      <h3>{subject.name}</h3>
      <p>{subject.description}</p>
      <div className="subject-level-line">Level {currentLevel.level}: {currentLevel.name}</div>
      <div className="preview-progress-row">
        <span>{progress.xp} / {levelProgress.nextLevelXp} XP</span>
        <span>{levelProgress.percent}% to {levelProgress.nextLevel ? `Level ${levelProgress.nextLevel.level}` : "Mastered"}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${levelProgress.percent}%` }} />
      </div>
      <div className="subject-card-metrics">
        <span>Accuracy: <strong>{progress.accuracy}%</strong></span>
        <span>Questions Solved: <strong>{progress.questionsSolved}</strong></span>
      </div>
      <button className="subject-btn" type="button" onClick={onPractice}>
        Practice Now <FaArrowRight />
      </button>
    </article>
  );
}

export default SubjectCard;
