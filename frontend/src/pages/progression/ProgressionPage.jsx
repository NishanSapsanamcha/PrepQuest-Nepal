import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaBookOpen,
  FaBookmark,
  FaBolt,
  FaBullseye,
  FaChartBar,
  FaChartLine,
  FaCheck,
  FaCheckCircle,
  FaClipboardList,
  FaExclamationTriangle,
  FaGraduationCap,
  FaLanguage,
  FaLayerGroup,
  FaLightbulb,
  FaLock,
  FaRegClock,
  FaRoute,
  FaShieldAlt,
  FaStar,
  FaUnlock,
  FaWaveSquare,
} from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PathImage from "../../assets/level/path.png";
import { examTracks } from "../../data/examTracks";
import { subjectLevels } from "../../data/subjectLevels";
import { formatLevel, languageLabel as getLanguageLabel, t, translateSubjectName, trText, formatAccuracyFromSolved, formatQuestionsSolved } from "../../data/translations";
import {
  buildSubjectCardData,
  getExamSubjects,
  getNormalizedSubjectProgress,
  normalizeExamId,
} from "../../utils/practiceUtils";
import {
  getSavedReviewQuestions,
  getWeakTopicsFromWrongAnswers,
  getWrongAnswerReview,
} from "../../utils/storageUtils";
import {
  calculateTotalXPFromTransactions,
  getNextLevelProgress,
  getXPTransactions,
} from "../../utils/xpUtils";
import "./ProgressionPage.css";

// Circumference of the accuracy donut (r = 52 in a 120 viewBox).
const ACCURACY_CIRCUMFERENCE = 2 * Math.PI * 52;

const subjectFilters = [
  { key: "all", label: "All" },
  { key: "practiced", label: "Practiced" },
  { key: "needs-practice", label: "Needs Practice" },
  { key: "strong", label: "Strong" },
  { key: "not-started", label: "Not Started" },
];

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function calculateAccuracy(correct, attempted) {
  const safeCorrect = safeNumber(correct);
  const safeAttempted = safeNumber(attempted);
  if (!safeAttempted) return null;
  return Math.round((safeCorrect / safeAttempted) * 100);
}

function formatPercent(value) {
  return Number.isFinite(value) ? `${value}%` : "Not Started Yet";
}

function formatDate(value) {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function readStorageValue(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function getPreferenceLabels() {
  const savedExam = readStorageValue("selectedExam");
  const savedLanguage = readStorageValue("preferredLanguage");
  const selectedExamId = savedExam ? normalizeExamId(savedExam) : "sakha-adhikrit";
  const languageValue = String(savedLanguage || "").toLowerCase();

  return {
    selectedExamId,
    examLabel: savedExam ? examTracks[selectedExamId]?.name || savedExam : "Not Selected",
    languageLabel: savedLanguage ? getLanguageLabel(languageValue) : "Not Selected",
    preferredLanguage: languageValue || "english",
  };
}

function getStatusForSubject(subject) {
  if (!subject.solved) return "Starting";
  if (subject.accuracy < 50) return "Needs Practice";
  if (subject.accuracy < 75) return "Developing";
  if (subject.accuracy < 90) return "Strong";
  return "Exam Ready";
}

function getSnapshotMessage(totalAttempted, accuracy) {
  if (!totalAttempted) return "Start your first practice session to unlock progression insights.";
  if (accuracy < 50) return "Your accuracy needs improvement. Focus on reviewing wrong answers first.";
  if (accuracy <= 75) return "You are building momentum. Keep practicing weak subjects.";
  return "Strong progress. Continue maintaining accuracy across all subjects.";
}

function getMostMissedTopic(wrongAnswers) {
  const activeWrongAnswers = wrongAnswers.filter((item) => !item?.mastered);
  if (!activeWrongAnswers.length) return null;

  const counts = activeWrongAnswers.reduce((topics, item) => {
    const topic = item?.topic || "Core concepts";
    topics[topic] = (topics[topic] || 0) + 1;
    return topics;
  }, {});

  const [topic, count] = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  return { topic, count };
}

function groupXpTransactions(transactions) {
  const groups = transactions.reduce((collection, transaction) => {
    const dateKey = formatDate(transaction.createdAt);
    const subjectName = transaction.subjectName || transaction.subjectId || "Practice";
    const reason = transaction.type === "practice_correct_answer" ? "correct practice answer" : transaction.type || "XP activity";
    const key = `${dateKey}::${subjectName}::${reason}`;
    const existing = collection[key] || {
      id: key,
      date: dateKey,
      subjectName,
      reason,
      amount: 0,
      count: 0,
      latestAt: transaction.createdAt,
    };

    collection[key] = {
      ...existing,
      amount: existing.amount + safeNumber(transaction.amount),
      count: existing.count + 1,
      latestAt: new Date(transaction.createdAt) > new Date(existing.latestAt) ? transaction.createdAt : existing.latestAt,
    };
    return collection;
  }, {});

  return Object.values(groups).sort((a, b) => new Date(b.latestAt) - new Date(a.latestAt));
}

function buildNextBestAction({ activeWrongAnswers, weakestSubject, notStartedSubject, closestSubject, totalAttempted }) {
  if (activeWrongAnswers.length) {
    return {
      title: "Review wrong answers",
      reason: `${activeWrongAnswers.length} active ${activeWrongAnswers.length === 1 ? "mistake needs" : "mistakes need"} your review to strengthen your understanding.`,
      actionLabel: "Open Review Center",
      path: "/practice/review?tab=wrong",
      icon: FaBullseye,
    };
  }

  if (weakestSubject) {
    return {
      title: `Practice ${weakestSubject.name}`,
      reason: `Lowest accuracy subject at ${weakestSubject.accuracy}%.`,
      actionLabel: "Practice Weak Subject",
      path: weakestSubject.canPractice ? `/practice/${weakestSubject.id}/session?recommended=1` : "/practice",
      icon: FaBullseye,
    };
  }

  if (notStartedSubject) {
    return {
      title: `Start ${notStartedSubject.name}`,
      reason: "This subject has no recorded practice attempts yet.",
      actionLabel: "Start Subject",
      path: notStartedSubject.canPractice ? `/practice/${notStartedSubject.id}/session` : "/practice",
      icon: FaBookOpen,
    };
  }

  if (closestSubject && totalAttempted) {
    return {
      title: `Continue ${closestSubject.name}`,
      reason: `${closestSubject.levelProgress.remainingXp} XP left for Level ${closestSubject.levelProgress.nextLevel.level}.`,
      actionLabel: "Continue Practice",
      path: closestSubject.canPractice ? `/practice/${closestSubject.id}/session` : "/practice",
      icon: FaRoute,
    };
  }

  return {
    title: "Start Quick Practice",
    reason: "Complete your first practice session to see progression.",
    actionLabel: "Start First Practice",
    path: "/practice",
    icon: FaBookOpen,
  };
}

function buildNextGoals({ subjectRows, activeWrongAnswers, savedQuestions, mostMissedTopic }) {
  const goals = [];
  const practicedSubjects = subjectRows.filter((subject) => subject.solved > 0);
  const closeToNextLevel = practicedSubjects
    .filter((subject) => subject.levelProgress.nextLevel && subject.levelProgress.remainingXp > 0)
    .sort((a, b) => a.levelProgress.remainingXp - b.levelProgress.remainingXp)[0];
  const lowAccuracy = practicedSubjects
    .filter((subject) => Number.isFinite(subject.accuracy) && subject.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy)[0];
  const notStarted = subjectRows.find((subject) => subject.solved === 0);

  if (activeWrongAnswers.length && mostMissedTopic) {
    goals.push(`Review ${mostMissedTopic.count} wrong ${mostMissedTopic.count === 1 ? "answer" : "answers"} from ${mostMissedTopic.topic}.`);
  }

  if (closeToNextLevel) {
    goals.push(`Earn ${closeToNextLevel.levelProgress.remainingXp} more XP in ${closeToNextLevel.name} to reach Level ${closeToNextLevel.levelProgress.nextLevel.level}.`);
  }

  if (lowAccuracy) {
    goals.push(`Improve ${lowAccuracy.name} accuracy from ${lowAccuracy.accuracy}% to 60%.`);
  }

  if (notStarted) {
    goals.push(`Start ${notStarted.name} practice.`);
  }

  if (savedQuestions.length && goals.length < 3) {
    goals.push(`Review ${savedQuestions.length} saved ${savedQuestions.length === 1 ? "question" : "questions"}.`);
  }

  if (!goals.length) {
    return [
      "Start your first practice session.",
      "Answer 10 questions in any subject.",
      "Save or review difficult questions after practice.",
    ];
  }

  return goals.slice(0, 3);
}

function ProgressionPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const { selectedExamId, examLabel, languageLabel, preferredLanguage } = getPreferenceLabels();
  const subjectProgress = getNormalizedSubjectProgress();
  const savedQuestions = getSavedReviewQuestions();
  const wrongAnswers = getWrongAnswerReview();
  const activeWrongAnswers = wrongAnswers.filter((item) => !item?.mastered);
  const masteredMistakes = wrongAnswers.filter((item) => item?.mastered);
  const xpTransactions = getXPTransactions();
  const groupedXpTransactions = groupXpTransactions(xpTransactions);
  const totalXp = calculateTotalXPFromTransactions();

  const subjectRows = useMemo(() => {
    return getExamSubjects(selectedExamId).map((subject) => {
      const cardData = buildSubjectCardData(subject, subjectProgress, selectedExamId);
      const solved = safeNumber(cardData.progress.questionsSolved);
      const correct = safeNumber(cardData.progress.correctAnswers);
      const wrong = safeNumber(cardData.progress.wrongAnswers);
      const subjectXp = safeNumber(cardData.progress.xp);
      const accuracy = calculateAccuracy(correct, solved || correct + wrong);
      const levelProgress = getNextLevelProgress(subjectXp);

      return {
        id: subject.id,
        name: subject.name,
        solved,
        correct,
        wrong,
        xp: subjectXp,
        accuracy,
        status: getStatusForSubject({ solved, accuracy }),
        level: levelProgress.currentLevel,
        levelProgress,
        canPractice: cardData.canPractice,
      };
    });
  }, [selectedExamId, subjectProgress]);

  const totalCorrect = subjectRows.reduce((sum, subject) => sum + subject.correct, 0);
  const totalWrong = subjectRows.reduce((sum, subject) => sum + subject.wrong, 0);
  const totalAttempted = totalCorrect + totalWrong;
  const overallAccuracy = calculateAccuracy(totalCorrect, totalAttempted);
  const subjectsPracticed = subjectRows.filter((subject) => subject.solved > 0).length;
  const highestLevel = subjectRows.reduce(
    (best, subject) => (subject.level.level > best.level ? subject.level : best),
    subjectLevels[0]
  );
  const practicedSubjects = subjectRows.filter((subject) => subject.solved > 0);
  const strongestSubject = practicedSubjects.length
    ? [...practicedSubjects].sort((a, b) => b.accuracy - a.accuracy || b.solved - a.solved)[0]
    : null;
  const weakestSubject = practicedSubjects.length
    ? [...practicedSubjects].sort((a, b) => a.accuracy - b.accuracy || b.solved - a.solved)[0]
    : null;
  const weakSubject = weakestSubject && weakestSubject.accuracy < 75 ? weakestSubject : null;
  const mostPracticedSubject = practicedSubjects.length
    ? [...practicedSubjects].sort((a, b) => b.solved - a.solved || b.xp - a.xp)[0]
    : null;
  const leastPracticedSubject =
    subjectRows.find((subject) => subject.solved === 0) ||
    (practicedSubjects.length ? [...practicedSubjects].sort((a, b) => a.solved - b.solved || a.xp - b.xp)[0] : null);
  const closestToNextLevel = practicedSubjects
    .filter((subject) => subject.levelProgress.nextLevel && subject.levelProgress.remainingXp > 0)
    .sort((a, b) => a.levelProgress.remainingXp - b.levelProgress.remainingXp)[0];
  const mostMissedTopic = getMostMissedTopic(wrongAnswers);
  const weakTopics = getWeakTopicsFromWrongAnswers();
  const topWeakTopic = weakTopics[0];
  const goals = buildNextGoals({ subjectRows, activeWrongAnswers, savedQuestions, mostMissedTopic });
  const nextBestAction = buildNextBestAction({
    activeWrongAnswers,
    weakestSubject: weakSubject,
    notStartedSubject: leastPracticedSubject?.solved === 0 ? leastPracticedSubject : null,
    closestSubject: closestToNextLevel,
    totalAttempted,
  });
  const NextActionIcon = nextBestAction.icon;
  const filteredSubjects = subjectRows.filter((subject) => {
    if (activeFilter === "practiced") return subject.solved > 0;
    if (activeFilter === "needs-practice") return subject.status === "Needs Practice";
    if (activeFilter === "strong") return subject.status === "Strong" || subject.status === "Exam Ready";
    if (activeFilter === "not-started") return subject.solved === 0;
    return true;
  });
  const latestXpSource = groupedXpTransactions[0];
  const filterCounts = {
    all: subjectRows.length,
    practiced: subjectRows.filter((subject) => subject.solved > 0).length,
    "needs-practice": subjectRows.filter((subject) => subject.status === "Needs Practice").length,
    strong: subjectRows.filter((subject) => subject.status === "Strong" || subject.status === "Exam Ready").length,
    "not-started": subjectRows.filter((subject) => subject.solved === 0).length,
  };
  const practiceSubject = (subject) => {
    if (!subject?.id) {
      navigate("/practice");
      return;
    }

    navigate(subject.canPractice ? `/practice/${subject.id}` : "/practice", {
      state: { selectedSubjectId: subject.id },
    });
  };
  const insightCards = [
    {
      key: "strongest",
      className: "strongest",
      icon: FaStar,
      label: t("strongestSubject", preferredLanguage),
      subject: strongestSubject,
      emptyTitle: t("noSubjectAnalysis", preferredLanguage),
      metric: strongestSubject
        ? formatAccuracyFromSolved(strongestSubject.accuracy, strongestSubject.solved, preferredLanguage)
        : t("completeToReveal", preferredLanguage),
    },
    {
      key: "attention",
      className: "attention",
      icon: FaExclamationTriangle,
      label: t("needsMostAttention", preferredLanguage),
      subject: weakestSubject,
      emptyTitle: t("noWeakSubject", preferredLanguage),
      metric: weakestSubject
        ? formatAccuracyFromSolved(weakestSubject.accuracy, weakestSubject.solved, preferredLanguage)
        : t("wrongLowAccuracyAppear", preferredLanguage),
    },
    {
      key: "most-practiced",
      className: "practiced",
      icon: FaClipboardList,
      label: t("mostPracticed", preferredLanguage),
      subject: mostPracticedSubject,
      emptyTitle: t("notStartedYet", preferredLanguage),
      metric: mostPracticedSubject
        ? formatQuestionsSolved(mostPracticedSubject.solved, preferredLanguage)
        : t("noSolvedRecorded", preferredLanguage),
    },
    {
      key: "least-practiced",
      className: "least-practiced",
      icon: FaRoute,
      label: t("leastPracticed", preferredLanguage),
      subject: leastPracticedSubject,
      emptyTitle: t("notStartedYet", preferredLanguage),
      metric: leastPracticedSubject?.solved ? `${leastPracticedSubject.solved} ${t("questionsSolved", preferredLanguage)}` : t("notStartedYet", preferredLanguage),
    },
  ];

  return (
    <DashboardLayout activeKey="progression">
      <header className="dashboard-header progression-header">
        <div className="header-left">
          <p className="eyebrow">{t("learningAnalytics", preferredLanguage)}</p>
          <h1>{t("progression", preferredLanguage)}</h1>
          <p>{t("progressionSubtitle", preferredLanguage)}</p>
        </div>
        <div className="header-right">
          <div className="header-chips">
            <span className="chip"><FaGraduationCap /> {t("exam", preferredLanguage)}: <strong>{examLabel}</strong></span>
            <span className="chip"><FaLanguage /> {t("language", preferredLanguage)}: <strong>{languageLabel}</strong></span>
          </div>
          <button className="outline-pill" type="button" onClick={() => navigate("/practice")}>
            <FaBookOpen /> {t("goToPractice", preferredLanguage)}
          </button>
        </div>
      </header>

      <section className="dashboard-content progression-content">
        <section className="analytics-hero-grid">
          <article className="progression-panel learning-snapshot-card">
            <div className="progression-section-heading snapshot-heading">
              <div className="snapshot-heading-left">
                <span className="snapshot-heading-icon"><FaChartBar /></span>
                <div>
                  <p className="eyebrow">{t("learningSnapshot", preferredLanguage)}</p>
                  <h2>{t("overallProgress", preferredLanguage)}</h2>
                </div>
              </div>
              <span className="snapshot-pulse"><FaChartLine /> {t("realData", preferredLanguage)}</span>
            </div>
            <div className="snapshot-primary">
              <div className="snapshot-xp">
                <span>{t("totalXP", preferredLanguage)}</span>
                <strong>{totalXp.toLocaleString()} XP</strong>
                <p>{getSnapshotMessage(totalAttempted, overallAccuracy)}</p>
              </div>
              <img className="path-illustration" src={PathImage} alt="" aria-hidden="true" />
              <div className="accuracy-ring">
                <svg className="accuracy-ring-svg" viewBox="0 0 120 120" aria-hidden="true">
                  <circle className="accuracy-track" cx="60" cy="60" r="52" />
                  <circle
                    className="accuracy-arc"
                    cx="60"
                    cy="60"
                    r="52"
                    style={{ strokeDasharray: ACCURACY_CIRCUMFERENCE, strokeDashoffset: ACCURACY_CIRCUMFERENCE * (1 - (overallAccuracy || 0) / 100) }}
                  />
                </svg>
                <div className="accuracy-ring-center">
                  <strong>{overallAccuracy ?? 0}%</strong>
                  <span>{t("accuracy", preferredLanguage)}</span>
                </div>
              </div>
            </div>
            <div className="snapshot-metrics">
              <div><FaClipboardList /><span>{t("attempted", preferredLanguage)}</span><strong>{totalAttempted.toLocaleString()}</strong></div>
              <div><FaCheckCircle /><span>{t("correct", preferredLanguage)}</span><strong>{totalCorrect.toLocaleString()}</strong></div>
              <div><FaExclamationTriangle /><span>{t("wrong", preferredLanguage)}</span><strong>{totalWrong.toLocaleString()}</strong></div>
              <div><FaLayerGroup /><span>{t("subjects", preferredLanguage)}</span><strong>{subjectsPracticed} / {subjectRows.length}</strong></div>
              <div><FaStar /><span>{t("bestMastery", preferredLanguage)}</span><strong>{strongestSubject ? translateSubjectName(strongestSubject.name, preferredLanguage) : t("notStartedYet", preferredLanguage)}</strong></div>
            </div>
          </article>

          <article className="progression-panel next-action-card">
            <div className="next-action-top">
              <div className="next-action-icon"><NextActionIcon /></div>
              <p className="eyebrow">{t("nextBestAction", preferredLanguage)}</p>
              <h2>{trText(nextBestAction.title, preferredLanguage)}</h2>
              <p className="next-action-reason">{nextBestAction.reason}</p>
            </div>
            <div className="next-action-bottom">
              <div className="next-action-divider" />
              <button className="btn review-action-btn" type="button" onClick={() => navigate(nextBestAction.path)}>
                <FaArrowRight /> {trText(nextBestAction.actionLabel, preferredLanguage)}
              </button>
              <p className="next-action-footer"><FaShieldAlt /> {t("consistencyBuildsMastery", preferredLanguage)}</p>
            </div>
          </article>
        </section>

        <section className="analytics-section subject-mastery-section">
          <div className="analytics-section-header matrix-heading">
            <div>
              <p className="eyebrow">{t("subjectMastery", preferredLanguage)}</p>
              <h2>{t("masteryBySubject", preferredLanguage)}</h2>
              <p>{t("compareSubjectXp", preferredLanguage)}</p>
            </div>
            <div className="filter-toolbar" aria-label="Subject filters">
              <div className="filter-toolbar-copy">
                <strong>{t("filterSubjects", preferredLanguage)}</strong>
                <span>{t("viewByPracticeStatus", preferredLanguage)}</span>
              </div>
              <div className="filter-pills">
                {subjectFilters.map((filter) => {
                  const isActive = activeFilter === filter.key;
                  return (
                    <button
                      key={filter.key}
                      className={isActive ? "active" : ""}
                      type="button"
                      onClick={() => setActiveFilter(filter.key)}
                    >
                      {isActive && <FaCheck />}
                      {filter.key === "all" ? t("all", preferredLanguage) : trText(filter.label, preferredLanguage)} <span>{filterCounts[filter.key]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="section-inner-panel subject-table-panel">
          {filteredSubjects.length ? (
            <div className="subject-comparison-table" role="table" aria-label="Subject progression comparison">
              <div className="subject-row subject-row-head" role="row">
                <span>{t("subject", preferredLanguage)}</span><span>{t("level", preferredLanguage)}</span><span>XP</span><span>{t("accuracy", preferredLanguage)}</span><span>{t("solved", preferredLanguage)}</span><span>{t("status", preferredLanguage)}</span><span>{t("nextLevel", preferredLanguage)}</span><span>{t("action", preferredLanguage)}</span>
              </div>
              {filteredSubjects.map((subject) => (
                <div className={`subject-row ${subject.status === "Needs Practice" ? "weak-row" : ""} ${subject.solved === 0 ? "muted-row" : ""}`} role="row" key={subject.id}>
                  <span className="subject-name-cell" data-label={t("subject", preferredLanguage)}>{translateSubjectName(subject.name, preferredLanguage)}</span>
                  <span data-label={t("level", preferredLanguage)}>{formatLevel(subject.level.level, subject.level.name, preferredLanguage)}</span>
                  <span data-label="XP">
                    <strong>{subject.xp} / {subject.levelProgress.nextLevelXp} XP</strong>
                    <span className="mini-progress" aria-label={`${subject.levelProgress.percent}% to next level`}>
                      <span style={{ width: `${subject.levelProgress.percent}%` }} />
                    </span>
                  </span>
                  <span data-label={t("accuracy", preferredLanguage)}>{formatPercent(subject.accuracy)}</span>
                  <span data-label={t("solved", preferredLanguage)}>{subject.solved}</span>
                  <span data-label={t("status", preferredLanguage)}><span className={`status-pill status-${subject.status.toLowerCase().replace(/\s+/g, "-")}`}>{trText(subject.status, preferredLanguage)}</span></span>
                  <span data-label={t("nextLevel", preferredLanguage)}>
                    <small>{subject.levelProgress.nextLevel ? `${subject.levelProgress.remainingXp} XP left for ${t("level", preferredLanguage)} ${subject.levelProgress.nextLevel.level}` : t("maxLevelReached", preferredLanguage)}</small>
                  </span>
                  <span data-label="Action">
                    <button className="practice-now-btn table-action" type="button" onClick={() => practiceSubject(subject)}>
                      {t("practiceNow", preferredLanguage)}
                    </button>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="progression-empty-state compact">
              <FaLayerGroup />
              <strong>{t("noSubjectsMatchFilter", preferredLanguage)}</strong>
              <p>{t("completeToCompareMastery", preferredLanguage)}</p>
            </div>
          )}
          </div>
        </section>

        <section className="analytics-section insight-summary-section">
          <div className="analytics-section-header">
            <div>
              <p className="eyebrow">{t("insightSummary", preferredLanguage)}</p>
              <h2>{t("whatProgressShows", preferredLanguage)}</h2>
              <p>{t("insightsRealHistory", preferredLanguage)}</p>
            </div>
          </div>
          <div className="insight-grid">
          {insightCards.map((card) => {
            const InsightIcon = card.icon;
            return (
              <article className={`insight-card ${card.className}`} key={card.key}>
                <div className="insight-card-top">
                  <span className="insight-icon"><InsightIcon /></span>
                  <p>{card.label}</p>
                </div>
                <strong>{card.subject ? translateSubjectName(card.subject.name, preferredLanguage) : card.emptyTitle}</strong>
                <span>{card.metric}</span>
                <button
                  className="practice-now-btn insight-action"
                  type="button"
                  disabled={!card.subject}
                  onClick={() => practiceSubject(card.subject)}
                >
                  {t("practiceNow", preferredLanguage)}
                </button>
              </article>
            );
          })}
          </div>
        </section>

        <section className="analytics-section growth-tracking-section">
          <div className="analytics-section-header">
            <div>
              <p className="eyebrow">{t("growthTracking", preferredLanguage)}</p>
              <h2>{t("xpGrowthRoadmap", preferredLanguage)}</h2>
              <p>{t("xpGrowthRoadmapDesc", preferredLanguage)}</p>
            </div>
          </div>
          <div className="progression-split-grid growth-grid">
          <article className="section-inner-panel xp-activity-panel">
            <div className="progression-section-heading">
              <div>
                <p className="eyebrow">{t("xpActivity", preferredLanguage)}</p>
                <h2>{t("recentGrowth", preferredLanguage)}</h2>
              </div>
              <span className="summary-chip"><FaBolt /> {totalXp.toLocaleString()} XP</span>
            </div>
            {groupedXpTransactions.length ? (
              <>
                <div className="latest-source">
                  <span>{t("latestXpSource", preferredLanguage)}</span>
                  <strong>{latestXpSource.subjectName}</strong>
                  <p>{latestXpSource.count} {latestXpSource.reason}{latestXpSource.count === 1 ? "" : "s"} · {latestXpSource.date}</p>
                </div>
                <div className="activity-list">
                  {groupedXpTransactions.slice(0, 5).map((transaction) => (
                    <div className="activity-item" key={transaction.id}>
                      <span className="activity-xp">+{transaction.amount} XP</span>
                      <div>
                        <strong>{transaction.subjectName}</strong>
                        <p>{transaction.count} {transaction.reason}{transaction.count === 1 ? "" : "s"} · {transaction.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="progression-empty-state">
                <FaRegClock />
                <strong>{t("noXpActivityYet", preferredLanguage)}</strong>
                <p>{t("noXpActivityDesc", preferredLanguage)}</p>
              </div>
            )}
          </article>

          <article className="section-inner-panel roadmap-panel">
            <div className="progression-section-heading">
              <div>
                <p className="eyebrow">{t("learningRoadmap", preferredLanguage)}</p>
                <h2>{t("subjectLevelUnlocks", preferredLanguage)}</h2>
                <p>{t("currentHighestSubjectLevel", preferredLanguage)}: {formatLevel(highestLevel.level, highestLevel.name, preferredLanguage)}</p>
              </div>
            </div>
            <div className="roadmap-list">
              {subjectLevels.map((level) => {
                const reachedBySubject = subjectRows.some((subject) => subject.level.level >= level.level && subject.xp >= level.requiredXp);
                const isCurrent = level.level === highestLevel.level;
                return (
                  <div className={`roadmap-item ${reachedBySubject ? "unlocked" : "locked"} ${isCurrent ? "current" : ""}`} key={level.level}>
                    <span className="roadmap-marker">{reachedBySubject ? <FaUnlock /> : <FaLock />}</span>
                    <div>
                      <strong>{formatLevel(level.level, level.name, preferredLanguage)}</strong>
                      <p>{level.requiredXp} XP · {level.unlock}</p>
                      <small>{isCurrent ? t("currentHighestSubjectLevel", preferredLanguage) : reachedBySubject ? t("unlocked", preferredLanguage) : t("locked", preferredLanguage)}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
          </div>
        </section>

        <section className="analytics-section review-goals-section">
          <div className="analytics-section-header">
            <div>
              <p className="eyebrow">{t("reviewNextSteps", preferredLanguage)}</p>
              <h2>{t("mistakeReviewGoals", preferredLanguage)}</h2>
              <p>{t("useReviewData", preferredLanguage)}</p>
            </div>
          </div>
          <div className="progression-split-grid review-grid">
          <article className="section-inner-panel review-panel">
            <div className="progression-section-heading">
              <div>
                <p className="eyebrow">{t("reviewProgress", preferredLanguage)}</p>
                <h2>{t("savedAndMistakes", preferredLanguage)}</h2>
              </div>
              <button className="btn btn-secondary" type="button" onClick={() => navigate("/practice/review")}>
                {t("openReviewCenter", preferredLanguage)}
              </button>
            </div>
            <div className="review-progress-grid">
              <div><FaBookmark /><span>{t("savedQuestions", preferredLanguage)}</span><strong>{savedQuestions.length}</strong></div>
              <div><FaExclamationTriangle /><span>{t("wrongAnswers", preferredLanguage)}</span><strong>{activeWrongAnswers.length}</strong></div>
              <div><FaCheckCircle /><span>{t("masteredMistakes", preferredLanguage)}</span><strong>{masteredMistakes.length}</strong></div>
              <div><FaLightbulb /><span>{t("mostMissedTopic", preferredLanguage)}</span><strong>{topWeakTopic?.topic || mostMissedTopic?.topic || t("noReviewData", preferredLanguage)}</strong></div>
            </div>
            {!savedQuestions.length && !activeWrongAnswers.length && (
              <p className="section-empty-note">{t("noSavedOrWrong", preferredLanguage)}</p>
            )}
          </article>

          <article className="section-inner-panel goals-panel">
            <div className="progression-section-heading">
              <div>
                <p className="eyebrow">{t("nextSteps", preferredLanguage)}</p>
                <h2>{t("next3Goals", preferredLanguage)}</h2>
              </div>
            </div>
            <ol className="goal-list">
              {goals.map((goal) => <li key={goal}>{goal}</li>)}
            </ol>
          </article>
          </div>
        </section>

        <section className="future-analytics-card">
          <FaWaveSquare />
          <div>
            <strong>{t("futureAnalytics", preferredLanguage)}</strong>
            <p>{t("futureAnalyticsDesc", preferredLanguage)}</p>
          </div>
        </section>
      </section>
    </DashboardLayout>
  );
}

export default ProgressionPage;
