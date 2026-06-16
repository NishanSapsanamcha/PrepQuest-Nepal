import { useNavigate } from "react-router-dom";
import { FaBookOpen, FaCoins, FaFire, FaGraduationCap, FaLanguage, FaLayerGroup, FaStar, FaTools } from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import RecommendedPracticeCard from "../../components/practice/RecommendedPracticeCard";
import SubjectCard from "../../components/practice/SubjectCard";
import { examTracks } from "../../data/examTracks";
import { getExamSubjects, buildSubjectProgress, normalizeExamId } from "../../utils/practiceUtils";
import { getUser } from "../../utils/storageUtils";
import "./PracticePage.css";

function PracticePage() {
  const navigate = useNavigate();
  const user = getUser();
  const selectedExamId = normalizeExamId(user.selectedExam || localStorage.getItem("selectedExam"));
  const examLabel = examTracks[selectedExamId]?.name || "Sakha Adhikrit";
  const languageLabel = localStorage.getItem("preferredLanguage") || user.preferredLanguage || "English";
  const subjects = getExamSubjects(selectedExamId);

  return (
    <DashboardLayout activeKey="practice">
      <header className="dashboard-header">
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
            <div className="stat-icon"><FaStar /></div>
            <div><div className="stat-value">{user.totalXp.toLocaleString()} XP</div><div className="stat-label">Total XP</div><div className="stat-helper">Earned across all activities</div></div>
          </article>
          <article className="stat-card">
            <div className="stat-icon"><FaCoins /></div>
            <div><div className="stat-value">{user.coins} Coins</div><div className="stat-label">Coins</div><div className="stat-helper">Use coins for extra mock tests</div></div>
          </article>
          <article className="stat-card">
            <div className="stat-icon"><FaFire /></div>
            <div><div className="stat-value">{user.streak} Days</div><div className="stat-label">Practice Streak</div><div className="stat-helper">Complete one practice today</div></div>
          </article>
          <article className="stat-card">
            <div className="stat-icon"><FaLayerGroup /></div>
            <div><div className="stat-value">{subjects.length} Subjects</div><div className="stat-label">Subjects</div><div className="stat-helper">Based on your exam track</div></div>
          </article>
        </section>

        <RecommendedPracticeCard onStart={() => navigate("/practice/constitution/session")} />

        <section className="practice-section-heading">
          <h2><FaBookOpen /> Subject Mastery Quest</h2>
          <p>Pick one subject, earn focused XP, and unlock deeper practice modes as your level grows.</p>
        </section>

        <section className="subject-grid">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              progress={buildSubjectProgress(subject.id)}
              onPractice={() => navigate(`/practice/${subject.id}`)}
            />
          ))}
        </section>
      </section>
    </DashboardLayout>
  );
}

export default PracticePage;
