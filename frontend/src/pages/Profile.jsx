import { useNavigate } from "react-router-dom";
import { FaBookOpen, FaCalendarAlt, FaCoins, FaFire, FaMedal, FaShieldAlt, FaTrophy, FaUser, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { MdTrackChanges } from "react-icons/md";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { mockBadges, mockCurrentUser, mockProfileActivity, mockTournamentHistory, rankThresholds } from "../data/gamificationMockData";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const soundMuted = localStorage.getItem("prepquest_sound_muted") === "true";
  const earnedBadges = mockBadges.filter((badge) => badge.status === "earned");
  const showcaseBadges = [
    ...earnedBadges,
    mockBadges.find((badge) => badge.id === "seven_day_warrior"),
    mockBadges.find((badge) => badge.id === "review_hero"),
  ].filter(Boolean).slice(0, 5);
  const rankProgressPercent = Math.round((mockCurrentUser.totalXP / mockCurrentUser.nextRankXP) * 100);

  return (
    <DashboardLayout activeKey="profile">
      <section className="dashboard-content profile-page">
        <header className="dashboard-card profile-header-card">
          <div className="profile-avatar">{mockCurrentUser.initials}</div>
          <div className="profile-header-copy">
            <p className="eyebrow">Gamified Identity</p>
            <h1>{mockCurrentUser.name}</h1>
            <div className="profile-chip-row">
              <span className="chip">{mockCurrentUser.examTrack}</span>
              <span className="chip">{mockCurrentUser.languageMode}</span>
              <span className="chip">{mockCurrentUser.currentRank}</span>
              <span className="chip"><FaShieldAlt /> Public leaderboard: {mockCurrentUser.publicLeaderboard ? "On" : "Off"}</span>
            </div>
          </div>
          <button className="outline-pill" type="button">Edit Profile</button>
        </header>

        <section className="dashboard-card rank-journey-card">
          <div className="rank-journey-top">
            <div>
              <p className="eyebrow">Overall Rank Journey</p>
              <h2>Current Rank: {mockCurrentUser.currentRank}</h2>
              <p>Account Level {mockCurrentUser.level} - {mockCurrentUser.totalXP} / {mockCurrentUser.nextRankXP} XP toward {mockCurrentUser.nextRank}.</p>
            </div>
            <div className="rank-xp-box">
              <span>XP Needed</span>
              <strong>{mockCurrentUser.xpToNextRank} XP</strong>
            </div>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${rankProgressPercent}%` }} /></div>
          <div className="rank-path">
            {rankThresholds.map((rank) => (
              <span className={rank.rank === mockCurrentUser.currentRank ? "current" : ""} key={rank.rank}>{rank.rank}</span>
            ))}
          </div>
        </section>

        <section className="stats-grid">
          <article className="stat-card"><div className="stat-icon"><FaCoins /></div><div><div className="stat-value">{mockCurrentUser.coins}</div><div className="stat-label">Coins</div><div className="stat-helper">Mock profile preview</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaFire /></div><div><div className="stat-value">{mockCurrentUser.streak} Days</div><div className="stat-label">Current Streak</div><div className="stat-helper">Daily habit status</div></div></article>
          <article className="stat-card"><div className="stat-icon"><MdTrackChanges /></div><div><div className="stat-value">{mockCurrentUser.overallAccuracy}%</div><div className="stat-label">Overall Accuracy</div><div className="stat-helper">{mockCurrentUser.totalCorrect} correct answers</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaBookOpen /></div><div><div className="stat-value">{mockCurrentUser.totalQuestionsAttempted}</div><div className="stat-label">Questions Attempted</div><div className="stat-helper">Across mock activity</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaMedal /></div><div><div className="stat-value">{mockCurrentUser.badgesEarned}</div><div className="stat-label">Badges Earned</div><div className="stat-helper">Achievement showcase</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaUser /></div><div><div className="stat-value">{mockCurrentUser.subjectsPracticed}</div><div className="stat-label">Subjects Practiced</div><div className="stat-helper">Study breadth</div></div></article>
        </section>

        <div className="profile-main-grid">
          <div className="profile-left-column">
            <section className="dashboard-card">
              <div className="card-heading">
                <h2 className="card-title"><FaMedal /> Badge Showcase</h2>
                <button className="action-btn compact" type="button" onClick={() => navigate("/badges")}>View All Badges</button>
              </div>
              <div className="profile-badge-grid">
                {showcaseBadges.map((badge) => (
                  <div className="profile-badge-row" key={badge.id}>
                    <span className="rank-badge">{badge.status === "earned" ? "✓" : `${badge.progress}/${badge.target}`}</span>
                    <div><strong>{badge.name}</strong><span>{badge.category} - {badge.reward}</span></div>
                  </div>
                ))}
              </div>
            </section>

            <section className="dashboard-card">
              <h2 className="card-title"><FaCalendarAlt /> Recent Activity</h2>
              <div className="profile-list">
                {mockProfileActivity.map((item) => (
                  <div className="profile-activity-row" key={item.id}>
                    <span className="stat-icon small"><FaCalendarAlt /></span>
                    <div><strong>{item.title}</strong><span>{item.detail}</span></div>
                    <time>{item.date}</time>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="profile-right-column">
            <section className="dashboard-card">
              <h2 className="card-title"><MdTrackChanges /> Study Identity</h2>
              <div className="detail-list">
                <div><span>Strongest Subject</span><strong>{mockCurrentUser.strongestSubject}</strong></div>
                <div><span>Weakest Subject</span><strong>{mockCurrentUser.weakestSubject}</strong></div>
                <div><span>Most Practiced</span><strong>{mockCurrentUser.mostPracticedSubject}</strong></div>
                <div><span>Recommended Next</span><strong>Practice {mockCurrentUser.weakestSubject} today</strong></div>
              </div>
            </section>

            <section className="dashboard-card">
              <h2 className="card-title"><FaTrophy /> Tournament History</h2>
              <div className="profile-list">
                {mockTournamentHistory.map((item) => (
                  <div className="tournament-history-row" key={item.id}>
                    <div><strong>{item.title}</strong><span>{item.date} - Rank {item.rank}/{item.participants}</span></div>
                    <strong>{item.points} pts</strong>
                    <span>{item.reward}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="dashboard-card">
              <h2 className="card-title"><FaShieldAlt /> Preferences Summary</h2>
              <div className="detail-list">
                <div><span>Selected Exam Track</span><strong>{mockCurrentUser.examTrack}</strong></div>
                <div><span>Language Mode</span><strong>{mockCurrentUser.languageMode}</strong></div>
                <div><span>Public Leaderboard</span><strong>On</strong></div>
                <div><span>Notifications</span><strong>Future feature</strong></div>
                <div><span>Sound Effects</span><strong>{soundMuted ? <><FaVolumeMute /> Muted</> : <><FaVolumeUp /> On</>}</strong></div>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default Profile;

