import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookOpen,
  FaBullseye,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaHome,
  FaListAlt,
  FaStar,
  FaTimesCircle,
  FaTrophy,
} from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { CoinIcon } from "../../components/common/Coin";
import usePrepQuestSound from "../../hooks/usePrepQuestSound";
import { useBadgeCelebration } from "../../context/BadgeCelebrationContext";
import { useCoinReward } from "../../context/CoinRewardContext";
import { t, translateSubjectName } from "../../data/translations";
import { getValidatedQuestions, getOptionLabel, getText } from "../../utils/practiceUtils";
import { formatElapsedTime, getDailyQuizAnswerDisplay, getLatestDailyQuizResult, getTodayDailyQuizAttempt } from "../../utils/dailyQuizUtils";
import "./DailyQuizPage.css";

function DailyQuizResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playClick, playComplete } = usePrepQuestSound();
  const { celebrate } = useBadgeCelebration();
  const { celebrateCoins } = useCoinReward();
  const completionSoundCheckedRef = useRef(false);
  const result = getLatestDailyQuizResult() || getTodayDailyQuizAttempt();
  const questions = useMemo(() => getValidatedQuestions(), []);

  useEffect(() => {
    if (!result) navigate("/daily-quiz", { replace: true });
  }, [navigate, result]);

  // Award + celebrate any badges this quiz unlocked, and show the coin popup.
  useEffect(() => {
    celebrate();
    celebrateCoins();
  }, [celebrate, celebrateCoins]);

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
          <h1>{t("practiceComplete", result.preferredLanguage)}</h1>
          <p>{recommendation}</p>
        </div>
        <div className="header-right">
          <button className="outline-pill" type="button" onClick={() => { playClick(); navigate("/daily-quiz"); }}>
            <FaArrowLeft /> {t("dailyQuiz", result.preferredLanguage)}
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
            <h2>{t("practiceComplete", result.preferredLanguage)}</h2>
            <p>Score {result.score} / {result.totalQuestions} with {result.accuracy}% accuracy.</p>
            <div className="daily-action-row">
              <button className="btn" type="button" onClick={handleReviewAnswers}>
                <FaListAlt /> {t("reviewWrongAnswers", result.preferredLanguage)}
              </button>
              <button className="btn btn-secondary" type="button" onClick={handlePracticeWeakSubject}>
                <FaBookOpen /> {t("practiceWeakSubject", result.preferredLanguage)}
              </button>
              <button className="btn btn-secondary" type="button" onClick={handleDashboard}>
                <FaHome /> {t("dashboard", result.preferredLanguage)}
              </button>
            </div>
          </div>
        </section>

        <section className="daily-result-grid" aria-label="Daily quiz result summary">
          <article className="stat-card"><div className="stat-icon"><FaBullseye /></div><div><div className="stat-value">{result.accuracy}%</div><div className="stat-helper">{t("accuracy", result.preferredLanguage)}</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaCheckCircle /></div><div><div className="stat-value">{result.correctAnswers}</div><div className="stat-helper">{t("correctAnswer", result.preferredLanguage)}</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaTimesCircle /></div><div><div className="stat-value">{result.wrongAnswers}</div><div className="stat-helper">{t("wrongAnswers", result.preferredLanguage)}</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaStar /></div><div><div className="stat-value">+{result.xpEarned} XP</div><div className="stat-helper">{t("xpEarned", result.preferredLanguage)}</div></div></article>
          <article className="stat-card"><div className="stat-icon coin-stat-icon"><CoinIcon size="md" /></div><div><div className="stat-value">+{result.coinsEarned}</div><div className="stat-helper">{t("coins", result.preferredLanguage)}</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaClock /></div><div><div className="stat-value">{formatElapsedTime(result.timeTakenSeconds)}</div><div className="stat-helper">Time taken</div></div></article>
        </section>

        <section className="daily-insight-grid">
          <article className="dashboard-card">
            <h2 className="card-title"><FaTrophy /> {t("strongestSubject", result.preferredLanguage)}</h2>
            <p className="insight-value">{translateSubjectName(result.strongestSubject, result.preferredLanguage) || "Balanced"}</p>
          </article>
          <article className="dashboard-card">
            <h2 className="card-title"><FaExclamationTriangle /> {t("weakTopics", result.preferredLanguage)}</h2>
            <p className="insight-value">{translateSubjectName(result.weakestSubject, result.preferredLanguage) || t("noDataYet", result.preferredLanguage)}</p>
          </article>
          <article className="dashboard-card">
            <h2 className="card-title"><FaBookOpen /> Recommended Next</h2>
            <p className="card-copy">{recommendation}</p>
          </article>
        </section>

        <section className="dashboard-card daily-review-card" id="daily-review">
          <div className="card-heading">
            <h2 className="card-title"><FaListAlt /> {t("reviewWrongAnswers", result.preferredLanguage)}</h2>
            <span className="status-chip">{result.totalQuestions} {t("question", result.preferredLanguage)}</span>
          </div>
          <div className="daily-review-list">
            {reviewItems.map(({ answer, question, display }, index) => (
              <article className={`daily-review-item ${answer.isCorrect ? "correct" : "wrong"}`} key={answer.questionId}>
                <div className="daily-review-top">
                  <span className="review-number">Q{index + 1}</span>
                  <div>
                    <h3>{display.question}</h3>
                    <div className="daily-chip-row">
                      <span className="question-pill">{translateSubjectName(answer.subject || question.subject, result.preferredLanguage)}</span>
                      <span className="question-pill">{answer.topic || question.topic}</span>
                      <span className="question-pill difficulty">{answer.difficulty || question.difficulty}</span>
                    </div>
                  </div>
                  <strong className={answer.isCorrect ? "correct-label" : "wrong-label"}>
                    {answer.isCorrect ? t("correct", result.preferredLanguage) : t("wrong", result.preferredLanguage)}
                  </strong>
                </div>
                <div className="review-answer-grid">
                  <div><span>{result.preferredLanguage === "nepali" ? "तपाईंको उत्तर" : "Your answer"}</span><strong>{question.id ? getOptionLabel(question, answer.selectedOptionKey, result.preferredLanguage) : display.selectedAnswer}</strong></div>
                  <div><span>{t("correctAnswer", result.preferredLanguage)}</span><strong>{question.id ? getOptionLabel(question, answer.correctOption, result.preferredLanguage) : display.correctAnswer}</strong></div>
                </div>
                <div className="review-explanation">
                  <span>{t("explanation", result.preferredLanguage)}</span>
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
