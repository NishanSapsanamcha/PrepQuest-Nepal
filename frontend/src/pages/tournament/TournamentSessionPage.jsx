import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaCrown, FaDoorOpen, FaExclamationTriangle, FaMedal, FaRegClock, FaTrophy } from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import AnswerFeedback from "../../components/practice/AnswerFeedback";
import { getText } from "../../utils/practiceUtils";
import { getCurrentTournaments, getTournamentLiveState, submitTournamentAnswer } from "../../services/tournamentService";
import "../Tournament.css";

function useTournamentId() {
  const [searchParams] = useSearchParams();
  return searchParams.get("id");
}

function TournamentSessionPage() {
  const navigate = useNavigate();
  const requestedId = useTournamentId();
  const [state, setState] = useState(null);
  const [selectedOptionKey, setSelectedOptionKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadState = async () => {
    try {
      let tournamentId = requestedId;
      if (!tournamentId) {
        const current = await getCurrentTournaments();
        tournamentId = current.tournament?.id;
      }
      if (!tournamentId) {
        navigate("/tournament", { replace: true });
        return;
      }
      const data = await getTournamentLiveState(tournamentId);
      setState(data);
      setError("");
      if (data.phase?.phase === "finished" || data.tournament?.status === "results_published") {
        navigate(`/tournament/result?id=${encodeURIComponent(tournamentId)}`, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Live battle is unavailable.");
    }
  };

  useEffect(() => {
    loadState();
    const id = window.setInterval(loadState, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedId]);

  useEffect(() => {
    setSelectedOptionKey(state?.answer?.selectedOptionKey || "");
    if (state?.answer?.locked && state?.phase?.phase === "question") {
      setNotice("Answer locked. Waiting for reveal.");
    }
  }, [state?.answer?.locked, state?.answer?.selectedOptionKey, state?.phase?.phase, state?.question?.id]);

  const registration = state?.registration;
  const tournament = state?.tournament;
  const phase = state?.phase;
  const question = state?.question;
  const answer = state?.answer;
  const currentRank = state?.currentUserRank;
  const languageMode = registration?.preferredLanguage || "english";
  const questionText = useMemo(() => question ? getText(question, languageMode) : null, [question, languageMode]);
  const questionNumber = Number.isInteger(phase?.questionIndex) ? phase.questionIndex + 1 : phase?.afterQuestion || 0;
  const progressPercent = Math.round((Math.min(questionNumber || 0, tournament?.questionCount || 20) / (tournament?.questionCount || 20)) * 100);
  const reveal = phase?.phase === "reveal";
  const locked = Boolean(answer?.locked);

  const handleSubmit = async (optionKey) => {
    if (!tournament || locked || submitting || phase?.phase !== "question") return;
    setSelectedOptionKey(optionKey);
    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      const data = await submitTournamentAnswer(tournament.id, optionKey);
      setNotice(data.answer?.message || "Answer locked. Waiting for reveal.");
      await loadState();
    } catch (err) {
      setError(err.response?.data?.message || "Could not lock answer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExit = () => {
    navigate("/tournament");
  };

  if (!state && !error) return null;

  if (!registration) {
    return (
      <DashboardLayout activeKey="tournament">
        <section className="dashboard-content tournament-page">
          <section className="dashboard-card tournament-card">
            <h1>Registration Closed</h1>
            <p className="empty-state">You must be registered before entering a live tournament battle.</p>
            <button className="tournament-primary-btn" type="button" onClick={() => navigate("/tournament")}>Back to Tournament</button>
          </section>
        </section>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeKey="tournament">
      <header className="dashboard-header session-header">
        <div className="header-left">
          <p className="eyebrow subject-pill">{tournament?.title || "Live Battle"}</p>
          <h1>Live Battle</h1>
          <p>Question {Math.max(1, questionNumber)} of {tournament?.questionCount || 20}</p>
        </div>
        <div className="header-right">
          <span className="soft-timer"><FaTrophy /> {registration.score} pts</span>
          <button className="outline-pill exit-practice-btn" type="button" onClick={handleExit}>
            <FaDoorOpen /> Exit Battle
          </button>
        </div>
      </header>

      <section className="dashboard-content practice-session-content tournament-session-content">
        {error && <p className="tournament-error"><FaExclamationTriangle /> {error}</p>}

        {tournament?.status === "registration_open" ? (
          <section className="dashboard-card checkpoint-leaderboard-card">
            <div className="card-heading">
              <h2 className="card-title"><FaRegClock /> Battle Starting Soon</h2>
              <span className="status-chip">Registered</span>
            </div>
            <p className="empty-state">Next question starts in {tournament?.secondsToStart || phase?.secondsToStart || 0} seconds.</p>
          </section>
        ) : phase?.phase === "checkpoint" ? (
          <section className="dashboard-card checkpoint-leaderboard-card">
            <div className="card-heading">
              <h2 className="card-title"><FaTrophy /> Live Ranking Checkpoint</h2>
              <span className="status-chip">After Question {phase.afterQuestion}</span>
            </div>
            <div className="checkpoint-leaderboard-list">
              {state.leaderboard.length ? state.leaderboard.map((row) => (
                <div className={`checkpoint-leaderboard-row${row.isCurrentUser ? " current-user" : ""}`} key={row.userId}>
                  <span className="rank-badge">{row.rank}</span>
                  <span className="learner-cell">
                    {row.rank === 1 ? <FaCrown /> : row.rank <= 3 ? <FaMedal /> : null}
                    <strong>{row.displayName}</strong>
                  </span>
                  <span>{row.correctAnswers} correct</span>
                  <strong>{row.score} pts</strong>
                </div>
              )) : <p className="empty-state">Leaderboard will appear after users answer.</p>}
            </div>
            <p className="tournament-note">Your rank: {currentRank ? `#${currentRank.rank} · ${currentRank.score} pts` : "Not ranked yet"}</p>
            <p className="tournament-success compact">Next question starts in {phase.countdownSeconds} seconds.</p>
          </section>
        ) : question ? (
          <div className="practice-board tournament-practice-board">
            <div className="board-question-side">
              <div className="board-top-strip">
                <div className="preview-progress-row">
                  <span>Question {questionNumber} of {tournament.questionCount}</span>
                  <span>{progressPercent}% complete</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="progress-strip-footer">
                  <span className="xp-chip">Score: {registration.score} pts · {registration.correctAnswers} correct</span>
                  <span className={`question-timer${(phase.timeLeft || 0) <= 5 && phase.phase === "question" ? " low" : ""}`}>
                    <FaRegClock /> {phase.phase === "question" ? `${phase.timeLeft}s` : `Reveal ${phase.revealCountdownSeconds}s`}
                  </span>
                </div>
                <div className="progress-bar question-timer-bar">
                  <div
                    className={`progress-fill${(phase.timeLeft || 0) <= 5 && phase.phase === "question" ? " timer-low-fill" : ""}`}
                    style={{ width: `${phase.phase === "question" ? ((phase.timeLeft || 0) / tournament.timePerQuestion) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <section className="dashboard-card question-card">
                <div className="question-meta-row">
                  <span className="question-pill difficulty">{question.difficulty}</span>
                  <span className="question-pill">{question.topic}</span>
                  <span className="question-pill level">{question.subject}</span>
                  <span className="question-pill">Tournament</span>
                </div>
                <p className="question-text">{questionText?.question}</p>
                <div className="answer-options">
                  {questionText?.options.map((option) => {
                    const isSelected = selectedOptionKey === option.key || answer?.selectedOptionKey === option.key;
                    const optionState = reveal
                      ? option.key === question.correctOption
                        ? "correct"
                        : isSelected
                          ? "wrong"
                          : "muted"
                      : isSelected
                        ? "selected"
                        : "";
                    return (
                      <button
                        className={`answer-option ${optionState}`}
                        type="button"
                        key={option.key}
                        disabled={locked || submitting || phase.phase !== "question"}
                        aria-pressed={isSelected}
                        onClick={() => handleSubmit(option.key)}
                      >
                        <span className="option-copy">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className={`question-actions${locked ? " answered" : ""}`}>
                {reveal && answer ? (
                  <span className={`tournament-score-badge${answer.isCorrect ? " correct" : " wrong"}`}>
                    {answer.isCorrect ? `+${answer.pointsEarned} points` : "+0 points"}
                  </span>
                ) : locked ? (
                  <span className="tournament-score-badge">Answer locked. Waiting for reveal.</span>
                ) : (
                  <span className="xp-preview">Choose once. The server locks your answer until reveal.</span>
                )}
              </div>
            </div>

            <aside className="board-coach-panel" aria-label="Tournament feedback panel">
              <section className="coach-section mini-session-stats">
                <div className="coach-section-heading"><span>Battle</span><strong>{questionNumber}/{tournament.questionCount}</strong></div>
                <div className="summary-grid">
                  <div><span>Score</span><strong>{registration.score}</strong></div>
                  <div><span>Correct</span><strong>{registration.correctAnswers}</strong></div>
                </div>
              </section>

              <section className="coach-feedback-shell">
                {reveal && answer ? (
                  <AnswerFeedback
                    question={question}
                    isCorrect={answer.isCorrect}
                    selectedOptionKey={answer.selectedOptionKey}
                    languageMode={languageMode}
                    showReward={false}
                  />
                ) : (
                  <div className="coach-placeholder">
                    <span>Live State</span>
                    <strong>{notice || "Answer before the server timer ends"}</strong>
                    <p>Correct or wrong is revealed only after the 15-second timer closes.</p>
                  </div>
                )}
              </section>
            </aside>
          </div>
        ) : (
          <section className="dashboard-card tournament-card">
            <p className="empty-state">Not enough validated tournament questions are available yet.</p>
          </section>
        )}
      </section>
    </DashboardLayout>
  );
}

export default TournamentSessionPage;
