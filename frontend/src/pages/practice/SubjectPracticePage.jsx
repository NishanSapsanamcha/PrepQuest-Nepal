import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookOpen,
  FaCheckCircle,
  FaGraduationCap,
  FaLanguage,
  FaLayerGroup,
  FaLightbulb,
  FaLockOpen,
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
    shortLabel: "Available Now",
    detail: "Instant feedback and explanation",
    description: "Start with focused questions, no pressure, and build subject XP every day.",
    level: 1,
    reward: "+10 XP per correct answer",
    buttonLabel: "Start Quick Practice",
  },
  {
    name: "Topic Practice",
    detail: "Practice selected topic questions",
    description: "Focus one topic and tighten your fundamentals.",
    level: 2,
  },
  {
    name: "Mixed Practice",
    detail: "Mixed questions from full subject",
    description: "Blend all topics to simulate real recall.",
    level: 3,
  },
  {
    name: "Weak Area Practice",
    detail: "Practice weak topics based on wrong answers",
    description: "Attack the topics that pull your accuracy down.",
    level: 4,
  },
  {
    name: "Accuracy Challenge",
    detail: "Practice with a high-accuracy target",
    description: "Train toward a stronger accuracy target.",
    level: 5,
  },
  {
    name: "Advanced Revision",
    detail: "Harder questions and saved review questions",
    description: "Review deeper concepts and saved mistakes.",
    level: 6,
  },
];

const howItWorks = [
  { icon: FaLayerGroup, title: "Choose Mode", text: "Start with Quick Practice and unlock deeper modes as you level up." },
  { icon: FaCheckCircle, title: "Answer Questions", text: "Each correct answer gives +10 XP." },
  { icon: FaLightbulb, title: "Learn Instantly", text: "See the correct answer and explanation after each question." },
  { icon: FaLockOpen, title: "Unlock Modes", text: "Subject XP unlocks Topic Practice, Mixed Practice, Weak Area Practice, and more." },
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
  const accuracyLabel = cardData.accuracy === null ? "Not Started" : `${cardData.accuracy}%`;
  const nextUnlockType = nextLevel?.unlock || "All modes unlocked";
  const nextUnlockNeed = nextLevel ? levelProgress.xpNeeded : 0;
  const nextUnlockLabel = nextLevel ? `Level ${nextLevel.level}: ${nextLevel.name}` : "Mastered";

  return (
    <DashboardLayout activeKey="practice">
      <header className="dashboard-header subject-detail-header">
        <div className="subject-header-content">
          <p className="eyebrow">{subject.name}</p>
          <h1>Level {levelProgress.currentLevel.level}: {levelProgress.currentLevel.name}</h1>
          <p>{subject.description}</p>
        </div>
        <div className="subject-header-actions">
          <div className="header-chips">
            <span className="subject-info-chip"><FaGraduationCap /> Exam: <strong>{selectedExamLabel}</strong></span>
            <span className="subject-info-chip"><FaLanguage /> Language: <strong>{languageLabel}</strong></span>
          </div>
          <button className="outline-pill" type="button" onClick={() => navigate("/practice")}><FaArrowLeft /> All Subjects</button>
        </div>
      </header>

      <section className="dashboard-content subject-detail-page">
        <section className="dashboard-card subject-progress-card">
          <div className="subject-progress-main">
            <div className="subject-xp-block">
              <p className="eyebrow">Subject Progress</p>
              <span>Subject XP</span>
              <strong>{progress.xp} / {levelProgress.nextLevelXp} XP</strong>
              <p>
                {nextLevel
                  ? `${levelProgress.xpNeeded} XP needed to unlock Level ${nextLevel.level}: ${nextLevel.name}`
                  : "You have unlocked every subject practice mode."}
              </p>
            </div>

            <div className="subject-progress-stats">
              <div className="subject-progress-stat">
                <span>Progress to {nextLevel ? `Level ${nextLevel.level}` : "Mastery"}</span>
                <strong>{levelProgress.progressPercent}%</strong>
              </div>
              <div className="subject-progress-stat">
                <span>Accuracy</span>
                <strong>{accuracyLabel}</strong>
              </div>
              <div className="subject-progress-stat">
                <span>Questions Solved</span>
                <strong>{progress.questionsSolved}</strong>
              </div>
              <div className="subject-progress-stat">
                <span>Validated Questions</span>
                <strong>{validatedQuestionCount}</strong>
              </div>
            </div>

            <aside className="next-unlock-box">
              <span>Next Unlock</span>
              <strong>{nextUnlockType}</strong>
              <p>{nextLevel ? `Unlocks at ${nextUnlockLabel}` : "No locked modes remaining"}</p>
              <em>{nextLevel ? `Need ${nextUnlockNeed} more XP` : "Complete"}</em>
            </aside>
          </div>

          <div className="subject-progress-bar-row">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${levelProgress.progressPercent}%` }} />
            </div>
            <strong>{levelProgress.progressPercent}%</strong>
          </div>

          <div className="reward-preview-row">
            <span className="reward-preview-pill"><FaStar /> Correct Answer: <strong>+10 XP</strong></span>
            <span className="reward-preview-pill"><FaCheckCircle /> Session result saved</span>
            <span className="reward-preview-pill mixed-reward"><FaLockOpen /> Level unlocks practice modes</span>
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

        <section className="practice-mode-grid">
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

        <section className="how-it-works-section">
          <h2>How This Subject Practice Works</h2>
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
          <FaBookOpen />
          <div>
            <h2>Validated Question Bank</h2>
            <p>
              Only reviewed bilingual questions are used in Practice Mode. Fake, placeholder,
              or incomplete questions are blocked by validation.
            </p>
            <strong>{validatedQuestions.length} validated questions available for this subject.</strong>
          </div>
        </section>
      </section>
    </DashboardLayout>
  );
}

export default SubjectPracticePage;
