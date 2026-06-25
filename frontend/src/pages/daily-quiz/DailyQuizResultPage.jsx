import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookOpen,
  FaBullseye,
  FaCheckCircle,
  FaClock,
  FaCoins,
  FaExclamationTriangle,
  FaHome,
  FaListAlt,
  FaStar,
  FaTimesCircle,
  FaTrophy,
} from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import usePrepQuestSound from "../../hooks/usePrepQuestSound";
import { useBadgeCelebration } from "../../context/BadgeCelebrationContext";
import { getValidatedQuestions, getOptionLabel, getText } from "../../utils/practiceUtils";
import { formatElapsedTime, getDailyQuizAnswerDisplay, getLatestDailyQuizResult, getTodayDailyQuizAttempt } from "../../utils/dailyQuizUtils";
import "./DailyQuizPage.css";

function DailyQuizResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playClick, playComplete } = usePrepQuestSound();
  const { celebrate } = useBadgeCelebration();
  const completionSoundCheckedRef = useRef(false);
  const result = getLatestDailyQuizResult() || getTodayDailyQuizAttempt();
  const questions = useMemo(() => getValidatedQuestions(), []);

  useEffect(() => {
    if (!result) navigate("/daily-quiz", { replace: true });
  }, [navigate, result]);

  // Award + celebrate any badges this quiz unlocked.
  useEffect(() => {
    celebrate();
  }, [celebrate]);

  useEffect(() => {
    if (!result || completionSoundCheckedRef.current) return;
    completionSoundCheckedRef.current = true;
    const newlyCompletedResultId = location.state?.resultId;
    if (newlyCompletedResultId !== result.id) return;

    const playedKey = `prepquest_daily_quiz_completion_sound_${result.id}`;
    if (sessionStorage.getItem(playedKey) === "true") return;
    sessionStorage.setItem(playedKey, "true");
    playComplete();
  }, [location.state?.resultId, playComplete, result]);

  if (!result) return null;

  const reviewItems = result.answers.map((answer) => {
    const question = questions.find((item) => item.id === answer.questionId) || {};
    const display = question.id
      ? getDailyQuizAnswerDisplay(question, answer, result.preferredLanguage)
      : {
          question: answer.questionId,
          selectedAnswer: answer.selectedOptionKey,
          correctAnswer: answer.correctOption,
          explanation: answer.explanation_en || answer.explanation_np || "",
        };

    return { answer, question, display };
  });

  const recommendation = result.weakestSubject
    ? `Practice 10 questions from ${result.weakestSubject} to improve your accuracy.`
    : "Review your answers and continue with subject practice.";

  const handlePracticeWeakSubject = () => {
    playClick();
    navigate(result.weakestSubject ? `/practice?recommended=${encodeURIComponent(result.weakestSubject)}` : "/practice");
  };

  const handleReviewAnswers = () => {
    playClick();
    document.getElementById("daily-review")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDashboard = () => {
    playClick();
    navigate("/dashboard");
  };

  return (
    <DashboardLayout activeKey="daily-quiz">
      <header className="dashboard-header daily-quiz-header">
        <div className="header-left">
          <p className="eyebrow">Result</p>
          <h1>Daily Quiz Complete!</h1>
          <p>{recommendation}</p>
        </div>
        <div className="header-right">
          <button className="outline-pill" type="button" onClick={() => { playClick(); navigate("/daily-quiz"); }}>
            <FaArrowLeft /> Daily Quiz
          </button>
        </div>
      </header>

      <section className="dashboard-content daily-result-content">
        <section className="dashboard-card daily-result-hero">
          <div className="result-score-ring">
            <span>{result.score}</span>
            <strong>/ {result.totalQuestions}</strong>
          </div>
          <div className="result-hero-copy">
            <h2>Daily Quiz Complete!</h2>
            <p>Score {result.score} / {result.totalQuestions} with {result.accuracy}% accuracy.</p>
            <div className="daily-action-row">
              <button className="btn" type="button" onClick={handleReviewAnswers}>
                <FaListAlt /> Review Answers
              </button>
              <button className="btn btn-secondary" type="button" onClick={handlePracticeWeakSubject}>
                <FaBookOpen /> Practice Weak Subject
              </button>
              <button className="btn btn-secondary" type="button" onClick={handleDashboard}>
                <FaHome /> Go to Dashboard
              </button>
            </div>
          </div>
        </section>

        <section className="daily-result-grid" aria-label="Daily quiz result summary">
          <article className="stat-card"><div className="stat-icon"><FaBullseye /></div><div><div className="stat-value">{result.accuracy}%</div><div className="stat-helper">Accuracy</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaCheckCircle /></div><div><div className="stat-value">{result.correctAnswers}</div><div className="stat-helper">Correct answers</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaTimesCircle /></div><div><div className="stat-value">{result.wrongAnswers}</div><div className="stat-helper">Wrong answers</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaStar /></div><div><div className="stat-value">+{result.xpEarned} XP</div><div className="stat-helper">XP earned</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaCoins /></div><div><div className="stat-value">+{result.coinsEarned}</div><div className="stat-helper">Coins earned</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaClock /></div><div><div className="stat-value">{formatElapsedTime(result.timeTakenSeconds)}</div><div className="stat-helper">Time taken</div></div></article>
        </section>

        <section className="daily-insight-grid">
          <article className="dashboard-card">
            <h2 className="card-title"><FaTrophy /> Strongest Subject</h2>
            <p className="insight-value">{result.strongestSubject || "Balanced"}</p>
          </article>
          <article className="dashboard-card">
            <h2 className="card-title"><FaExclamationTriangle /> Weakest Subject</h2>
            <p className="insight-value">{result.weakestSubject || "No weak subject detected"}</p>
          </article>
          <article className="dashboard-card">
            <h2 className="card-title"><FaBookOpen /> Recommended Next</h2>
            <p className="card-copy">{recommendation}</p>
          </article>
        </section>

        <section className="dashboard-card daily-review-card" id="daily-review">
          <div className="card-heading">
            <h2 className="card-title"><FaListAlt /> Review Answers</h2>
            <span className="status-chip">{result.totalQuestions} Questions</span>
          </div>
          <div className="daily-review-list">
            {reviewItems.map(({ answer, question, display }, index) => (
              <article className={`daily-review-item ${answer.isCorrect ? "correct" : "wrong"}`} key={answer.questionId}>
                <div className="daily-review-top">
                  <span className="review-number">Q{index + 1}</span>
                  <div>
                    <h3>{display.question}</h3>
                    <div className="daily-chip-row">
                      <span className="question-pill">{answer.subject || question.subject}</span>
                      <span className="question-pill">{answer.topic || question.topic}</span>
                      <span className="question-pill difficulty">{answer.difficulty || question.difficulty}</span>
                    </div>
                  </div>
                  <strong className={answer.isCorrect ? "correct-label" : "wrong-label"}>
                    {answer.isCorrect ? "Correct" : "Wrong"}
                  </strong>
                </div>
                <div className="review-answer-grid">
                  <div><span>Your answer</span><strong>{question.id ? getOptionLabel(question, answer.selectedOptionKey, result.preferredLanguage) : display.selectedAnswer}</strong></div>
                  <div><span>Correct answer</span><strong>{question.id ? getOptionLabel(question, answer.correctOption, result.preferredLanguage) : display.correctAnswer}</strong></div>
                </div>
                <div className="review-explanation">
                  <span>Explanation</span>
                  <p>{question.id ? getText(question, result.preferredLanguage).explanation : display.explanation}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </DashboardLayout>
  );
}

export default DailyQuizResultPage;
