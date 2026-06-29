import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaBookOpen, FaFire, FaMedal, FaShieldAlt, FaStar } from "react-icons/fa";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import LeaderboardProfilePanel from "../components/leaderboard/LeaderboardProfilePanel";
import { CoinIcon } from "../components/common/Coin";
import { useAuth } from "../context/AuthContext";
import { examTracks } from "../data/examTracks";
import { getPreferredLanguage, t, translateExamName, translateSubjectName, formatYouAreRank, formatRankHash, formatPracticeToUnlock } from "../data/translations";
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
  { id: "tournament", labelKey: "tournament", descKey: "tournamentRankDesc" },
  { id: "weekly", labelKey: "weekly", descKey: "weeklyRankDesc" },
  { id: "monthly", labelKey: "monthly", descKey: "monthlyRankDesc" },
  { id: "subject", labelKey: "subjectWise", descKey: "subjectRankDesc" },
  { id: "examTrack", labelKey: "examTrack", descKey: "examTrackRankDesc" },
  { id: "hallOfFame", labelKey: "hallOfFame", descKey: "hallOfFameRankDesc" },
];

// Maps the internal English filter values (kept as state keys) to translation keys.
const FILTER_KEY = {
  "This Week": "thisWeek", "Last Week": "lastWeek",
  "This Month": "thisMonth", "Last Month": "lastMonth",
  "Lifetime XP": "lifetimeXPFilter", "Lifetime Tournament Wins": "lifetimeTournamentWins", "Lifetime Badges": "lifetimeBadges",
};

// Podium rewards are awarded by finishing position (matches the Friday Battle
// reward table) so they stay correct even when the source row carries no
// `reward` field (e.g. live tournament rows from the backend).
const podiumRewards = {
  1: { coins: 500, xp: 500, titleKey: "goldChampion" },
  2: { coins: 300, xp: 300, titleKey: "silverChampion" },
  3: { coins: 150, xp: 200, titleKey: "bronzeChampion" },
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
  const preferredLanguage = getPreferredLanguage();

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
  // logged-in user). No seeded/demo competitors are ever shown â€” every ranking
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
      // No backend list, but a legacy/offline local attempt exists â€” show it.
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
    const startPractice = { label: t("startPractice", preferredLanguage), action: () => navigate("/practice") };
    switch (selectedRankingType) {
      case "tournament":
        // Reached only when there are no public results to show. Distinguish a
        // backend/connection failure from a genuinely empty board.
        if (tournamentLoadError) {
          return { title: t("emptyTournamentErrorTitle", preferredLanguage), body: t("emptyTournamentErrorBody", preferredLanguage), cta: { label: t("retry", preferredLanguage), action: () => window.location.reload() } };
        }
        return { title: t("emptyTournamentTitle", preferredLanguage), body: t("emptyTournamentBody", preferredLanguage), cta: { label: t("goToTournament", preferredLanguage), action: goToTournament } };
      case "weekly":
        return { title: t("emptyWeeklyTitle", preferredLanguage), body: t("emptyWeeklyBody", preferredLanguage), cta: startPractice };
      case "monthly":
        return { title: t("emptyMonthlyTitle", preferredLanguage), body: t("emptyMonthlyBody", preferredLanguage), cta: startPractice };
      case "subject":
        return { title: t("emptySubjectTitle", preferredLanguage), body: formatPracticeToUnlock(subjectFilter, preferredLanguage), cta: { label: t("practiceSubjectBtn", preferredLanguage), action: () => navigate("/practice") } };
      case "examTrack":
        return { title: t("emptyExamTrackTitle", preferredLanguage), body: t("emptyExamTrackBody", preferredLanguage), cta: startPractice };
      case "hallOfFame":
        return { title: t("emptyHallOfFameTitle", preferredLanguage), body: t("emptyHallOfFameBody", preferredLanguage), cta: startPractice };
      default:
        return { title: t("emptyDefaultTitle", preferredLanguage), body: t("emptyDefaultBody", preferredLanguage), cta: startPractice };
    }
  };

  const renderSecondaryFilters = () => {
    if (selectedRankingType === "weekly") {
      return (
        <div className="secondary-filter-row" aria-label="Weekly filters">
          {weeklyFilters.map((filter) => (
            <button className={`filter-option${weeklyFilter === filter ? " active" : ""}`} type="button" key={filter} onClick={() => setWeeklyFilter(filter)}>{t(FILTER_KEY[filter], preferredLanguage)}</button>
          ))}
        </div>
      );
    }
    if (selectedRankingType === "monthly") {
      return (
        <div className="secondary-filter-row" aria-label="Monthly filters">
          {monthlyFilters.map((filter) => (
            <button className={`filter-option${monthlyFilter === filter ? " active" : ""}`} type="button" key={filter} onClick={() => setMonthlyFilter(filter)}>{t(FILTER_KEY[filter], preferredLanguage)}</button>
          ))}
        </div>
      );
    }
    if (selectedRankingType === "subject") {
      return (
        <div className="secondary-filter-grid subject-filter-grid">
          <label>
            <span>{t("subject", preferredLanguage)}</span>
            <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}>
              {me.subjects.map((subject) => <option key={subject} value={subject}>{translateSubjectName(subject, preferredLanguage)}</option>)}
            </select>
          </label>
        </div>
      );
    }
    if (selectedRankingType === "hallOfFame") {
      return (
        <div className="secondary-filter-row" aria-label="Hall of Fame filters">
          {hallOfFameFilters.map((filter) => (
            <button className={`filter-option${hallOfFameFilter === filter ? " active" : ""}`} type="button" key={filter} onClick={() => setHallOfFameFilter(filter)}>{t(FILTER_KEY[filter], preferredLanguage)}</button>
          ))}
        </div>
      );
    }
    return (
      <div className="scope-note">
        <strong>{t(activeRanking.labelKey, preferredLanguage)} {t("rankingSuffix", preferredLanguage)}</strong>
        <span>{t(activeRanking.descKey, preferredLanguage)}</span>
      </div>
    );
  };

  const ViewButton = ({ user }) => (
    <button className="view-profile-btn" type="button" onClick={() => handleViewProfile(user)}>{t("viewProfile", preferredLanguage)}</button>
  );

  const LearnerCell = ({ user }) => (
    <span className="learner-cell">
      <span className="mini-avatar">{user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : user.initials}</span>
      <span><strong>{user.name}</strong>{user.isCurrentUser ? <em>{t("you", preferredLanguage)}</em> : null}</span>
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
            <span>{t("rank", preferredLanguage)}</span><span>{t("learner", preferredLanguage)}</span><span>{t("subject", preferredLanguage)}</span><span>{t("subjectXP", preferredLanguage)}</span><span>{t("accuracy", preferredLanguage)}</span><span>{t("solved", preferredLanguage)}</span><span>{t("view", preferredLanguage)}</span>
          </div>
          {rows.map((user) => {
            const stats = user.subjectStats?.[subjectFilter] || { xp: 0, accuracy: null, questionsSolved: 0 };
            return (
              <div className={`leaderboard-table-row${user.isCurrentUser ? " current-user" : ""}`} key={user.id}>
                <span className={`rank-badge rank-${user.rank <= 3 ? user.rank : "default"}`}>#{user.rank}</span>
                <LearnerCell user={user} />
                <span>{translateSubjectName(subjectFilter, preferredLanguage)}</span>
                <strong>{formatNumber(stats.xp)} XP</strong>
                <span>{Number.isFinite(stats.accuracy) ? `${stats.accuracy}%` : t("notStartedYet", preferredLanguage)}</span>
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
            <span>{t("rank", preferredLanguage)}</span><span>{t("learner", preferredLanguage)}</span><span>{t("examTrack", preferredLanguage)}</span><span>{t("lifetimeXPHeader", preferredLanguage)}</span><span>{t("badges", preferredLanguage)}</span><span>{t("wins", preferredLanguage)}</span><span>{t("streak", preferredLanguage)}</span><span>{t("view", preferredLanguage)}</span>
          </div>
          {rows.map((user) => (
            <div className={`leaderboard-table-row${user.isCurrentUser ? " current-user" : ""}`} key={user.id}>
              <span className={`rank-badge rank-${user.rank <= 3 ? user.rank : "default"}`}>#{user.rank}</span>
              <LearnerCell user={user} />
              <span>{translateExamName(user.examTrack, preferredLanguage)}</span>
              <strong>{formatNumber(user.lifetimeXP)} XP</strong>
              <span>{user.badges}</span>
              <span>{user.tournamentWins || 0}</span>
              <span>{user.streak || 0}{preferredLanguage === "nepali" ? " दिन" : "d"}</span>
              <span><ViewButton user={user} /></span>
            </div>
          ))}
        </div>
      );
    }

    const pointsHeading = isTournament ? t("points", preferredLanguage) : selectedRankingType === "monthly" ? t("monthlyXP", preferredLanguage) : selectedRankingType === "examTrack" ? t("examXP", preferredLanguage) : selectedRankingType === "weekly" ? t("weeklyXP", preferredLanguage) : t("points", preferredLanguage);
    return (
      <div className="leaderboard-table standard-table">
        <div className="leaderboard-table-head">
          <span>{t("rank", preferredLanguage)}</span><span>{t("learner", preferredLanguage)}</span><span>{t("examTrack", preferredLanguage)}</span><span>{pointsHeading}</span><span>{t("accuracy", preferredLanguage)}</span><span>{t("level", preferredLanguage)}</span><span>{t("badges", preferredLanguage)}</span><span>{t("view", preferredLanguage)}</span>
        </div>
        {rows.map((user) => (
          <div className={`leaderboard-table-row${user.isCurrentUser ? " current-user" : ""}`} key={user.id}>
            <span className={`rank-badge rank-${user.rank <= 3 ? user.rank : "default"}`}>#{user.rank}</span>
            <LearnerCell user={user} />
            <span>{translateExamName(user.examTrack, preferredLanguage)}</span>
            <strong>{formatNumber(metricFor(user))}</strong>
            <span>{user.accuracy || 0}%</span>
            <span className="level-pill">{t("lvAbbr", preferredLanguage)} {user.level || 1}</span>
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
            <h1>{t("leaderboard", preferredLanguage)}</h1>
            <p>{t("trackRanking", preferredLanguage)}</p>
          </div>
          <div className="header-right">
            <div className="header-chips">
              <span className="chip"><FaFire /> {t("fridayBattle", preferredLanguage)}</span>
              <span className="chip"><FaMedal /> {translateExamName(selectedExam, preferredLanguage)}</span>
              <span className="chip"><FaShieldAlt /> {t("privacySafeRanking", preferredLanguage)}</span>
            </div>
          </div>
        </header>

        {/* Tournament rank + exam track + CTA + trophy banner */}
        <section className="dashboard-card leaderboard-rank-banner">
          <div className="rank-zone rank-main">
            <p className="eyebrow">{t("myTournamentRank", preferredLanguage)}</p>
            <div className="rank-main-row">
              <span className="rank-circle">{playedTournament && myTournamentRank ? `#${myTournamentRank}` : "—"}</span>
              <span className="rank-main-text">
                <strong>
                  {playedTournament
                    ? `${formatNumber(myTournamentPoints)} ${t("points", preferredLanguage)}`
                    : publicResultsExist
                    ? t("youHaventJoined", preferredLanguage)
                    : t("youHaventPlayed", preferredLanguage)}
                </strong>
                <span>
                  {playedTournament
                    ? `${myTournamentAccuracy}% ${t("accuracy", preferredLanguage)}`
                    : publicResultsExist
                    ? t("finalPublicRankings", preferredLanguage)
                    : t("takeFridayBattle", preferredLanguage)}
                </span>
              </span>
            </div>
          </div>

          <div className="rank-zone rank-exam">
            <span className="rank-exam-icon"><FaBookOpen /></span>
            <span className="rank-exam-text">
              <p className="eyebrow">{t("examTrack", preferredLanguage)}</p>
              <strong className="rank-banner-exam">{translateExamName(selectedExam, preferredLanguage)}</strong>
            </span>
          </div>

          <div className="rank-zone rank-cta-zone">
            <p className="rank-banner-tagline">{t("everyQuestionTop", preferredLanguage)}</p>
            <button className="btn rank-cta" type="button" onClick={goToTournament}>{t("viewTournamentDetails", preferredLanguage)} <FaArrowRight /></button>
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
                    <p>{translateExamName(user.examTrack, preferredLanguage)}</p>
                  </div>
                  <strong className="podium-score">
                    {formatNumber(score)} {isTournament ? t("points", preferredLanguage) : "XP"}{accuracy ? ` · ${accuracy}%` : ""}
                  </strong>
                  <div className="podium-rewards">
                    {isTournament ? (
                      <>
                        <span className="reward-pill"><CoinIcon size="xs" /> {reward.coins}</span>
                        <span className="reward-pill"><FaStar className="reward-star" /> {reward.xp} XP</span>
                        <span className="reward-pill champion">{t(reward.titleKey, preferredLanguage)}</span>
                      </>
                    ) : (
                      <span className="reward-pill champion">{formatRankHash(user.rank, preferredLanguage)}</span>
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
              <h2>{t("chooseRankingType", preferredLanguage)}</h2>
            <p>{t(activeRanking.descKey, preferredLanguage)}</p>
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
                {t(type.labelKey, preferredLanguage)}
              </button>
            ))}
          </div>
          {renderSecondaryFilters()}
        </section>

        {/* Full leaderboard table â€” splits into table + inline profile panel
            (beside the table, in this same section) when a profile is open. */}
        <section className="dashboard-card leaderboard-table-card">
          <div className="card-heading">
            <h2 className="card-title"><FaMedal /> {t("fullLeaderboard", preferredLanguage)}</h2>
            <span className="status-chip">{selectedRankingType === "subject" ? translateSubjectName(subjectFilter, preferredLanguage) : t(activeRanking.labelKey, preferredLanguage)}{myRow ? formatYouAreRank(myRow.rank, preferredLanguage) : ""}</span>
          </div>
          <div className={`leaderboard-table-body${selectedProfile ? " profile-open" : ""}`}>
            <div className="leaderboard-table-main">
              {renderTable()}
              <p className="privacy-note">
                {t("leaderboardPrivacyNote", preferredLanguage)}
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

