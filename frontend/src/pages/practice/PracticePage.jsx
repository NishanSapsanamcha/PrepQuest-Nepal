import { useNavigate } from "react-router-dom";
import { FaBolt, FaCoins, FaFire, FaGraduationCap, FaLanguage, FaLayerGroup, FaTools } from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import RecommendedPracticeCard from "../../components/practice/RecommendedPracticeCard";
import SubjectCard from "../../components/practice/SubjectCard";
import { examTracks } from "../../data/examTracks";
import {
  buildSubjectCardData,
  getExamSubjects,
  getNormalizedSubjectProgress,
  normalizeExamId,
} from "../../utils/practiceUtils";
import { getUser } from "../../utils/storageUtils";
import "./PracticePage.css";

function PracticePage() {
  const navigate = useNavigate();
  const user = getUser();
  const selectedExamId = normalizeExamId(user.selectedExam || localStorage.getItem("selectedExam"));
  const examLabel = examTracks[selectedExamId]?.name || "Sakha Adhikrit";
  const languageLabel = localStorage.getItem("preferredLanguage") || user.preferredLanguage || "English";
  const subjectProgress = getNormalizedSubjectProgress();
  const subjectCards = getExamSubjects(selectedExamId).map((subject) =>
    buildSubjectCardData(subject, subjectProgress, selectedExamId)
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

  return (
    <DashboardLayout activeKey="practice">
      <header className="dashboard-header practice-header">
        <div className="header-left">
          <p className="eyebrow">Welcome back, <span>{user.name}</span></p>
          <h1>Practice Mode</h1>
          <p>Choose a subject and improve your Loksewa preparation with XP, coins, feedback, and subject levels.</p>
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

      <section className="dashboard-content practice-content">
        <section className="stats-grid" aria-label="Practice stats">
          <article className="stat-card">
            <div className="stat-icon"><FaBolt /></div>
            <div><div className="stat-value">{user.totalXp.toLocaleString()} XP</div><div className="stat-helper">Earned across all activities</div></div>
          </article>
          <article className="stat-card">
            <div className="stat-icon"><FaCoins /></div>
            <div><div className="stat-value">{user.coins} Coins</div><div className="stat-helper">Use coins for extra mock tests</div></div>
          </article>
          <article className="stat-card">
            <div className="stat-icon"><FaFire /></div>
            <div><div className="stat-value">{user.streak} Days</div><div className="stat-helper">Complete one practice today</div></div>
          </article>
          <article className="stat-card">
            <div className="stat-icon"><FaLayerGroup /></div>
            <div><div className="stat-value">{subjectCards.length} Subjects</div><div className="stat-helper">Based on your exam track</div></div>
          </article>
        </section>

        <RecommendedPracticeCard
          recommendation={recommendation}
          onStart={() => recommendation.canPractice && navigate(`/practice/${recommendation.subjectId}/session?recommended=1`)}
        />

        <section className="practice-section-heading">
          <h2>Subjects</h2>
        </section>

        <section className="subject-grid">
          {subjectCards.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onPractice={() => subject.canPractice && navigate(`/practice/${subject.id}`)}
            />
          ))}
        </section>
      </section>
    </DashboardLayout>
  );
}

export default PracticePage;
