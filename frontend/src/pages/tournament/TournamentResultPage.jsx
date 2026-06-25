import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBullseye,
  FaCheckCircle,
  FaCoins,
  FaCrown,
  FaHome,
  FaListAlt,
  FaMedal,
  FaStar,
  FaTimesCircle,
  FaTrophy,
} from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import usePrepQuestSound from "../../hooks/usePrepQuestSound";
import { getOptionLabel, getText } from "../../utils/practiceUtils";
import { getTournamentResults } from "../../services/tournamentService";
import "../Tournament.css";

function TournamentResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tournamentId = searchParams.get("id");
  const { playClick, playComplete } = usePrepQuestSound();
  const completionSoundCheckedRef = useRef(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tournamentId) {
      navigate("/tournament", { replace: true });
      return;
    }
    getTournamentResults(tournamentId)
      .then((result) => {
        setData(result);
        setError("");
      })
      .catch((err) => setError(err.response?.data?.message || "Results will appear after the tournament finishes."));
  }, [navigate, tournamentId]);

  useEffect(() => {
    if (!data || completionSoundCheckedRef.current) return;
    completionSoundCheckedRef.current = true;
    const playedKey = `prepquest_tournament_completion_sound_${tournamentId}`;
    if (sessionStorage.getItem(playedKey) === "true") return;
    sessionStorage.setItem(playedKey, "true");
    playComplete();
  }, [data, playComplete, tournamentId]);

  const result = data?.currentUserResult;
  const currentUser = data?.currentUser;
  const totalParticipants = data?.leaderboard?.length || 0;
  const totalQuestions = data?.tournament?.questionCount || 20;
  const accuracy = result ? Math.round((result.correctAnswers / totalQuestions) * 100) : 0;

  const handleReviewAnswers = () => {
    playClick();
    document.getElementById("tournament-review")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDashboard = () => {
    playClick();
    navigate("/dashboard");
  };

  const handleTournamentHome = () => {
    playClick();
    navigate("/tournament");
  };

  if (error && !data) {
    return (
      <DashboardLayout activeKey="tournament">
        <section className="dashboard-content tournament-page">
          <section className="dashboard-card tournament-card">
            <p className="empty-state">{error}</p>
            <button className="tournament-primary-btn" type="button" onClick={handleTournamentHome}>Back to Tournament</button>
          </section>
        </section>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  return (
    <DashboardLayout activeKey="tournament">
      <header className="dashboard-header daily-quiz-header">
        <div className="header-left">
          <p className="eyebrow">Result</p>
          <h1>Final Tournament Results</h1>
          <p>
            {currentUser ? `You finished rank #${currentUser.rank} of ${totalParticipants} with ${accuracy}% accuracy.` : "Results will appear after the tournament finishes."}
          </p>
        </div>
        <div className="header-right">
          <button className="outline-pill" type="button" onClick={handleTournamentHome}>
            <FaArrowLeft /> Tournament
          </button>
        </div>
      </header>

      <section className="dashboard-content daily-result-content">
        <section className="dashboard-card final-podium-card">
          <div className="card-heading">
            <h2 className="card-title"><FaTrophy /> Podium Winners</h2>
            <span className="status-chip">{totalParticipants} participants</span>
          </div>
          {data.podium.length ? (
            <div className="podium-layout">
              {[2, 1, 3].map((rank) => {
                const row = data.podium.find((item) => item.rank === rank);
                if (!row) return null;
                return (
                  <article className={`podium-place podium-${rank}`} key={row.userId}>
                    <div className="podium-medal">{rank === 1 ? <FaCrown /> : <FaMedal />}</div>
                    <span>#{rank}</span>
                    <h3>{row.displayName}</h3>
                    <strong>{row.score} pts</strong>
                    <p>{row.correctAnswers} correct · {row.result?.rewardCoins || 0} coins · {row.result?.rewardXp || 0} XP</p>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="empty-state">Results will appear after the tournament finishes.</p>
          )}
        </section>

        {result && (
          <>
            <section className="dashboard-card daily-result-hero">
              <div className="result-score-ring">
                <span>{result.finalScore}</span>
                <strong>pts</strong>
              </div>
              <div className="result-hero-copy">
                <h2>Your Battle Result</h2>
                <p>
                  Rank #{result.finalRank} of {totalParticipants}. Rewards: +{result.rewardXp} XP,
                  +{result.rewardCoins} coins{result.badgeEarned ? `, ${result.badgeEarned}` : ""}.
                </p>
                <div className="daily-action-row">
                  <button className="btn" type="button" onClick={handleReviewAnswers}>
                    <FaListAlt /> Review Answers
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={handleDashboard}>
                    <FaHome /> Go to Dashboard
                  </button>
                </div>
              </div>
            </section>

            <section className="daily-result-grid" aria-label="Tournament result summary">
              <article className="stat-card"><div className="stat-icon"><FaTrophy /></div><div><div className="stat-value">#{result.finalRank}</div><div className="stat-helper">Final rank</div></div></article>
              <article className="stat-card"><div className="stat-icon"><FaBullseye /></div><div><div className="stat-value">{accuracy}%</div><div className="stat-helper">Accuracy</div></div></article>
              <article className="stat-card"><div className="stat-icon"><FaCheckCircle /></div><div><div className="stat-value">{result.correctAnswers}</div><div className="stat-helper">Correct answers</div></div></article>
              <article className="stat-card"><div className="stat-icon"><FaTimesCircle /></div><div><div className="stat-value">{result.wrongAnswers}/{result.unanswered}</div><div className="stat-helper">Wrong / unanswered</div></div></article>
              <article className="stat-card"><div className="stat-icon"><FaStar /></div><div><div className="stat-value">+{result.rewardXp} XP</div><div className="stat-helper">XP earned</div></div></article>
              <article className="stat-card"><div className="stat-icon"><FaCoins /></div><div><div className="stat-value">+{result.rewardCoins}</div><div className="stat-helper">Coins earned</div></div></article>
            </section>
          </>
        )}

        <section className="dashboard-card board-panel" aria-labelledby="final-leaderboard-title">
          <div className="card-heading">
            <h2 className="card-title" id="final-leaderboard-title"><FaTrophy /> Full Leaderboard</h2>
            <span className="status-chip">{totalParticipants} participants</span>
          </div>
          <div className="checkpoint-leaderboard-list">
            {data.leaderboard.length ? data.leaderboard.map((row) => (
              <div className={`checkpoint-leaderboard-row${row.isCurrentUser ? " current-user" : ""}`} key={row.userId}>
                <span className="rank-badge">{row.rank}</span>
                <span className="learner-cell">
                  {row.rank === 1 ? <FaCrown /> : row.rank <= 3 ? <FaMedal /> : null}
                  <strong>{row.displayName}</strong>
                </span>
                <span>{row.correctAnswers} correct · {row.unanswered} unanswered</span>
                <strong>{row.score} pts</strong>
              </div>
            )) : <p className="empty-state">No users registered yet.</p>}
          </div>
        </section>

        {data.answers.length > 0 && (
          <section className="dashboard-card daily-review-card" id="tournament-review">
            <div className="card-heading">
              <h2 className="card-title"><FaListAlt /> Review Answers</h2>
              <span className="status-chip">{data.answers.length} answered</span>
            </div>
            <div className="daily-review-list">
              {data.answers.map((answer, index) => (
                <article className={`daily-review-item ${answer.isCorrect ? "correct" : "wrong"}`} key={`${answer.questionId}-${index}`}>
                  <div className="daily-review-top">
                    <span className="review-number">Q{index + 1}</span>
                    <div>
                      <h3>{getText(answer, data.tournament.registration?.preferredLanguage || "english").question}</h3>
                      <div className="daily-chip-row">
                        <span className="question-pill">{answer.subject}</span>
                        <span className="question-pill">{answer.topic}</span>
                        <span className="question-pill difficulty">{answer.difficulty}</span>
                      </div>
                    </div>
                    <strong className={answer.isCorrect ? "correct-label" : "wrong-label"}>
                      {answer.isCorrect ? `+${answer.pointsEarned} pts` : "+0 pts"}
                    </strong>
                  </div>
                  <div className="review-answer-grid">
                    <div><span>Your answer</span><strong>{getOptionLabel(answer, answer.selectedOptionKey, "english")}</strong></div>
                    <div><span>Correct answer</span><strong>{getOptionLabel(answer, answer.correctOption, "english")}</strong></div>
                  </div>
                  <div className="review-explanation">
                    <span>Explanation</span>
                    <p>{getText(answer, "english").explanation}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </DashboardLayout>
  );
}

export default TournamentResultPage;
