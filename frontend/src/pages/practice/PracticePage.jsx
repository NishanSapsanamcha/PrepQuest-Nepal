import { useNavigate } from "react-router-dom";
import { FaBookmark, FaExclamationTriangle, FaFire, FaGraduationCap, FaLanguage, FaLayerGroup, FaLightbulb, FaMedal, FaStar, FaTools } from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import RecommendedPracticeCard from "../../components/practice/RecommendedPracticeCard";
import SubjectCard from "../../components/practice/SubjectCard";
import PremiumBadge from "../../components/practice/PremiumBadge";
import { CoinIcon } from "../../components/common/Coin";
import { STAT_ICON_ASSETS } from "../../data/practiceIconAssets";
import badgeStatIcon from "../../assets/level/bages.png";
import { examTracks } from "../../data/examTracks";
import { getCurrentStreak } from "../../utils/dailyQuizUtils";
import { getEarnedBadges, syncBadges } from "../../utils/badgeUtils";
import { getUserCoinBalance } from "../../services/coinService";
import {
  buildSubjectCardData,
  getExamSubjects,
  getNormalizedSubjectProgress,
  normalizeExamId,
} from "../../utils/practiceUtils";
import {
  getSavedCountBySubject,
  getSavedReviewQuestions,
  getUser,
  getWeakTopicsFromWrongAnswers,
  getWrongAnswerCountBySubject,
  getWrongAnswerReview,
} from "../../utils/storageUtils";
import { calculateTotalXPFromTransactions } from "../../utils/xpUtils";
import "./PracticePage.css";

function PracticePage() {
  const navigate = useNavigate();
  const user = getUser();
  const currentStreak = getCurrentStreak();
  const selectedExamId = normalizeExamId(user.selectedExam || localStorage.getItem("selectedExam"));
  const examLabel = examTracks[selectedExamId]?.name || "Sakha Adhikrit";
  const languageLabel = localStorage.getItem("preferredLanguage") || user.preferredLanguage || "English";
  const subjectProgress = getNormalizedSubjectProgress();
  const totalXp = calculateTotalXPFromTransactions();
  const coinBalance = getUserCoinBalance();
  const badgesEarned = getEarnedBadges(syncBadges()).length;
  const savedQuestions = getSavedReviewQuestions();
  const wrongAnswers = getWrongAnswerReview().filter((item) => !item.mastered);
  const weakTopics = getWeakTopicsFromWrongAnswers();
  const topWeakTopic = weakTopics[0];
  const subjectCards = getExamSubjects(selectedExamId).map((subject) =>
    ({
      ...buildSubjectCardData(subject, subjectProgress, selectedExamId),
      savedReviewCount: getSavedCountBySubject(subject.id),
      wrongReviewCount: getWrongAnswerCountBySubject(subject.id),
    })
  );
  const practicedSubjects = subjectCards.filter((subject) => subject.progress.questionsSolved > 0 && subject.canPractice);
  const recommendationSubject =
    practicedSubjects.length > 0
      ? [...practicedSubjects].sort((a, b) => (a.accuracy ?? 101) - (b.accuracy ?? 101))[0]
      : subjectCards.find((subject) => subject.id === "constitution" && subject.canPractice) ||
        subjectCards.find((subject) => subject.id === "general-knowledge" && subject.canPractice) ||
        [...subjectCards].sort((a, b) => b.questionsAvailable - a.questionsAvailable)[0];
  const recommendation = recommendationSubject
    ? {
        title: `Start with ${recommendationSubject.name}`,
        text:
          recommendationSubject.progress.questionsSolved > 0
            ? `${recommendationSubject.name} has your lowest current accuracy. Complete a focused practice to improve it.`
            : `Start with ${recommendationSubject.name} to build your foundation.`,
        questionsAvailable: recommendationSubject.questionsAvailable,
        canPractice: recommendationSubject.canPractice,
        subjectId: recommendationSubject.id,
      }
    : {
        title: "Question bank not ready",
        text: "Validated practice questions are not available yet.",
        questionsAvailable: 0,
        canPractice: false,
        subjectId: null,
      };

  // DEV-ONLY: ?debugPracticeLayout=true outlines/labels major layout sections.
  const debugLayout =
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debugPracticeLayout") === "true";

  return (
    <DashboardLayout activeKey="practice">
      {/* A. Header — clean, no welcome line */}
      <header className="dashboard-header practice-header">
        <div className="header-left">
          <h1>Choose Your Practice Subject</h1>
          <p>Master each subject step by step and level up your knowledge.</p>
        </div>
        <div className="header-right">
          <div className="header-chips">
            <span className="chip"><FaGraduationCap /> Exam: <strong>{examLabel}</strong></span>
            <span className="chip"><FaLanguage /> Language: <strong>{languageLabel}</strong></span>
          </div>
          <button className="outline-pill" type="button" onClick={() => navigate("/setup", { state: { allowPreferenceChange: true } })}>
            <FaTools /> Change Preferences
          </button>
        </div>
      </header>

      <section className={`dashboard-content practice-content${debugLayout ? " debug-practice-layout" : ""}`}>
        {/* B. Summary strip */}
        <section className="practice-summary-strip" aria-label="Your gamification stats" data-debug="Summary Strip">
          <div className="summary-stat">
            <PremiumBadge src={STAT_ICON_ASSETS.xp} alt="XP" className="summary-stat-icon xp" imgClassName="practice-summary-icon"><FaStar /></PremiumBadge>
            <div className="summary-stat-body">
              <span className="summary-stat-label">Total XP</span>
              <strong className="summary-stat-value">{totalXp.toLocaleString()}</strong>
              <span className="summary-stat-helper">Keep leveling up!</span>
            </div>
          </div>
          <div className="summary-stat">
            <PremiumBadge src={STAT_ICON_ASSETS.coin} alt="Coins" className="summary-stat-icon coin" imgClassName="practice-summary-icon"><CoinIcon size="md" /></PremiumBadge>
            <div className="summary-stat-body">
              <strong className="summary-stat-value summary-stat-value-solo">{coinBalance.toLocaleString()}</strong>
            </div>
          </div>
          <div className="summary-stat">
            <PremiumBadge src={STAT_ICON_ASSETS.streak} alt="Streak" className="summary-stat-icon streak" imgClassName="practice-summary-icon"><FaFire /></PremiumBadge>
            <div className="summary-stat-body">
              <span className="summary-stat-label">Current Streak</span>
              <strong className="summary-stat-value">{currentStreak} {currentStreak === 1 ? "Day" : "Days"}</strong>
              <span className="summary-stat-helper">{currentStreak > 0 ? "Keep it alive today" : "Start a daily quiz"}</span>
            </div>
          </div>
          <div className="summary-stat">
            <PremiumBadge src={badgeStatIcon} alt="Badges" className="summary-stat-icon badges" imgClassName="practice-summary-icon"><FaMedal /></PremiumBadge>
            <div className="summary-stat-body">
              <span className="summary-stat-label">Badges Earned</span>
              <strong className="summary-stat-value">{badgesEarned}</strong>
            </div>
          </div>
        </section>

        {/* C. Subjects grid (main focus) */}
        <section className="practice-section-heading">
          <h2>Subjects</h2>
        </section>

        <section className="subject-grid" data-debug="Subject Grid">
          {subjectCards.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onPractice={() => subject.canPractice && navigate(`/practice/${subject.id}`)}
            />
          ))}
        </section>

        {/* D. Recommended Practice */}
        <RecommendedPracticeCard
          recommendation={recommendation}
          onStart={() => recommendation.canPractice && navigate(`/practice/${recommendation.subjectId}/session?recommended=1`)}
        />

        {/* E. Review & Mistakes */}
        <section className="review-mistakes-section" aria-labelledby="review-mistakes-title">
          <div className="practice-section-heading compact">
            <h2 id="review-mistakes-title">Review &amp; Mistakes</h2>
            <p>Revisit saved questions and correct your weak areas before your next practice.</p>
          </div>
          <div className="review-card-grid">
            <article className="review-mini-card">
              <div className="review-mini-icon"><FaBookmark /></div>
              <div>
                <h3>Saved Questions</h3>
                <strong>{savedQuestions.length} saved</strong>
                <p>Questions you bookmarked during practice.</p>
              </div>
              <button className="btn btn-secondary" type="button" disabled={!savedQuestions.length} onClick={() => navigate("/practice/review?tab=saved")}>
                Review Saved
              </button>
            </article>
            <article className="review-mini-card mistakes">
              <div className="review-mini-icon"><FaExclamationTriangle /></div>
              <div>
                <h3>Wrong Answers</h3>
                <strong>{wrongAnswers.length ? `${wrongAnswers.length} to review` : "No mistakes yet"}</strong>
                <p>Learn from mistakes with explanations.</p>
              </div>
              <button className="btn btn-secondary" type="button" disabled={!wrongAnswers.length} onClick={() => navigate("/practice/review?tab=wrong")}>
                Review Mistakes
              </button>
            </article>
            <article className="review-mini-card">
              <div className="review-mini-icon"><FaLightbulb /></div>
              <div>
                <h3>Weak Topic</h3>
                <strong>{topWeakTopic ? topWeakTopic.topic : "Not enough data yet"}</strong>
                <p>Most missed topic from recent practice.</p>
              </div>
              <button className="btn btn-secondary" type="button" disabled={!topWeakTopic} onClick={() => navigate("/practice/review?tab=weak")}>
                Practice Topic
              </button>
            </article>
          </div>
        </section>

        {/* F. How XP & Gamification Works (extra explanation lives here) */}
        <section className="how-xp-section" aria-labelledby="how-xp-title">
          <div className="practice-section-heading compact">
            <h2 id="how-xp-title">How XP &amp; Gamification Works</h2>
            <p>A quick guide to how progress, rewards, and unlocks are earned.</p>
          </div>
          <div className="how-xp-grid">
            <article className="how-xp-card">
              <span className="how-xp-icon xp"><FaStar /></span>
              <h3>Earn XP</h3>
              <p>Each correct practice answer gives +10 XP.</p>
            </article>
            <article className="how-xp-card">
              <span className="how-xp-icon level"><FaLayerGroup /></span>
              <h3>Level Up Subjects</h3>
              <p>Subject XP unlocks new practice modes and harder challenges.</p>
            </article>
            <article className="how-xp-card">
              <span className="how-xp-icon streak"><FaFire /></span>
              <h3>Build Streaks</h3>
              <p>Daily learning increases your streak and can unlock streak badges.</p>
            </article>
            <article className="how-xp-card">
              <span className="how-xp-icon coin"><CoinIcon size="sm" /></span>
              <h3>Earn Coins</h3>
              <p>Coins come from daily challenges, mocks, tournaments, badges, and strong practice.</p>
            </article>
            <article className="how-xp-card">
              <span className="how-xp-icon badge"><FaMedal /></span>
              <h3>Unlock Badges</h3>
              <p>Badges unlock automatically when real requirements are completed.</p>
            </article>
            <article className="how-xp-card">
              <span className="how-xp-icon weak"><FaLightbulb /></span>
              <h3>Improve Weak Areas</h3>
              <p>Wrong answers and weak topics are tracked so you can review and improve.</p>
            </article>
          </div>
        </section>

        <p className="practice-footer-tagline">
          <FaFire /> <strong>Consistent practice makes perfect!</strong> Keep your streak alive and climb the leaderboard.
        </p>
      </section>
    </DashboardLayout>
  );
}

export default PracticePage;
