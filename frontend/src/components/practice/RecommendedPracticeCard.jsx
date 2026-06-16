import { FaArrowRight, FaCoins, FaStar } from "react-icons/fa";

function RecommendedPracticeCard({ recommendation, onStart }) {
  return (
    <section className="dashboard-card recommended-practice-card">
      <div>
        <p className="eyebrow">Recommended Practice</p>
        <h2>{recommendation.title}</h2>
        <p>{recommendation.text}</p>
        <p className="card-copy">Validated Questions: <strong>{recommendation.questionsAvailable}</strong></p>
        <div className="reward-pills">
          <span><FaStar /> +100 XP</span>
          <span><FaCoins /> +20 Coins</span>
        </div>
      </div>
      <button className="btn" type="button" disabled={!recommendation.canPractice} onClick={onStart}>
        Start Recommended Practice <FaArrowRight />
      </button>
    </section>
  );
}

export default RecommendedPracticeCard;
