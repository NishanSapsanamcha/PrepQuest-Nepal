import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookOpen,
  FaChartLine,
  FaCheckCircle,
  FaGraduationCap,
  FaLanguage,
  FaLayerGroup,
  FaLightbulb,
  FaLock,
  FaQuestionCircle,
  FaStar,
} from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PracticeTypeCard from "../../components/practice/PracticeTypeCard";
import { examTracks } from "../../data/examTracks";
import { subjectLevels } from "../../data/subjectLevels";
import { getSubjectById } from "../../data/subjects";
import {
  buildSubjectCardData,
  getNormalizedSubjectProgress,
  getQuestionsBySubject,
  getValidatedQuestionCountBySubject,
  normalizeExamId,
} from "../../utils/practiceUtils";
import { getUser } from "../../utils/storageUtils";
import { getNextLevelProgress } from "../../utils/xpUtils";
import "./SubjectPracticePage.css";

const practiceTypes = [
  {
    name: "Quick Practice",
    description: "10 validated questions. No pressure. Build daily streaks and earn XP!",
    level: 1,
    buttonLabel: "Start Quick Practice",
  },
  {
    name: "Topic Practice",
    description: "Focus on one topic and strengthen your fundamentals.",
    level: 2,
  },
  {
    name: "Mixed Practice",
    description: "Blend all topics to simulate real exam experience.",
    level: 3,
  },
  {
    name: "Weak Area Practice",
    description: "Attack your weak topics and turn mistakes into strength.",
    level: 4,
  },
  {
    name: "Accuracy Challenge",
    description: "Train toward a higher accuracy target and earn bonus XP.",
    level: 5,
  },
  {
    name: "Advanced Revision",
    description: "Review deeper concepts and solidify long-term memory.",
    level: 6,
  },
];

const howItWorks = [
  { icon: FaLayerGroup, title: "Choose a Mode", text: "Pick a practice mode that fits your goal and unlock it." },
  { icon: FaCheckCircle, title: "Answer Questions", text: "Each correct answer earns +10 XP." },
  { icon: FaLightbulb, title: "Learn & Improve", text: "Instant explanations help you understand better." },
  { icon: FaChartLine, title: "Level Up", text: "Earn XP, unlock new modes, and track your growth." },
];

export function formatLanguageLabel(language) {
  const value = String(language || "English").trim().toLowerCase();
  if (value === "both" || value.includes("both")) return "Both Nepali and English";
  if (value === "nepali") return "Nepali";
  if (value === "english") return "English";
  return String(language || "English");
}

function getUnlockLevel(level) {
  return subjectLevels.find((item) => item.level === level) || subjectLevels[0];
}

function SubjectPracticePage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  const subject = getSubjectById(subjectId);
  const selectedExamId = normalizeExamId(user.selectedExam || localStorage.getItem("selectedExam"));
  const selectedExamLabel = examTracks[selectedExamId]?.name || user.selectedExam || "Sakha Adhikrit";
  const languageLabel = formatLanguageLabel(localStorage.getItem("preferredLanguage") || user.preferredLanguage);

  if (!subject) {
    return (
      <DashboardLayout activeKey="practice">
        <section className="dashboard-content">
          <div className="dashboard-card"><h1>Subject not found</h1></div>
        </section>
      </DashboardLayout>
    );
  }

  const subjectProgress = getNormalizedSubjectProgress();
  const cardData = buildSubjectCardData(subject, subjectProgress, selectedExamId);
  const progress = cardData.progress;
  const levelProgress = getNextLevelProgress(progress.xp || 0);
  const nextLevel = levelProgress.nextLevel;
  const validatedQuestions = getQuestionsBySubject(subjectId, selectedExamId);
  const validatedQuestionCount = getValidatedQuestionCountBySubject(subjectId, selectedExamId);
  const canStartQuickPractice = validatedQuestionCount > 0;
  const quickPracticeCount = Math.min(10, validatedQuestionCount);
  const nextUnlockType = nextLevel?.unlock || "All modes unlocked";
  const nextUnlockLabel = nextLevel ? `Level ${nextLevel.level}: ${nextLevel.name}` : "Mastered";

  // DEV-ONLY: ?debugPracticeLayout=true outlines/labels major layout sections.
  const debugLayout =
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debugPracticeLayout") === "true";

  return (
    <DashboardLayout activeKey="practice">
      <header className="dashboard-header subject-detail-header">
        <div className="subject-header-content">
          <p className="eyebrow">{subject.name}</p>
          <h1>{subject.name} Practice Modes</h1>
          <p>Level up your knowledge with smart, gamified practice.</p>
        </div>
        <div className="subject-header-actions">
          <div className="header-chips">
            <span className="subject-info-chip"><FaGraduationCap /> Exam: <strong>{selectedExamLabel}</strong></span>
            <span className="subject-info-chip"><FaLanguage /> Language: <strong>{languageLabel}</strong></span>
          </div>
          <button className="outline-pill" type="button" onClick={() => navigate("/practice")}><FaArrowLeft /> All Subjects</button>
        </div>
      </header>

      <section className={`dashboard-content subject-detail-page${debugLayout ? " debug-practice-layout" : ""}`}>
        {/* Horizontal hero: level, XP progress, validated questions, next unlock. */}
        <section className="subject-hero" data-debug="Hero Summary">
          <div className="hero-cell hero-level-cell">
            <div className="hero-level-badge">{levelProgress.currentLevel.level}</div>
            <div className="hero-cell-body">
              <span className="hero-label">Current Level</span>
              <strong className="hero-value">Level {levelProgress.currentLevel.level}: {levelProgress.currentLevel.name}</strong>
              <span className="hero-sub">
                {nextLevel ? `${levelProgress.xpNeeded} XP to reach Level ${nextLevel.level}` : "Max level reached"}
              </span>
            </div>
          </div>

          <div className="hero-cell">
            <span className="hero-icon xp"><FaStar /></span>
            <div className="hero-cell-body">
              <span className="hero-label">Subject XP Progress</span>
              <strong className="hero-value">{progress.xp} / {levelProgress.nextLevelXp} XP</strong>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${levelProgress.progressPercent}%` }} /></div>
              <span className="hero-sub">{levelProgress.progressPercent}% to {nextLevel ? `Level ${nextLevel.level}` : "Mastery"}</span>
            </div>
          </div>

          <div className="hero-cell">
            <span className="hero-icon ok"><FaCheckCircle /></span>
            <div className="hero-cell-body">
              <span className="hero-label">Validated Questions</span>
              <strong className="hero-value hero-value-big">{validatedQuestionCount}</strong>
              <span className="hero-sub">questions available</span>
            </div>
          </div>

          <div className="hero-cell">
            <span className="hero-icon lock"><FaLock /></span>
            <div className="hero-cell-body">
              <span className="hero-label">Next Unlock</span>
              <strong className="hero-value">{nextUnlockType}</strong>
              <span className="hero-sub">{nextLevel ? `Unlocks at ${nextUnlockLabel}` : "All modes unlocked"}</span>
              {nextLevel && <span className="hero-need">Need {levelProgress.xpNeeded} more XP</span>}
            </div>
          </div>
        </section>

        {validatedQuestionCount === 0 && (
          <section className="validation-warning-card">
            <FaQuestionCircle />
            <div>
              <strong>Question bank not ready for this subject.</strong>
              <p>Validated Questions: 0. Please choose another subject.</p>
            </div>
          </section>
        )}

        {validatedQuestionCount > 0 && validatedQuestionCount < 10 && (
          <section className="validation-warning-card soft">
            <FaQuestionCircle />
            <div>
              <strong>Only {validatedQuestionCount} validated questions available.</strong>
              <p>Quick Practice will use the reviewed questions currently available for this subject.</p>
            </div>
          </section>
        )}

        <div className="practice-modes-heading">
          <h2><FaStar /> Practice Modes</h2>
          <p>Choose a mode and level up your skills.</p>
        </div>

        <section className="practice-mode-grid" data-debug="Mode Cards">
          {practiceTypes.map((type) => {
            const unlockLevel = getUnlockLevel(type.level);
            const unlockedByLevel = progress.xp >= unlockLevel.requiredXp;
            const unlocked = unlockedByLevel && (type.level !== 1 || canStartQuickPractice);
            const xpNeeded = Math.max(0, unlockLevel.requiredXp - (progress.xp || 0));
            const unlockPercent = unlockLevel.requiredXp === 0
              ? 100
              : Math.min(100, Math.round(((progress.xp || 0) / unlockLevel.requiredXp) * 100));
            return (
              <PracticeTypeCard
                key={type.name}
                type={type}
                unlocked={unlocked}
                currentXp={progress.xp || 0}
                unlockLevel={unlockLevel}
                unlockPercent={unlockPercent}
                xpNeeded={xpNeeded}
                questionCount={validatedQuestionCount}
                quickPracticeCount={quickPracticeCount}
                validationMessage={validatedQuestionCount === 0 ? "Question bank not ready" : ""}
                onStart={() => unlocked && navigate(`/practice/${subjectId}/session`)}
              />
            );
          })}
        </section>

        <div className="subject-learn-row" data-debug="How It Works + Validated Bank">
          <section className="how-it-works-section">
            <h2><FaBookOpen /> How Subject Practice Works</h2>
            <div className="how-it-works-grid">
              {howItWorks.map(({ icon: Icon, title, text }) => (
                <article className="info-step-card" key={title}>
                  <span><Icon /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="validation-notice-card">
            <div className="validation-notice-head">
              <FaBookOpen />
              <h2>Validated Question Bank</h2>
            </div>
            <p>Only reviewed bilingual questions are used in Practice Mode.</p>
            <strong>{validatedQuestions.length} validated questions available</strong>
          </section>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default SubjectPracticePage;
