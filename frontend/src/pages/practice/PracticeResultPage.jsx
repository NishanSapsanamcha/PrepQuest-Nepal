import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaRedo, FaSearch, FaTachometerAlt } from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import ResultSummary from "../../components/practice/ResultSummary";
import WrongAnswerReview from "../../components/practice/WrongAnswerReview";
import { useBadgeCelebration } from "../../context/BadgeCelebrationContext";
import { useCoinReward } from "../../context/CoinRewardContext";
import { getLastPracticeResult, getSavedReviewQuestions, getUser } from "../../utils/storageUtils";
import "./PracticeResultPage.css";

function PracticeResultPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { celebrate } = useBadgeCelebration();
  const { celebrateCoins } = useCoinReward();
  const user = getUser();
  const language = localStorage.getItem("preferredLanguage") || user.preferredLanguage;
  const result = getLastPracticeResult();
  const savedQuestions = getSavedReviewQuestions();
  const [showReview, setShowReview] = useState(false);

  // Award + celebrate any badges this practice session unlocked, and show coins.
  useEffect(() => {
    celebrate();
    celebrateCoins();
  }, [celebrate, celebrateCoins]);

  if (!result || result.subjectId !== subjectId) {
    return (
      <DashboardLayout activeKey="practice">
        <section className="dashboard-content">
          <div className="dashboard-card empty-result">
            <h1>No recent result found</h1>
            <p className="card-copy">Start a quick practice session to generate your subject result.</p>
            <button className="btn" type="button" onClick={() => navigate(`/practice/${subjectId}/session`)}>Start Practice</button>
          </div>
        </section>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeKey="practice">
      <section className="dashboard-content practice-result-content">
        <ResultSummary result={result} />

        <section className="dashboard-card result-next-card">
          <div>
            <p className="eyebrow">Weak Topic</p>
            <h2>{result.weakTopic}</h2>
            <p>Recommended Next: {result.recommendation}</p>
          </div>
          <div className="result-action-grid">
            <button className="btn" type="button" onClick={() => navigate(`/practice/${subjectId}/session`)}><FaRedo /> Practice Again</button>
            {result.wrongAnswers?.length > 0 && (
              <button className="btn btn-secondary" type="button" onClick={() => setShowReview((value) => !value)}><FaSearch /> Review Wrong Answers</button>
            )}
            {savedQuestions.length > 0 && (
              <button className="btn btn-secondary" type="button" onClick={() => navigate("/practice/review?tab=saved")}><FaSearch /> Review Saved Questions</button>
            )}
            <button className="btn btn-secondary" type="button" onClick={() => navigate("/practice")}><FaArrowLeft /> Choose Another Subject</button>
            <button className="btn btn-secondary" type="button" onClick={() => navigate("/dashboard")}><FaTachometerAlt /> Go to Dashboard</button>
          </div>
        </section>

        {showReview && (
          <WrongAnswerReview
            wrongAnswers={result.wrongAnswers}
            language={language}
            onTryAgain={() => navigate(`/practice/${subjectId}/session`)}
          />
        )}
      </section>
    </DashboardLayout>
  );
}

export default PracticeResultPage;
