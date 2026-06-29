import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaBookOpen, FaFire, FaMedal, FaShieldAlt, FaStar } from "react-icons/fa";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import LeaderboardProfilePanel from "../components/leaderboard/LeaderboardProfilePanel";
import { CoinIcon } from "../components/common/Coin";
import { useAuth } from "../context/AuthContext";
import { examTracks } from "../data/examTracks";
import { getLatestTournamentResults } from "../services/tournamentService";
import { getCurrentStreak } from "../utils/dailyQuizUtils";
import { getEarnedBadges, syncBadges } from "../utils/badgeUtils";
import {
  buildSubjectCardData,
  getExamSubjects,
  getNormalizedSubjectProgress,
  normalizeExamId,
} from "../utils/practiceUtils";
import { getProfileOverrides } from "../utils/profileUtils";
import { getTournamentAttempts, mirrorTournamentResult } from "../utils/tournamentUtils";
import { calculateTotalXPFromTransactions, getOverallRankProgress, getXPTransactions } from "../utils/xpUtils";
import CupImage from "../assets/level/tournamentcup-transparent.png";
import "./Leaderboard.css";

const DAY_MS = 24 * 60 * 60 * 1000;

function getInitials(name) {
  return String(name || "").trim().split(/\s+/).map((part) => part[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "ME";
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

// Account "Level" derived from lifetime XP (no separate level field exists).
function deriveLevel(xp) {
  return Math.max(1, Math.floor((Number(xp) || 0) / 1300) + 1);
}

const rankingTypes = [
  { id: "tournament", label: "Tournament", description: "Ranking based on Friday Loksewa Battle performance." },
  { id: "weekly", label: "Weekly", description: "Ranking by XP earned over the last 7 days." },
  { id: "monthly", label: "Monthly", description: "Ranking by XP earned over the last 30 days." },
  { id: "subject", label: "Subject-wise", description: "Ranking by subject XP, accuracy, and solved questions." },
  { id: "examTrack", label: "Exam Track", description: "Ranking by total XP within the exam track." },
  { id: "hallOfFame", label: "Hall of Fame", description: "Lifetime XP, badges, and long-term consistency." },
];

// Podium rewards are awarded by finishing position (matches the Friday Battle
// reward table) so they stay correct even when the source row carries no
// `reward` field (e.g. live tournament rows from the backend).
const podiumRewards = {
  1: { coins: 500, xp: 500, title: "Gold Champion" },
  2: { coins: 300, xp: 300, title: "Silver Champion" },
  3: { coins: 150, xp: 200, title: "Bronze Champion" },
};

const weeklyFilters = ["This Week", "Last Week"];
const monthlyFilters = ["This Month", "Last Month"];
const hallOfFameFilters = ["Lifetime XP", "Lifetime Tournament Wins", "Lifetime Badges"];

function xpInWindow(transactions, fromDaysAgo, toDaysAgo) {
  const now = Date.now();
  const olderBound = now - fromDaysAgo * DAY_MS;
  const newerBound = now - toDaysAgo * DAY_MS;
  return transactions.reduce((sum, transaction) => {
    const ts = new Date(transaction.createdAt).getTime();
    if (Number.isNaN(ts) || ts <= olderBound || ts > newerBound) return sum;
    return sum + (Number(transaction.amount) || 0);
  }, 0);
}

function Leaderboard() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [selectedRankingType, setSelectedRankingType] = useState("tournament");
  const [weeklyFilter, setWeeklyFilter] = useState("This Week");
  const [monthlyFilter, setMonthlyFilter] = useState("This Month");
  const [hallOfFameFilter, setHallOfFameFilter] = useState("Lifetime XP");
  const [tournamentData, setTournamentData] = useState(null);
  const [tournamentLoadError, setTournamentLoadError] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // ---- Real current-user profile from local progress (your row is always real)
  const me = useMemo(() => {
    const realName = authUser?.fullName || authUser?.name || localStorage.getItem("userName") || "You";
    const examId = normalizeExamId(localStorage.getItem("selectedExam") || "sakha-adhikrit");
    const examLabel = examTracks[examId]?.name || "Sakha Adhikrit";
    const subjectProgress = getNormalizedSubjectProgress();
    const subjectCards = getExamSubjects(examId).map((subject) =>
      buildSubjectCardData(subject, subjectProgress, examId)
    );
    const totalCorrect = subjectCards.reduce((sum, s) => sum + (s.progress.correctAnswers || 0), 0);
    const totalWrong = subjectCards.reduce((sum, s) => sum + (s.progress.wrongAnswers || 0), 0);
    const totalAttempted = totalCorrect + totalWrong;
    const overallAccuracy = totalAttempted ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
    const transactions = getXPTransactions();
    const totalXp = calculateTotalXPFromTransactions();
    const rankProgress = getOverallRankProgress(totalXp);

    const subjectStats = {};
    subjectCards.forEach((card) => {
      subjectStats[card.name] = {
        xp: card.progress.xp || 0,
        accuracy: Number.isFinite(card.accuracy) ? card.accuracy : null,
        questionsSolved: card.progress.questionsSolved || 0,
      };
    });

    const attempts = getTournamentAttempts();
    const bestAttempt = [...attempts].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))[0] || null;

    return {
      id: "me",
      isCurrentUser: true,
      name: realName,
      initials: getInitials(realName),
      examTrack: examLabel,
      avatarUrl: getProfileOverrides().avatarImage || "",
      weeklyXP: xpInWindow(transactions, 7, 0),
      lastWeekXP: xpInWindow(transactions, 14, 7),
      monthlyXP: xpInWindow(transactions, 30, 0),
      lastMonthXP: xpInWindow(transactions, 60, 30),
      lifetimeXP: totalXp,
      totalXP: totalXp,
      examXP: totalXp,
      tournamentPoints: bestAttempt?.totalScore || 0,
      tournamentAccuracy: bestAttempt && bestAttempt.totalQuestions
        ? Math.round(((bestAttempt.correctAnswers || 0) / bestAttempt.totalQuestions) * 100)
        : overallAccuracy,
      accuracy: overallAccuracy,
      streak: getCurrentStreak(),
      badges: getEarnedBadges(syncBadges()).length,
      earnedBadges: getEarnedBadges(syncBadges()),
      tournamentWins: attempts.filter((a) => a.rank === 1).length,
      level: rankProgress.level,
      rankTitle: rankProgress.currentRank,
      hasPlayedTournament: attempts.length > 0,
      bestAttempt,
      subjectStats,
      subjects: subjectCards.map((c) => c.name),
      about: `Dedicated ${examLabel} learner building progress on PrepQuest Nepal.`,
    };
  }, [authUser]);

  const selectedExam = me.examTrack;
  const [subjectFilter, setSubjectFilter] = useState(() => me.subjects[0] || "");
  useEffect(() => {
    if (!me.subjects.includes(subjectFilter)) setSubjectFilter(me.subjects[0] || "");
  }, [me.subjects, subjectFilter]);

  const activeRanking = rankingTypes.find((type) => type.id === selectedRankingType);
  const isTournament = selectedRankingType === "tournament";

  // Real users only. This prototype stores a single real account locally (the
  // logged-in user). No seeded/demo competitors are ever shown — every ranking
  // is derived from real saved progress. If/when a real multi-user store exists
  // it can be merged into this list; until then it is just the current user.
  const realUsers = useMemo(() => [me], [me]);

  // Whether the current ranking tab has any real data for a given user. Used to
  // keep ineligible users off a tab (and to drive honest empty states) instead
  // of padding the table with fake rows.
  const isEligibleForTab = (user) => {
    if (!user) return false;
    switch (selectedRankingType) {
      case "weekly":
        return (weeklyFilter === "Last Week" ? user.lastWeekXP : user.weeklyXP) > 0;
      case "monthly":
        return (monthlyFilter === "Last Month" ? user.lastMonthXP : user.monthlyXP) > 0;
      case "subject": {
        const stats = user.subjectStats?.[subjectFilter];
        return (stats?.xp || 0) > 0 || (stats?.questionsSolved || 0) > 0;
      }
      case "examTrack":
        return (user.examXP || user.totalXP || 0) > 0;
      case "hallOfFame":
        if (hallOfFameFilter === "Lifetime Tournament Wins") return (user.tournamentWins || 0) > 0;
        if (hallOfFameFilter === "Lifetime Badges") return (user.badges || 0) > 0;
        return (user.lifetimeXP || 0) > 0;
      default:
        return false; // tournament handled separately
    }
  };

  // Load the latest completed tournament's real results on mount (not only when
  // the Tournament tab is open) so the hero "My Tournament Rank" block and the
  // tab both reflect the real backend final results immediately after playing.
  useEffect(() => {
    let cancelled = false;
    getLatestTournamentResults()
      .then((data) => {
        if (cancelled) return;
        // Mirror the real backend result into the badge store so tournament
        // badges award from real results (backend stays the source of truth).
        if (mirrorTournamentResult(data)) syncBadges();
        setTournamentData(data);
        setTournamentLoadError(false);
      })
      .catch(() => {
        if (cancelled) return;
        setTournamentData(null);
        setTournamentLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The current user's real row in the latest tournament's final results (the
  // authoritative "did I play / what was my rank" signal for the live system).
  const tournamentQuestionCount = tournamentData?.tournament?.questionCount || 20;
  const myTournamentRow = tournamentData?.leaderboard?.find((row) => row.isCurrentUser) || null;
  // Public final results exist for everyone, independent of whether the current
  // user took part (a brand-new account still sees the public board).
  const publicResultsExist = Boolean(tournamentData?.leaderboard?.length);
  // Played if the backend final results include us, OR (legacy/offline) a local
  // attempt exists.
  const playedTournament = Boolean(myTournamentRow) || me.hasPlayedTournament;
  const myTournamentRank = myTournamentRow?.rank ?? (me.hasPlayedTournament ? me.bestAttempt?.rank : null);
  const myTournamentPoints = myTournamentRow?.score ?? me.tournamentPoints ?? 0;
  const myTournamentAccuracy = myTournamentRow
    ? Math.round(((myTournamentRow.correctAnswers || 0) / tournamentQuestionCount) * 100)
    : me.tournamentAccuracy;

  const metricFor = (user) => {
    if (!user) return 0;
    if (selectedRankingType === "weekly") return weeklyFilter === "Last Week" ? user.lastWeekXP || 0 : user.weeklyXP || 0;
    if (selectedRankingType === "monthly") return monthlyFilter === "Last Month" ? user.lastMonthXP || 0 : user.monthlyXP || 0;
    if (selectedRankingType === "subject") return user.subjectStats?.[subjectFilter]?.xp || 0;
    if (selectedRankingType === "examTrack") return user.examXP || user.lifetimeXP || 0;
    if (selectedRankingType === "hallOfFame") {
      if (hallOfFameFilter === "Lifetime Tournament Wins") return user.tournamentWins || 0;
      if (hallOfFameFilter === "Lifetime Badges") return user.badges || 0;
      return user.lifetimeXP || 0;
    }
    return user.tournamentPoints || 0; // tournament
  };

  const rows = useMemo(() => {
    // --- Tournament: real final results. Once a Friday battle is completed its
    // leaderboard is public, so we show the real backend results whenever they
    // exist (this is the authoritative source for the live tournament). The
    // current user's row is flagged via row.isCurrentUser. ---
    if (isTournament) {
      if (tournamentData?.leaderboard?.length) {
        return tournamentData.leaderboard.map((row) => ({
          id: row.userId,
          rank: row.rank,
          name: row.displayName,
          initials: getInitials(row.displayName),
          examTrack: examTracks[normalizeExamId(row.selectedExam)]?.name || me.examTrack,
          tournamentPoints: row.score || 0,
          displayPoints: row.score || 0,
          accuracy: Math.round(((row.correctAnswers || 0) / tournamentQuestionCount) * 100),
          level: deriveLevel(row.score),
          badges: row.isCurrentUser ? me.badges : 0,
          earnedBadges: row.isCurrentUser ? me.earnedBadges : [],
          totalXP: row.score || 0,
          lifetimeXP: row.score || 0,
          isCurrentUser: row.isCurrentUser,
          avatarUrl: row.isCurrentUser ? me.avatarUrl : "",
          topPercent: row.rank ? Math.max(1, Math.round((row.rank / tournamentData.leaderboard.length) * 100)) : 100,
          about: row.isCurrentUser ? me.about : "This learner is building progress on PrepQuest Nepal.",
        }));
      }
      // No backend list, but a legacy/offline local attempt exists — show it.
      if (me.hasPlayedTournament) {
        return [{ ...me, rank: me.bestAttempt?.rank || 1, displayPoints: me.tournamentPoints, accuracy: me.tournamentAccuracy, topPercent: 100 }];
      }
      return [];
    }

    // --- Other tabs: only real users with real data for this tab. ---
    const eligible = realUsers.filter(isEligibleForTab);
    const ranked = [...eligible]
      .sort(
        (a, b) =>
          metricFor(b) - metricFor(a) ||            // primary: ranking score
          (b.accuracy || 0) - (a.accuracy || 0) ||  // tie-break: accuracy
          (b.lifetimeXP || 0) - (a.lifetimeXP || 0) // tie-break: lifetime XP
      )
      .map((user, index) => ({ ...user, rank: index + 1 }));
    const total = ranked.length || 1;
    return ranked.map((user) => ({
      ...user,
      displayPoints: metricFor(user),
      topPercent: Math.max(1, Math.round((user.rank / total) * 100)),
    }));
  }, [isTournament, tournamentData, me, realUsers, selectedRankingType, weeklyFilter, monthlyFilter, subjectFilter, hallOfFameFilter]);

  const myRow = rows.find((user) => user.isCurrentUser);
  // Podium reordered so #1 sits in the centre (#2 left, #1 centre, #3 right).
  const podium = (() => {
    const top = rows.slice(0, 3);
    if (top.length < 3) return top;
    return [top[1], top[0], top[2]];
  })();

  const handleViewProfile = (user) => setSelectedProfile(user);
  const closeProfile = () => setSelectedProfile(null);
  const goToTournament = () => navigate("/tournament");

  // Honest, tab-specific empty states (no fake rows are ever shown instead).
  const getEmptyState = () => {
    switch (selectedRankingType) {
      case "tournament":
        // Reached only when there are no public results to show. Distinguish a
        // backend/connection failure from a genuinely empty board.
        if (tournamentLoadError) {
          return { title: "Unable to load tournament results right now.", body: "Please check your connection or try again later.", cta: { label: "Retry", action: () => window.location.reload() } };
        }
        return { title: "No tournament results yet.", body: "Rankings will appear after learners complete the Friday Loksewa Battle.", cta: { label: "Go to Tournament", action: goToTournament } };
      case "weekly":
        return { title: "No weekly ranking yet.", body: "Complete quizzes, practice sessions, or mock tests this week to appear here.", cta: { label: "Start Practice", action: () => navigate("/practice") } };
      case "monthly":
        return { title: "No monthly ranking yet.", body: "Earn XP this month to appear on the monthly leaderboard.", cta: { label: "Start Practice", action: () => navigate("/practice") } };
      case "subject":
        return { title: "No subject-wise ranking yet.", body: `Practice ${subjectFilter || "this subject"} to unlock your subject leaderboard position.`, cta: { label: "Practice Subject", action: () => navigate("/practice") } };
      case "examTrack":
        return { title: "No ranking yet for this exam track.", body: "Your real progress will appear here as you earn XP.", cta: { label: "Start Practice", action: () => navigate("/practice") } };
      case "hallOfFame":
        return { title: "No Hall of Fame ranking yet.", body: "Long-term rankings will appear as you build total XP.", cta: { label: "Start Practice", action: () => navigate("/practice") } };
      default:
        return { title: "No ranking data yet.", body: "Start practicing to build your real stats.", cta: { label: "Start Practice", action: () => navigate("/practice") } };
    }
  };

  const renderSecondaryFilters = () => {
    if (selectedRankingType === "weekly") {
      return (
        <div className="secondary-filter-row" aria-label="Weekly filters">
          {weeklyFilters.map((filter) => (
            <button className={`filter-option${weeklyFilter === filter ? " active" : ""}`} type="button" key={filter} onClick={() => setWeeklyFilter(filter)}>{filter}</button>
          ))}
        </div>
      );
    }
    if (selectedRankingType === "monthly") {
      return (
        <div className="secondary-filter-row" aria-label="Monthly filters">
          {monthlyFilters.map((filter) => (
            <button className={`filter-option${monthlyFilter === filter ? " active" : ""}`} type="button" key={filter} onClick={() => setMonthlyFilter(filter)}>{filter}</button>
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
              {me.subjects.map((subject) => <option key={subject}>{subject}</option>)}
            </select>
          </label>
        </div>
      );
    }
    if (selectedRankingType === "hallOfFame") {
      return (
        <div className="secondary-filter-row" aria-label="Hall of Fame filters">
          {hallOfFameFilters.map((filter) => (
            <button className={`filter-option${hallOfFameFilter === filter ? " active" : ""}`} type="button" key={filter} onClick={() => setHallOfFameFilter(filter)}>{filter}</button>
          ))}
        </div>
      );
    }
    return (
      <div className="scope-note">
        <strong>{activeRanking.label} Ranking</strong>
        <span>{activeRanking.description}</span>
      </div>
    );
  };

  const ViewButton = ({ user }) => (
    <button className="view-profile-btn" type="button" onClick={() => handleViewProfile(user)}>View Profile</button>
  );

  const LearnerCell = ({ user }) => (
    <span className="learner-cell">
      <span className="mini-avatar">{user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : user.initials}</span>
      <span><strong>{user.name}</strong>{user.isCurrentUser ? <em>You</em> : null}</span>
    </span>
  );

  const renderTable = () => {
    if (!rows.length) {
      const empty = getEmptyState();
      return (
        <div className="leaderboard-empty-state">
          <span className="leaderboard-empty-icon"><FaMedal /></span>
          <strong className="leaderboard-empty-title">{empty.title}</strong>
          <p>{empty.body}</p>
          {empty.cta ? (
            <button className="btn" type="button" onClick={empty.cta.action}>{empty.cta.label}</button>
          ) : null}
        </div>
      );
    }

    if (selectedRankingType === "subject") {
      return (
        <div className="leaderboard-table subject-table">
          <div className="leaderboard-table-head">
            <span>Rank</span><span>Learner</span><span>Subject</span><span>Subject XP</span><span>Accuracy</span><span>Solved</span><span>View</span>
          </div>
          {rows.map((user) => {
            const stats = user.subjectStats?.[subjectFilter] || { xp: 0, accuracy: null, questionsSolved: 0 };
            return (
              <div className={`leaderboard-table-row${user.isCurrentUser ? " current-user" : ""}`} key={user.id}>
                <span className={`rank-badge rank-${user.rank <= 3 ? user.rank : "default"}`}>#{user.rank}</span>
                <LearnerCell user={user} />
                <span>{subjectFilter}</span>
                <strong>{formatNumber(stats.xp)} XP</strong>
                <span>{Number.isFinite(stats.accuracy) ? `${stats.accuracy}%` : "Not Started"}</span>
                <span>{stats.questionsSolved}</span>
                <span><ViewButton user={user} /></span>
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
            <span>Rank</span><span>Learner</span><span>Exam Track</span><span>Lifetime XP</span><span>Badges</span><span>Wins</span><span>Streak</span><span>View</span>
          </div>
          {rows.map((user) => (
            <div className={`leaderboard-table-row${user.isCurrentUser ? " current-user" : ""}`} key={user.id}>
              <span className={`rank-badge rank-${user.rank <= 3 ? user.rank : "default"}`}>#{user.rank}</span>
              <LearnerCell user={user} />
              <span>{user.examTrack}</span>
              <strong>{formatNumber(user.lifetimeXP)} XP</strong>
              <span>{user.badges}</span>
              <span>{user.tournamentWins || 0}</span>
              <span>{user.streak || 0}d</span>
              <span><ViewButton user={user} /></span>
            </div>
          ))}
        </div>
      );
    }

    const pointsHeading = isTournament ? "Points" : selectedRankingType === "monthly" ? "Monthly XP" : selectedRankingType === "examTrack" ? "Exam XP" : selectedRankingType === "weekly" ? "Weekly XP" : "Points";
    return (
      <div className="leaderboard-table standard-table">
        <div className="leaderboard-table-head">
          <span>Rank</span><span>Learner</span><span>Exam Track</span><span>{pointsHeading}</span><span>Accuracy</span><span>Level</span><span>Badges</span><span>View</span>
        </div>
        {rows.map((user) => (
          <div className={`leaderboard-table-row${user.isCurrentUser ? " current-user" : ""}`} key={user.id}>
            <span className={`rank-badge rank-${user.rank <= 3 ? user.rank : "default"}`}>#{user.rank}</span>
            <LearnerCell user={user} />
            <span>{user.examTrack}</span>
            <strong>{formatNumber(metricFor(user))}</strong>
            <span>{user.accuracy || 0}%</span>
            <span className="level-pill">Lv {user.level || 1}</span>
            <span className="badge-cell"><FaMedal /> {user.badges || 0}</span>
            <span><ViewButton user={user} /></span>
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
            <p>Track your ranking, earn XP, and rise to the top.</p>
          </div>
          <div className="header-right">
            <div className="header-chips">
              <span className="chip"><FaFire /> Friday Battle</span>
              <span className="chip"><FaMedal /> {selectedExam}</span>
              <span className="chip"><FaShieldAlt /> Privacy-safe ranking</span>
            </div>
          </div>
        </header>

        {/* Tournament rank + exam track + CTA + trophy banner */}
        <section className="dashboard-card leaderboard-rank-banner">
          <div className="rank-zone rank-main">
            <p className="eyebrow">My Tournament Rank</p>
            <div className="rank-main-row">
              <span className="rank-circle">{playedTournament && myTournamentRank ? `#${myTournamentRank}` : "—"}</span>
              <span className="rank-main-text">
                <strong>
                  {playedTournament
                    ? `${formatNumber(myTournamentPoints)} points`
                    : publicResultsExist
                    ? "You haven't joined yet"
                    : "You haven't played yet"}
                </strong>
                <span>
                  {playedTournament
                    ? `${myTournamentAccuracy}% accuracy`
                    : publicResultsExist
                    ? "Final public rankings are shown below. Join the next Friday Loksewa Battle to appear on the board."
                    : "Take the Friday Loksewa Battle and start your climb!"}
                </span>
              </span>
            </div>
          </div>

          <div className="rank-zone rank-exam">
            <span className="rank-exam-icon"><FaBookOpen /></span>
            <span className="rank-exam-text">
              <p className="eyebrow">Exam Track</p>
              <strong className="rank-banner-exam">{selectedExam}</strong>
            </span>
          </div>

          <div className="rank-zone rank-cta-zone">
            <p className="rank-banner-tagline">Every question you answer brings you closer to the top!</p>
            <button className="btn rank-cta" type="button" onClick={goToTournament}>View Tournament Details <FaArrowRight /></button>
          </div>

          <div className="rank-banner-cup" aria-hidden="true">
            <span className="cup-glow" />
            <img className="tournament-cup-img" src={CupImage} alt="" />
          </div>
        </section>

        {/* Top 3 leaders */}
        {podium.length ? (
          <section className="leaderboard-podium-grid" aria-label="Top learners">
            {podium.map((user) => {
              const reward = podiumRewards[user.rank] || podiumRewards[3];
              const score = isTournament ? (user.tournamentPoints || 0) : metricFor(user);
              const accuracy = isTournament ? user.tournamentAccuracy : user.accuracy;
              return (
                <article className={`podium-card rank-${user.rank}`} key={user.id}>
                  <div className={`podium-rank-circle rank-${user.rank}`}>{user.rank}</div>
                  <div className="leader-avatar">{user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : user.initials}</div>
                  <div className="podium-name">
                    <h2>{user.name}</h2>
                    <p>{user.examTrack}</p>
                  </div>
                  <strong className="podium-score">
                    {formatNumber(score)} {isTournament ? "points" : "XP"}{accuracy ? ` · ${accuracy}%` : ""}
                  </strong>
                  <div className="podium-rewards">
                    {isTournament ? (
                      <>
                        <span className="reward-pill"><CoinIcon size="xs" /> {reward.coins}</span>
                        <span className="reward-pill"><FaStar className="reward-star" /> {reward.xp} XP</span>
                        <span className="reward-pill champion">{reward.title}</span>
                      </>
                    ) : (
                      <span className="reward-pill champion">Rank #{user.rank}</span>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        ) : null}

        {/* Ranking tabs */}
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

        {/* Full leaderboard table — splits into table + inline profile panel
            (beside the table, in this same section) when a profile is open. */}
        <section className="dashboard-card leaderboard-table-card">
          <div className="card-heading">
            <h2 className="card-title"><FaMedal /> Full Leaderboard</h2>
            <span className="status-chip">{selectedRankingType === "subject" ? subjectFilter : activeRanking.label}{myRow ? ` · You are #${myRow.rank}` : ""}</span>
          </div>
          <div className={`leaderboard-table-body${selectedProfile ? " profile-open" : ""}`}>
            <div className="leaderboard-table-main">
              {renderTable()}
              <p className="privacy-note">
                Your row reflects your real saved progress. Other learners are shown for ranking context and only public,
                privacy-safe details are displayed.
              </p>
            </div>
            {selectedProfile ? (
              <LeaderboardProfilePanel user={selectedProfile} onClose={closeProfile} />
            ) : null}
          </div>
        </section>
      </section>
    </DashboardLayout>
  );
}

export default Leaderboard;
