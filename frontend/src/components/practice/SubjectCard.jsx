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
import { FaArrowRight } from "react-icons/fa";
import PremiumBadge from "./PremiumBadge";
import { SUBJECT_ICON_ASSETS } from "../../data/practiceIconAssets";

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

// Per-subject accent so the icon reads as a strong, distinct emblem (matches the
// gamified reference). Falls back to the brand teal for any unmapped subject.
const accentMap = {
  "general-knowledge": "#18e0c2",
  constitution: "#a855f7",
  "current-affairs": "#3b82f6",
  "general-ability-iq": "#22d3ee",
  "governance-basics": "#22c55e",
  "public-administration-basics": "#f59e0b",
  nepali: "#ef4444",
  english: "#f97316",
  "iq-mental-ability": "#22d3ee",
  "nepali-grammar": "#ef4444",
  "english-grammar": "#f97316",
};

function SubjectCard({ subject, onPractice }) {
  const Icon = iconMap[subject.id] || Building2;
  const accent = accentMap[subject.id] || "#18e0c2";
  const iconAsset = SUBJECT_ICON_ASSETS[subject.id]; // premium art if added later
  const progress = subject.progress;
  const levelProgress = subject.levelProgress;
  const currentLevel = subject.currentLevel;
  const hasStarted = subject.hasStarted;
  const nextLevelLabel = levelProgress.nextLevel ? `Lvl ${levelProgress.nextLevel.level}` : "Max";
  const displayProgressPercent = levelProgress.nextRequiredXp
    ? Math.min(100, Math.round((progress.xp / levelProgress.nextRequiredXp) * 100))
    : 100;
  const accuracyStat = hasStarted && subject.accuracy !== null ? `${subject.accuracy}%` : "—";
  const solvedStat = progress.questionsSolved || 0;
  const mistakesStat = progress.wrongAnswers || 0;

  return (
    <article className={`subject-card practice-subject-card${subject.canPractice ? "" : " disabled"}`}>
      <div className="subject-card-header">
        <PremiumBadge
          src={iconAsset}
          alt={subject.name}
          imgClassName="practice-subject-icon-img"
          className="subject-card-icon hex-badge"
          style={
            iconAsset
              ? undefined
              : {
                  color: accent,
                  background: `linear-gradient(150deg, ${accent}, ${accent}55)`,
                  filter: `drop-shadow(0 5px 14px ${accent}50)`,
                }
          }
        >
          <Icon />
        </PremiumBadge>
        <div className="subject-card-titles">
          <div className="subject-card-name">{subject.name}</div>
          <span className="subject-level-chip" style={{ color: accent, background: `${accent}1a`, borderColor: `${accent}40` }}>
            Level {currentLevel.level} · {hasStarted ? currentLevel.name : "Not Started"}
          </span>
        </div>
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

      <div className="subject-card-statgrid">
        <div className="subject-stat">
          <span>Accuracy</span>
          <strong className="accuracy">{accuracyStat}</strong>
        </div>
        <div className="subject-stat">
          <span>Solved</span>
          <strong>{solvedStat}</strong>
        </div>
        <div className="subject-stat">
          <span>Mistakes</span>
          <strong className="mistakes">{mistakesStat}</strong>
        </div>
      </div>

      <div className="subject-card-footer">
        <button className="subject-practice-btn" type="button" disabled={!subject.canPractice} onClick={onPractice}>
          {subject.canPractice ? (
            <>Practice Now <FaArrowRight /></>
          ) : (
            "Question Bank Not Ready"
          )}
        </button>
      </div>
    </article>
  );
}

export default SubjectCard;
