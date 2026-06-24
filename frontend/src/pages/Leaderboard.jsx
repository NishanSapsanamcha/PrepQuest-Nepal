import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowDown,
  FaArrowUp,
  FaEquals,
  FaFire,
  FaMedal,
  FaShieldAlt,
  FaTrophy,
} from "react-icons/fa";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { mockCurrentUser, mockLeaderboardUsers } from "../data/gamificationMockData";
import "./Leaderboard.css";

const rankingTypes = [
  {
    id: "weekly",
    label: "Weekly",
    description: "Ranks reset every week so every learner gets a fresh chance.",
  },
  {
    id: "monthly",
    label: "Monthly",
    description: "Compare consistent learners across the month.",
  },
  {
    id: "tournament",
    label: "Tournament",
    description: "Ranking based on Friday Loksewa Battle performance.",
  },
  {
    id: "subject",
    label: "Subject-wise",
    description: "Compare learners by selected subject accuracy and XP.",
  },
  {
    id: "examTrack",
    label: "Exam Track",
    description: "Compare learners preparing for the same exam track.",
  },
];

const examFilters = ["All Exams", "Nayab Subba", "Sakha Adhikrit"];
const examTrackFilters = ["Nayab Subba", "Sakha Adhikrit"];
const tournamentFilters = ["Latest Friday Battle", "Previous Battle"];
const subjectFilters = [
  "Constitution of Nepal",
  "General Knowledge",
  "Current Affairs",
  "IQ",
  "Nepali",
  "English",
  "Governance Basics",
  "Public Administration Basics",
];

function metricFor(user, rankingType) {
  if (rankingType === "monthly") return user.monthlyXP;
  if (rankingType === "tournament") return user.tournamentPoints;
  if (rankingType === "subject") return user.subjectXP || user.weeklyXP;
  return user.weeklyXP;
}

function metricLabel(rankingType) {
  return rankingType === "tournament" ? "points" : "XP";
}

function subjectStatsFor(user, subject) {
  const subjectIndex = subjectFilters.indexOf(subject);
  const adjustment = ((user.rank + subjectIndex * 3) % 7) - 3;
  return {
    subjectAccuracy: Math.max(55, Math.min(98, user.accuracy + adjustment)),
    subjectXP: Math.max(120, user.weeklyXP + adjustment * 85),
  };
}

function TrendIcon({ trend }) {
  if (trend === "up") return <FaArrowUp />;
  if (trend === "down") return <FaArrowDown />;
  return <FaEquals />;
}

function Leaderboard() {
  const navigate = useNavigate();
  const [selectedRankingType, setSelectedRankingType] = useState("weekly");
  const [examFilter, setExamFilter] = useState("All Exams");
  const [subjectExamFilter, setSubjectExamFilter] = useState("All Exams");
  const [subjectFilter, setSubjectFilter] = useState("Constitution of Nepal");
  const [tournamentFilter, setTournamentFilter] = useState("Latest Friday Battle");
  const [examTrackFilter, setExamTrackFilter] = useState("Sakha Adhikrit");

  const currentUser = mockLeaderboardUsers.find((user) => user.isCurrentUser) || mockLeaderboardUsers[0];
  const podium = mockLeaderboardUsers.slice(0, 3);
  const activeRanking = rankingTypes.find((type) => type.id === selectedRankingType);

  const rows = useMemo(() => {
    let nextRows = [...mockLeaderboardUsers];

    if (selectedRankingType === "weekly" || selectedRankingType === "monthly") {
      nextRows = nextRows.filter((user) => examFilter === "All Exams" || user.examTrack === examFilter);
      return nextRows.sort((a, b) => a.rank - b.rank);
    }

    if (selectedRankingType === "subject") {
      nextRows = nextRows.filter((user) => subjectExamFilter === "All Exams" || user.examTrack === subjectExamFilter);
      return nextRows
        .map((user) => ({
          ...user,
          ...subjectStatsFor(user, subjectFilter),
        }))
        .sort((a, b) => b.subjectAccuracy - a.subjectAccuracy || b.subjectXP - a.subjectXP);
    }

    if (selectedRankingType === "examTrack") {
      nextRows = nextRows.filter((user) => user.examTrack === examTrackFilter);
      return nextRows.sort((a, b) => b.weeklyXP - a.weeklyXP);
    }

    const tournamentMultiplier = tournamentFilter === "Previous Battle" ? 0.86 : 1;
    return nextRows
      .map((user) => ({
        ...user,
        tournamentPoints: Math.round(user.tournamentPoints * tournamentMultiplier),
      }))
      .sort((a, b) => b.tournamentPoints - a.tournamentPoints);
  }, [examFilter, examTrackFilter, selectedRankingType, subjectExamFilter, subjectFilter, tournamentFilter]);

  const handleRankingChange = (rankingType) => {
    setSelectedRankingType(rankingType);
  };

  const renderSecondaryFilters = () => {
    if (selectedRankingType === "weekly" || selectedRankingType === "monthly") {
      return (
        <div className="secondary-filter-row" aria-label="Exam filters">
          {examFilters.map((exam) => (
            <button className={`filter-option${examFilter === exam ? " active" : ""}`} type="button" key={exam} onClick={() => setExamFilter(exam)}>
              {exam}
            </button>
          ))}
        </div>
      );
    }

    if (selectedRankingType === "subject") {
      return (
        <div className="secondary-filter-grid">
          <label>
            <span>Exam Track</span>
            <select value={subjectExamFilter} onChange={(event) => setSubjectExamFilter(event.target.value)}>
              {examFilters.map((exam) => <option key={exam}>{exam}</option>)}
            </select>
          </label>
          <label>
            <span>Subject</span>
            <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}>
              {subjectFilters.map((subject) => <option key={subject}>{subject}</option>)}
            </select>
          </label>
        </div>
      );
    }

    if (selectedRankingType === "tournament") {
      return (
        <div className="secondary-filter-row" aria-label="Tournament filters">
          {tournamentFilters.map((battle) => (
            <button className={`filter-option${tournamentFilter === battle ? " active" : ""}`} type="button" key={battle} onClick={() => setTournamentFilter(battle)}>
              {battle}
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="secondary-filter-row" aria-label="Exam track filters">
        {examTrackFilters.map((track) => (
          <button className={`filter-option${examTrackFilter === track ? " active" : ""}`} type="button" key={track} onClick={() => setExamTrackFilter(track)}>
            {track}
          </button>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout activeKey="leaderboard">
      <section className="dashboard-content leaderboard-page">
        <header className="dashboard-header leaderboard-header">
          <div className="header-left">
            <h1>Leaderboard</h1>
            <p>Compare weekly progress, tournaments, subjects, and exam-track rankings.</p>
          </div>
          <div className="header-right">
            <div className="header-chips">
              <span className="chip"><FaFire /> Weekly Reset</span>
              <span className="chip"><FaShieldAlt /> Privacy-safe ranking</span>
            </div>
          </div>
        </header>

        <section className="dashboard-card leaderboard-rank-summary">
          <div className="rank-main">
            <p className="eyebrow">My Weekly Rank</p>
            <div className="rank-number">#{mockCurrentUser.weeklyRank}</div>
            <div>
              <strong>{mockCurrentUser.examTrack}</strong>
              <span>Keep practicing to move up this week.</span>
            </div>
          </div>
          <div className="leaderboard-summary-grid">
            <span>Weekly XP <strong>{currentUser.weeklyXP.toLocaleString()} XP</strong></span>
            <span>Accuracy <strong>{currentUser.accuracy}%</strong></span>
            <span>Streak <strong>{currentUser.streak} days</strong></span>
            <span>Badges <strong>{currentUser.badges}</strong></span>
          </div>
          <button className="btn rank-cta" type="button" onClick={() => navigate("/practice")}>
            Practice Weak Subject
          </button>
        </section>

        <section className="leaderboard-podium-grid" aria-label="Top 3 learners">
          {podium.map((user) => (
            <article className={`podium-card rank-${user.rank}`} key={user.id}>
              <div className="podium-rank"><FaTrophy /> #{user.rank}</div>
              <div className="leader-avatar">{user.initials}</div>
              <div>
                <h2>{user.name}</h2>
                <p>{user.examTrack}</p>
              </div>
              <strong>{user.weeklyXP.toLocaleString()} XP &middot; {user.accuracy}%</strong>
            </article>
          ))}
        </section>

        <section className="dashboard-card leaderboard-controls">
          <div className="control-heading">
            <h2>Choose Ranking Type</h2>
            <p>{activeRanking.description}</p>
          </div>
          <div className="ranking-tabs" role="tablist" aria-label="Ranking type">
            {rankingTypes.map((type) => (
              <button
                className={`ranking-tab${selectedRankingType === type.id ? " active" : ""}`}
                type="button"
                role="tab"
                aria-selected={selectedRankingType === type.id}
                key={type.id}
                onClick={() => handleRankingChange(type.id)}
              >
                {type.label}
              </button>
            ))}
          </div>
          {renderSecondaryFilters()}
        </section>

        <section className="dashboard-card leaderboard-table-card">
          <div className="card-heading">
            <h2 className="card-title"><FaMedal /> Full Leaderboard</h2>
            <span className="status-chip">{activeRanking.label}{selectedRankingType === "subject" ? ` - ${subjectFilter}` : ""}</span>
          </div>

          {rows.length > 0 ? (
            <div className="leaderboard-table">
              <div className="leaderboard-table-head">
                <span>Rank</span><span>Learner</span><span>Exam Track</span><span>XP / Points</span><span>Accuracy</span><span>Streak</span><span>Badges</span><span>Trend</span>
              </div>
              {rows.map((user, index) => {
                const visibleRank = selectedRankingType === "weekly" || selectedRankingType === "monthly" ? user.rank : index + 1;
                return (
                  <div className={`leaderboard-table-row${user.isCurrentUser ? " current-user" : ""}`} key={user.id}>
                    <span className={`rank-badge rank-${visibleRank <= 3 ? visibleRank : "default"}`}>#{visibleRank}</span>
                    <span className="learner-cell">
                      <span className="mini-avatar">{user.initials}</span>
                      <span><strong>{user.name}</strong>{user.isCurrentUser ? <em>You</em> : null}</span>
                    </span>
                    <span>{user.examTrack}</span>
                    <strong>{metricFor(user, selectedRankingType).toLocaleString()} {metricLabel(selectedRankingType)}</strong>
                    <span>{selectedRankingType === "subject" ? user.subjectAccuracy : user.accuracy}%</span>
                    <span>{user.streak} days</span>
                    <span>{user.badges}</span>
                    <span className={`trend ${user.trend}`}><TrendIcon trend={user.trend} /></span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="leaderboard-empty-state">
              <p>No ranking data yet for this filter.</p>
              <button className="btn" type="button" onClick={() => navigate("/practice")}>Start Practice</button>
            </div>
          )}
        </section>

        <p className="privacy-note">Leaderboard uses display names only. Users can hide from public ranking in future settings.</p>
      </section>
    </DashboardLayout>
  );
}

export default Leaderboard;
