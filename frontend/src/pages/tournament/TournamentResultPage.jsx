import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { getDisplayLeaderboard, getLatestTournamentResult, getThisWeekTournamentAttempt } from "../../utils/tournamentUtils";
import "../Tournament.css";

function TournamentResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playClick, playComplete } = usePrepQuestSound();
  const completionSoundCheckedRef = useRef(false);
  const result = getLatestTournamentResult() || getThisWeekTournamentAttempt();

  useEffect(() => {
    if (!result) navigate("/tournament", { replace: true });
  }, [navigate, result]);

  useEffect(() => {
    if (!result || completionSoundCheckedRef.current) return;
    completionSoundCheckedRef.current = true;
    if (location.state?.resultId !== result.id) return;

    const playedKey = `prepquest_tournament_completion_sound_${result.id}`;
    if (sessionStorage.getItem(playedKey) === "true") return;
    sessionStorage.setItem(playedKey, "true");
    playComplete();
  }, [location.state?.resultId, playComplete, result]);

  if (!result) return null;

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

  const rankIcon = result.rank === 1 ? <FaCrown /> : result.rank <= 3 ? <FaMedal /> : <FaTrophy />;

  return (
    <DashboardLayout activeKey="tournament">
      <header className="dashboard-header daily-quiz-header">
        <div className="header-left">
          <p className="eyebrow">Result</p>
          <h1>Friday Battle Complete!</h1>
          <p>
            You finished rank #{result.rank} of {result.totalParticipants} with {result.accuracy}% accuracy.
          </p>
        </div>
        <div className="header-right">
          <button className="outline-pill" type="button" onClick={handleTournamentHome}>
            <FaArrowLeft /> Tournament
          </button>
        </div>
      </header>

      <section className="dashboard-content daily-result-content">
        <section className="dashboard-card daily-result-hero">
          <div className="result-score-ring">
            <span>{result.totalScore}</span>
            <strong>/ {result.maxScore}</strong>
          </div>
          <div className="result-hero-copy">
            <h2>Friday Battle Complete!</h2>
            <p>
              Score {result.totalScore} / {result.maxScore} &middot; Rank #{result.rank} of {result.totalParticipants}
              {result.rankLabel ? ` (${result.rankLabel})` : ""}.
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
          <article className="stat-card"><div className="stat-icon">{rankIcon}</div><div><div className="stat-value">#{result.rank}</div><div className="stat-helper">Final rank</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaBullseye /></div><div><div className="stat-value">{result.accuracy}%</div><div className="stat-helper">Accuracy</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaCheckCircle /></div><div><div className="stat-value">{result.correctAnswers}</div><div className="stat-helper">Correct answers</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaTimesCircle /></div><div><div className="stat-value">{result.wrongAnswers}</div><div className="stat-helper">Wrong answers</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaStar /></div><div><div className="stat-value">+{result.xpEarned} XP</div><div className="stat-helper">XP earned</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaCoins /></div><div><div className="stat-value">+{result.coinsEarned}</div><div className="stat-helper">Coins earned</div></div></article>
        </section>

        <section className="dashboard-card board-panel" aria-labelledby="final-leaderboard-title">
          <div className="card-heading">
            <h2 className="card-title" id="final-leaderboard-title"><FaTrophy /> Final Leaderboard</h2>
            <span className="status-chip">{result.totalParticipants} participants</span>
          </div>
          <div className="checkpoint-leaderboard-list">
            {getDisplayLeaderboard(result.leaderboard).map((row, index) => (
              <div className={`checkpoint-leaderboard-row${row.isCurrentUser ? " current-user" : ""}`} key={row.id}>
                <span className="rank-badge">{row.rank ?? index + 1}</span>
                <span className="learner-cell">
                  {(row.rank ?? index + 1) === 1 ? <FaCrown /> : (row.rank ?? index + 1) <= 3 ? <FaMedal /> : null}
                  <strong>{row.name}</strong>
                </span>
                <span>{row.examTrack}</span>
                <strong>{row.tournamentPoints} pts</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-card daily-review-card" id="tournament-review">
          <div className="card-heading">
            <h2 className="card-title"><FaListAlt /> Review Answers</h2>
            <span className="status-chip">{result.answers.length} Questions</span>
          </div>
          <div className="daily-review-list">
            {result.answers.map((answer, index) => (
              <article className={`daily-review-item ${answer.isCorrect ? "correct" : "wrong"}`} key={answer.questionId}>
                <div className="daily-review-top">
                  <span className="review-number">Q{index + 1}</span>
                  <div>
                    <h3>{getText(answer, result.preferredLanguage).question}</h3>
                    <div className="daily-chip-row">
                      <span className="question-pill">{answer.subject}</span>
                      <span className="question-pill">{answer.topic}</span>
                      <span className="question-pill difficulty">{answer.difficulty}</span>
                    </div>
                  </div>
                  <strong className={answer.isCorrect ? "correct-label" : "wrong-label"}>
                    {answer.isCorrect ? `+${answer.score} pts` : "+0 pts"}
                  </strong>
                </div>
                <div className="review-answer-grid">
                  <div><span>Your answer</span><strong>{getOptionLabel(answer, answer.selectedOptionKey, result.preferredLanguage)}</strong></div>
                  <div><span>Correct answer</span><strong>{getOptionLabel(answer, answer.correctOption, result.preferredLanguage)}</strong></div>
                </div>
                <div className="review-explanation">
                  <span>Explanation</span>
                  <p>{getText(answer, result.preferredLanguage).explanation}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </DashboardLayout>
  );
}

export default TournamentResultPage;
