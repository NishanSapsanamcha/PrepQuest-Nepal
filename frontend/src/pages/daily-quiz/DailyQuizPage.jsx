import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaBookOpen,
  FaCalendarCheck,
  FaCheckCircle,
  FaClock,
  FaCoins,
  FaFire,
  FaGraduationCap,
  FaHistory,
  FaLanguage,
  FaListUl,
  FaTrophy,
} from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { examTracks } from "../../data/examTracks";
import usePrepQuestSound from "../../hooks/usePrepQuestSound";
import {
  buildDailyQuizSession,
  formatElapsedTime,
  getDailyQuizAttempts,
  getDailyQuizContext,
  getTodayDailyQuizAttempt,
  selectDailyQuizQuestions,
} from "../../utils/dailyQuizUtils";
import "./DailyQuizPage.css";

const languageLabels = {
  english: "English",
  nepali: "Nepali",
  both: "Both",
};

function DailyQuizPage() {
  const navigate = useNavigate();
  const { playClick } = usePrepQuestSound();
  const context = getDailyQuizContext();
  const todayAttempt = getTodayDailyQuizAttempt();
  const attempts = getDailyQuizAttempts();
  const availableQuestions = useMemo(() => selectDailyQuizQuestions(context.selectedExam), [context.selectedExam]);
  const canStart = availableQuestions.length >= 10 && !todayAttempt;
  const recentAttempts = attempts.slice(0, 5);

  const handleStart = () => {
    playClick();
    if (todayAttempt) {
      navigate("/daily-quiz/result");
      return;
    }
    const result = buildDailyQuizSession();
    if (result.ok) navigate("/daily-quiz/session");
  };

  const handlePracticeWeakSubject = () => {
    playClick();
    navigate(todayAttempt?.weakestSubject ? `/practice?recommended=${encodeURIComponent(todayAttempt.weakestSubject)}` : "/practice");
  };

  const handleReviewToday = () => {
    playClick();
    navigate("/daily-quiz/result");
  };

  const handleDashboard = () => {
    playClick();
    navigate("/dashboard");
  };

  return (
    <DashboardLayout activeKey="daily-quiz">
      <header className="dashboard-header daily-quiz-header">
        <div className="header-left">
          <p className="eyebrow">Daily Challenge</p>
          <h1>Daily Quiz</h1>
          <p>Complete today's 10-question challenge and keep your Loksewa streak alive.</p>
        </div>
        <div className="header-right">
          <span className={`status-chip ${todayAttempt ? "complete" : ""}`}>
            <FaCalendarCheck /> {todayAttempt ? "Completed" : "Not Completed"}
          </span>
        </div>
      </header>

      <section className="dashboard-content daily-quiz-content">
        <section className="daily-context-grid" aria-label="Daily quiz context">
          <article className="stat-card">
            <div className="stat-icon"><FaGraduationCap /></div>
            <div><div className="stat-value">{examTracks[context.selectedExam]?.name || context.selectedExamLabel}</div><div className="stat-helper">Selected exam track</div></div>
          </article>
          <article className="stat-card">
            <div className="stat-icon"><FaLanguage /></div>
            <div><div className="stat-value">{languageLabels[context.preferredLanguage] || "English"}</div><div className="stat-helper">Preferred language</div></div>
          </article>
          <article className="stat-card">
            <div className="stat-icon"><FaFire /></div>
            <div><div className="stat-value">{context.user.streak || 0} Days</div><div className="stat-helper">Current streak</div></div>
          </article>
          <article className="stat-card">
            <div className="stat-icon"><FaCheckCircle /></div>
            <div><div className="stat-value">{todayAttempt ? "Completed" : "Open"}</div><div className="stat-helper">Today's status</div></div>
          </article>
        </section>

        <div className="daily-top-grid">
          <section className="dashboard-card daily-intro-card">
            <div className="card-heading">
              <h2 className="card-title"><FaBookOpen /> Today's Loksewa Daily Quiz</h2>
              <span className="status-chip">10 Questions</span>
            </div>

            {todayAttempt ? (
              <div className="daily-complete-state">
                <h3>Daily Quiz Completed</h3>
                <p>You already completed today's quiz and earned today's reward. Come back tomorrow for a new challenge.</p>
                <div className="result-mini-grid">
                  <span>Score <strong>{todayAttempt.score} / {todayAttempt.totalQuestions}</strong></span>
                  <span>Accuracy <strong>{todayAttempt.accuracy}%</strong></span>
                  <span>XP <strong>+{todayAttempt.xpEarned}</strong></span>
                  <span>Coins <strong>+{todayAttempt.coinsEarned}</strong></span>
                  <span>Weakest <strong>{todayAttempt.weakestSubject || "None"}</strong></span>
                </div>
                <div className="daily-action-row">
                  <button className="btn" type="button" onClick={handleReviewToday}>Review Today's Result</button>
                  <button className="btn btn-secondary" type="button" onClick={handlePracticeWeakSubject}>Practice Weak Subject</button>
                  <button className="btn btn-secondary" type="button" onClick={handleDashboard}>Go to Dashboard</button>
                </div>
              </div>
            ) : availableQuestions.length < 10 ? (
              <div className="daily-empty-state">
                <h3>Not enough validated questions are available for today's quiz yet.</h3>
                <p>Add more reviewed questions to the question bank before starting Daily Quiz.</p>
                <span>{availableQuestions.length} / 10 validated questions available</span>
              </div>
            ) : (
              <>
                <ul className="daily-feature-list">
                  <li><FaListUl /> 10 mixed questions based on your selected exam track</li>
                  <li><FaBookOpen /> Covers GK, Constitution, IQ, English, Nepali, Current Affairs, and available subjects</li>
                  <li><FaClock /> Estimated time: 8-10 minutes</li>
                  <li><FaTrophy /> Complete today to keep your streak active</li>
                </ul>
                <button className="btn daily-start-btn" type="button" disabled={!canStart} onClick={handleStart}>
                  Start Today's Quiz <FaArrowRight />
                </button>
              </>
            )}
          </section>

          <section className="dashboard-card daily-status-card">
            <h2 className="card-title"><FaCalendarCheck /> Daily Status</h2>
            <div className="daily-status-meter">
              <strong>{todayAttempt ? "Done for today" : "Ready"}</strong>
              <span>{todayAttempt ? `Completed in ${formatElapsedTime(todayAttempt.timeTakenSeconds)}` : "One reward can be earned today"}</span>
            </div>
            <div className="daily-status-row"><span>Question bank</span><strong>{availableQuestions.length >= 10 ? "Ready" : `${availableQuestions.length}/10`}</strong></div>
            <div className="daily-status-row"><span>Exam track</span><strong>{context.selectedExamLabel}</strong></div>
            <div className="daily-status-row"><span>Language</span><strong>{languageLabels[context.preferredLanguage] || "English"}</strong></div>
          </section>
        </div>

        <div className="daily-middle-grid">
          <article className="dashboard-card reward-card">
            <h2 className="card-title"><FaTrophy /> Reward Preview</h2>
            <div className="reward-pills"><span>+50 XP</span><span><FaCoins /> +20 coins for 80%+</span><span>+30 XP perfect score</span></div>
          </article>
          <article className="dashboard-card">
            <h2 className="card-title"><FaFire /> Streak Reminder</h2>
            <p className="card-copy">Complete today to keep your daily habit active. Daily Quiz completion is stored as today's activity.</p>
          </article>
          {attempts[1] && (
            <article className="dashboard-card">
              <h2 className="card-title"><FaHistory /> Previous Result</h2>
              <div className="daily-status-row"><span>{attempts[1].date}</span><strong>{attempts[1].score}/{attempts[1].totalQuestions}</strong></div>
              <div className="daily-status-row"><span>Accuracy</span><strong>{attempts[1].accuracy}%</strong></div>
            </article>
          )}
        </div>

        <section className="daily-bottom-grid">
          <article className="dashboard-card">
            <h2 className="card-title"><FaListUl /> Daily Quiz Rules</h2>
            <ul className="daily-rules-list">
              <li>10 mixed questions</li>
              <li>One reward per day</li>
              <li>Instant feedback after each answer</li>
              <li>Wrong answers are saved for review</li>
              <li>Complete the quiz to keep your daily habit active</li>
            </ul>
          </article>

          <article className="dashboard-card">
            <h2 className="card-title"><FaHistory /> Recent Daily Quiz History</h2>
            {recentAttempts.length ? (
              <div className="daily-history-list">
                {recentAttempts.map((attempt) => (
                  <div className="daily-history-item" key={attempt.id}>
                    <span>{attempt.date}</span>
                    <strong>{attempt.score}/{attempt.totalQuestions} - {attempt.accuracy}%</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="card-copy">No Daily Quiz attempts yet.</p>
            )}
          </article>
        </section>
      </section>
    </DashboardLayout>
  );
}

export default DailyQuizPage;
