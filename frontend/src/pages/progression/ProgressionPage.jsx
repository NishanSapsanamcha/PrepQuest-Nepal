import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaBookOpen,
  FaBookmark,
  FaBolt,
  FaBullseye,
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
  FaStar,
  FaUnlock,
  FaWaveSquare,
} from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PathImage from "../../assets/level/path.png";
import { examTracks } from "../../data/examTracks";
import { subjectLevels } from "../../data/subjectLevels";
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

const languageLabels = {
  nepali: "Nepali",
  english: "English",
  both: "Both",
};

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
    languageLabel: savedLanguage ? languageLabels[languageValue] || savedLanguage : "Not Selected",
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
      reason: `${activeWrongAnswers.length} active ${activeWrongAnswers.length === 1 ? "mistake needs" : "mistakes need"} review.`,
      actionLabel: "Open Review Center",
      path: "/practice/review?tab=wrong",
      icon: FaExclamationTriangle,
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
  const { selectedExamId, examLabel, languageLabel } = getPreferenceLabels();
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
      label: "Strongest Subject",
      subject: strongestSubject,
      emptyTitle: "No subject analysis yet",
      metric: strongestSubject
        ? `${strongestSubject.accuracy}% accuracy from ${strongestSubject.solved} solved`
        : "Complete a practice session to reveal this.",
    },
    {
      key: "attention",
      className: "attention",
      icon: FaExclamationTriangle,
      label: "Needs Most Attention",
      subject: weakestSubject,
      emptyTitle: "No weak subject detected yet",
      metric: weakestSubject
        ? `${weakestSubject.accuracy}% accuracy from ${weakestSubject.solved} solved`
        : "Wrong answers and low accuracy will appear here.",
    },
    {
      key: "most-practiced",
      className: "practiced",
      icon: FaClipboardList,
      label: "Most Practiced",
      subject: mostPracticedSubject,
      emptyTitle: "Not Started Yet",
      metric: mostPracticedSubject
        ? `${mostPracticedSubject.solved} questions solved`
        : "No solved questions recorded yet.",
    },
    {
      key: "least-practiced",
      className: "least-practiced",
      icon: FaRoute,
      label: "Least Practiced",
      subject: leastPracticedSubject,
      emptyTitle: "Not Started Yet",
      metric: leastPracticedSubject?.solved ? `${leastPracticedSubject.solved} questions solved` : "Not Started Yet",
    },
  ];

  return (
    <DashboardLayout activeKey="progression">
      <header className="dashboard-header progression-header">
        <div className="header-left">
          <p className="eyebrow">Learning Analytics</p>
          <h1>Progression</h1>
          <p>Track real learning growth, subject mastery, XP activity, and review progress.</p>
        </div>
        <div className="header-right">
          <div className="header-chips">
            <span className="chip"><FaGraduationCap /> Exam: <strong>{examLabel}</strong></span>
            <span className="chip"><FaLanguage /> Language: <strong>{languageLabel}</strong></span>
          </div>
          <button className="outline-pill" type="button" onClick={() => navigate("/practice")}>
            <FaBookOpen /> Go to Practice
          </button>
        </div>
      </header>

      <section className="dashboard-content progression-content">
        <section className="analytics-hero-grid">
          <article className="progression-panel learning-snapshot-card">
            <div className="progression-section-heading">
              <div>
                <p className="eyebrow">Learning Snapshot</p>
                <h2>Overall Progress</h2>
              </div>
              <span className="snapshot-pulse"><FaChartLine /> Real Data</span>
            </div>
            <div className="snapshot-primary">
              <div className="snapshot-xp">
                <span>Total XP</span>
                <strong>{totalXp.toLocaleString()} XP</strong>
                <p>{getSnapshotMessage(totalAttempted, overallAccuracy)}</p>
              </div>
              <img className="path-illustration" src={PathImage} alt="" aria-hidden="true" />
              <div className="accuracy-ring" style={{ "--accuracy": `${overallAccuracy || 0}%` }}>
                <strong>{formatPercent(overallAccuracy)}</strong>
                <span>Accuracy</span>
              </div>
            </div>
            <div className="snapshot-metrics">
              <div><FaClipboardList /><span>Attempted</span><strong>{totalAttempted.toLocaleString()}</strong></div>
              <div><FaCheckCircle /><span>Correct</span><strong>{totalCorrect.toLocaleString()}</strong></div>
              <div><FaExclamationTriangle /><span>Wrong</span><strong>{totalWrong.toLocaleString()}</strong></div>
              <div><FaLayerGroup /><span>Subjects</span><strong>{subjectsPracticed} / {subjectRows.length}</strong></div>
              <div><FaStar /><span>Best Mastery</span><strong>{strongestSubject ? strongestSubject.name : "Not Started Yet"}</strong></div>
            </div>
          </article>

          <article className="progression-panel next-action-card">
            <div className="next-action-icon"><NextActionIcon /></div>
            <p className="eyebrow">Next Best Action</p>
            <h2>{nextBestAction.title}</h2>
            <p>{nextBestAction.reason}</p>
            <button className="btn" type="button" onClick={() => navigate(nextBestAction.path)}>
              {nextBestAction.actionLabel} <FaArrowRight />
            </button>
          </article>
        </section>

        <section className="analytics-section subject-mastery-section">
          <div className="analytics-section-header matrix-heading">
            <div>
              <p className="eyebrow">Subject Mastery</p>
              <h2>Mastery by Subject</h2>
              <p>Compare real subject XP, accuracy, solved questions, and level progress.</p>
            </div>
            <div className="filter-toolbar" aria-label="Subject filters">
              <div className="filter-toolbar-copy">
                <strong>Filter Subjects</strong>
                <span>View subjects by practice status.</span>
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
                      {filter.label} <span>{filterCounts[filter.key]}</span>
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
                <span>Subject</span><span>Level</span><span>XP</span><span>Accuracy</span><span>Solved</span><span>Status</span><span>Next Level</span><span>Action</span>
              </div>
              {filteredSubjects.map((subject) => (
                <div className={`subject-row ${subject.status === "Needs Practice" ? "weak-row" : ""} ${subject.solved === 0 ? "muted-row" : ""}`} role="row" key={subject.id}>
                  <span className="subject-name-cell" data-label="Subject">{subject.name}</span>
                  <span data-label="Level">Level {subject.level.level}: {subject.level.name}</span>
                  <span data-label="XP">
                    <strong>{subject.xp} / {subject.levelProgress.nextLevelXp} XP</strong>
                    <span className="mini-progress" aria-label={`${subject.levelProgress.percent}% to next level`}>
                      <span style={{ width: `${subject.levelProgress.percent}%` }} />
                    </span>
                  </span>
                  <span data-label="Accuracy">{formatPercent(subject.accuracy)}</span>
                  <span data-label="Solved">{subject.solved}</span>
                  <span data-label="Status"><span className={`status-pill status-${subject.status.toLowerCase().replace(/\s+/g, "-")}`}>{subject.status}</span></span>
                  <span data-label="Next Level">
                    <small>{subject.levelProgress.nextLevel ? `${subject.levelProgress.remainingXp} XP left for Level ${subject.levelProgress.nextLevel.level}` : "Max level reached"}</small>
                  </span>
                  <span data-label="Action">
                    <button className="practice-now-btn table-action" type="button" onClick={() => practiceSubject(subject)}>
                      Practice Now
                    </button>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="progression-empty-state compact">
              <FaLayerGroup />
              <strong>No subjects match this filter</strong>
              <p>Complete a practice session to compare subject mastery.</p>
            </div>
          )}
          </div>
        </section>

        <section className="analytics-section insight-summary-section">
          <div className="analytics-section-header">
            <div>
              <p className="eyebrow">Insight Summary</p>
              <h2>What Your Progress Shows</h2>
              <p>These insights are calculated from your real practice history.</p>
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
                <strong>{card.subject ? card.subject.name : card.emptyTitle}</strong>
                <span>{card.metric}</span>
                <button
                  className="practice-now-btn insight-action"
                  type="button"
                  disabled={!card.subject}
                  onClick={() => practiceSubject(card.subject)}
                >
                  Practice Now
                </button>
              </article>
            );
          })}
          </div>
        </section>

        <section className="analytics-section growth-tracking-section">
          <div className="analytics-section-header">
            <div>
              <p className="eyebrow">Growth Tracking</p>
              <h2>XP Growth &amp; Learning Roadmap</h2>
              <p>See where your XP came from and what subject levels unlock next.</p>
            </div>
          </div>
          <div className="progression-split-grid growth-grid">
          <article className="section-inner-panel xp-activity-panel">
            <div className="progression-section-heading">
              <div>
                <p className="eyebrow">XP Activity</p>
                <h2>Recent Growth</h2>
              </div>
              <span className="summary-chip"><FaBolt /> {totalXp.toLocaleString()} XP</span>
            </div>
            {groupedXpTransactions.length ? (
              <>
                <div className="latest-source">
                  <span>Latest XP Source</span>
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
                <strong>No XP activity yet</strong>
                <p>No XP activity yet. Correct answers in practice will appear here.</p>
              </div>
            )}
          </article>

          <article className="section-inner-panel roadmap-panel">
            <div className="progression-section-heading">
              <div>
                <p className="eyebrow">Learning Roadmap</p>
                <h2>Subject Level Unlocks</h2>
                <p>Current highest subject level: Level {highestLevel.level} {highestLevel.name}</p>
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
                      <strong>Level {level.level} {level.name}</strong>
                      <p>{level.requiredXp} XP · {level.unlock}</p>
                      <small>{isCurrent ? "Current highest level" : reachedBySubject ? "Unlocked" : "Locked"}</small>
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
              <p className="eyebrow">Review &amp; Next Steps</p>
              <h2>Mistake Review and Learning Goals</h2>
              <p>Use review data and weak-area history to decide what to do next.</p>
            </div>
          </div>
          <div className="progression-split-grid review-grid">
          <article className="section-inner-panel review-panel">
            <div className="progression-section-heading">
              <div>
                <p className="eyebrow">Review Progress</p>
                <h2>Saved &amp; Mistakes</h2>
              </div>
              <button className="btn btn-secondary" type="button" onClick={() => navigate("/practice/review")}>
                Open Review Center
              </button>
            </div>
            <div className="review-progress-grid">
              <div><FaBookmark /><span>Saved Questions</span><strong>{savedQuestions.length}</strong></div>
              <div><FaExclamationTriangle /><span>Wrong Answers</span><strong>{activeWrongAnswers.length}</strong></div>
              <div><FaCheckCircle /><span>Mastered Mistakes</span><strong>{masteredMistakes.length}</strong></div>
              <div><FaLightbulb /><span>Most Missed Topic</span><strong>{topWeakTopic?.topic || mostMissedTopic?.topic || "No review data yet"}</strong></div>
            </div>
            {!savedQuestions.length && !activeWrongAnswers.length && (
              <p className="section-empty-note">No saved or wrong questions yet. Save difficult questions during practice.</p>
            )}
          </article>

          <article className="section-inner-panel goals-panel">
            <div className="progression-section-heading">
              <div>
                <p className="eyebrow">Next Steps</p>
                <h2>Next 3 Learning Goals</h2>
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
            <strong>Future Analytics</strong>
            <p>Mock test, tournament, and badge analytics will appear here after those systems are connected.</p>
          </div>
        </section>
      </section>
    </DashboardLayout>
  );
}

export default ProgressionPage;
