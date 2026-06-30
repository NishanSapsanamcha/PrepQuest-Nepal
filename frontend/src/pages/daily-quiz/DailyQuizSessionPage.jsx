import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookmark, FaDoorOpen, FaRegClock, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import AnswerFeedback from "../../components/practice/AnswerFeedback";
import QuestionCard from "../../components/practice/QuestionCard";
import usePrepQuestSound from "../../hooks/usePrepQuestSound";
import { t, translateSubjectName, translateDifficulty } from "../../data/translations";
import {
  completeDailyQuiz,
  formatElapsedTime,
  getActiveDailyQuizSession,
  getTodayDailyQuizAttempt,
  saveActiveDailyQuizSession,
  saveDailyQuizReviewQuestion,
} from "../../utils/dailyQuizUtils";
import { getSavedReviewQuestions } from "../../utils/storageUtils";
import "./DailyQuizPage.css";

function DailyQuizSessionPage() {
  const navigate = useNavigate();
  const { isMuted, toggleMute, playClick, playCorrect, playWrong } = usePrepQuestSound();
  const [session, setSession] = useState(() => getActiveDailyQuizSession());
  const [currentIndex, setCurrentIndex] = useState(() => getActiveDailyQuizSession()?.currentIndex || 0);
  const [selectedOptionKey, setSelectedOptionKey] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [savedQuestionIds, setSavedQuestionIds] = useState(() => getSavedReviewQuestions().map((item) => item.questionId));
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    const active = getActiveDailyQuizSession();
    return active?.startedAt ? Math.max(0, Math.floor((Date.now() - new Date(active.startedAt).getTime()) / 1000)) : 0;
  });
  const submittedSoundIdsRef = useRef(new Set());

  useEffect(() => {
    if (getTodayDailyQuizAttempt()) {
      navigate("/daily-quiz", { replace: true });
      return;
    }
    if (!session?.questions?.length) {
      navigate("/daily-quiz", { replace: true });
    }
  }, [navigate, session]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const question = session?.questions?.[currentIndex];
  const answers = session?.answers || [];
  const progressPercent = session?.questions?.length ? Math.round(((currentIndex + 1) / session.questions.length) * 100) : 0;
  const correctCount = answers.filter((answer) => answer.isCorrect).length;
  const wrongCount = answers.filter((answer) => !answer.isCorrect).length;
  const accuracySoFar = answers.length ? Math.round((correctCount / answers.length) * 100) : 0;
  const isCurrentQuestionSaved = question ? savedQuestionIds.includes(question.id) : false;

  const answeredSubjects = useMemo(() => {
    return answers.reduce((state, answer) => {
      const answeredQuestion = session?.questions?.find((item) => item.id === answer.questionId);
      if (!answeredQuestion) return state;
      state[answeredQuestion.subject] = (state[answeredQuestion.subject] || 0) + (answer.isCorrect ? 0 : 1);
      return state;
    }, {});
  }, [answers, session?.questions]);

  if (!session || !question) return null;

  const persistSession = (nextSession, nextIndex = currentIndex) => {
    const updated = { ...nextSession, currentIndex: nextIndex };
    saveActiveDailyQuizSession(updated);
    setSession(updated);
  };

  const handleOptionSelect = (optionKey) => {
    if (feedback) return;
    playClick();
    setSelectedOptionKey(optionKey);
  };

  const handleSubmit = () => {
    if (!selectedOptionKey || feedback) return;
    playClick();
    const isCorrect = selectedOptionKey === question.correctOption;
    const answer = {
      questionId: question.id,
      selectedOptionKey,
      correctOption: question.correctOption,
      isCorrect,
    };
    const nextSession = {
      ...session,
      answers: [...session.answers.filter((item) => item.questionId !== question.id), answer],
    };
    persistSession(nextSession);
    setFeedback({ isCorrect, answer });
    if (!submittedSoundIdsRef.current.has(question.id)) {
      submittedSoundIdsRef.current.add(question.id);
      if (isCorrect) playCorrect();
      else playWrong();
    }
  };

  const handleSaveReview = () => {
    if (!question || isCurrentQuestionSaved) return;
    playClick();
    saveDailyQuizReviewQuestion(question, feedback?.answer?.selectedOptionKey || selectedOptionKey, session.preferredLanguage);
    setSavedQuestionIds((current) => current.includes(question.id) ? current : [question.id, ...current]);
  };

  const handleNext = () => {
    playClick();
    if (currentIndex === session.questions.length - 1) {
      const result = completeDailyQuiz(session, elapsedSeconds);
      navigate("/daily-quiz/result", { state: { resultId: result.id } });
      return;
    }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setSelectedOptionKey("");
    setFeedback(null);
    persistSession(session, nextIndex);
  };

  return (
    <DashboardLayout activeKey="daily-quiz">
      <header className="dashboard-header session-header">
        <div className="header-left">
          <p className="eyebrow subject-pill">{t("dailyQuiz", session.preferredLanguage)}</p>
          <h1>{t("dailyQuiz", session.preferredLanguage)}</h1>
          <p>{t("question", session.preferredLanguage)} {currentIndex + 1} {t("of", session.preferredLanguage)} {session.questions.length}</p>
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
          <span className="soft-timer"><FaRegClock /> {formatElapsedTime(elapsedSeconds)}</span>
          <button className="outline-pill exit-practice-btn" type="button" onClick={() => { playClick(); navigate("/daily-quiz"); }}>
            <FaDoorOpen /> {t("exit", session.preferredLanguage)}
          </button>
        </div>
      </header>

      <section className="dashboard-content practice-session-content daily-session-content">
        <div className={`practice-board daily-practice-board${feedback ? " has-feedback" : ""}`}>
          <div className="board-question-side">
            <div className="board-top-strip">
              <div className="preview-progress-row">
                <span>{t("question", session.preferredLanguage)} {currentIndex + 1} {t("of", session.preferredLanguage)} {session.questions.length}</span>
                <span>{progressPercent}% {t("complete", session.preferredLanguage)}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="progress-strip-footer">
                <span className="xp-chip">{t("rewardsAfterCompletion", session.preferredLanguage)}</span>
                <span className="practice-mode-chip">{formatElapsedTime(elapsedSeconds)}</span>
              </div>
            </div>

            <div className="practice-question-stack">
              <QuestionCard
                question={question}
                selectedOptionKey={selectedOptionKey}
                correctOptionKey={question.correctOption}
                languageMode={session.preferredLanguage}
                isAnswered={Boolean(feedback)}
                levelLabel={question.subject}
                practiceType={question.topic}
                onSelectOption={handleOptionSelect}
              />
            </div>

            <div className={`question-actions${feedback ? " answered" : ""}`}>
              <span className="xp-preview">{feedback ? t("answerSavedFinal", session.preferredLanguage) : t("selectOneOption", session.preferredLanguage)}</span>
              {!feedback ? (
                <>
                  <button className="btn btn-secondary" type="button" onClick={handleSaveReview}>
                    <FaBookmark /> {t("saveForReview", session.preferredLanguage)}
                  </button>
                  <button className="btn" type="button" disabled={!selectedOptionKey} onClick={handleSubmit}>{t("submitAnswer", session.preferredLanguage)}</button>
                </>
              ) : (
                <>
                  <button className="btn btn-secondary" type="button" disabled={isCurrentQuestionSaved} onClick={handleSaveReview}>
                    <FaBookmark /> {isCurrentQuestionSaved ? t("savedState", session.preferredLanguage) : t("saveForReview", session.preferredLanguage)}
                  </button>
                  <button className="btn" type="button" onClick={handleNext}>
                    {currentIndex === session.questions.length - 1 ? t("practiceComplete", session.preferredLanguage) : t("nextQuestion", session.preferredLanguage)}
                  </button>
                </>
              )}
            </div>
          </div>

          <aside className="board-coach-panel" aria-label="Daily Quiz feedback panel">
            <section className="coach-section mini-session-stats">
              <div className="coach-section-heading"><span>{t("sessionWord", session.preferredLanguage)}</span><strong>{currentIndex + 1}/{session.questions.length}</strong></div>
              <div className="summary-grid">
                <div><span>{t("correct", session.preferredLanguage)}</span><strong>{correctCount}</strong></div>
                <div><span>{t("wrong", session.preferredLanguage)}</span><strong>{wrongCount}</strong></div>
                <div><span>{t("accuracy", session.preferredLanguage)}</span><strong>{accuracySoFar}%</strong></div>
                <div><span>{t("savedLabel", session.preferredLanguage)}</span><strong>{savedQuestionIds.length}</strong></div>
              </div>
            </section>

            <section className="coach-section subject-mini-progress">
              <div className="subject-progress-hero">
                <span>{t("currentQuestion", session.preferredLanguage)}</span>
                <strong>{translateSubjectName(question.subject, session.preferredLanguage)}</strong>
              </div>
              <div className="daily-chip-row">
                <span className="question-pill difficulty">{translateDifficulty(question.difficulty, session.preferredLanguage)}</span>
                <span className="question-pill">{translateSubjectName(question.topic, session.preferredLanguage)}</span>
              </div>
              <p className="subject-progress-copy">
                {Object.keys(answeredSubjects).length ? t("weakSubjectRecommendation", session.preferredLanguage) : t("submitToGenerateInsights", session.preferredLanguage)}
              </p>
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
                  <span>{t("feedbackWord", session.preferredLanguage)}</span>
                  <strong>{t("answerWhenReady", session.preferredLanguage)}</strong>
                  <p>{t("timerAwarenessNote", session.preferredLanguage)}</p>
                  <small>{t("noXpPerQuestion", session.preferredLanguage)}</small>
                </div>
              )}
            </section>
          </aside>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default DailyQuizSessionPage;
