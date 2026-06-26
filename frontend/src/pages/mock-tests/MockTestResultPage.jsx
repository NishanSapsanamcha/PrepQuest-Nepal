import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaAward,
  FaBookOpen,
  FaBullseye,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFire,
  FaHome,
  FaListAlt,
  FaLock,
  FaRegClock,
  FaSave,
  FaStar,
  FaTimesCircle,
  FaTrophy,
} from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { CoinIcon } from "../../components/common/Coin";
import usePrepQuestSound from "../../hooks/usePrepQuestSound";
import { useBadgeCelebration } from "../../context/BadgeCelebrationContext";
import { useCoinReward } from "../../context/CoinRewardContext";
import {
  DETAILED_REPORT_COST,
  formatMockDuration,
  getLatestMockResult,
  getMockAnswerDisplay,
  getMockAttempts,
  saveMockReviewQuestion,
  unlockDetailedReport,
} from "../../utils/mockTestUtils";
import "./MockTestsPage.css";

function MockTestResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playClick, playComplete } = usePrepQuestSound();
  const { celebrate } = useBadgeCelebration();
  const { celebrateCoins } = useCoinReward();
  const [filter, setFilter] = useState("all");
  const [reportUnlocked, setReportUnlocked] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const completionSoundCheckedRef = useRef(false);
  const resultId = location.state?.resultId;
  const result = useMemo(() => {
    const attempts = getMockAttempts();
    return attempts.find((attempt) => attempt.id === resultId) || getLatestMockResult() || attempts[0] || null;
  }, [resultId]);

  useEffect(() => {
    if (!result) navigate("/mock-tests", { replace: true });
  }, [navigate, result]);

  useEffect(() => {
    if (!result || completionSoundCheckedRef.current) return;
    completionSoundCheckedRef.current = true;
    const playedKey = `prepquest_mock_completion_sound_${result.id}`;
    if (sessionStorage.getItem(playedKey) === "true") return;
    sessionStorage.setItem(playedKey, "true");
    playComplete();
  }, [playComplete, result]);

  // Award + celebrate any badges this mock test unlocked, and show the coin popup.
  useEffect(() => {
    celebrate();
    celebrateCoins();
  }, [celebrate, celebrateCoins]);

  if (!result) return null;

  const questions = result.questions || [];
  const savedSet = new Set(result.savedQuestionIds || []);
  const reviewItems = result.answers.map((answer, index) => {
    const question = questions.find((item) => item.id === answer.questionId) || {};
    const display = question.id
      ? getMockAnswerDisplay(question, answer, result.preferredLanguage)
      : {
          question: answer.questionId,
          selectedAnswer: answer.selectedOptionKey || "Unanswered",
          correctAnswer: answer.correctOption,
          explanation: answer.explanation_en || answer.explanation_np || "",
        };
    return { answer, question, display, index };
  });
  const filteredReviewItems = reviewItems.filter(({ answer }) => {
    if (filter === "wrong") return !answer.isCorrect;
    if (filter === "saved") return savedSet.has(answer.questionId);
    return true;
  });
  const weakMisses = result.answers.filter((answer) => !answer.isCorrect && answer.subject === result.weakestSubject).length;
  const recommendation = result.weakestSubject
    ? `You missed ${weakMisses} questions from ${result.weakestSubject}. Practice 10 ${result.weakestSubject} questions before your next mock.`
    : "Strong attempt. Review explanations and keep your rhythm steady.";
  const improvementText =
    result.previousAccuracy === null
      ? "This is your first attempt. Future mocks will show score improvement."
      : result.improvement >= 0
        ? `Great improvement. You increased your mock score by ${result.improvement}%.`
        : `Your score dropped slightly. Review weak areas and try again.`;

  const handlePracticeWeakSubject = () => {
    playClick();
    navigate(result.weakestSubject ? `/practice?recommended=${encodeURIComponent(result.weakestSubject)}` : "/practice");
  };

  const handleSave = (question, answer) => {
    playClick();
    if (!question?.id) return;
    saveMockReviewQuestion(question, answer.selectedOptionKey, result.preferredLanguage, result.id);
  };

  const handleUnlockReport = () => {
    playClick();
    const unlocked = unlockDetailedReport(result.id);
    if (unlocked.ok) {
      setReportUnlocked(true);
      setReportMessage("Detailed report unlocked for this mock.");
    } else {
      setReportMessage("You need 80 coins to unlock the optional detailed report.");
    }
  };

  return (
    <DashboardLayout activeKey="mock-tests">
      <header className="dashboard-header mock-header">
        <div className="header-left">
          <p className="eyebrow">Result</p>
          <h1>Mock Test Complete!</h1>
          <p>{recommendation}</p>
        </div>
        <div className="header-right">
          <button className="outline-pill" type="button" onClick={() => { playClick(); navigate("/mock-tests"); }}>
            <FaArrowLeft /> Mock Tests
          </button>
        </div>
      </header>

      <section className="dashboard-content mock-result-content">
        <section className="dashboard-card mock-result-hero">
          <div className="result-score-ring">
            <span>{result.score}</span>
            <strong>/ {result.totalQuestions}</strong>
          </div>
          <div className="result-hero-copy">
            <h2>Mock Test Complete!</h2>
            <p>Score {result.score} / {result.totalQuestions} with {result.accuracy}% accuracy.</p>
            <div className="daily-action-row">
              <button className="btn" type="button" onClick={() => document.getElementById("mock-review")?.scrollIntoView({ behavior: "smooth" })}>
                <FaListAlt /> Review Answers
              </button>
              <button className="btn btn-secondary" type="button" onClick={handlePracticeWeakSubject}>
                <FaBookOpen /> Practice Weak Subject
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => { playClick(); navigate("/mock-tests"); }}>
                <FaTrophy /> Take Another Mock
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => { playClick(); navigate("/dashboard"); }}>
                <FaHome /> Go to Dashboard
              </button>
            </div>
          </div>
        </section>

        <section className="mock-result-grid" aria-label="Mock result summary">
          <article className="stat-card"><div className="stat-icon"><FaBullseye /></div><div><div className="stat-value">{result.accuracy}%</div><div className="stat-helper">Accuracy</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaCheckCircle /></div><div><div className="stat-value">{result.correctAnswers}</div><div className="stat-helper">Correct answers</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaTimesCircle /></div><div><div className="stat-value">{result.wrongAnswers}</div><div className="stat-helper">Wrong answers</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaExclamationTriangle /></div><div><div className="stat-value">{result.unansweredCount}</div><div className="stat-helper">Unanswered</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaRegClock /></div><div><div className="stat-value">{formatMockDuration(result.timeTakenSeconds)}</div><div className="stat-helper">Time taken</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaStar /></div><div><div className="stat-value">+{result.xpEarned} XP</div><div className="stat-helper">XP earned</div></div></article>
          <article className="stat-card"><div className="stat-icon coin-stat-icon"><CoinIcon size="md" /></div><div><div className="stat-value">+{result.coinsEarned}</div><div className="stat-helper">Coins earned</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaFire /></div><div><div className="stat-value">Active</div><div className="stat-helper">Streak status</div></div></article>
        </section>

        <section className="mock-insight-grid">
          <article className="dashboard-card readiness-card">
            <h2 className="card-title"><FaShield /> Exam Readiness</h2>
            <p className="insight-value">{result.accuracy}%</p>
            <strong>{result.readinessLabel}</strong>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${result.accuracy}%` }} /></div>
            <p className="card-copy">{result.readinessMessage} {result.weakestSubject ? `${result.weakestSubject} needs more revision.` : ""}</p>
          </article>
          <article className="dashboard-card">
            <h2 className="card-title"><FaTrophy /> Strongest Subject</h2>
            <p className="insight-value">{result.strongestSubject || "Balanced"}</p>
          </article>
          <article className="dashboard-card">
            <h2 className="card-title"><FaExclamationTriangle /> Weakest Subject</h2>
            <p className="insight-value">{result.weakestSubject || "No weak subject detected"}</p>
            {result.weakestTopic && <p className="card-copy">Weak Topic: {result.weakestTopic}</p>}
          </article>
          <article className="dashboard-card">
            <h2 className="card-title"><FaBullseye /> Personal Improvement</h2>
            <p className="card-copy">
              {result.previousAccuracy === null ? "First attempt" : `Previous Score: ${result.previousAccuracy}% - Current Score: ${result.accuracy}%`}
            </p>
            <strong className={result.improvement < 0 ? "negative-change" : "positive-change"}>
              {result.improvement === null ? "Baseline set" : `${result.improvement >= 0 ? "+" : ""}${result.improvement}%`}
            </strong>
            <p className="card-copy">{improvementText}</p>
          </article>
        </section>

        <section className="dashboard-card mock-recommendation-card">
          <h2 className="card-title"><FaBookOpen /> Weak Area Recommendation</h2>
          <p>{recommendation}</p>
          <div className="daily-action-row">
            <button className="btn" type="button" onClick={handlePracticeWeakSubject}>Practice Weak Subject</button>
            {result.weakestTopic && <button className="btn btn-secondary" type="button" onClick={handlePracticeWeakSubject}>Practice {result.weakestTopic}</button>}
          </div>
        </section>

        <section className="dashboard-card">
          <div className="card-heading">
            <h2 className="card-title"><FaAward /> Badge Progress</h2>
            <span className="status-chip">Preview</span>
          </div>
          <div className="badge-progress-grid">
            {(result.badgeProgress || []).map((badge) => (
              <article className={`badge-progress-card${badge.unlocked ? " unlocked" : ""}`} key={badge.id}>
                <h3>{badge.name}</h3>
                <p>{badge.description}</p>
                <strong>{badge.progress} / {badge.target}</strong>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(100, (badge.progress / badge.target) * 100)}%` }} /></div>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-card detailed-report-card">
          <div>
            <h2 className="card-title"><FaLock /> Optional Detailed Report</h2>
            <p className="card-copy">Basic score, weak subject, explanations, and recommended practice stay free. Detailed reports add topic-wise weakness, slow questions, and a 3-step study plan.</p>
            {reportMessage && <p className="mock-warning">{reportMessage}</p>}
          </div>
          <button className="btn btn-secondary" type="button" disabled={reportUnlocked} onClick={handleUnlockReport}>
            {reportUnlocked ? "Detailed Report Unlocked" : `Unlock Detailed Report - ${DETAILED_REPORT_COST} Coins`}
          </button>
        </section>

        {reportUnlocked && (
          <section className="dashboard-card">
            <h2 className="card-title"><FaListAlt /> Detailed Report</h2>
            <div className="subject-report-grid">
              {(result.subjectStats || []).map((subject) => (
                <div className="subject-report-item" key={subject.subject}>
                  <span>{subject.subject}</span>
                  <strong>{subject.accuracy}%</strong>
                  <small>{subject.correct}/{subject.total} correct</small>
                </div>
              ))}
            </div>
            <p className="card-copy">Study plan: review explanations, practice {result.weakestSubject || "your weakest subject"}, then retake a full mock tomorrow.</p>
          </section>
        )}

        <section className="dashboard-card mock-review-card" id="mock-review">
          <div className="card-heading">
            <h2 className="card-title"><FaListAlt /> Review Answers</h2>
            <span className="status-chip">{filteredReviewItems.length} shown</span>
          </div>
          <div className="review-filter-row">
            {["all", "wrong", "saved"].map((item) => (
              <button className={`filter-chip${filter === item ? " active" : ""}`} type="button" key={item} onClick={() => { playClick(); setFilter(item); }}>
                {item === "all" ? "Show All" : item === "wrong" ? "Wrong Only" : "Saved Only"}
              </button>
            ))}
          </div>
          <div className="daily-review-list">
            {filteredReviewItems.map(({ answer, question, display, index }) => (
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
                    {answer.isCorrect ? "Correct" : answer.isUnanswered ? "Unanswered" : "Wrong"}
                  </strong>
                </div>
                <div className="review-answer-grid">
                  <div><span>Your answer</span><strong>{display.selectedAnswer}</strong></div>
                  <div><span>Correct answer</span><strong>{display.correctAnswer}</strong></div>
                </div>
                <div className="review-explanation">
                  <span>Explanation</span>
                  <p>{display.explanation}</p>
                </div>
                <div className="review-item-actions">
                  <button className="btn btn-secondary" type="button" onClick={() => handleSave(question, answer)}><FaSave /> Save for Review</button>
                  <button className="btn btn-secondary" type="button" onClick={handlePracticeWeakSubject}>Practice Similar Questions</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </DashboardLayout>
  );
}

function FaShield(props) {
  return <FaAward {...props} />;
}

export default MockTestResultPage;
