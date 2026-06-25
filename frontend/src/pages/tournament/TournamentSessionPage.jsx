import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaCheckCircle,
  FaCrown,
  FaDoorOpen,
  FaExclamationTriangle,
  FaMedal,
  FaRegClock,
  FaShieldAlt,
  FaTrophy,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import usePrepQuestSound from "../../hooks/usePrepQuestSound";
import { getOptionLabel, getText } from "../../utils/practiceUtils";
import { getCurrentTournaments, getTournamentLiveState, markTournamentReady, submitTournamentAnswer } from "../../services/tournamentService";
import "../Tournament.css";

function useTournamentId() {
  const [searchParams] = useSearchParams();
  return searchParams.get("id");
}

function formatCountdown(seconds = 0) {
  return String(Math.max(0, Math.floor(seconds))).padStart(2, "0");
}

function TournamentSessionPage() {
  const navigate = useNavigate();
  const requestedId = useTournamentId();
  const { isMuted, toggleMute, playClick, playCorrect, playWrong, playLevelUp } = usePrepQuestSound();
  const lastRevealSoundRef = useRef("");
  const lastCheckpointSoundRef = useRef("");
  const [state, setState] = useState(null);
  const [selectedOptionKey, setSelectedOptionKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [readyBusy, setReadyBusy] = useState(false);
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

  useEffect(() => {
    if (state?.phase?.phase !== "reveal" || !state?.question?.id) return;
    const key = `${state.question.id}-${state.answer?.selectedOptionKey || "unanswered"}`;
    if (lastRevealSoundRef.current === key) return;
    lastRevealSoundRef.current = key;
    if (state.answer?.isCorrect) playCorrect();
    else playWrong();
  }, [playCorrect, playWrong, state?.answer?.isCorrect, state?.answer?.selectedOptionKey, state?.phase?.phase, state?.question?.id]);

  useEffect(() => {
    if (state?.phase?.phase !== "checkpoint") return;
    const key = String(state.phase.afterQuestion || "");
    if (!key || lastCheckpointSoundRef.current === key) return;
    lastCheckpointSoundRef.current = key;
    playLevelUp();
  }, [playLevelUp, state?.phase?.afterQuestion, state?.phase?.phase]);

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
  const selectedAnswerLabel = question && answer?.selectedOptionKey ? getOptionLabel(question, answer.selectedOptionKey, languageMode) : "No answer submitted";
  const correctAnswerLabel = question?.correctOption ? getOptionLabel(question, question.correctOption, languageMode) : "";

  const handleReady = async () => {
    if (!tournament || readyBusy) return;
    setReadyBusy(true);
    setError("");
    playClick();
    try {
      await markTournamentReady(tournament.id);
      setNotice("You're ready. Question 1 starts on server time.");
      await loadState();
    } catch (err) {
      setError(err.response?.data?.message || "Could not mark you ready.");
    } finally {
      setReadyBusy(false);
    }
  };

  const handleSubmit = async (optionKey) => {
    if (!tournament || locked || submitting || phase?.phase !== "question") return;
    setSelectedOptionKey(optionKey);
    setSubmitting(true);
    setError("");
    setNotice("");
    playClick();
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
    playClick();
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
          <p className="eyebrow subject-pill">Friday Live Tournament</p>
          <h1>Live Battle</h1>
          <p>{phase?.phase === "ready_room" ? "Ready room" : `Question ${Math.max(1, questionNumber)} of ${tournament?.questionCount || 20}`}</p>
        </div>
        <div className="header-right">
          <button
            className={`sound-toggle${isMuted ? " muted" : ""}`}
            type="button"
            aria-label={isMuted ? "Unmute sound effects" : "Mute sound effects"}
            title={isMuted ? "Unmute sound effects" : "Mute sound effects"}
            onClick={toggleMute}
          >
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          <span className="soft-timer"><FaTrophy /> {registration.score} pts</span>
          <button className="outline-pill exit-practice-btn" type="button" onClick={handleExit}>
            <FaDoorOpen /> Exit Battle
          </button>
        </div>
      </header>

      <section className="dashboard-content practice-session-content tournament-session-content">
        {error && <p className="tournament-error"><FaExclamationTriangle /> {error}</p>}

        {phase?.phase === "ready_room" ? (
          <section className="dashboard-card ready-room-card">
            <div className="ready-countdown">
              <span>Get Ready for Friday Live Tournament</span>
              <strong>{formatCountdown(tournament.readyCountdownSeconds)}</strong>
              <p>Tournament starts in {tournament.readyCountdownSeconds} seconds</p>
            </div>
            <div className="tournament-format-grid">
              <div className="tournament-format-item"><FaCheckCircle /> 20 mixed Loksewa questions</div>
              <div className="tournament-format-item"><FaCheckCircle /> 15 seconds per question</div>
              <div className="tournament-format-item"><FaCheckCircle /> Answers lock after submission</div>
              <div className="tournament-format-item"><FaCheckCircle /> Correct/wrong reveals after timer closes</div>
              <div className="tournament-format-item"><FaCheckCircle /> Speed bonus rewards faster correct answers</div>
              <div className="tournament-format-item"><FaShieldAlt /> No betting. No coin loss.</div>
            </div>
            <button className="tournament-primary-btn" type="button" disabled={readyBusy || registration.readyStatus} onClick={handleReady}>
              <FaTrophy /> {registration.readyStatus ? "I'm Ready" : "Enter Battle / I'm Ready"}
            </button>
            <p className="tournament-note">Question 1 starts from the shared server clock for everyone together.</p>
          </section>
        ) : tournament?.status === "registration_open" ? (
          <section className="dashboard-card checkpoint-leaderboard-card">
            <div className="card-heading">
              <h2 className="card-title"><FaRegClock /> Battle Starting Soon</h2>
              <span className="status-chip">Registered</span>
            </div>
            <p className="empty-state">Next question starts after registration closes in {tournament?.secondsToStart || phase?.secondsToStart || 0} seconds.</p>
          </section>
        ) : phase?.phase === "checkpoint" ? (
          <section className="dashboard-card checkpoint-leaderboard-card major-checkpoint-card">
            <div className="checkpoint-countdown-card">
              <span>Next question starts in 15 seconds.</span>
              <strong>{phase.countdownSeconds}</strong>
            </div>
            <div className="card-heading">
              <h2 className="card-title"><FaTrophy /> Live Ranking Checkpoint</h2>
              <span className="status-chip">After Question {phase.afterQuestion}</span>
            </div>
            <div className="checkpoint-leaderboard-list scrollable-ranking">
              {state.leaderboard.length ? state.leaderboard.map((row) => (
                <div className={`checkpoint-leaderboard-row${row.isCurrentUser ? " current-user" : ""}`} key={row.userId}>
                  <span className={`rank-badge rank-${row.rank <= 3 ? row.rank : "default"}`}>{row.rank}</span>
                  <span className="learner-cell">
                    {row.rank === 1 ? <FaCrown /> : row.rank <= 3 ? <FaMedal /> : null}
                    <strong>{row.displayName}</strong>
                  </span>
                  <span>{row.correctAnswers} correct · {row.wrongAnswers} wrong · {row.unanswered} unanswered</span>
                  <strong>{row.score} pts</strong>
                </div>
              )) : <p className="empty-state">Leaderboard will appear after participants answer live questions.</p>}
            </div>
            <p className="tournament-note">Your rank: {currentRank ? `#${currentRank.rank} · ${currentRank.score} pts · ${currentRank.correctAnswers} correct` : "Not ranked yet"}</p>
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
                <p className="lock-warning">Choose carefully. Your answer cannot be changed after submission.</p>
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
                ) : reveal ? (
                  <span className="tournament-score-badge wrong">Time's up · +0 points</span>
                ) : locked ? (
                  <span className="tournament-score-badge">Answer locked. Waiting for reveal.</span>
                ) : (
                  <span className="xp-preview">Correct Answer: +100 · Speed Bonus: +0 to +50 · Max: 150</span>
                )}
              </div>
            </div>

            <aside className="board-coach-panel" aria-label="Tournament feedback panel">
              <section className="coach-section mini-session-stats">
                <div className="coach-section-heading"><span>Battle</span><strong>{questionNumber}/{tournament.questionCount}</strong></div>
                <div className="summary-grid">
                  <div><span>Score</span><strong>{registration.score}</strong></div>
                  <div><span>Correct</span><strong>{registration.correctAnswers}</strong></div>
                  <div><span>Wrong</span><strong>{registration.wrongAnswers}</strong></div>
                  <div><span>Unanswered</span><strong>{registration.unanswered}</strong></div>
                </div>
              </section>

              <section className="coach-feedback-shell">
                {reveal ? (
                  <div className={`answer-feedback ${answer?.isCorrect ? "correct" : "wrong"}`}>
                    <div className="feedback-heading">
                      <span className="feedback-icon">{answer?.isCorrect ? <FaCheckCircle /> : <FaExclamationTriangle />}</span>
                      <div>
                        <h3>{answer ? (answer.isCorrect ? "Correct" : "Not correct") : "Time's up"}</h3>
                        <p>{answer ? (answer.isCorrect ? "Nice work - your answer was correct." : "Your selected answer was not correct.") : "No answer was submitted."}</p>
                      </div>
                    </div>
                    <div className="feedback-answer-grid">
                      {!answer?.isCorrect && (
                        <div>
                          <span>Your answer</span>
                          <strong>{selectedAnswerLabel}</strong>
                        </div>
                      )}
                      <div>
                        <span>Correct answer</span>
                        <strong>{correctAnswerLabel}</strong>
                      </div>
                      <div>
                        <span>Points earned</span>
                        <strong>{answer?.pointsEarned || 0}</strong>
                      </div>
                      {answer?.isCorrect && (
                        <div>
                          <span>Speed bonus</span>
                          <strong>+{Math.max(0, (answer.pointsEarned || 0) - 100)}</strong>
                        </div>
                      )}
                    </div>
                    <div className="feedback-explanation">
                      <strong>Explanation</strong>
                      <span>{questionText?.explanation}</span>
                    </div>
                  </div>
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
