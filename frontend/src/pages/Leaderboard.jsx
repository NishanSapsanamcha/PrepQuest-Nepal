import { useEffect, useMemo, useState } from "react";
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
import { RewardDisplay } from "../components/common/Coin";
import { examTracks } from "../data/examTracks";
import { mockCurrentUser, mockLeaderboardUsers } from "../data/gamificationMockData";
import { getLatestTournamentResults } from "../services/tournamentService";
import { getUser } from "../utils/storageUtils";
import "./Leaderboard.css";

const rankingTypes = [
  { id: "tournament", label: "Tournament", description: "Ranking based on the latest Friday Loksewa Battle performance." },
  { id: "weekly", label: "Weekly", description: "Ranks reset every week so every learner gets a fresh chance." },
  { id: "monthly", label: "Monthly", description: "Compare consistent learners across the month." },
  { id: "subject", label: "Subject-wise", description: "Compare learners by selected subject accuracy and XP." },
  { id: "examTrack", label: "Exam Track", description: "Compare learners preparing for the same exam track." },
  { id: "hallOfFame", label: "Hall of Fame", description: "Lifetime ranking based on all-time XP and long-term consistency." },
];

const tournamentFilters = ["Latest Friday Battle", "Previous Battle", "All Tournament History"];
const weeklyFilters = ["This Week", "Last Week"];
const monthlyFilters = ["This Month", "Last Month"];
const hallOfFameFilters = ["Lifetime XP", "Lifetime Tournament Wins", "Lifetime Badges"];
const subjectFilters = [
  "Constitution of Nepal",
  "General Knowledge",
  "Current Affairs",
  "IQ / Mental Ability",
  "Nepali",
  "English",
  "Governance Basics",
  "Public Administration Basics",
];

function normalizeExamTrack(value) {
  if (!value) return "Sakha Adhikrit";
  if (examTracks[value]?.name) return examTracks[value].name;

  const normalized = String(value).trim().toLowerCase();
  const match = Object.values(examTracks).find((track) => track.name.toLowerCase() === normalized || track.id === normalized);
  return match?.name || value;
}

function getSelectedExamTrack() {
  const user = getUser();
  const storedPreferences = (() => {
    try {
      return JSON.parse(localStorage.getItem("prepquest_user_preferences") || "{}");
    } catch {
      return {};
    }
  })();

  return normalizeExamTrack(
    localStorage.getItem("selectedExam")
      || localStorage.getItem("prepquest_selected_exam")
      || storedPreferences.selectedExam
      || user.selectedExam
      || user.examTrack
      || mockCurrentUser.examTrack
  );
}

function getSubjectStats(user, subject) {
  return user.subjectStats?.[subject] || {
    xp: Math.max(120, Math.round((user.weeklyXP || 0) * 0.45)),
    accuracy: user.accuracy || 0,
    questionsSolved: Math.max(30, Math.round((user.badges || 1) * 11)),
  };
}

function metricFor(user, rankingType, context = {}) {
  if (rankingType === "weekly") return user.weeklyXP || 0;
  if (rankingType === "monthly") return user.monthlyXP || 0;
  if (rankingType === "subject") return getSubjectStats(user, context.subjectFilter).xp;
  if (rankingType === "hallOfFame") {
    if (context.hallOfFameFilter === "Lifetime Tournament Wins") return user.tournamentWins || 0;
    if (context.hallOfFameFilter === "Lifetime Badges") return user.badges || 0;
    return user.lifetimeXP || 0;
  }
  if (rankingType === "examTrack") return user.examXP || user.weeklyXP || 0;
  return user.tournamentPoints || 0;
}

function buildRankedUsers(users, rankingType, context = {}) {
  return [...users]
    .sort((a, b) => metricFor(b, rankingType, context) - metricFor(a, rankingType, context) || a.name.localeCompare(b.name))
    .map((user, index) => ({ ...user, rank: index + 1 }));
}

function applyTimeFilter(user, rankingType, activeFilter) {
  if (rankingType === "weekly" && activeFilter === "Last Week") return { ...user, weeklyXP: Math.round(user.weeklyXP * 0.78) };
  if (rankingType === "monthly" && activeFilter === "Last Month") return { ...user, monthlyXP: Math.round(user.monthlyXP * 0.86) };
  if (rankingType === "tournament" && activeFilter === "Previous Battle") return { ...user, tournamentPoints: Math.round(user.tournamentPoints * 0.88) };
  if (rankingType === "tournament" && activeFilter === "All Tournament History") {
    return { ...user, tournamentPoints: user.tournamentPoints + (user.tournamentWins || 0) * 1200 };
  }
  return user;
}

function TrendIcon({ trend }) {
  if (trend === "up") return <FaArrowUp />;
  if (trend === "down") return <FaArrowDown />;
  return <FaEquals />;
}

function rewardForRank(user) {
  if (user.reward) return user.reward;
  if (user.rank === 1) return "500 coins + 500 XP";
  if (user.rank === 2) return "300 coins + 300 XP";
  if (user.rank === 3) return "150 coins + 200 XP";
  return "50 coins + 100 XP";
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function Leaderboard() {
  const navigate = useNavigate();
  const selectedExam = useMemo(() => getSelectedExamTrack(), []);
  const [selectedRankingType, setSelectedRankingType] = useState("tournament");
  const [tournamentFilter, setTournamentFilter] = useState("Latest Friday Battle");
  const [weeklyFilter, setWeeklyFilter] = useState("This Week");
  const [monthlyFilter, setMonthlyFilter] = useState("This Month");
  const [subjectFilter, setSubjectFilter] = useState("Constitution of Nepal");
  const [hallOfFameFilter, setHallOfFameFilter] = useState("Lifetime XP");
  const [tournamentType, setTournamentType] = useState(`${selectedExam} Friday Battle`);
  const [tournamentData, setTournamentData] = useState(null);
  const [tournamentError, setTournamentError] = useState("");

  const activeRanking = rankingTypes.find((type) => type.id === selectedRankingType);
  const examFilteredUsers = useMemo(
    () => mockLeaderboardUsers.filter((user) => user.examTrack === selectedExam),
    [selectedExam]
  );

  useEffect(() => {
    if (selectedRankingType !== "tournament") return;
    getLatestTournamentResults()
      .then((data) => {
        setTournamentData(data);
        setTournamentError("");
      })
      .catch((err) => {
        setTournamentData(null);
        setTournamentError(err.response?.data?.message || "Results will appear after the tournament finishes.");
      });
  }, [selectedRankingType, tournamentFilter]);

  const rows = useMemo(() => {
    if (selectedRankingType === "tournament") {
      if (!tournamentData?.leaderboard?.length) return [];
      return tournamentData.leaderboard.map((row) => ({
        id: row.userId,
        rank: row.rank,
        name: row.displayName,
        initials: row.displayName?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "PQ",
        examTrack: normalizeExamTrack(row.selectedExam),
        tournamentPoints: row.score,
        tournamentAccuracy: Math.round(((row.correctAnswers || 0) / 20) * 100),
        tournamentCorrectAnswers: row.correctAnswers,
        wrongAnswers: row.wrongAnswers,
        unanswered: row.unanswered,
        speedBonus: row.speedBonusTotal || 0,
        reward: row.result
          ? `${row.result.rewardCoins} coins + ${row.result.rewardXp} XP${row.result.badgeEarned ? ` + ${row.result.badgeEarned}` : ""}`
          : row.reward
            ? `${row.reward.rewardCoins} coins + ${row.reward.rewardXp} XP${row.reward.badgeEarned ? ` + ${row.reward.badgeEarned}` : ""}`
            : "Pending",
        isCurrentUser: row.isCurrentUser,
        trend: "same"
      }));
    }

    const context = { subjectFilter, hallOfFameFilter };
    const filteredUsers = examFilteredUsers.map((user) => {
      if (selectedRankingType === "weekly") return applyTimeFilter(user, "weekly", weeklyFilter);
      if (selectedRankingType === "monthly") return applyTimeFilter(user, "monthly", monthlyFilter);
      if (selectedRankingType === "tournament") return applyTimeFilter(user, "tournament", tournamentFilter);
      return user;
    });

    return buildRankedUsers(filteredUsers, selectedRankingType, context);
  }, [examFilteredUsers, hallOfFameFilter, monthlyFilter, selectedRankingType, subjectFilter, tournamentData, weeklyFilter]);

  const currentUser = rows.find((user) => user.isCurrentUser);
  const podium = rows.slice(0, 3);
  const isTournament = selectedRankingType === "tournament";

  const handlePrimaryCta = () => {
    navigate(isTournament ? "/tournament" : "/practice");
  };

  const renderSecondaryFilters = () => {
    if (selectedRankingType === "tournament") {
      return (
        <div className="secondary-filter-grid tournament-filter-grid">
          <div className="secondary-filter-row" aria-label="Tournament filters">
            {tournamentFilters.map((filter) => (
              <button className={`filter-option${tournamentFilter === filter ? " active" : ""}`} type="button" key={filter} onClick={() => setTournamentFilter(filter)}>
                {filter}
              </button>
            ))}
          </div>
          <label>
            <span>Tournament Type</span>
            <select value={tournamentType} onChange={(event) => setTournamentType(event.target.value)}>
              <option>{selectedExam} Friday Battle</option>
              <option>{selectedExam === "Sakha Adhikrit" ? "Nayab Subba" : "Sakha Adhikrit"} Friday Battle</option>
              <option>Mixed Loksewa Battle</option>
            </select>
          </label>
        </div>
      );
    }

    if (selectedRankingType === "weekly") {
      return (
        <div className="secondary-filter-row" aria-label="Weekly filters">
          {weeklyFilters.map((filter) => (
            <button className={`filter-option${weeklyFilter === filter ? " active" : ""}`} type="button" key={filter} onClick={() => setWeeklyFilter(filter)}>
              {filter}
            </button>
          ))}
        </div>
      );
    }

    if (selectedRankingType === "monthly") {
      return (
        <div className="secondary-filter-row" aria-label="Monthly filters">
          {monthlyFilters.map((filter) => (
            <button className={`filter-option${monthlyFilter === filter ? " active" : ""}`} type="button" key={filter} onClick={() => setMonthlyFilter(filter)}>
              {filter}
            </button>
          ))}
        </div>
      );
    }

    if (selectedRankingType === "subject") {
      return (
        <div className="secondary-filter-grid subject-filter-grid">
          <label>
            <span>Subject</span>
            <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}>
              {subjectFilters.map((subject) => <option key={subject}>{subject}</option>)}
            </select>
          </label>
        </div>
      );
    }

    if (selectedRankingType === "hallOfFame") {
      return (
        <div className="secondary-filter-row" aria-label="Hall of Fame filters">
          {hallOfFameFilters.map((filter) => (
            <button className={`filter-option${hallOfFameFilter === filter ? " active" : ""}`} type="button" key={filter} onClick={() => setHallOfFameFilter(filter)}>
              {filter}
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="scope-note">
        <strong>{selectedExam} Ranking</strong>
        <span>Current exam track ranking only by default.</span>
      </div>
    );
  };

  const renderSummaryStats = () => {
    if (isTournament) {
      const correctAnswers = currentUser?.tournamentCorrectAnswers || Math.round(((currentUser?.tournamentAccuracy || currentUser?.accuracy || 0) / 100) * 25);
      return (
        <>
          <span>Tournament Points <strong>{formatNumber(currentUser?.tournamentPoints)}</strong></span>
          <span>Correct Answers <strong>{correctAnswers}</strong></span>
          <span>Accuracy <strong>{currentUser?.tournamentAccuracy || currentUser?.accuracy || 0}%</strong></span>
          <span>Speed Bonus <strong>+{formatNumber(currentUser?.speedBonus)}</strong></span>
          <span>Reward <strong><RewardText text={rewardForRank(currentUser || {})} /></strong></span>
        </>
      );
    }

    if (selectedRankingType === "hallOfFame") {
      return (
        <>
          <span>Lifetime XP <strong>{formatNumber(currentUser?.lifetimeXP)}</strong></span>
          <span>Badges <strong>{currentUser?.badges || 0}</strong></span>
          <span>Tournament Wins <strong>{currentUser?.tournamentWins || 0}</strong></span>
          <span>Longest Streak <strong>{currentUser?.longestStreak || currentUser?.streak || 0} days</strong></span>
        </>
      );
    }

    const subjectStats = currentUser ? getSubjectStats(currentUser, subjectFilter) : null;
    if (selectedRankingType === "subject") {
      return (
        <>
          <span>Subject XP <strong>{formatNumber(subjectStats?.xp)} XP</strong></span>
          <span>Accuracy <strong>{subjectStats?.accuracy || 0}%</strong></span>
          <span>Questions Solved <strong>{subjectStats?.questionsSolved || 0}</strong></span>
          <span>Badges <strong>{currentUser?.badges || 0}</strong></span>
        </>
      );
    }

    const xpLabel = selectedRankingType === "monthly" ? "Monthly XP" : selectedRankingType === "examTrack" ? "Exam XP" : "Weekly XP";
    return (
      <>
        <span>{xpLabel} <strong>{formatNumber(metricFor(currentUser || {}, selectedRankingType))} XP</strong></span>
        <span>Accuracy <strong>{currentUser?.accuracy || 0}%</strong></span>
        <span>Streak <strong>{currentUser?.streak || 0} days</strong></span>
        <span>Badges <strong>{currentUser?.badges || 0}</strong></span>
      </>
    );
  };

  const renderTable = () => {
    if (!rows.length) {
      return (
        <div className="leaderboard-empty-state">
          <p>
            {isTournament
              ? tournamentError || "Results will appear after the tournament finishes."
              : "No ranking data yet for this filter. Start practicing to appear on the leaderboard."}
          </p>
          <button className="btn" type="button" onClick={handlePrimaryCta}>{isTournament ? "View Tournament" : "Start Practice"}</button>
        </div>
      );
    }

    if (isTournament) {
      return (
        <div className="leaderboard-table tournament-table">
          <div className="leaderboard-table-head">
            <span>Rank</span><span>Learner</span><span>Exam Track</span><span>Points</span><span>Correct</span><span>Wrong</span><span>Unanswered</span><span>Speed Bonus</span><span>Reward</span>
          </div>
          {rows.map((user) => (
            <div className={`leaderboard-table-row${user.isCurrentUser ? " current-user" : ""}`} key={user.id}>
              <span className={`rank-badge rank-${user.rank <= 3 ? user.rank : "default"}`}>#{user.rank}</span>
              <span className="learner-cell"><span className="mini-avatar">{user.initials}</span><span><strong>{user.name}</strong>{user.isCurrentUser ? <em>You</em> : null}</span></span>
              <span>{user.examTrack}</span>
              <strong>{formatNumber(user.tournamentPoints)}</strong>
              <span>{user.tournamentCorrectAnswers || 0}</span>
              <span>{user.wrongAnswers || 0}</span>
              <span>{user.unanswered || 0}</span>
              <span>+{formatNumber(user.speedBonus)}</span>
              <span><RewardText text={rewardForRank(user)} /></span>
            </div>
          ))}
        </div>
      );
    }

    if (selectedRankingType === "subject") {
      return (
        <div className="leaderboard-table subject-table">
          <div className="leaderboard-table-head">
            <span>Rank</span><span>Learner</span><span>Subject</span><span>Subject XP</span><span>Accuracy</span><span>Questions Solved</span><span>Trend</span>
          </div>
          {rows.map((user) => {
            const stats = getSubjectStats(user, subjectFilter);
            return (
              <div className={`leaderboard-table-row${user.isCurrentUser ? " current-user" : ""}`} key={user.id}>
                <span className={`rank-badge rank-${user.rank <= 3 ? user.rank : "default"}`}>#{user.rank}</span>
                <span className="learner-cell"><span className="mini-avatar">{user.initials}</span><span><strong>{user.name}</strong>{user.isCurrentUser ? <em>You</em> : null}</span></span>
                <span>{subjectFilter}</span>
                <strong>{formatNumber(stats.xp)} XP</strong>
                <span>{stats.accuracy}%</span>
                <span>{stats.questionsSolved}</span>
                <span className={`trend ${user.trend}`}><TrendIcon trend={user.trend} /></span>
              </div>
            );
          })}
        </div>
      );
    }

    if (selectedRankingType === "hallOfFame") {
      return (
        <div className="leaderboard-table hall-table">
          <div className="leaderboard-table-head">
            <span>Rank</span><span>Learner</span><span>Exam Track</span><span>Lifetime XP</span><span>Badges</span><span>Tournament Wins</span><span>Streak</span><span>Trend</span>
          </div>
          {rows.map((user) => (
            <div className={`leaderboard-table-row${user.isCurrentUser ? " current-user" : ""}`} key={user.id}>
              <span className={`rank-badge rank-${user.rank <= 3 ? user.rank : "default"}`}>#{user.rank}</span>
              <span className="learner-cell"><span className="mini-avatar">{user.initials}</span><span><strong>{user.name}</strong>{user.isCurrentUser ? <em>You</em> : null}</span></span>
              <span>{user.examTrack}</span>
              <strong>{formatNumber(user.lifetimeXP)} XP</strong>
              <span>{user.badges}</span>
              <span>{user.tournamentWins || 0}</span>
              <span>{user.longestStreak || user.streak} days</span>
              <span className={`trend ${user.trend}`}><TrendIcon trend={user.trend} /></span>
            </div>
          ))}
        </div>
      );
    }

    const xpHeading = selectedRankingType === "monthly" ? "Monthly XP" : selectedRankingType === "examTrack" ? "Exam XP" : "XP";
    return (
      <div className="leaderboard-table">
        <div className="leaderboard-table-head">
          <span>Rank</span><span>Learner</span><span>Exam Track</span><span>{xpHeading}</span><span>Accuracy</span><span>Streak</span><span>Badges</span><span>Trend</span>
        </div>
        {rows.map((user) => (
          <div className={`leaderboard-table-row${user.isCurrentUser ? " current-user" : ""}`} key={user.id}>
            <span className={`rank-badge rank-${user.rank <= 3 ? user.rank : "default"}`}>#{user.rank}</span>
            <span className="learner-cell"><span className="mini-avatar">{user.initials}</span><span><strong>{user.name}</strong>{user.isCurrentUser ? <em>You</em> : null}</span></span>
            <span>{user.examTrack}</span>
            <strong>{formatNumber(metricFor(user, selectedRankingType))} XP</strong>
            <span>{user.accuracy}%</span>
            <span>{user.streak} days</span>
            <span>{user.badges}</span>
            <span className={`trend ${user.trend}`}><TrendIcon trend={user.trend} /></span>
          </div>
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
            <p>Compare Friday Battle performance, weekly progress, subjects, and lifetime consistency.</p>
          </div>
          <div className="header-right">
            <div className="header-chips">
              <span className="chip"><FaFire /> Friday Battle</span>
              <span className="chip"><FaMedal /> {selectedExam} only</span>
              <span className="chip"><FaShieldAlt /> Privacy-safe ranking</span>
            </div>
          </div>
        </header>

        <section className="dashboard-card leaderboard-rank-summary">
          <div className="rank-main">
            <p className="eyebrow">{isTournament ? "My Tournament Rank" : selectedRankingType === "hallOfFame" ? "My Hall of Fame Rank" : `My ${activeRanking.label} Rank`}</p>
            <div className="rank-number">{currentUser ? `#${currentUser.rank}` : "-"}</div>
            <div>
              <strong>{selectedExam}</strong>
              <span>{isTournament ? `Friday Loksewa Battle ranking for ${selectedExam} aspirants only.` : `Ranking for ${selectedExam} aspirants only.`}</span>
            </div>
          </div>
          <div className="leaderboard-summary-grid">{renderSummaryStats()}</div>
          <button className="btn rank-cta" type="button" onClick={handlePrimaryCta}>
            {isTournament ? "View Tournament Details" : "Practice Weak Subject"}
          </button>
        </section>

        <section className="leaderboard-podium-grid" aria-label="Top 3 learners">
          {podium.map((user) => {
            const subjectStats = getSubjectStats(user, subjectFilter);
            return (
              <article className={`podium-card rank-${user.rank}`} key={user.id}>
                <div className="podium-rank"><FaTrophy /> #{user.rank}</div>
                <div className="leader-avatar">{user.initials}</div>
                <div>
                  <h2>{user.name}</h2>
                  <p>{user.examTrack}</p>
                </div>
                <strong>
                  {isTournament
                    ? `${formatNumber(user.tournamentPoints)} points - ${user.tournamentAccuracy || user.accuracy}%`
                    : selectedRankingType === "subject"
                      ? `${formatNumber(subjectStats.xp)} XP - ${subjectStats.accuracy}%`
                      : `${formatNumber(metricFor(user, selectedRankingType, { hallOfFameFilter }))} ${selectedRankingType === "hallOfFame" ? "lifetime" : "XP"} - ${user.accuracy}%`}
                </strong>
                {isTournament ? <span className="podium-reward">Reward: <RewardText text={rewardForRank(user)} /></span> : null}
              </article>
            );
          })}
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
                onClick={() => setSelectedRankingType(type.id)}
              >
                {type.label}
              </button>
            ))}
          </div>
          {renderSecondaryFilters()}
        </section>

        {isTournament ? (
          <section className="dashboard-card tournament-cta-card">
            <div>
              <h2>Friday Loksewa Battle</h2>
              <p>Compete every Friday with learners from your exam track. Answer timed questions, earn speed bonuses, and win XP, coins, and badges.</p>
            </div>
            <div className="tournament-rewards">
              <span><b>1st</b> <RewardDisplay coins={500} xp={500} /></span>
              <span><b>2nd</b> <RewardDisplay coins={300} xp={300} /></span>
              <span><b>3rd</b> <RewardDisplay coins={150} xp={200} /></span>
              <span><b>Everyone</b> <RewardDisplay coins={50} xp={100} /></span>
            </div>
            <button className="btn tournament-cta-button" type="button" onClick={() => navigate("/tournament")}>View Tournament</button>
          </section>
        ) : null}

        <section className="dashboard-card leaderboard-table-card">
          <div className="card-heading">
            <h2 className="card-title"><FaMedal /> Full Leaderboard</h2>
            <span className="status-chip">{selectedExam} - {selectedRankingType === "subject" ? subjectFilter : activeRanking.label}</span>
          </div>
          {renderTable()}
        </section>

        <p className="privacy-note">Leaderboard shows only learners from your selected exam track. Display names are used for privacy-safe ranking.</p>
      </section>
    </DashboardLayout>
  );
}

export default Leaderboard;
