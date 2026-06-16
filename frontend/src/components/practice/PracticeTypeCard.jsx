import { FaLock, FaPlay } from "react-icons/fa";

function PracticeTypeCard({ type, unlocked, requirement, onStart }) {
  return (
    <article className={`dashboard-card practice-type-card${unlocked ? "" : " locked"}`}>
      <div className="card-heading">
        <h3>{type.name}</h3>
        <span className={unlocked ? "status-chip" : "locked-chip"}>{unlocked ? "Unlocked" : <><FaLock /> Locked</>}</span>
      </div>
      <p>{type.description}</p>
      <div className="practice-type-meta">
        <span>{type.detail}</span>
        <span>Unlocked at Level {type.level}</span>
      </div>
      {unlocked ? (
        <button className="btn btn-full" type="button" onClick={onStart}>
          <FaPlay /> Start
        </button>
      ) : (
        <div className="locked-requirement"><FaLock /> {requirement}</div>
      )}
    </article>
  );
}

export default PracticeTypeCard;
