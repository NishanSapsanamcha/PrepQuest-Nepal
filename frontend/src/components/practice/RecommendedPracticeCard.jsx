import { FaArrowRight, FaCoins, FaStar } from "react-icons/fa";

function RecommendedPracticeCard({ onStart }) {
  return (
    <section className="dashboard-card recommended-practice-card">
      <div>
        <p className="eyebrow">Recommended Practice</p>
        <h2>Constitution focus for today</h2>
        <p>
          Your Constitution of Nepal accuracy is lower this week. Complete 10 Constitution questions today to improve
          your subject level.
        </p>
        <div className="reward-pills">
          <span><FaStar /> +100 XP</span>
          <span><FaCoins /> +20 Coins</span>
        </div>
      </div>
      <button className="btn" type="button" onClick={onStart}>
        Start Recommended Practice <FaArrowRight />
      </button>
    </section>
  );
}

export default RecommendedPracticeCard;
