import { useMemo, useState } from "react";
import { FaArrowDown, FaArrowUp, FaEquals, FaFire, FaMedal, FaShieldAlt, FaTrophy, FaUserGraduate } from "react-icons/fa";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { mockCurrentUser, mockLeaderboardUsers, mockSubjectLeaderboards } from "../data/gamificationMockData";
import "./Leaderboard.css";

const tabs = ["Weekly", "Monthly", "Tournament"];
const exams = ["All Exams", "Nayab Subba", "Sakha Adhikrit"];

function metricFor(user, activeTab) {
  if (activeTab === "Monthly") return user.monthlyXP;
  if (activeTab === "Tournament") return user.tournamentPoints;
  return user.weeklyXP;
}

function TrendIcon({ trend }) {
  if (trend === "up") return <FaArrowUp />;
  if (trend === "down") return <FaArrowDown />;
  return <FaEquals />;
}

function Leaderboard() {
  const [activeTab, setActiveTab] = useState("Weekly");
  const [activeExam, setActiveExam] = useState("All Exams");

  const rows = useMemo(() => {
    return mockLeaderboardUsers
      .filter((user) => activeExam === "All Exams" || user.examTrack === activeExam)
      .sort((a, b) => metricFor(b, activeTab) - metricFor(a, activeTab));
  }, [activeExam, activeTab]);

  const podium = mockLeaderboardUsers.slice(0, 3);
  const currentUser = mockLeaderboardUsers.find((user) => user.isCurrentUser) || mockLeaderboardUsers[2];

  return (
    <DashboardLayout activeKey="leaderboard">
      <section className="dashboard-content leaderboard-page">
        <header className="dashboard-header leaderboard-header">
          <div className="header-left">
            <p className="eyebrow">Community Ranking</p>
            <h1>Leaderboard</h1>
            <p>Compare progress across weekly XP, tournaments, subjects, and exam tracks.</p>
          </div>
          <div className="header-right">
            <div className="header-chips">
              <span className="chip"><FaFire /> Weekly Reset</span>
              <span className="chip"><FaUserGraduate /> {mockCurrentUser.examTrack}</span>
              <span className="chip"><FaMedal /> Rank #{mockCurrentUser.weeklyRank}</span>
              <span className="chip"><FaShieldAlt /> Privacy-safe ranking</span>
            </div>
          </div>
        </header>

        <section className="dashboard-card leaderboard-rank-summary">
          <div>
            <p className="eyebrow">Your Rank Summary</p>
            <h2>Weekly Rank #{mockCurrentUser.weeklyRank}</h2>
            <p>You are close to the next rank. Complete one quiz or practice your weak subject to climb higher.</p>
          </div>
          <div className="leaderboard-summary-grid">
            <span>Weekly XP <strong>{currentUser.weeklyXP}</strong></span>
            <span>Accuracy <strong>{currentUser.accuracy}%</strong></span>
            <span>Streak <strong>{currentUser.streak} days</strong></span>
            <span>Badges <strong>{currentUser.badges}</strong></span>
          </div>
        </section>

        <section className="leaderboard-podium-grid">
          {podium.map((user) => (
            <article className={`dashboard-card podium-card rank-${user.rank}`} key={user.id}>
              <div className="podium-rank"><FaTrophy /> #{user.rank}</div>
              <div className="leader-avatar">{user.initials}</div>
              <h2>{user.name}</h2>
              <p>{user.examTrack}</p>
              <div className="podium-stats">
                <span>{user.weeklyXP} XP</span>
                <span>{user.accuracy}% accuracy</span>
              </div>
            </article>
          ))}
        </section>

        <section className="dashboard-card leaderboard-controls">
          <div className="tab-row">
            {tabs.map((tab) => <button className={`tab-pill${activeTab === tab ? " active" : ""}`} type="button" key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>)}
          </div>
          <div className="tab-row">
            {exams.map((exam) => <button className={`tab-pill filter${activeExam === exam ? " active" : ""}`} type="button" key={exam} onClick={() => setActiveExam(exam)}>{exam}</button>)}
          </div>
        </section>

        <section className="dashboard-card leaderboard-table-card">
          <div className="card-heading">
            <h2 className="card-title"><FaMedal /> Full Leaderboard</h2>
            <span className="status-chip">{activeTab}</span>
          </div>
          <div className="leaderboard-table">
            <div className="leaderboard-table-head">
              <span>Rank</span><span>Learner</span><span>Exam Track</span><span>XP / Points</span><span>Accuracy</span><span>Streak</span><span>Badges</span><span>Trend</span>
            </div>
            {rows.map((user, index) => (
              <div className={`leaderboard-table-row${user.isCurrentUser ? " current-user" : ""}`} key={user.id}>
                <span className="rank-badge">{index + 1}</span>
                <span className="learner-cell"><span className="mini-avatar">{user.initials}</span><strong>{user.name}</strong></span>
                <span>{user.examTrack}</span>
                <strong>{metricFor(user, activeTab).toLocaleString()}</strong>
                <span>{user.accuracy}%</span>
                <span>{user.streak} days</span>
                <span>{user.badges}</span>
                <span className={`trend ${user.trend}`}><TrendIcon trend={user.trend} /></span>
              </div>
            ))}
          </div>
        </section>

        <section className="subject-leaderboard-grid">
          {Object.entries(mockSubjectLeaderboards).map(([subject, leaders]) => (
            <article className="dashboard-card subject-board-card" key={subject}>
              <h2 className="card-title">{subject}</h2>
              {leaders.map((leader) => (
                <div className="subject-board-row" key={leader.rank}>
                  <span className="rank-badge">{leader.rank}</span>
                  <strong>{leader.name}</strong>
                  <span>{leader.score}%</span>
                  <span>{leader.solved} solved</span>
                </div>
              ))}
            </article>
          ))}
        </section>

        <section className="dashboard-card ranking-rules-card">
          <h2 className="card-title"><FaShieldAlt /> How Ranking Works</h2>
          <div className="rules-grid">
            <span>Weekly leaderboard resets every Monday.</span>
            <span>Tournament leaderboard is based on Friday Battle points.</span>
            <span>Subject leaderboard is based on accuracy and solved questions.</span>
            <span>All-time leaderboard is not the main focus because new users need a fair chance.</span>
            <span>Hide from public leaderboard option can be added later.</span>
          </div>
        </section>
      </section>
    </DashboardLayout>
  );
}

export default Leaderboard;

