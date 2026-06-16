import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaGraduationCap, FaLanguage } from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PracticeTypeCard from "../../components/practice/PracticeTypeCard";
import { subjectLevels } from "../../data/subjectLevels";
import { getSubjectById } from "../../data/subjects";
import { buildSubjectCardData, getNormalizedSubjectProgress, normalizeExamId } from "../../utils/practiceUtils";
import { getUser } from "../../utils/storageUtils";
import { getNextLevelProgress } from "../../utils/xpUtils";
import "./SubjectPracticePage.css";

const practiceTypes = [
  { name: "Quick Practice", detail: "10 questions", description: "No pressure. Best for daily subject practice.", level: 1 },
  { name: "Topic Practice", detail: "Questions from selected topic", description: "Focus one topic and tighten your fundamentals.", level: 2 },
  { name: "Mixed Practice", detail: "Mixed questions from full subject", description: "Blend all topics to simulate real recall.", level: 3 },
  { name: "Weak Area Practice", detail: "Questions from weak topics", description: "Attack the topics that pull your accuracy down.", level: 4 },
  { name: "Accuracy Challenge", detail: "Score 80% or above", description: "Practice with a high-accuracy target.", level: 5 },
  { name: "Advanced Revision", detail: "Harder questions and review questions", description: "Review deeper concepts and saved mistakes.", level: 6 },
];

function SubjectPracticePage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  const subject = getSubjectById(subjectId);
  const selectedExamId = normalizeExamId(user.selectedExam || localStorage.getItem("selectedExam"));
  const cardData = subject ? buildSubjectCardData(subject, getNormalizedSubjectProgress(), selectedExamId) : null;
  const progress = cardData?.progress || {};
  const levelProgress = getNextLevelProgress(progress.xp || 0);

  if (!subject) {
    return (
      <DashboardLayout activeKey="practice">
        <section className="dashboard-content"><div className="dashboard-card"><h1>Subject not found</h1></div></section>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeKey="practice">
      <header className="dashboard-header">
        <div className="header-left">
          <p className="eyebrow">{subject.name}</p>
          <h1>Level {levelProgress.currentLevel.level}: {levelProgress.currentLevel.name}</h1>
          <p>{subject.description}</p>
        </div>
        <div className="header-right">
          <div className="header-chips">
            <span className="chip"><FaGraduationCap /> Exam: <strong>{user.selectedExam}</strong></span>
            <span className="chip"><FaLanguage /> Language: <strong>{localStorage.getItem("preferredLanguage") || user.preferredLanguage}</strong></span>
          </div>
          <button className="outline-pill" type="button" onClick={() => navigate("/practice")}><FaArrowLeft /> All Subjects</button>
        </div>
      </header>

      <section className="dashboard-content practice-content">
        <section className="dashboard-card subject-progress-card">
          <div className="progress-card-grid">
            <div>
              <p className="eyebrow">Subject XP</p>
              <h2>{progress.xp} / {levelProgress.nextLevelXp} XP</h2>
              <p>{levelProgress.xpNeeded} XP needed to unlock Level {levelProgress.nextLevel?.level || levelProgress.currentLevel.level}: {levelProgress.nextLevel?.name || "Mastered"}</p>
            </div>
            <div className="subject-progress-stats">
              <span>Progress to Level {levelProgress.nextLevel?.level || levelProgress.currentLevel.level}: <strong>{levelProgress.progressPercent}%</strong></span>
              <span>Accuracy: <strong>{cardData.accuracy === null ? "Not started" : `${cardData.accuracy}%`}</strong></span>
              <span>Questions Solved: <strong>{progress.questionsSolved}</strong></span>
              <span>Validated Questions: <strong>{cardData.questionsAvailable}</strong></span>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${levelProgress.progressPercent}%` }} />
          </div>
        </section>

        <section className="practice-type-grid">
          {practiceTypes.map((type) => {
            const level = subjectLevels.find((item) => item.level === type.level);
            const unlocked = cardData.canPractice && progress.xp >= level.requiredXp;
            return (
              <PracticeTypeCard
                key={type.name}
                type={type}
                unlocked={unlocked}
                requirement={cardData.canPractice ? `${level.requiredXp} XP required` : "Question bank not ready"}
                onStart={() => cardData.canPractice && navigate(`/practice/${subjectId}/session`)}
              />
            );
          })}
        </section>
      </section>
    </DashboardLayout>
  );
}

export default SubjectPracticePage;
