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
  FaUserCheck,
  FaUsers,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import usePrepQuestSound from "../../hooks/usePrepQuestSound";
import { getOptionLabel, getText } from "../../utils/practiceUtils";
import { getCurrentTournaments, getTournamentLiveState, markTournamentReady, submitTournamentAnswer } from "../../services/tournamentService";
import {
  t,
  translateSubjectName,
  translateDifficulty,
  formatBeginsInSeconds,
  formatNextAfterReg,
  formatAfterQuestion,
  formatQuestionOf,
  formatCWU,
  formatScorePts,
  formatYourRank,
  formatPointsEarned,
  formatRegisteredCount,
} from "../../data/translations";
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
  const autoLockRef = useRef("");
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
      setError(err.response?.data?.message || t("liveBattleUnavailable", languageMode));
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
      setNotice(t("answerLockedWaiting", state?.registration?.preferredLanguage || "english"));
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
  const selectedAnswerLabel = question && answer?.selectedOptionKey ? getOptionLabel(question, answer.selectedOptionKey, languageMode) : t("noAnswerSubmitted", languageMode);
  const correctAnswerLabel = question?.correctOption ? getOptionLabel(question, question.correctOption, languageMode) : "";

  const handleReady = async () => {
    if (!tournament || readyBusy) return;
    setReadyBusy(true);
    setError("");
    playClick();
    try {
      await markTournamentReady(tournament.id);
      setNotice(t("youreReady", languageMode));
      await loadState();
    } catch (err) {
      setError(err.response?.data?.message || t("couldNotMarkReady", languageMode));
    } finally {
      setReadyBusy(false);
    }
  };

  const handleSubmit = async () => {
    if (!tournament || locked || submitting || phase?.phase !== "question") return;
    if (!selectedOptionKey) {
      setError(t("chooseAnswerBeforeLock", languageMode));
      return;
    }
    setSubmitting(true);
    setError("");
    setNotice("");
    playClick();
    try {
      const data = await submitTournamentAnswer(tournament.id, selectedOptionKey);
      setNotice(data.answer?.message || t("answerLockedWaiting", languageMode));
      await loadState();
    } catch (err) {
      setError(err.response?.data?.message || t("couldNotLockAnswer", languageMode));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!tournament || locked || submitting || phase?.phase !== "question" || !question?.id || !selectedOptionKey) return;
    if ((phase.timeLeft || 0) > 0) return;
    const key = `${tournament.id}-${question.id}-${selectedOptionKey}`;
    if (autoLockRef.current === key) return;
    autoLockRef.current = key;
    handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, phase?.phase, phase?.timeLeft, question?.id, selectedOptionKey, submitting, tournament?.id]);

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
            <h1>{t("registrationClosed", languageMode)}</h1>
            <p className="empty-state">{t("mustRegisterBattle", languageMode)}</p>
            <button className="tournament-primary-btn" type="button" onClick={() => navigate("/tournament")}>{t("backToTournament", languageMode)}</button>
          </section>
        </section>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeKey="tournament">
      <header className="dashboard-header session-header">
        <div className="header-left">
          <p className="eyebrow subject-pill">{t("fridayLiveTournament", languageMode)}</p>
          <h1>{t("liveBattle", languageMode)}</h1>
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
          <span className="soft-timer"><FaTrophy /> {registration.score} {t("pts", languageMode)}</span>
          <button className="outline-pill exit-practice-btn" type="button" onClick={handleExit}>
            <FaDoorOpen /> {t("exitBattle", languageMode)}
          </button>
        </div>
      </header>

      <section className="dashboard-content practice-session-content tournament-session-content">
        {error && <p className="tournament-error"><FaExclamationTriangle /> {error}</p>}

        {phase?.phase === "ready_room" ? (
          <section className="dashboard-card ready-room-card">
            <div className="ready-countdown">
              <span>{t("getReadyFriday", languageMode)}</span>
              <strong>{formatCountdown(tournament.readyCountdownSeconds)}</strong>
              <p>{formatBeginsInSeconds(tournament.readyCountdownSeconds, languageMode)}</p>
            </div>
            <div className="ready-room-meta-grid">
              <div><FaUsers /><span>{t("totalRegistered", languageMode)}</span><strong>{formatRegisteredCount(tournament.registrationCount, languageMode)}</strong></div>
              <div><FaTrophy /><span>{t("examTrack", languageMode)}</span><strong>{tournament.examTrack === "mixed" ? t("mixedWord", languageMode) : translateSubjectName(registration.selectedExam, languageMode)}</strong></div>
              <div><FaUserCheck /><span>{t("languageModeLabel", languageMode)}</span><strong>{registration.preferredLanguage === "nepali" ? "नेपाली" : registration.preferredLanguage === "english" ? "English" : registration.preferredLanguage}</strong></div>
              <div><FaRegClock /><span>{t("formatLabel", languageMode)}</span><strong>{t("twentyMixedQuestions", languageMode)}</strong></div>
            </div>
            <div className="tournament-format-grid">
              <div className="tournament-format-item"><FaCheckCircle /> {t("rule20Questions", languageMode)}</div>
              <div className="tournament-format-item"><FaCheckCircle /> {t("rule15Seconds", languageMode)}</div>
              <div className="tournament-format-item"><FaCheckCircle /> {t("ruleSpeedBonus50", languageMode)}</div>
              <div className="tournament-format-item"><FaCheckCircle /> {t("ruleAnswersLock", languageMode)}</div>
              <div className="tournament-format-item"><FaCheckCircle /> {t("ruleRevealAfterTimer", languageMode)}</div>
              <div className="tournament-format-item"><FaCheckCircle /> {t("ruleSpeedRewards", languageMode)}</div>
              <div className="tournament-format-item"><FaShieldAlt /> {t("noBettingNoCoinLoss", languageMode)}</div>
            </div>
            <div className="ready-participant-panel">
              <div className="card-heading">
                <h2 className="card-title"><FaUsers /> {t("registeredParticipants", languageMode)}</h2>
                <span className="status-chip">{state.participants?.length || 0}</span>
              </div>
              <div className="ready-participant-list">
                {state.participants?.length ? state.participants.map((participant) => (
                  <div className={`ready-participant-row${participant.isCurrentUser ? " current-user" : ""}`} key={participant.userId}>
                    <strong>{participant.displayName}</strong>
                    <span>{translateSubjectName(participant.selectedExam, languageMode)} · {participant.preferredLanguage === "nepali" ? "नेपाली" : participant.preferredLanguage === "english" ? "English" : participant.preferredLanguage}</span>
                    {participant.isCurrentUser ? <em>{t("you", languageMode)}</em> : null}
                  </div>
                )) : <p className="empty-state">{t("noUsersRegistered", languageMode)}</p>}
              </div>
            </div>
            <button className="tournament-primary-btn" type="button" disabled={readyBusy || registration.readyStatus} onClick={handleReady}>
              <FaTrophy /> {registration.readyStatus ? t("enteredTournament", languageMode) : t("enterTournament", languageMode)}
            </button>
            <p className="tournament-note">{t("q1StartsShared", languageMode)}</p>
          </section>
        ) : tournament?.status === "registration_open" ? (
          <section className="dashboard-card checkpoint-leaderboard-card">
            <div className="card-heading">
              <h2 className="card-title"><FaRegClock /> {t("battleStartingSoon", languageMode)}</h2>
              <span className="status-chip">{t("registered", languageMode)}</span>
            </div>
            <p className="empty-state">{formatNextAfterReg(tournament?.secondsToStart || phase?.secondsToStart || 0, languageMode)}</p>
          </section>
        ) : phase?.phase === "checkpoint" ? (
          <section className="dashboard-card checkpoint-leaderboard-card major-checkpoint-card">
            <div className="checkpoint-countdown-card">
              <span>{t("nextStarts15", languageMode)}</span>
              <strong>{phase.countdownSeconds}</strong>
            </div>
            <div className="card-heading">
              <h2 className="card-title"><FaTrophy /> {t("liveRankingCheckpoint", languageMode)}</h2>
              <span className="status-chip">{formatAfterQuestion(phase.afterQuestion, languageMode)}</span>
            </div>
            <div className="checkpoint-leaderboard-list scrollable-ranking">
              {state.leaderboard.length ? state.leaderboard.map((row) => (
                <div className={`checkpoint-leaderboard-row${row.isCurrentUser ? " current-user" : ""}`} key={row.userId}>
                  <span className={`rank-badge rank-${row.rank <= 3 ? row.rank : "default"}`}>{row.rank}</span>
                  <span className="learner-cell">
                    {row.rank === 1 ? <FaCrown /> : row.rank <= 3 ? <FaMedal /> : null}
                    <strong>{row.displayName}</strong>
                    {row.isCurrentUser ? <em className="you-badge">{t("you", languageMode)}</em> : null}
                  </span>
                  <span>{formatCWU(row.correctAnswers, row.wrongAnswers, row.unanswered, languageMode)}</span>
                  <strong>{row.score} {t("pts", languageMode)}</strong>
                </div>
              )) : <p className="empty-state">{t("leaderboardWillAppear", languageMode)}</p>}
            </div>
            <p className="tournament-note">{formatYourRank(currentRank?.rank, currentRank?.score, currentRank?.correctAnswers, languageMode)}</p>
          </section>
        ) : question ? (
          <div className="practice-board tournament-practice-board">
            <div className="board-question-side">
              <div className="board-top-strip">
                <div className="preview-progress-row">
                  <span>{formatQuestionOf(questionNumber, tournament.questionCount, languageMode)}</span>
                  <span>{progressPercent}% {t("complete", languageMode)}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="progress-strip-footer">
                  <span className="xp-chip">{formatScorePts(registration.score, registration.correctAnswers, languageMode)}</span>
                  <span className={`question-timer${(phase.timeLeft || 0) <= 5 && phase.phase === "question" ? " low" : ""}`}>
                    <FaRegClock /> {phase.phase === "question" ? `${phase.timeLeft}s` : `${t("reveal", languageMode)} ${phase.revealCountdownSeconds}s`}
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
                  <span className="question-pill difficulty">{translateDifficulty(question.difficulty, languageMode)}</span>
                  <span className="question-pill">{translateSubjectName(question.topic, languageMode)}</span>
                  <span className="question-pill level">{translateSubjectName(question.subject, languageMode)}</span>
                  <span className="question-pill">{t("tournament", languageMode)}</span>
                </div>
                <p className="question-text">{questionText?.question}</p>
                <p className="lock-warning">{t("chooseCarefullyChange", languageMode)}</p>
                <div className="answer-options">
                  {questionText?.options.map((option) => {
                    const isSelected = (locked ? answer?.selectedOptionKey : selectedOptionKey) === option.key;
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
                        onClick={() => {
                          setError("");
                          setSelectedOptionKey(option.key);
                        }}
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
                    {answer.isCorrect ? formatPointsEarned(answer.pointsEarned, languageMode) : t("points0", languageMode)}
                  </span>
                ) : reveal ? (
                  <span className="tournament-score-badge wrong">{t("timesUpZero", languageMode)}</span>
                ) : locked ? (
                  <span className="tournament-score-badge">{t("answerLockedWaiting", languageMode)}</span>
                ) : (
                  <span className="xp-preview">{t("scoringPreview", languageMode)}</span>
                )}
              </div>
              {!reveal && !locked ? (
                <div className="question-actions lock-answer-row">
                  <button className="tournament-primary-btn lock-answer-btn" type="button" disabled={!selectedOptionKey || submitting || phase?.phase !== "question"} onClick={handleSubmit}>
                    <FaCheckCircle /> {submitting ? t("locking", languageMode) : t("lockAnswer", languageMode)}
                  </button>
                </div>
              ) : null}
            </div>

            <aside className="board-coach-panel" aria-label="Tournament feedback panel">
              <section className="coach-section mini-session-stats">
                <div className="coach-section-heading"><span>{t("battleWord", languageMode)}</span><strong>{questionNumber}/{tournament.questionCount}</strong></div>
                <div className="summary-grid">
                  <div><span>{t("scoreWord", languageMode)}</span><strong>{registration.score}</strong></div>
                  <div><span>{t("correct", languageMode)}</span><strong>{registration.correctAnswers}</strong></div>
                  <div><span>{t("wrong", languageMode)}</span><strong>{registration.wrongAnswers}</strong></div>
                  <div><span>{t("unanswered", languageMode)}</span><strong>{registration.unanswered}</strong></div>
                  <div><span>{t("speedBonus", languageMode)}</span><strong>+{registration.speedBonusTotal || 0}</strong></div>
                </div>
              </section>

              <section className="coach-feedback-shell">
                {reveal ? (
                  <div className={`answer-feedback ${answer?.isCorrect ? "correct" : "wrong"}`}>
                    <div className="feedback-heading">
                      <span className="feedback-icon">{answer?.isCorrect ? <FaCheckCircle /> : <FaExclamationTriangle />}</span>
                      <div>
                        <h3>{answer ? (answer.isCorrect ? t("correct", languageMode) : t("notCorrect", languageMode)) : t("timesUp", languageMode)}</h3>
                        <p>{answer ? (answer.isCorrect ? t("niceWorkCorrect", languageMode) : t("yourAnswerNotCorrect", languageMode)) : t("noAnswerWasSubmitted", languageMode)}</p>
                      </div>
                    </div>
                    <div className="feedback-answer-grid">
                      {!answer?.isCorrect && (
                        <div>
                          <span>{t("yourAnswer", languageMode)}</span>
                          <strong>{selectedAnswerLabel}</strong>
                        </div>
                      )}
                      <div>
                        <span>{t("correctAnswer", languageMode)}</span>
                        <strong>{correctAnswerLabel}</strong>
                      </div>
                      <div>
                        <span>{t("pointsEarned", languageMode)}</span>
                        <strong>{answer?.pointsEarned || 0}</strong>
                      </div>
                      <div>
                        <span>{t("basePoints", languageMode)}</span>
                        <strong>{answer?.basePoints || 0}</strong>
                      </div>
                      {answer?.isCorrect && (
                        <div>
                          <span>{t("speedBonus", languageMode)}</span>
                          <strong>+{answer.speedBonus || 0}</strong>
                        </div>
                      )}
                    </div>
                    <div className="feedback-explanation">
                      <strong>{t("explanation", languageMode)}</strong>
                      <span>{questionText?.explanation}</span>
                    </div>
                  </div>
                ) : (
                  <div className="coach-placeholder">
                    <span>{t("liveState", languageMode)}</span>
                    <strong>{notice || t("answerBeforeTimer", languageMode)}</strong>
                    <p>{t("revealAfter15", languageMode)}</p>
                  </div>
                )}
              </section>
            </aside>
          </div>
        ) : (
          <section className="dashboard-card tournament-card">
            <p className="empty-state">{t("notEnoughTournamentQuestions", languageMode)}</p>
          </section>
        )}
      </section>
    </DashboardLayout>
  );
}

export default TournamentSessionPage;
