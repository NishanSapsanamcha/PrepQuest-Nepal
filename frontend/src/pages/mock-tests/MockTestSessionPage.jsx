import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookmark, FaDoorOpen, FaFlagCheckered, FaRegClock, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import ConfirmModal from "../../components/common/ConfirmModal";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import usePrepQuestSound from "../../hooks/usePrepQuestSound";
import { getText } from "../../utils/practiceUtils";
import {
  completeMockSession,
  formatMockTime,
  getActiveMockSession,
  saveActiveMockSession,
  saveMockReviewQuestion,
} from "../../utils/mockTestUtils";
import "./MockTestsPage.css";

function MockTestSessionPage() {
  const navigate = useNavigate();
  const { isMuted, toggleMute, playClick } = usePrepQuestSound();
  const [session, setSession] = useState(() => getActiveMockSession());
  const [currentIndex, setCurrentIndex] = useState(() => getActiveMockSession()?.currentIndex || 0);
  const [timeLeft, setTimeLeft] = useState(() => {
    const active = getActiveMockSession();
    if (!active) return 0;
    const elapsed = Math.floor((Date.now() - new Date(active.startedAt).getTime()) / 1000);
    return Math.max(0, active.durationMinutes * 60 - elapsed);
  });
  const [showTimeUp, setShowTimeUp] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [modalType, setModalType] = useState("");

  useEffect(() => {
    if (!session?.questions?.length) navigate("/mock-tests", { replace: true });
  }, [navigate, session]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((seconds) => {
        const next = Math.max(0, seconds - 1);
        if (next === 0) setShowTimeUp(true);
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const question = session?.questions?.[currentIndex];
  const answers = session?.answers || [];
  const selectedOptionKey = answers.find((answer) => answer.questionId === question?.id)?.selectedOptionKey || "";
  const answeredCount = answers.filter((answer) => answer.selectedOptionKey).length;
  const remainingCount = Math.max(0, (session?.questions?.length || 0) - answeredCount);
  const progressPercent = session?.questions?.length ? Math.round(((currentIndex + 1) / session.questions.length) * 100) : 0;
  const text = question ? getText(question, session.preferredLanguage) : null;
  const savedSet = useMemo(() => new Set(session?.savedQuestionIds || []), [session?.savedQuestionIds]);

  if (!session || !question || !text) return null;

  const persist = (nextSession, nextIndex = currentIndex) => {
    const updated = { ...nextSession, currentIndex: nextIndex };
    saveActiveMockSession(updated);
    setSession(updated);
  };

  const handleSelect = (optionKey) => {
    playClick();
    const nextAnswers = [
      ...answers.filter((answer) => answer.questionId !== question.id),
      {
        questionId: question.id,
        selectedOptionKey: optionKey,
        timeSpentSeconds: Math.max(0, session.durationMinutes * 60 - timeLeft),
      },
    ];
    persist({ ...session, answers: nextAnswers });
  };

  const goToQuestion = (index) => {
    playClick();
    setCurrentIndex(index);
    persist(session, index);
  };

  const handleSave = () => {
    playClick();
    const nextSaved = savedSet.has(question.id)
      ? session.savedQuestionIds
      : [question.id, ...(session.savedQuestionIds || [])];
    saveMockReviewQuestion(question, selectedOptionKey, session.preferredLanguage, session.id);
    persist({ ...session, savedQuestionIds: nextSaved });
  };

  const handleSubmit = () => {
    if (submitted) return;
    playClick();
    setModalType("submit");
  };

  const submitMock = () => {
    if (submitted) return;
    setSubmitted(true);
    setModalType("");
    const elapsed = Math.max(0, session.durationMinutes * 60 - timeLeft);
    const result = completeMockSession(session, elapsed);
    if (result.error) {
      setSubmitted(false);
      return;
    }
    navigate("/mock-tests/result", { state: { resultId: result.id } });
  };

  const handleExit = () => {
    playClick();
    setModalType("exit");
  };

  return (
    <DashboardLayout activeKey="mock-tests">
      <header className="dashboard-header session-header mock-session-header">
        <div className="header-left">
          <p className="eyebrow subject-pill">Mock Test</p>
          <h1>{session.mockTitle}</h1>
          <p>Question {currentIndex + 1} of {session.questions.length} - Language: {session.preferredLanguage} - Subjects: {session.mockType?.type === "full" ? `Mixed ${session.selectedExamLabel}` : question.subject}</p>
        </div>
        <div className="header-right">
          <button className={`sound-toggle${isMuted ? " muted" : ""}`} type="button" aria-label="Toggle sound" onClick={toggleMute}>
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          <span className={`soft-timer${timeLeft <= 120 ? " warning" : ""}`}><FaRegClock /> {formatMockTime(timeLeft)}</span>
          <button className="outline-pill exit-practice-btn" type="button" onClick={handleExit}><FaDoorOpen /> Exit Mock</button>
        </div>
      </header>

      <section className="dashboard-content mock-session-content">
        {showTimeUp && (
          <div className="time-up-banner">
            <strong>Time is up.</strong>
            <span>Submit your mock to see your result.</span>
            <button className="btn" type="button" onClick={handleSubmit}>Submit Mock</button>
          </div>
        )}

        <div className="mock-session-grid">
          <section className="dashboard-card mock-question-card">
            <div className="mock-progress-strip">
              <div className="preview-progress-row">
                <span>Question {currentIndex + 1} of {session.questions.length}</span>
                <span>Position Progress: {progressPercent}%</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${progressPercent}%` }} /></div>
              <div className="progress-strip-footer">
                <span className="xp-chip">Answered: {answeredCount} / {session.questions.length}</span>
                <span className="practice-mode-chip">Remaining: {remainingCount}</span>
              </div>
            </div>

            <div className="mock-question-meta">
              <span className="question-pill">{question.subject}</span>
              <span className="question-pill">{question.topic}</span>
              <span className="question-pill difficulty">{question.difficulty}</span>
            </div>

            <div className="mock-question-text">
              {text.question.split("\n").map((line) => <p key={line}>{line}</p>)}
            </div>

            <div className="mock-options-list">
              {text.options.map((option) => (
                <button
                  className={`mock-option${selectedOptionKey === option.key ? " selected" : ""}`}
                  type="button"
                  key={option.key}
                  onClick={() => handleSelect(option.key)}
                >
                  <strong>{option.key}</strong>
                  <span>{option.label.replace(`${option.key}. `, "")}</span>
                </button>
              ))}
            </div>

            <div className="mock-session-actions">
              <button className="btn btn-secondary" type="button" disabled={currentIndex === 0} onClick={() => goToQuestion(currentIndex - 1)}>Previous Question</button>
              <button className="btn btn-secondary" type="button" onClick={handleSave}><FaBookmark /> {savedSet.has(question.id) ? "Saved" : "Save for Review"}</button>
              {currentIndex < session.questions.length - 1 ? (
                <button className="btn" type="button" onClick={() => goToQuestion(currentIndex + 1)}>Next Question</button>
              ) : (
                <button className="btn" type="button" disabled={submitted} onClick={handleSubmit}><FaFlagCheckered /> Submit Mock</button>
              )}
            </div>
          </section>

          <aside className="dashboard-card mock-navigator-card">
            <h2 className="card-title">Question Navigator</h2>
            <div className="summary-grid mock-summary-grid">
              <div><span>Answered</span><strong>{answeredCount}</strong></div>
              <div><span>Remaining</span><strong>{remainingCount}</strong></div>
              <div><span>Saved</span><strong>{savedSet.size}</strong></div>
              <div><span>Time</span><strong>{formatMockTime(timeLeft)}</strong></div>
            </div>
            <div className="question-nav-grid">
              {session.questions.map((item, index) => {
                const isAnswered = answers.some((answer) => answer.questionId === item.id && answer.selectedOptionKey);
                const isSaved = savedSet.has(item.id);
                return (
                  <button
                    type="button"
                    className={`question-nav-dot${index === currentIndex ? " active" : ""}${isAnswered ? " answered" : ""}${isSaved ? " saved" : ""}`}
                    key={item.id}
                    onClick={() => goToQuestion(index)}
                    aria-label={`Go to question ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <p className="card-copy">Finish strong. Your result will show weak areas and exam readiness.</p>
            <button className="btn btn-full" type="button" disabled={submitted} onClick={handleSubmit}>Submit Mock</button>
          </aside>
        </div>
      </section>
      <ConfirmModal
        isOpen={modalType === "exit"}
        title="Leave Mock Test?"
        description="Your current attempt has not been submitted yet. If you leave now, your answers may not be saved."
        cancelLabel="Cancel"
        confirmLabel="Leave Mock"
        confirmAriaLabel="Leave mock test"
        onCancel={() => setModalType("")}
        onConfirm={() => {
          playClick();
          setModalType("");
          navigate("/mock-tests");
        }}
      />
      <ConfirmModal
        isOpen={modalType === "submit"}
        title="Submit Mock Test?"
        description={`You answered ${answeredCount} of ${session.questions.length} questions. Unanswered questions will be marked wrong. Are you ready to submit?`}
        cancelLabel="Review Answers"
        confirmLabel="Submit Mock"
        confirmAriaLabel="Submit mock test"
        onCancel={() => setModalType("")}
        onConfirm={() => {
          playClick();
          submitMock();
        }}
      />
    </DashboardLayout>
  );
}

export default MockTestSessionPage;
