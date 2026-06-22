function RecommendedPracticeCard({ recommendation, onStart }) {
  const lowAccuracyMatch = recommendation.text.match(/^(.*?) has your lowest current accuracy\.(.*)$/);

  return (
    <section className="dashboard-card recommended-practice-card">
      <div>
        <h2>Recommended Practice</h2>
        <p className="recommendation-message">
          {lowAccuracyMatch ? (
            <>
              <strong>{lowAccuracyMatch[1]}</strong> has your lowest current accuracy.
              {lowAccuracyMatch[2]}
            </>
          ) : (
            recommendation.text
          )}
        </p>
        <div className="reward-pills">
          <span>Earn +10 XP for each correct answer</span>
        </div>
      </div>
      <button className="btn" type="button" disabled={!recommendation.canPractice} onClick={onStart}>
        Start Recommended Practice
      </button>
    </section>
  );
}

export default RecommendedPracticeCard;
