import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCrown, FaDoorOpen, FaMedal, FaRegClock, FaTrophy, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import AnswerFeedback from "../../components/practice/AnswerFeedback";
import QuestionCard from "../../components/practice/QuestionCard";
import usePrepQuestSound from "../../hooks/usePrepQuestSound";
import {
  LEADERBOARD_CHECKPOINTS,
  TIME_PER_QUESTION_SECONDS,
  buildTournamentSession,
  computeQuestionScore,
  completeTournament,
  getActiveTournamentSession,
  getMergedLeaderboard,
  hasCompletedTournamentThisWeek,
  saveActiveTournamentSession,
} from "../../utils/tournamentUtils";
import "../Tournament.css";

function TournamentSessionPage() {
  const navigate = useNavigate();
  const { isMuted, toggleMute, playClick, playCorrect, playWrong } = usePrepQuestSound();
  const [session, setSession] = useState(() => {
    if (hasCompletedTournamentThisWeek()) return null;
    const active = getActiveTournamentSession();
    if (active) return active;
    const built = buildTournamentSession();
    return built.ok ? built.session : null;
  });
  const [currentIndex, setCurrentIndex] = useState(() => session?.currentIndex || 0);
  const [selectedOptionKey, setSelectedOptionKey] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TIME_PER_QUESTION_SECONDS);

  useEffect(() => {
    if (hasCompletedTournamentThisWeek()) {
      navigate("/tournament/result", { replace: true });
      return;
    }
    if (!session?.questions?.length) {
      navigate("/tournament", { replace: true });
    }
  }, [navigate, session]);

  // Owns the full per-question countdown with its own local counter so a
  // question change never reads the previous question's stale timeRemaining
  // value (that race used to auto-submit the next question as a timeout).
  useEffect(() => {
    if (feedback || showLeaderboard) return undefined;
    let remaining = TIME_PER_QUESTION_SECONDS;
    setTimeRemaining(remaining);
    const interval = window.setInterval(() => {
      remaining -= 1;
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        window.clearInterval(interval);
        submitAnswer("");
      }
    }, 1000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, feedback, showLeaderboard]);

  if (!session) return null;

  const question = session.questions[currentIndex];
  const answers = session.answers || [];
  const runningScore = answers.reduce((sum, answer) => sum + (answer.score || 0), 0);
  const correctCount = answers.filter((answer) => answer.isCorrect).length;
  const progressPercent = Math.round(((currentIndex + 1) / session.questions.length) * 100);
  const isLastQuestion = currentIndex === session.questions.length - 1;
  const isCheckpoint = LEADERBOARD_CHECKPOINTS.includes(currentIndex + 1);

  const persistSession = (nextSession, nextIndex = currentIndex) => {
    const updated = { ...nextSession, currentIndex: nextIndex };
    saveActiveTournamentSession(updated);
    setSession(updated);
  };

  function submitAnswer(optionKey) {
    if (feedback) return;
    const isCorrect = optionKey !== "" && optionKey === question.correctOption;
    const score = computeQuestionScore({ isCorrect, timeRemainingSeconds: timeRemaining });
    const answer = { questionId: question.id, selectedOptionKey: optionKey, isCorrect, score, timeRemainingSeconds: timeRemaining };
    const nextSession = {
      ...session,
      answers: [...answers.filter((item) => item.questionId !== question.id), answer],
    };
    persistSession(nextSession);
    setFeedback({ isCorrect, answer });
    if (isCorrect) playCorrect();
    else playWrong();
  }

  const handleOptionSelect = (optionKey) => {
    if (feedback) return;
    playClick();
    setSelectedOptionKey(optionKey);
    submitAnswer(optionKey);
  };

  const handleNext = () => {
    playClick();
    if (isCheckpoint && !showLeaderboard) {
      setShowLeaderboard(true);
      return;
    }
    setShowLeaderboard(false);
    if (isLastQuestion) {
      const attempt = completeTournament(session);
      navigate("/tournament/result", { state: { resultId: attempt.id } });
      return;
    }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setSelectedOptionKey("");
    setFeedback(null);
    persistSession(session, nextIndex);
  };

  const handleExit = () => {
    playClick();
    navigate("/tournament");
  };

  const leaderboard = showLeaderboard ? getMergedLeaderboard(runningScore) : null;
  const timerLow = timeRemaining <= 5 && !feedback;

  return (
    <DashboardLayout activeKey="tournament">
      <header className="dashboard-header session-header">
        <div className="header-left">
          <p className="eyebrow subject-pill">Friday Tournament</p>
          <h1>Live Battle</h1>
          <p>Question {currentIndex + 1} of {session.questions.length}</p>
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
          <span className="soft-timer"><FaTrophy /> {runningScore} pts</span>
          <button className="outline-pill exit-practice-btn" type="button" onClick={handleExit}>
            <FaDoorOpen /> Exit Battle
          </button>
        </div>
      </header>

      <section className="dashboard-content practice-session-content tournament-session-content">
        <div className="practice-board tournament-practice-board">
          <div className="board-question-side">
            <div className="board-top-strip">
              <div className="preview-progress-row">
                <span>Question {currentIndex + 1} of {session.questions.length}</span>
                <span>{progressPercent}% complete</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="progress-strip-footer">
                <span className="xp-chip">Score: {runningScore} pts &middot; {correctCount} correct</span>
                {!feedback && !showLeaderboard && (
                  <span className={`question-timer${timerLow ? " low" : ""}`}>
                    <FaRegClock /> {timeRemaining}s
                  </span>
                )}
              </div>
              {!feedback && !showLeaderboard && (
                <div className="progress-bar question-timer-bar">
                  <div
                    className={`progress-fill${timerLow ? " timer-low-fill" : ""}`}
                    style={{ width: `${(timeRemaining / TIME_PER_QUESTION_SECONDS) * 100}%` }}
                  />
                </div>
              )}
            </div>

            {showLeaderboard ? (
              <section className="dashboard-card checkpoint-leaderboard-card">
                <div className="card-heading">
                  <h2 className="card-title"><FaTrophy /> Live Leaderboard</h2>
                  <span className="status-chip">After Question {currentIndex + 1}</span>
                </div>
                <div className="checkpoint-leaderboard-list">
                  {leaderboard.map((row, index) => (
                    <div className={`checkpoint-leaderboard-row${row.isCurrentUser ? " current-user" : ""}`} key={row.id}>
                      <span className="rank-badge">{index + 1}</span>
                      <span className="learner-cell">
                        {index === 0 ? <FaCrown /> : index < 3 ? <FaMedal /> : null}
                        <strong>{row.name}</strong>
                      </span>
                      <span>{row.examTrack}</span>
                      <strong>{row.tournamentPoints} pts</strong>
                    </div>
                  ))}
                </div>
                <button className="btn btn-full" type="button" onClick={handleNext}>
                  {isLastQuestion ? "View Final Results" : "Continue Battle"}
                </button>
              </section>
            ) : (
              <>
                <div className="practice-question-stack">
                  <QuestionCard
                    question={question}
                    selectedOptionKey={selectedOptionKey}
                    correctOptionKey={question.correctOption}
                    languageMode={session.preferredLanguage}
                    isAnswered={Boolean(feedback)}
                    levelLabel={question.subject}
                    practiceType="Tournament"
                    onSelectOption={handleOptionSelect}
                  />
                </div>

                <div className={`question-actions${feedback ? " answered" : ""}`}>
                  {feedback ? (
                    <>
                      <span className={`tournament-score-badge${feedback.isCorrect ? " correct" : " wrong"}`}>
                        {feedback.isCorrect ? `+${feedback.answer.score} points` : "+0 points"}
                      </span>
                      <button className="btn" type="button" onClick={handleNext}>
                        {isLastQuestion ? "Finish Battle" : "Next Question"}
                      </button>
                    </>
                  ) : (
                    <span className="xp-preview">Pick an answer fast &mdash; speed adds points</span>
                  )}
                </div>
              </>
            )}
          </div>

          {!showLeaderboard && (
            <aside className="board-coach-panel" aria-label="Tournament feedback panel">
              <section className="coach-section mini-session-stats">
                <div className="coach-section-heading"><span>Battle</span><strong>{currentIndex + 1}/{session.questions.length}</strong></div>
                <div className="summary-grid">
                  <div><span>Score</span><strong>{runningScore}</strong></div>
                  <div><span>Correct</span><strong>{correctCount}</strong></div>
                </div>
              </section>

              <section className="coach-feedback-shell">
                {feedback ? (
                  <AnswerFeedback
                    question={question}
                    isCorrect={feedback.isCorrect}
                    selectedOptionKey={feedback.answer.selectedOptionKey}
                    languageMode={session.preferredLanguage}
                    showReward={false}
                  />
                ) : (
                  <div className="coach-placeholder">
                    <span>Feedback</span>
                    <strong>Answer when ready</strong>
                    <p>Faster correct answers earn more points. The timer auto-submits as wrong at 0.</p>
                  </div>
                )}
              </section>
            </aside>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}

export default TournamentSessionPage;
