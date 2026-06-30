import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaBookOpen,
  FaCalendarCheck,
  FaCheckCircle,
  FaClock,
  FaFire,
  FaGraduationCap,
  FaHistory,
  FaLanguage,
  FaListUl,
  FaTrophy,
} from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { CoinIcon } from "../../components/common/Coin";
import { examTracks } from "../../data/examTracks";
import { languageLabel as getLanguageLabel, t, translateExamName, translateSubjectName, formatDays, formatCompletedIn } from "../../data/translations";
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
          <p className="eyebrow">{t("todayMission", context.preferredLanguage)}</p>
          <h1>{t("dailyQuiz", context.preferredLanguage)}</h1>
          <p>{t("dailyQuizDescription", context.preferredLanguage)}</p>
        </div>
        <div className="header-right">
          <span className={`status-chip ${todayAttempt ? "complete" : ""}`}>
            <FaCalendarCheck /> {todayAttempt ? t("completed", context.preferredLanguage) : t("notCompleted", context.preferredLanguage)}
          </span>
        </div>
      </header>

      <section className="dashboard-content daily-quiz-content">
        <section className="daily-context-grid" aria-label="Daily quiz context">
          <article className="stat-card">
            <div className="stat-icon"><FaGraduationCap /></div>
            <div><div className="stat-value">{translateExamName(examTracks[context.selectedExam]?.name || context.selectedExamLabel, context.preferredLanguage)}</div><div className="stat-helper">{t("selectedExamTrack", context.preferredLanguage)}</div></div>
          </article>
          <article className="stat-card">
            <div className="stat-icon"><FaLanguage /></div>
            <div><div className="stat-value">{getLanguageLabel(context.preferredLanguage)}</div><div className="stat-helper">{t("preferredLanguage", context.preferredLanguage)}</div></div>
          </article>
          <article className="stat-card">
            <div className="stat-icon"><FaFire /></div>
            <div><div className="stat-value">{formatDays(context.user.streak || 0, context.preferredLanguage)}</div><div className="stat-helper">{t("currentStreak", context.preferredLanguage)}</div></div>
          </article>
          <article className="stat-card">
            <div className="stat-icon"><FaCheckCircle /></div>
            <div><div className="stat-value">{todayAttempt ? t("completed", context.preferredLanguage) : t("open", context.preferredLanguage)}</div><div className="stat-helper">{t("todaysStatus", context.preferredLanguage)}</div></div>
          </article>
        </section>

        <div className="daily-top-grid">
          <section className="dashboard-card daily-intro-card">
            <div className="card-heading">
              <h2 className="card-title"><FaBookOpen /> {t("todaysLoksewaDailyQuiz", context.preferredLanguage)}</h2>
              <span className="status-chip">{t("tenQuestions", context.preferredLanguage)}</span>
            </div>

            {todayAttempt ? (
              <div className="daily-complete-state">
                <h3>{t("dailyQuizCompleted", context.preferredLanguage)}</h3>
                <p>{t("dailyQuizCompletedDesc", context.preferredLanguage)}</p>
                <div className="result-mini-grid">
                  <span>{t("scoreWord", context.preferredLanguage)} <strong>{todayAttempt.score} / {todayAttempt.totalQuestions}</strong></span>
                  <span>{t("accuracy", context.preferredLanguage)} <strong>{todayAttempt.accuracy}%</strong></span>
                  <span>XP <strong>+{todayAttempt.xpEarned}</strong></span>
                  <span><CoinIcon size="sm" /> <strong>+{todayAttempt.coinsEarned}</strong></span>
                  <span>{t("weakest", context.preferredLanguage)} <strong>{todayAttempt.weakestSubject ? translateSubjectName(todayAttempt.weakestSubject, context.preferredLanguage) : t("none", context.preferredLanguage)}</strong></span>
                </div>
                <div className="daily-action-row">
                  <button className="btn" type="button" onClick={handleReviewToday}>{t("reviewTodaysResult", context.preferredLanguage)}</button>
                  <button className="btn btn-secondary" type="button" onClick={handlePracticeWeakSubject}>{t("practiceWeakSubjectAction", context.preferredLanguage)}</button>
                  <button className="btn btn-secondary" type="button" onClick={handleDashboard}>{t("goToDashboard", context.preferredLanguage)}</button>
                </div>
              </div>
            ) : availableQuestions.length < 10 ? (
              <div className="daily-empty-state">
                <h3>{t("notEnoughValidatedQuestions", context.preferredLanguage)}</h3>
                <p>{t("addMoreQuestions", context.preferredLanguage)}</p>
                <span>{availableQuestions.length} / 10 {t("validatedQuestionsAvailable", context.preferredLanguage)}</span>
              </div>
            ) : (
              <>
                <ul className="daily-feature-list">
                  <li><FaListUl /> {t("dailyQuizFeatureMixed", context.preferredLanguage)}</li>
                  <li><FaBookOpen /> {t("dailyQuizFeatureCovers", context.preferredLanguage)}</li>
                  <li><FaClock /> {t("estimatedTime", context.preferredLanguage)}: {t("estimatedTimeValue", context.preferredLanguage)}</li>
                  <li><FaTrophy /> {t("dailyQuizFeatureStreak", context.preferredLanguage)}</li>
                </ul>
                <button className="btn daily-start-btn" type="button" disabled={!canStart} onClick={handleStart}>
                  {t("startTodaysQuiz", context.preferredLanguage)} <FaArrowRight />
                </button>
              </>
            )}
          </section>

          <section className="dashboard-card daily-status-card">
            <h2 className="card-title"><FaCalendarCheck /> {t("dailyStatus", context.preferredLanguage)}</h2>
            <div className="daily-status-meter">
              <strong>{todayAttempt ? t("completed", context.preferredLanguage) : t("ready", context.preferredLanguage)}</strong>
              <span>{todayAttempt ? formatCompletedIn(formatElapsedTime(todayAttempt.timeTakenSeconds), context.preferredLanguage) : t("oneRewardToday", context.preferredLanguage)}</span>
            </div>
            <div className="daily-status-row"><span>{t("questionBank", context.preferredLanguage)}</span><strong>{availableQuestions.length >= 10 ? t("ready", context.preferredLanguage) : `${availableQuestions.length}/10`}</strong></div>
            <div className="daily-status-row"><span>{t("examTrack", context.preferredLanguage)}</span><strong>{translateExamName(context.selectedExamLabel, context.preferredLanguage)}</strong></div>
            <div className="daily-status-row"><span>{t("language", context.preferredLanguage)}</span><strong>{getLanguageLabel(context.preferredLanguage)}</strong></div>
          </section>
        </div>

        <div className="daily-middle-grid">
          <article className="dashboard-card reward-card">
            <h2 className="card-title"><FaTrophy /> {t("rewardPreview", context.preferredLanguage)}</h2>
            <div className="reward-pills"><span>+50 XP</span><span><CoinIcon size="sm" /> +20 for 80%+</span><span>+30 XP perfect score</span></div>
          </article>
          <article className="dashboard-card">
            <h2 className="card-title"><FaFire /> {t("streakReminder", context.preferredLanguage)}</h2>
            <p className="card-copy">{t("streakReminderDesc", context.preferredLanguage)}</p>
          </article>
          {attempts[1] && (
            <article className="dashboard-card">
              <h2 className="card-title"><FaHistory /> {t("previousResult", context.preferredLanguage)}</h2>
              <div className="daily-status-row"><span>{attempts[1].date}</span><strong>{attempts[1].score}/{attempts[1].totalQuestions}</strong></div>
              <div className="daily-status-row"><span>{t("accuracy", context.preferredLanguage)}</span><strong>{attempts[1].accuracy}%</strong></div>
            </article>
          )}
        </div>

        <section className="daily-bottom-grid">
          <article className="dashboard-card">
            <h2 className="card-title"><FaListUl /> {t("dailyQuizRules", context.preferredLanguage)}</h2>
            <ul className="daily-rules-list">
              <li>{t("rule10Mixed", context.preferredLanguage)}</li>
              <li>{t("ruleOneReward", context.preferredLanguage)}</li>
              <li>{t("ruleInstantFeedback", context.preferredLanguage)}</li>
              <li>{t("ruleWrongSaved", context.preferredLanguage)}</li>
              <li>{t("ruleCompleteHabit", context.preferredLanguage)}</li>
            </ul>
          </article>

          <article className="dashboard-card">
            <h2 className="card-title"><FaHistory /> {t("recentDailyQuizHistory", context.preferredLanguage)}</h2>
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
              <p className="card-copy">{t("noDailyQuizAttempts", context.preferredLanguage)}</p>
            )}
          </article>
        </section>
      </section>
    </DashboardLayout>
  );
}

export default DailyQuizPage;
