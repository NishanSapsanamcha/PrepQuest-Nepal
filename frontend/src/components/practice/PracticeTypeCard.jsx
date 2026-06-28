import { FaBullseye, FaCheckCircle, FaCrown, FaLayerGroup, FaLock, FaPlay, FaQuestionCircle, FaRocket, FaShieldAlt, FaTrophy } from "react-icons/fa";

const practiceIcons = {
  "Quick Practice": FaRocket,
  "Topic Practice": FaBullseye,
  "Mixed Practice": FaLayerGroup,
  "Weak Area Practice": FaShieldAlt,
  "Accuracy Challenge": FaTrophy,
  "Advanced Revision": FaCrown,
};

// Per-mode accent so each card reads as a distinct unlockable game mode.
const accentMap = {
  "Quick Practice": "#18e0c2",
  "Topic Practice": "#3b82f6",
  "Mixed Practice": "#a855f7",
  "Weak Area Practice": "#f59e0b",
  "Accuracy Challenge": "#22c55e",
  "Advanced Revision": "#ef4444",
};

function PracticeTypeCard({
  type,
  unlocked,
  currentXp,
  unlockLevel,
  unlockPercent,
  validationMessage,
  questionCount,
  iconSrc,
  onStart,
}) {
  const Icon = practiceIcons[type.name] || FaQuestionCircle;
  const accent = accentMap[type.name] || "#18e0c2";
  const isQuickPractice = type.level === 1;
  const isQuestionBankBlocked = isQuickPractice && Boolean(validationMessage);

  return (
    <article
      className={`practice-type-card ${unlocked ? "unlocked" : "locked"}`}
      style={unlocked ? { "--mode-accent": accent } : undefined}
    >
      <div className="ptc-head">
        {iconSrc ? (
          <span className="ptc-icon ptc-icon-img" style={{ filter: `drop-shadow(0 5px 14px ${accent}55)` }}>
            <img src={iconSrc} alt="" loading="lazy" />
          </span>
        ) : (
          <span
            className="ptc-icon hex-badge"
            style={{ color: accent, background: `linear-gradient(150deg, ${accent}, ${accent}66)`, filter: `drop-shadow(0 5px 14px ${accent}50)` }}
          >
            <Icon />
          </span>
        )}
        <div className="ptc-info">
          <div className="ptc-title-row">
            <h3>{type.name}</h3>
            {!unlocked && <span className="ptc-lock-pill"><FaLock /> Locked</span>}
          </div>
          <p>{type.description}</p>
        </div>
      </div>

      {unlocked ? (
        <div className="ptc-foot">
          {isQuestionBankBlocked ? (
            <div className="ptc-blocked"><FaLock /> Question bank not ready ({questionCount})</div>
          ) : (
            <>
              <span className="ptc-available">Available Now</span>
              <button className="ptc-start-btn" type="button" onClick={onStart}>
                <FaPlay /> {type.buttonLabel || "Start Practice"}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="ptc-foot ptc-locked-foot">
          <div className="ptc-unlock-line">
            <FaLock /> Unlocks at Level {unlockLevel.level}: {unlockLevel.name}
          </div>
          <div className="ptc-unlock-progress">
            <div className="ptc-unlock-prog-label">
              <span>{currentXp} / {unlockLevel.requiredXp} XP</span>
              <span>{unlockPercent}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${unlockPercent}%`, background: `linear-gradient(90deg, ${accent}, ${accent}aa)` }}
              />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default PracticeTypeCard;
