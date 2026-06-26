import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FaArrowRight, FaBookmark, FaCheckCircle, FaDoorOpen, FaFire, FaRobot, FaStar, FaTimesCircle, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import AnswerFeedback from "../../components/practice/AnswerFeedback";
import QuestionCard from "../../components/practice/QuestionCard";
import usePrepQuestSound from "../../hooks/usePrepQuestSound";
import { getSubjectById } from "../../data/subjects";
import { buildSubjectProgress, completePracticeSession, getSubjectQuestions, normalizeLanguageMode } from "../../utils/practiceUtils";
import {
  getSavedReviewQuestions,
  getUser,
  saveLastPracticeResult,
  saveReviewQuestion,
  saveWrongAnswer,
} from "../../utils/storageUtils";
import { addXPTransaction, getCorrectAnswerXP, getNextLevelProgress, getPracticeSessionXP, getSubjectLevel } from "../../utils/xpUtils";
import "./PracticeSessionPage.css";

function PracticeSessionPage() {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = getUser();
  const subject = getSubjectById(subjectId);
  const selectedExam = user.selectedExam || localStorage.getItem("selectedExam");
  const questions = useMemo(() => getSubjectQuestions(subjectId, selectedExam), [subjectId, selectedExam]);
  const practiceSessionIdRef = useRef(`practice-${subjectId}-${Date.now()}`);
  const progress = buildSubjectProgress(subjectId);
  const level = getSubjectLevel(progress.xp);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionKey, setSelectedOptionKey] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [sessionEarnedXp, setSessionEarnedXp] = useState(() => getPracticeSessionXP(practiceSessionIdRef.current));
  const [savedQuestionIds, setSavedQuestionIds] = useState(() => getSavedReviewQuestions().map((item) => item.questionId));
  const [hintMessage, setHintMessage] = useState("");
  const { isMuted, toggleMute, playClick, playCorrect, playWrong, playComplete, playLevelUp } = usePrepQuestSound();
  const languageMode = normalizeLanguageMode(localStorage.getItem("preferredLanguage") || user.preferredLanguage);
  const isRecommendedPractice = searchParams.get("recommended") === "1";

  if (!subject || !questions.length) {
    return (
      <DashboardLayout activeKey="practice">
        <section className="dashboard-content">
          <div className="dashboard-card">
            <h1>No validated practice questions found</h1>
            <p className="card-copy">This subject question bank is not ready yet.</p>
          </div>
        </section>
      </DashboardLayout>
    );
  }

  const question = questions[currentIndex];
  const correctCount = answers.filter((answer) => answer.isCorrect).length;
  const wrongCount = answers.filter((answer) => !answer.isCorrect).length;
  const answeredCount = answers.length;
  const accuracySoFar = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;
  const subjectLevelProgress = getNextLevelProgress(progress.xp);
  const isCurrentQuestionSaved = savedQuestionIds.includes(question.id);
  // Consecutive correct answers at the end of the session (in-session streak).
  const sessionStreak = (() => {
    let streak = 0;
    for (let i = answers.length - 1; i >= 0; i -= 1) {
      if (answers[i].isCorrect) streak += 1;
      else break;
    }
    return streak;
  })();

  const handleSoundToggle = () => {
    toggleMute();
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
      languageMode,
      isCorrect,
    };
    setAnswers((current) => [...current, answer]);
    setFeedback({ isCorrect, answer });
    if (isCorrect) {
      const xpResult = addXPTransaction({
        type: "practice_correct_answer",
        amount: getCorrectAnswerXP(),
        subjectId,
        subjectName: subject.name,
        questionId: question.id,
        practiceSessionId: practiceSessionIdRef.current,
        metadata: { source: "quick_practice" },
      });
      if (xpResult.added) setSessionEarnedXp((current) => current + xpResult.transaction.amount);
    } else {
      saveWrongAnswer(question, selectedOptionKey, languageMode);
    }
    if (isCorrect) playCorrect();
    else playWrong();
  };

  const finishSession = (finalAnswers) => {
    const result = completePracticeSession({
      subjectId,
      subjectName: subject.name,
      answers: finalAnswers,
      questions,
      practiceSessionId: practiceSessionIdRef.current,
      practiceType: "Quick Practice",
      isRecommendedPractice,
    });
    if (result.levelUp?.didLevelUp) playLevelUp();
    else playComplete();
    saveLastPracticeResult(result);
    navigate(`/practice/${subjectId}/result`);
  };

  const handleNext = () => {
    playClick();
    const currentAnswers = feedback?.answer && !answers.some((answer) => answer.questionId === feedback.answer.questionId)
      ? [...answers, feedback.answer]
      : answers;
    if (currentIndex === questions.length - 1) {
      finishSession(currentAnswers);
      return;
    }
    setCurrentIndex((index) => index + 1);
    setSelectedOptionKey("");
    setFeedback(null);
  };

  const handleSkip = () => {
    if (feedback) return;
    playClick();
    const skippedAnswer = {
      questionId: question.id,
      selectedOptionKey: "SKIPPED",
      correctOption: question.correctOption,
      languageMode,
      isCorrect: false,
    };
    const nextAnswers = [...answers, skippedAnswer];
    setAnswers(nextAnswers);
    setFeedback({ isCorrect: false, answer: skippedAnswer });
  };

  const handleSaveReview = () => {
    if (!feedback?.answer || isCurrentQuestionSaved) return;
    playClick();
    saveReviewQuestion(question, feedback.answer.selectedOptionKey, languageMode);
    setSavedQuestionIds((current) => current.includes(question.id) ? current : [question.id, ...current]);
  };

  // DEV-ONLY: ?debugPracticeLayout=true outlines/labels major layout sections.
  const debugLayout =
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debugPracticeLayout") === "true";

  return (
    <DashboardLayout activeKey="practice">
      <header className="dashboard-header session-header session-header-quiz">
        <div className="session-head-left">
          <p className="eyebrow subject-pill">{subject.name}</p>
          <h1>Level {level.level}: {level.name}</h1>
        </div>

        <div className="session-head-center">
          <span className="session-progress-text">Question {currentIndex + 1} of {questions.length}</span>
          <div className="step-nodes" aria-hidden="true">
            {questions.map((item, index) => (
              <span
                key={item.id || index}
                className={`step-node${index < currentIndex ? " done" : ""}${index === currentIndex ? " current" : ""}`}
              >
                {index + 1}
              </span>
            ))}
          </div>
        </div>

        <div className="session-head-right">
          <span className="session-chip xp-chip"><FaStar /> +10 XP</span>
          <span className="session-chip streak-chip"><FaFire /> {sessionStreak} Streak</span>
          <button
            className="sound-toggle"
            type="button"
            aria-label={isMuted ? "Sound Off" : "Sound On"}
            title={isMuted ? "Sound Off" : "Sound On"}
            onClick={handleSoundToggle}
          >
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          <button
            className="outline-pill exit-practice-btn"
            type="button"
            onClick={() => {
              playClick();
              navigate(`/practice/${subjectId}`);
            }}
          >
            <FaDoorOpen /> Exit Practice
          </button>
        </div>
      </header>

      <section className={`dashboard-content practice-session-content${debugLayout ? " debug-practice-layout" : ""}`}>
        <div className={`practice-board${feedback ? " has-feedback" : ""}`} data-debug="Practice Board">
          <div className="board-question-side" data-debug="Question Side">
            <div className={`practice-question-stack${feedback?.isCorrect ? " answered-correct" : ""}`}>
              {feedback?.isCorrect && (
                <div className="celebration-burst" aria-hidden="true">
                  {Array.from({ length: 12 }, (_, index) => <span key={index} />)}
                </div>
              )}
              <QuestionCard
                question={question}
                selectedOptionKey={selectedOptionKey}
                correctOptionKey={question.correctOption}
                languageMode={languageMode}
                isAnswered={Boolean(feedback)}
                onSelectOption={handleOptionSelect}
                showXpBurst={Boolean(feedback?.isCorrect)}
              />
            </div>

            {feedback && (
              <AnswerFeedback
                question={question}
                isCorrect={feedback.isCorrect}
                selectedOptionKey={feedback.answer.selectedOptionKey}
                languageMode={languageMode}
              />
            )}

            <div className={`question-actions${feedback ? " answered" : ""}`}>
              <span className="xp-preview">
                {!feedback && <><FaStar /> Correct answer reward: +10 XP</>}
                {feedback?.isCorrect && <><FaStar /> +10 XP earned</>}
                {feedback && !feedback.isCorrect && "Review the explanation above"}
              </span>
              <div className="question-action-btns">
                {!feedback ? (
                  <>
                    <button className="btn btn-secondary" type="button" onClick={handleSkip}>Skip</button>
                    <button className="btn" type="button" disabled={!selectedOptionKey} onClick={handleSubmit}>Submit Answer</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-secondary" type="button" disabled={isCurrentQuestionSaved} onClick={handleSaveReview}>
                      <FaBookmark /> {isCurrentQuestionSaved ? "Saved" : "Save for Review"}
                    </button>
                    <button className="btn" type="button" onClick={handleNext}>{currentIndex === questions.length - 1 ? "Finish Practice" : "Next Question"}</button>
                  </>
                )}
              </div>
            </div>
          </div>

          <aside className="board-coach-panel" aria-label="Practice session panel">
            <section className="session-panel" data-debug="Session Panel">
              <div className="panel-section">
                <span className="panel-kicker">Your Progress</span>
                <div className="progress-panel-top">
                  <div className="panel-level-badge">{level.level}</div>
                  <div className="progress-panel-meta">
                    <strong>Level {level.level}: {level.name}</strong>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${subjectLevelProgress.percent}%` }} />
                </div>
                <div className="panel-xp-line">
                  <span>{progress.xp} / {subjectLevelProgress.nextLevelXp} XP</span>
                </div>
                <span className="panel-sub">
                  {subjectLevelProgress.nextLevel
                    ? `${subjectLevelProgress.remainingXp} XP to reach Level ${subjectLevelProgress.nextLevel.level}: ${subjectLevelProgress.nextLevel.name}`
                    : "Highest subject level reached."}
                </span>
              </div>

              <div className="panel-divider" />

              <div className="panel-section">
                <div className="panel-head">
                  <span className="panel-kicker">Session</span>
                  <strong>{currentIndex + 1}/{questions.length}</strong>
                </div>
                <div className="session-score-row">
                  <span>Score</span>
                  <strong>+{sessionEarnedXp} XP</strong>
                </div>
                <div className="session-stat-grid">
                  <div>
                    <span className="session-stat-label"><FaCheckCircle className="ok" /> Correct</span>
                    <strong>{correctCount}</strong>
                  </div>
                  <div>
                    <span className="session-stat-label"><FaTimesCircle className="bad" /> Wrong</span>
                    <strong>{wrongCount}</strong>
                  </div>
                  <div>
                    <span className="session-stat-label">Accuracy</span>
                    <strong>{accuracySoFar}%</strong>
                  </div>
                </div>
              </div>

              <div className="panel-divider" />

              <div className="panel-section">
                <span className="panel-kicker">Streak</span>
                <div className="streak-panel-body">
                  <FaFire />
                  <span>{sessionStreak} {sessionStreak === 1 ? "question" : "questions"} in a row</span>
                  <span className="streak-hex">{sessionStreak}</span>
                </div>
              </div>
            </section>

            <button className="hint-card" type="button" onClick={() => setHintMessage("Hints are coming soon.")}>
              <span className="hint-icon"><FaRobot /></span>
              <div className="hint-copy">
                <strong>Need a Hint?</strong>
                <span>{hintMessage || "Get a small hint to help you out."}</span>
              </div>
              <FaArrowRight className="hint-arrow" />
            </button>
          </aside>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default PracticeSessionPage;
