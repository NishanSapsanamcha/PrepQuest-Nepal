import { useNavigate } from "react-router-dom";
import { FaBookmark, FaExclamationTriangle, FaFire, FaGraduationCap, FaLanguage, FaLayerGroup, FaLightbulb, FaMedal, FaStar, FaTools } from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import RecommendedPracticeCard from "../../components/practice/RecommendedPracticeCard";
import SubjectCard from "../../components/practice/SubjectCard";
import PremiumBadge from "../../components/practice/PremiumBadge";
import { CoinIcon } from "../../components/common/Coin";
import { STAT_ICON_ASSETS } from "../../data/practiceIconAssets";
import {
  languageLabel as getLanguageLabel,
  t,
  translateExamName,
  formatDays,
  formatStartWith,
  formatLowestAccuracy,
  formatBuildFoundation,
} from "../../data/translations";
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
  const preferredLanguage = localStorage.getItem("preferredLanguage") || user.preferredLanguage || "english";
  const examLabel = translateExamName(examTracks[selectedExamId]?.name || "Sakha Adhikrit", preferredLanguage);
  const languageLabel = getLanguageLabel(preferredLanguage);
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
        title: formatStartWith(recommendationSubject.name, preferredLanguage),
        text:
          recommendationSubject.progress.questionsSolved > 0
            ? formatLowestAccuracy(recommendationSubject.name, preferredLanguage)
            : formatBuildFoundation(recommendationSubject.name, preferredLanguage),
        questionsAvailable: recommendationSubject.questionsAvailable,
        canPractice: recommendationSubject.canPractice,
        subjectId: recommendationSubject.id,
      }
    : {
        title: t("questionBankNotReadyTitle", preferredLanguage),
        text: t("questionsNotAvailable", preferredLanguage),
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
          <h1>{t("chooseSubject", preferredLanguage)}</h1>
          <p>{t("practicePageSubtitle", preferredLanguage)}</p>
        </div>
        <div className="header-right">
          <div className="header-chips">
            <span className="chip"><FaGraduationCap /> {t("exam", preferredLanguage)}: <strong>{examLabel}</strong></span>
            <span className="chip"><FaLanguage /> {t("language", preferredLanguage)}: <strong>{languageLabel}</strong></span>
          </div>
          <button className="outline-pill" type="button" onClick={() => navigate("/setup", { state: { allowPreferenceChange: true } })}>
            <FaTools /> {t("changePreferences", preferredLanguage)}
          </button>
        </div>
      </header>

      <section className={`dashboard-content practice-content${debugLayout ? " debug-practice-layout" : ""}`}>
        {/* B. Summary strip */}
        <section className="practice-summary-strip" aria-label="Your gamification stats" data-debug="Summary Strip">
          <div className="summary-stat">
            <PremiumBadge src={STAT_ICON_ASSETS.xp} alt="XP" className="summary-stat-icon xp" imgClassName="practice-summary-icon"><FaStar /></PremiumBadge>
            <div className="summary-stat-body">
              <span className="summary-stat-label">{t("totalXP", preferredLanguage)}</span>
              <strong className="summary-stat-value">{totalXp.toLocaleString()}</strong>
              <span className="summary-stat-helper">{t("keepLevelingUp", preferredLanguage)}</span>
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
              <span className="summary-stat-label">{t("currentStreak", preferredLanguage)}</span>
              <strong className="summary-stat-value">{formatDays(currentStreak, preferredLanguage)}</strong>
              <span className="summary-stat-helper">{currentStreak > 0 ? t("keepItAliveToday", preferredLanguage) : t("startDailyQuizPrompt", preferredLanguage)}</span>
            </div>
          </div>
          <div className="summary-stat">
            <PremiumBadge src={badgeStatIcon} alt="Badges" className="summary-stat-icon badges" imgClassName="practice-summary-icon"><FaMedal /></PremiumBadge>
            <div className="summary-stat-body">
              <span className="summary-stat-label">{t("earnedBadges", preferredLanguage)}</span>
              <strong className="summary-stat-value">{badgesEarned}</strong>
            </div>
          </div>
        </section>

        {/* C. Subjects grid (main focus) */}
        <section className="practice-section-heading">
          <h2>{t("chooseSubject", preferredLanguage)}</h2>
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
            <h2 id="review-mistakes-title">{t("reviewMistakes", preferredLanguage)}</h2>
            <p>{t("revisitSaved", preferredLanguage)}</p>
          </div>
          <div className="review-card-grid">
            <article className="review-mini-card">
              <div className="review-mini-icon"><FaBookmark /></div>
              <div>
                <h3>{t("savedQuestions", preferredLanguage)}</h3>
                <strong>{savedQuestions.length} {t("savedWord", preferredLanguage)}</strong>
                <p>{t("bookmarkedQuestions", preferredLanguage)}</p>
              </div>
              <button className="btn btn-secondary" type="button" disabled={!savedQuestions.length} onClick={() => navigate("/practice/review?tab=saved")}>
                {t("reviewSaved", preferredLanguage)}
              </button>
            </article>
            <article className="review-mini-card mistakes">
              <div className="review-mini-icon"><FaExclamationTriangle /></div>
              <div>
                <h3>{t("wrongAnswers", preferredLanguage)}</h3>
                <strong>{wrongAnswers.length ? `${wrongAnswers.length} ${t("toReviewSuffix", preferredLanguage)}` : t("noMistakesYet", preferredLanguage)}</strong>
                <p>{t("learnFromMistakes", preferredLanguage)}</p>
              </div>
              <button className="btn btn-secondary" type="button" disabled={!wrongAnswers.length} onClick={() => navigate("/practice/review?tab=wrong")}>
                {t("reviewMistakesAction", preferredLanguage)}
              </button>
            </article>
            <article className="review-mini-card">
              <div className="review-mini-icon"><FaLightbulb /></div>
              <div>
                <h3>{t("weakTopics", preferredLanguage)}</h3>
                <strong>{topWeakTopic ? topWeakTopic.topic : t("notEnoughDataYet", preferredLanguage)}</strong>
                <p>{t("mostMissedRecent", preferredLanguage)}</p>
              </div>
              <button className="btn btn-secondary" type="button" disabled={!topWeakTopic} onClick={() => navigate("/practice/review?tab=weak")}>
                {t("practiceTopic", preferredLanguage)}
              </button>
            </article>
          </div>
        </section>

        {/* F. How XP & Gamification Works (extra explanation lives here) */}
        <section className="how-xp-section" aria-labelledby="how-xp-title">
          <div className="practice-section-heading compact">
            <h2 id="how-xp-title">{t("howXpWorks", preferredLanguage)}</h2>
            <p>{t("howXpWorksDesc", preferredLanguage)}</p>
          </div>
          <div className="how-xp-grid">
            <article className="how-xp-card">
              <span className="how-xp-icon xp"><FaStar /></span>
              <h3>{t("earnXp", preferredLanguage)}</h3>
              <p>{t("earnXpDesc", preferredLanguage)}</p>
            </article>
            <article className="how-xp-card">
              <span className="how-xp-icon level"><FaLayerGroup /></span>
              <h3>{t("levelUpSubjects", preferredLanguage)}</h3>
              <p>{t("levelUpSubjectsDesc", preferredLanguage)}</p>
            </article>
            <article className="how-xp-card">
              <span className="how-xp-icon streak"><FaFire /></span>
              <h3>{t("buildStreaks", preferredLanguage)}</h3>
              <p>{t("buildStreaksDesc", preferredLanguage)}</p>
            </article>
            <article className="how-xp-card">
              <span className="how-xp-icon coin"><CoinIcon size="sm" /></span>
              <h3>{t("earnCoins", preferredLanguage)}</h3>
              <p>{t("earnCoinsDesc", preferredLanguage)}</p>
            </article>
            <article className="how-xp-card">
              <span className="how-xp-icon badge"><FaMedal /></span>
              <h3>{t("unlockBadges", preferredLanguage)}</h3>
              <p>{t("unlockBadgesDesc", preferredLanguage)}</p>
            </article>
            <article className="how-xp-card">
              <span className="how-xp-icon weak"><FaLightbulb /></span>
              <h3>{t("improveWeakAreas", preferredLanguage)}</h3>
              <p>{t("improveWeakAreasDesc", preferredLanguage)}</p>
            </article>
          </div>
        </section>

        <p className="practice-footer-tagline">
          <FaFire /> <strong>{t("consistentPracticeBold", preferredLanguage)}</strong> {t("consistentPracticeRest", preferredLanguage)}
        </p>
      </section>
    </DashboardLayout>
  );
}

export default PracticePage;
