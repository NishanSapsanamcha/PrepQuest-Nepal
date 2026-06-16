import { FaArrowRight } from "react-icons/fa";

function SubjectCard({ subject, onPractice }) {
  const Icon = subject.icon;
  const progress = subject.progress;
  const levelProgress = subject.levelProgress;
  const currentLevel = subject.currentLevel;
  const nextLevelLabel = levelProgress.nextLevel ? `Level ${levelProgress.nextLevel.level}` : "Mastered";

  return (
    <article className={`subject-card practice-subject-card${subject.canPractice ? "" : " disabled"}`}>
      <div className="practice-card-top">
        <span className="stat-icon"><Icon /></span>
        <span className="subject-badge">Level {currentLevel.level}</span>
      </div>
      <h3>{subject.name}</h3>
      <p>{subject.description}</p>
      <div className="subject-level-line">{subject.masteryStatus}</div>
      <div className="subject-level-line">Level {currentLevel.level}: {currentLevel.name}</div>
      <div className="preview-progress-row">
        <span>{progress.xp} / {levelProgress.nextRequiredXp} XP</span>
        <span>{levelProgress.progressPercent}% to {nextLevelLabel}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${levelProgress.progressPercent}%` }} />
      </div>
      <div className="subject-card-metrics">
        <span>Accuracy: <strong>{subject.accuracy === null ? "Not started" : `${subject.accuracy}%`}</strong></span>
        <span>Questions Solved: <strong>{progress.questionsSolved}</strong></span>
        <span>Validated Questions: <strong>{subject.questionsAvailable}</strong></span>
      </div>
      <button className="subject-btn" type="button" disabled={!subject.canPractice} onClick={onPractice}>
        {subject.canPractice ? "Practice Now" : "Coming Soon"} {subject.canPractice && <FaArrowRight />}
      </button>
    </article>
  );
}

export default SubjectCard;
