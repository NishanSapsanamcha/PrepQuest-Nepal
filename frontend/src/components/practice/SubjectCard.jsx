import {
  Brain,
  Building2,
  ClipboardList,
  Globe2,
  Landmark,
  Languages,
  Newspaper,
  Pencil,
  ScrollText,
} from "lucide-react";

const iconMap = {
  "general-knowledge": Globe2,
  constitution: ScrollText,
  "current-affairs": Newspaper,
  "general-ability-iq": Brain,
  "governance-basics": Landmark,
  "public-administration-basics": ClipboardList,
  nepali: Pencil,
  english: Languages,
  "iq-mental-ability": Brain,
  "nepali-grammar": Pencil,
  "english-grammar": Languages,
};

function SubjectCard({ subject, onPractice }) {
  const Icon = iconMap[subject.id] || Building2;
  const progress = subject.progress;
  const levelProgress = subject.levelProgress;
  const currentLevel = subject.currentLevel;
  const nextLevelLabel = levelProgress.nextLevel ? `Level ${levelProgress.nextLevel.level}` : "Mastered";
  const statusLabel = subject.masteryStatus === "Not Started" ? "Starting" : subject.masteryStatus;
  const accuracyLabel = subject.accuracy === null ? "Not started" : `${subject.accuracy}%`;
  const displayProgressPercent = levelProgress.nextRequiredXp
    ? Math.min(100, Math.round((progress.xp / levelProgress.nextRequiredXp) * 100))
    : 100;
  const subjectCopy = {
    "general-knowledge": "History, geography, science, and everyday facts.",
    constitution: "Build constitutional knowledge, rights, duties, and governance structure.",
    "current-affairs": "Stay updated on national and international events.",
    "general-ability-iq": "Logical reasoning, puzzles, and analytical thinking.",
    "governance-basics": "Government systems, policies, and administrative law.",
    "public-administration-basics": "Concepts of public service, bureaucracy, and administration.",
  };

  return (
    <article className={`subject-card practice-subject-card${subject.canPractice ? "" : " disabled"}`}>
      <div className="subject-card-header">
        <div className="subject-card-icon"><Icon /></div>
        <div>
          <div className="subject-card-name">{subject.name}</div>
          <div className="subject-card-desc">{subjectCopy[subject.id] || subject.description}</div>
        </div>
      </div>
      <div className="subject-card-meta">
        <span className="subject-meta-badge level">Level {currentLevel.level}: {currentLevel.name}</span>
        <span className="subject-meta-badge">{statusLabel}</span>
      </div>
      <div className="subject-card-progress">
        <div className="subject-card-progress-label">
          <span>{progress.xp} / {levelProgress.nextRequiredXp} XP</span>
          <span>{displayProgressPercent}% to {nextLevelLabel}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${displayProgressPercent}%` }} />
        </div>
      </div>
      <div className="subject-card-stats">
        <div>Accuracy: <span>{accuracyLabel}</span></div>
        <div>Solved: <span>{progress.questionsSolved}</span></div>
      </div>
      <div className="subject-card-footer">
        <button className="primary-button small subject-btn" type="button" disabled={!subject.canPractice} onClick={onPractice}>
          {subject.canPractice ? "Practice Now" : "Coming Soon"}
        </button>
      </div>
    </article>
  );
}

export default SubjectCard;
