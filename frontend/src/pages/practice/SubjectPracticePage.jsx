import { useNavigate, useParams } from "react-router-dom";
import {
  FaBookOpen,
  FaChartLine,
  FaCheckCircle,
  FaLayerGroup,
  FaLightbulb,
  FaLock,
  FaQuestionCircle,
  FaSignOutAlt,
  FaStar,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PracticeTypeCard from "../../components/practice/PracticeTypeCard";
import usePrepQuestSound from "../../hooks/usePrepQuestSound";
import { getLevelBadge, heroMountain, practiceModeIcons } from "../../assets/gamification";
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
    description: "Start with 10 mixed questions.",
    level: 1,
    buttonLabel: "Start Quick Practice",
  },
  {
    name: "Topic Practice",
    description: "Focus on one topic.",
    level: 2,
    buttonLabel: "Start Topic Practice",
  },
  {
    name: "Mixed Practice",
    description: "Practice across all topics.",
    level: 3,
    buttonLabel: "Start Mixed Practice",
  },
  {
    name: "Weak Area Practice",
    description: "Improve your weak topics.",
    level: 4,
    buttonLabel: "Start Weak Area Practice",
  },
  {
    name: "Accuracy Challenge",
    description: "Train for higher accuracy.",
    level: 5,
    buttonLabel: "Start Accuracy Challenge",
  },
  {
    name: "Advanced Revision",
    description: "Review advanced concepts.",
    level: 6,
    buttonLabel: "Start Advanced Revision",
  },
];

const howItWorks = [
  { icon: FaLayerGroup, title: "Choose a Mode", text: "Pick Quick Practice first, then unlock more modes as you level up." },
  { icon: FaCheckCircle, title: "Answer Questions", text: "Each correct answer gives +10 XP." },
  { icon: FaLightbulb, title: "Learn & Improve", text: "Review explanations and strengthen weak topics." },
  { icon: FaChartLine, title: "Level Up", text: "Earn XP to unlock Topic, Mixed, Weak Area, Accuracy, and Advanced Revision modes." },
];

function getUnlockLevel(level) {
  return subjectLevels.find((item) => item.level === level) || subjectLevels[0];
}

function SubjectPracticePage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  const subject = getSubjectById(subjectId);
  const { isMuted, toggleMute } = usePrepQuestSound();
  const selectedExamId = normalizeExamId(user.selectedExam || localStorage.getItem("selectedExam"));

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
  const levelBadge = getLevelBadge(levelProgress.currentLevel.level);

  // DEV-ONLY: ?debugPracticeLayout=true outlines/labels major layout sections.
  const debugLayout =
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debugPracticeLayout") === "true";

  return (
    <DashboardLayout activeKey="practice">
      <section className={`dashboard-content subject-detail-page${debugLayout ? " debug-practice-layout" : ""}`}>
        {/* Separate top bar — sits ABOVE the hero, no mountain behind it. */}
        <div className="practice-topbar">
          <span className="hero-brand">PrepQuest <strong>Nepal</strong></span>
          <div className="hero-actions">
            <button
              type="button"
              className={`hero-volume-btn${isMuted ? " is-muted" : ""}`}
              aria-label={isMuted ? "Unmute sound" : "Mute sound"}
              aria-pressed={!isMuted}
              title={isMuted ? "Sound off" : "Sound on"}
              onClick={toggleMute}
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <button className="hero-exit-btn" type="button" onClick={() => navigate("/practice")}>
              <FaSignOutAlt /> Exit Practice
            </button>
          </div>
        </div>

        {/* Hero banner — mountain decoration + subject heading only. */}
        <header
          className="subject-modes-hero"
          style={heroMountain ? { "--hero-mountain": `url(${heroMountain})` } : undefined}
        >
          <div className="hero-mountain" aria-hidden="true" />
          <div className="subject-modes-hero-body">
            <span className="hero-subject-tag">{subject.name}</span>
            <h1>{subject.name} Practice Modes</h1>
            <p>Level up your knowledge with smart, gamified practice</p>
          </div>
        </header>

        {/* Compact progress summary: level, XP, validated questions, next unlock. */}
        <section className="subject-hero" data-debug="Progress Summary">
          <div className="hero-cell hero-level-cell">
            {levelBadge ? (
              <img className="hero-level-art" src={levelBadge} alt={`Level ${levelProgress.currentLevel.level}`} />
            ) : (
              <div className="hero-level-badge">{levelProgress.currentLevel.level}</div>
            )}
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
              <span className="hero-label">Subject XP</span>
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
                iconSrc={practiceModeIcons[type.name]}
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
