import { FaBullseye, FaCheckCircle, FaLayerGroup, FaLock, FaPlay, FaQuestionCircle, FaRocket, FaTrophy } from "react-icons/fa";

const practiceIcons = {
  "Quick Practice": FaRocket,
  "Topic Practice": FaBullseye,
  "Mixed Practice": FaLayerGroup,
  "Weak Area Practice": FaQuestionCircle,
  "Accuracy Challenge": FaTrophy,
  "Advanced Revision": FaCheckCircle,
};

function PracticeTypeCard({
  type,
  unlocked,
  currentXp,
  unlockLevel,
  unlockPercent,
  xpNeeded,
  questionCount,
  quickPracticeCount,
  validationMessage,
  onStart,
}) {
  const Icon = practiceIcons[type.name] || FaQuestionCircle;
  const isQuickPractice = type.level === 1;
  const isQuestionBankBlocked = isQuickPractice && Boolean(validationMessage);
  const availableQuestionText = isQuickPractice
    ? `${quickPracticeCount} validated question${quickPracticeCount === 1 ? "" : "s"}`
    : type.detail;

  return (
    <article className={`dashboard-card practice-type-card ${unlocked ? "unlocked" : "locked"}`}>
      <div className="practice-card-top">
        <span className="practice-card-icon"><Icon /></span>
        <span className={`practice-status-pill ${unlocked ? "is-unlocked" : "is-locked"}`}>
          {unlocked ? "Unlocked" : <><FaLock /> Locked</>}
        </span>
      </div>

      <div className="practice-card-body">
        <p className="practice-card-kicker">{unlocked && type.shortLabel ? type.shortLabel : `Unlocks at Level ${type.level}`}</p>
        <h3>{type.name}</h3>
        <p>{type.description}</p>
      </div>

      <div className="practice-mode-facts">
        <span>{availableQuestionText}</span>
        {isQuickPractice && <span>No pressure</span>}
        {isQuickPractice && <span>Rewards: {type.reward}</span>}
      </div>

      {!unlocked && (
        <div className="unlock-requirement-box">
          {isQuestionBankBlocked ? (
            <>
              <span>Question Bank</span>
              <strong>{validationMessage}</strong>
              <em>Validated questions: {questionCount}</em>
            </>
          ) : (
            <>
              <span>Unlock Requirement</span>
              <strong>Reach Level {unlockLevel.level}: {unlockLevel.name}</strong>
              <div className="unlock-progress-mini">
                <div>
                  <span>{currentXp} / {unlockLevel.requiredXp} XP</span>
                  <span>{unlockPercent}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${unlockPercent}%` }} />
                </div>
              </div>
              <em>Need {xpNeeded} more XP</em>
            </>
          )}
        </div>
      )}

      <div className="practice-card-actions">
        <button
          className={`btn btn-full ${unlocked ? "primary-button" : "disabled-button"}`}
          type="button"
          disabled={!unlocked}
          onClick={onStart}
        >
          {unlocked ? (
            <><FaPlay /> {type.buttonLabel || "Start Practice"}</>
          ) : (
            <>
              <FaLock /> {isQuestionBankBlocked ? "Question Bank Not Ready" : "Locked"}
            </>
          )}
        </button>
      </div>
    </article>
  );
}

export default PracticeTypeCard;
