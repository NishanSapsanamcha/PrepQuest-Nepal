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
import { formatLevel, getPreferredLanguage, t, translateSubjectName, trText } from "../../data/translations";

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
  const preferredLanguage = getPreferredLanguage();
  const Icon = iconMap[subject.id] || Building2;
  const accent = accentMap[subject.id] || "#18e0c2";
  const iconAsset = SUBJECT_ICON_ASSETS[subject.id]; // premium art if added later
  const progress = subject.progress;
  const levelProgress = subject.levelProgress;
  const currentLevel = subject.currentLevel;
  const hasStarted = subject.hasStarted;
  const nextLevelLabel = levelProgress.nextLevel ? `${t("level", preferredLanguage)} ${levelProgress.nextLevel.level}` : t("maxLevel", preferredLanguage);
  const displayProgressPercent = levelProgress.nextRequiredXp
    ? Math.min(100, Math.round((progress.xp / levelProgress.nextRequiredXp) * 100))
    : 100;
  const accuracyStat = hasStarted && subject.accuracy !== null ? `${subject.accuracy}%` : "â€”";
  const solvedStat = progress.questionsSolved || 0;
  const mistakesStat = progress.wrongAnswers || 0;

  return (
    <article className={`subject-card practice-subject-card${subject.canPractice ? "" : " disabled"}`}>
      <div className="subject-card-header">
        <PremiumBadge
          src={iconAsset}
          alt={translateSubjectName(subject.name, preferredLanguage)}
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
          <div className="subject-card-name">{translateSubjectName(subject.name, preferredLanguage)}</div>
          <span className="subject-level-chip" style={{ color: accent, background: `${accent}1a`, borderColor: `${accent}40` }}>
            {formatLevel(currentLevel.level, hasStarted ? currentLevel.name : "Not Started", preferredLanguage)}
          </span>
        </div>
      </div>

      <div className="subject-card-progress">
        <div className="subject-card-progress-label">
          <span>{progress.xp} / {levelProgress.nextRequiredXp} XP</span>
          <span>{preferredLanguage === "nepali" ? `${displayProgressPercent}% ${nextLevelLabel} ${t("toLabel", preferredLanguage)}` : `${displayProgressPercent}% ${t("toLabel", preferredLanguage)} ${nextLevelLabel}`}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${displayProgressPercent}%` }} />
        </div>
      </div>

      <div className="subject-card-statgrid">
        <div className="subject-stat">
          <span>{t("accuracy", preferredLanguage)}</span>
          <strong className="accuracy">{accuracyStat}</strong>
        </div>
        <div className="subject-stat">
          <span>{t("solved", preferredLanguage)}</span>
          <strong>{solvedStat}</strong>
        </div>
        <div className="subject-stat">
          <span>{t("mistakes", preferredLanguage)}</span>
          <strong className="mistakes">{mistakesStat}</strong>
        </div>
      </div>

      <div className="subject-card-footer">
        <button className="subject-practice-btn" type="button" disabled={!subject.canPractice} onClick={onPractice}>
          {subject.canPractice ? (
            <>{t("practiceNow", preferredLanguage)} <FaArrowRight /></>
          ) : (
            trText("Question Bank Not Ready", preferredLanguage)
          )}
        </button>
      </div>
    </article>
  );
}

export default SubjectCard;

