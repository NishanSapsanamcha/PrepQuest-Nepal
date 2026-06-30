import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookOpen, FaCalendarAlt, FaChevronDown, FaChevronUp, FaFire, FaLock, FaMedal, FaPen, FaShieldAlt, FaTrophy, FaUser, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { MdTrackChanges } from "react-icons/md";
import BadgeIcon from "../components/badges/BadgeIcon";
import AchievementBadge from "../components/common/AchievementBadge";
import EditProfileModal from "../components/profile/EditProfileModal";
import { rankJourney } from "../data/rankBadges";
import {
  languageLabel as getLanguageLabel,
  t,
  translateRankName,
  translateSubjectName,
  translateExamName,
  formatDays,
  formatCorrectAnswers,
  formatBestStreak,
  formatPracticeToday,
  trText,
  translateBadgeCategory,
} from "../data/translations";
import { getInitials, getProfileOverrides, saveProfileOverrides } from "../utils/profileUtils";
import { CoinIcon, CoinValue, RewardText } from "../components/common/Coin";
import {
  getCoinSourceLabel,
  getUserCoinBalance,
  getUserCoinTransactions,
} from "../services/coinService";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { examTracks } from "../data/examTracks";
import { mockProfileActivity } from "../data/gamificationMockData";
import { getEarnedBadges, syncBadges } from "../utils/badgeUtils";
import { getCurrentStreak } from "../utils/dailyQuizUtils";
import { buildSubjectCardData, getExamSubjects, getNormalizedSubjectProgress, normalizeExamId } from "../utils/practiceUtils";
import { getUser } from "../utils/storageUtils";
import { mirrorTournamentResult } from "../utils/tournamentUtils";
import { getLatestTournamentResults } from "../services/tournamentService";
import { calculateTotalXPFromTransactions, getOverallRankProgress, getXPTransactions } from "../utils/xpUtils";
import "./Profile.css";

// Static "how to earn" guide (no daily-login coins yet — built later).
const COIN_EARN_GUIDE = [
  { label: "Complete daily quick challenge", amount: 30 },
  { label: "Score 80%+ in daily challenge", amount: 20, suffix: "bonus" },
  { label: "Score 80%+ in practice", amount: 20 },
  { label: "Complete recommended weak subject practice", amount: 20 },
  { label: "Level up a subject", amount: 30 },
  { label: "Master a subject", amount: 100 },
  { label: "Complete a mock test", amount: 40 },
  { label: "Score 80%+ in a mock test", amount: 30 },
  { label: "Join / complete Friday tournament", amount: 50 },
  { label: "Rank top 3 in tournament", amount: "150–500" },
  { label: "Unlock badges with coin rewards", amount: "varies" },
];

function formatTransactionTime(transaction) {
  const raw = transaction.createdAt || transaction.date;
  if (!raw) return "";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return String(raw);
  return parsed.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function Profile() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const soundMuted = localStorage.getItem("prepquest_sound_muted") === "true";
  const [isCoinWalletOpen, setIsCoinWalletOpen] = useState(false);

  // Editable identity (display name + avatar) takes precedence over the synced
  // auth name. Kept in state so a save re-renders the header immediately.
  const [profileOverrides, setProfileOverrides] = useState(() => getProfileOverrides());
  const [isEditOpen, setIsEditOpen] = useState(false);

  const authName = authUser?.fullName || authUser?.name || localStorage.getItem("userName") || "Aspirant";
  const realName = profileOverrides.displayName || authName;
  const avatarImage = profileOverrides.avatarImage;
  const storedUser = getUser();
  const selectedExamId = normalizeExamId(localStorage.getItem("selectedExam") || storedUser.selectedExam);
  const preferredLanguage = (localStorage.getItem("preferredLanguage") || storedUser.preferredLanguage || "english").toLowerCase();
  const examLabel = translateExamName(examTracks[selectedExamId]?.name || "Sakha Adhikrit", preferredLanguage);
  const languageLabel = getLanguageLabel(preferredLanguage);

  const totalXp = calculateTotalXPFromTransactions();
  const rankProgress = getOverallRankProgress(totalXp);
  const currentStreak = getCurrentStreak();
  // Real, ledger-derived balance (never a static/fake value).
  const coins = getUserCoinBalance();
  const coinTransactions = getUserCoinTransactions();
  const recentCoinTransactions = coinTransactions.slice(0, 8);

  const subjectCards = getExamSubjects(selectedExamId).map((subject) =>
    buildSubjectCardData(subject, getNormalizedSubjectProgress(), selectedExamId)
  );
  const practicedSubjects = subjectCards.filter((subject) => subject.progress.questionsSolved > 0);
  const totalCorrect = subjectCards.reduce((sum, subject) => sum + (subject.progress.correctAnswers || 0), 0);
  const totalWrong = subjectCards.reduce((sum, subject) => sum + (subject.progress.wrongAnswers || 0), 0);
  const totalQuestionsAttempted = totalCorrect + totalWrong;
  const overallAccuracy = totalQuestionsAttempted ? Math.round((totalCorrect / totalQuestionsAttempted) * 100) : 0;
  const subjectsPracticed = practicedSubjects.length;
  const strongestSubject = practicedSubjects.length
    ? translateSubjectName([...practicedSubjects].sort((a, b) => (b.accuracy ?? 0) - (a.accuracy ?? 0))[0].name, preferredLanguage)
    : t("notEnoughDataYet", preferredLanguage);
  const weakestSubjectRaw = practicedSubjects.length
    ? [...practicedSubjects].sort((a, b) => (a.accuracy ?? 101) - (b.accuracy ?? 101))[0].name
    : null;
  const weakestSubject = weakestSubjectRaw ? translateSubjectName(weakestSubjectRaw, preferredLanguage) : t("notEnoughDataYet", preferredLanguage);
  const mostPracticedSubject = practicedSubjects.length
    ? translateSubjectName([...practicedSubjects].sort((a, b) => b.progress.questionsSolved - a.progress.questionsSolved)[0].name, preferredLanguage)
    : t("notStartedYet", preferredLanguage);

  // Earned badges are computed from real activity and shown with their gem art.
  const allBadges = syncBadges();
  const earnedBadges = getEarnedBadges(allBadges);
  const lockedByProgress = allBadges
    .filter((badge) => badge.status !== "earned")
    .sort((a, b) => b.percent - a.percent);
  const showcaseBadges = [...earnedBadges, ...lockedByProgress].slice(0, 5);

  const realActivity = getXPTransactions()
    .slice(0, 8)
    .map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      title: transaction.reason || transaction.source || "XP Earned",
      detail: `+${transaction.amount} XP${transaction.subjectName ? ` - ${transaction.subjectName}` : ""}`,
      date: new Date(transaction.createdAt).toLocaleDateString(),
    }));
  const recentActivity = realActivity.length ? realActivity : mockProfileActivity;

  // Tournament history comes from the real backend results (the live system),
  // never from the legacy local attempts or mock data. Shows the current user's
  // completed Friday battles; empty state when they have not played.
  const [tournamentHistory, setTournamentHistory] = useState([]);
  useEffect(() => {
    let cancelled = false;
    getLatestTournamentResults()
      .then((data) => {
        if (cancelled) return;
        // Mirror real backend result into the badge store (award tournament badges).
        if (mirrorTournamentResult(data)) syncBadges();
        const result = data?.currentUserResult;
        if (!result) {
          setTournamentHistory([]);
          return;
        }
        const questionCount = data?.tournament?.questionCount || 20;
        setTournamentHistory([
          {
            id: `${data.tournament?.id || "tournament"}-${result.userId || "me"}`,
            title: data.tournament?.title || data.tournament?.name || "Friday Loksewa Battle",
            date: data.tournament?.startAt ? new Date(data.tournament.startAt).toLocaleDateString() : "Latest battle",
            rank: result.finalRank,
            participants: data.leaderboard?.length || 0,
            points: result.finalScore,
            accuracy: Math.round(((result.correctAnswers || 0) / questionCount) * 100),
            reward: `+${result.rewardXp || 0} XP, +${result.rewardCoins || 0} coins${result.badgeEarned ? ` - ${result.badgeEarned}` : ""}`,
          },
        ]);
      })
      .catch(() => !cancelled && setTournamentHistory([]));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveProfile = ({ displayName, avatarImage: nextImage }) => {
    setProfileOverrides(saveProfileOverrides({ displayName, avatarImage: nextImage }));
    setIsEditOpen(false);
  };

  // Rank journey states derived from real XP (rankProgress.rankIndex).
  const currentRankIndex = rankProgress.rankIndex;
  const journeyBadges = rankJourney.map((rank, index) => ({
    ...rank,
    state:
      index === currentRankIndex
        ? "current"
        : index === currentRankIndex + 1
          ? "next"
          : index < currentRankIndex
            ? "achieved"
            : "locked",
  }));
  const isMaxRank = currentRankIndex >= rankJourney.length - 1;

  return (
    <DashboardLayout activeKey="profile">
      <section className="dashboard-content profile-page">
        <header className="profile-identity-card">
          <div className="profile-avatar" aria-hidden="true">
            {avatarImage ? <img src={avatarImage} alt="" /> : <span>{getInitials(realName)}</span>}
          </div>
          <div className="profile-identity-copy">
            <h1>{realName}</h1>
            <div className="profile-chip-row">
              <span className="chip"><FaUser /> {examLabel}</span>
              <span className="chip"><FaShieldAlt /> {languageLabel}</span>
            </div>
          </div>
          <button className="outline-pill profile-edit-btn" type="button" onClick={() => setIsEditOpen(true)}>
            <FaPen /> {t("editProfile", preferredLanguage)}
          </button>
        </header>

        <section className="dashboard-card rank-journey-card">
          <div className="rank-journey-top">
            <div>
              <p className="eyebrow">{t("overallRankJourney", preferredLanguage)}</p>
              <h2>{t("currentRank", preferredLanguage)}: <span className="rank-journey-current">{translateRankName(rankProgress.currentRank, preferredLanguage)}</span></h2>
              {isMaxRank ? (
                <p>{totalXp.toLocaleString()} XP · {t("topRankReachedLegend", preferredLanguage)}</p>
              ) : (
                <p>
                  <strong className="rank-journey-xp">{totalXp.toLocaleString()} / {rankProgress.nextRankXp.toLocaleString()} XP</strong>
                  {preferredLanguage === "nepali"
                    ? ` ${translateRankName(rankProgress.nextRank, preferredLanguage)} तर्फ।`
                    : ` toward ${rankProgress.nextRank}.`}
                </p>
              )}
            </div>
            <div className="rank-xp-box">
              <span>{isMaxRank ? t("statusWord", preferredLanguage) : t("xpNeeded", preferredLanguage)}</span>
              <strong>{isMaxRank ? t("maxed", preferredLanguage) : `${rankProgress.xpToNextRank.toLocaleString()} XP`}</strong>
            </div>
          </div>

          <div className="rank-progress-track">
            <div className="progress-bar rank-progress-bar">
              <div className="progress-fill" style={{ width: `${rankProgress.percent}%` }} />
            </div>
            <div className="rank-progress-node" style={{ left: `${rankProgress.percent}%` }}>
              <span className="rank-progress-bubble">{rankProgress.percent}%</span>
            </div>
          </div>

          <div className="rank-badge-row">
            {journeyBadges.map((rank) => (
              <div
                className={`rank-badge-item is-${rank.state}${rank.key === "prepQuestLegend" ? " is-legend" : ""}`}
                key={rank.key}
              >
                <div className="rank-badge-art">
                  <img src={rank.badge} alt={rank.label} loading="lazy" />
                </div>
                <span className="rank-node-track" aria-hidden="true">
                  <span className="rank-node-dot" />
                </span>
                <span className="rank-badge-label">
                  {preferredLanguage === "nepali" ? (
                    <span className="rank-label-line">{translateRankName(rank.label, preferredLanguage)}</span>
                  ) : (
                    rank.labelLines.map((line) => (
                      <span className="rank-label-line" key={line}>{line}</span>
                    ))
                  )}
                </span>
                <div className="rank-badge-meta">
                  {rank.state === "current" ? (
                    <span className="rank-state-chip is-current-chip">{t("current", preferredLanguage)}</span>
                  ) : rank.state === "next" ? (
                    <span className="rank-state-chip is-next-chip">{t("nextTarget", preferredLanguage)}</span>
                  ) : rank.state === "achieved" ? (
                    <span className="rank-state-chip is-done-chip">✓</span>
                  ) : (
                    <span className="rank-state-lock" aria-label="Locked"><FaLock /></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="stats-grid">
          <article className="stat-card coin-stat-card"><CoinIcon size="xl" className="stat-coin" /><div><div className="stat-value coin-stat-value">{coins.toLocaleString()}</div><div className="stat-label">{t("coinBalance", preferredLanguage)}</div><div className="stat-helper">{t("earnedFromQuizzes", preferredLanguage)}</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaFire /></div><div><div className="stat-value">{formatDays(currentStreak, preferredLanguage)}</div><div className="stat-label">{t("currentStreak", preferredLanguage)}</div><div className="stat-helper">{t("dailyHabitStatus", preferredLanguage)}</div></div></article>
          <article className="stat-card"><div className="stat-icon"><MdTrackChanges /></div><div><div className="stat-value">{overallAccuracy}%</div><div className="stat-label">{t("accuracy", preferredLanguage)}</div><div className="stat-helper">{formatCorrectAnswers(totalCorrect, preferredLanguage)}</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaBookOpen /></div><div><div className="stat-value">{totalQuestionsAttempted}</div><div className="stat-label">{t("questionsSolved", preferredLanguage)}</div><div className="stat-helper">{t("acrossAllPractice", preferredLanguage)}</div></div></article>
          <article className="stat-card badge-stat-card"><AchievementBadge size="sm" className="stat-badge-icon" /><div><div className="stat-value">{earnedBadges.length}</div><div className="stat-label">{t("earnedBadges", preferredLanguage)}</div><div className="stat-helper">{t("achievementShowcase", preferredLanguage)}</div></div></article>
          <article className="stat-card"><div className="stat-icon"><FaUser /></div><div><div className="stat-value">{subjectsPracticed}</div><div className="stat-label">{t("subjectsPracticed", preferredLanguage)}</div><div className="stat-helper">{t("studyBreadth", preferredLanguage)}</div></div></article>
        </section>

        <section className={`dashboard-card coin-wallet-card${isCoinWalletOpen ? " is-open" : ""}`}>
          <button
            type="button"
            className="coin-wallet-top coin-wallet-toggle"
            aria-expanded={isCoinWalletOpen}
            aria-controls="coin-wallet-details"
            onClick={() => setIsCoinWalletOpen((open) => !open)}
          >
            <div className="coin-wallet-balance">
              <CoinIcon size="xl" className="coin-wallet-icon" />
              <div>
                <div className="coin-wallet-amount">{coins.toLocaleString()}</div>
                <div className="coin-wallet-label">{t("availableBalance", preferredLanguage)}</div>
              </div>
            </div>
            <p className="coin-wallet-note">
              {t("coinWalletNote", preferredLanguage)}
            </p>
            <span className="coin-wallet-chevron" aria-hidden="true">
              {isCoinWalletOpen ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </button>

          {isCoinWalletOpen && (
            <div className="coin-wallet-grid" id="coin-wallet-details">
              <div className="coin-wallet-panel">
                <h3 className="coin-wallet-heading">{t("howToEarnCoins", preferredLanguage)}</h3>
                <ul className="coin-earn-list">
                  {COIN_EARN_GUIDE.map((item) => (
                    <li key={item.label}>
                      <span className="coin-earn-reason">{trText(item.label, preferredLanguage)}</span>
                      <span className="coin-earn-amount">
                        <CoinIcon size="xs" />
                        {typeof item.amount === "number" ? `+${item.amount}` : trText(item.amount, preferredLanguage)}
                        {item.suffix ? <em className="coin-earn-suffix"> {trText(item.suffix, preferredLanguage)}</em> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="coin-wallet-panel">
                <h3 className="coin-wallet-heading">{t("recentCoinActivity", preferredLanguage)}</h3>
                {recentCoinTransactions.length ? (
                  <ul className="coin-activity-list">
                    {recentCoinTransactions.map((transaction) => {
                      const isSpend = Number(transaction.amount) < 0;
                      return (
                        <li className="coin-activity-row" key={transaction.id || transaction.idempotencyKey}>
                          <CoinIcon size="sm" />
                          <div className="coin-activity-copy">
                            <strong>{transaction.reason || getCoinSourceLabel(transaction.source)}</strong>
                            <span>{getCoinSourceLabel(transaction.source)} · {formatTransactionTime(transaction)}</span>
                          </div>
                          <span className={`coin-activity-amount ${isSpend ? "is-spend" : "is-earn"}`}>
                            {isSpend ? "−" : "+"}
                            {Math.abs(Number(transaction.amount)).toLocaleString()}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="coin-activity-empty">
                    <CoinValue amount={0} size="md" />
                    <p>{t("noCoinActivity", preferredLanguage)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <div className="profile-main-grid">
          <div className="profile-left-column">
            <section className="dashboard-card">
              <div className="card-heading">
                <h2 className="card-title"><FaMedal /> {t("badgeShowcase", preferredLanguage)}</h2>
                <button className="action-btn compact" type="button" onClick={() => navigate("/badges")}>{t("viewAllBadges", preferredLanguage)}</button>
              </div>
              <div className="profile-badge-grid">
                {showcaseBadges.map((badge) => {
                  const isEarned = badge.status === "earned";
                  const isMasked = badge.isSecret && !isEarned;
                  return (
                    <div className="profile-badge-row" key={badge.id}>
                      <BadgeIcon shape={badge.shape} iconKind={badge.iconKind} rarity={badge.rarity} size="sm" locked={!isEarned} earned={isEarned} isSecret={badge.isSecret} />
                      <div>
                        <strong>{isMasked ? "???" : trText(badge.name, preferredLanguage)}</strong>
                        <span>{isMasked ? (preferredLanguage === "nepali" ? "यो ब्याज पत्ता लगाउन खेल्दै रहनुहोस्।" : "Keep playing to discover this badge.") : <>{translateBadgeCategory(badge.category, preferredLanguage)} - <RewardText text={badge.reward} /></>}</span>
                      </div>
                      <span className="rank-badge">{isEarned ? "✓" : `${badge.progress}/${badge.target}`}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="dashboard-card">
              <h2 className="card-title"><FaCalendarAlt /> {t("recentActivity", preferredLanguage)}</h2>
              <div className="profile-list">
                {recentActivity.map((item) => (
                  <div className="profile-activity-row" key={item.id}>
                    <span className="stat-icon small"><FaCalendarAlt /></span>
                    <div><strong>{trText(item.title, preferredLanguage)}</strong><span>{item.detail}</span></div>
                    <time>{item.date}</time>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="profile-right-column">
            <section className="dashboard-card">
              <h2 className="card-title"><MdTrackChanges /> {t("studyIdentity", preferredLanguage)}</h2>
              <div className="detail-list">
                <div><span>{t("strongestSubject", preferredLanguage)}</span><strong>{strongestSubject}</strong></div>
                <div><span>{t("weakestSubject", preferredLanguage)}</span><strong>{weakestSubject}</strong></div>
                <div><span>{t("mostPracticed", preferredLanguage)}</span><strong>{mostPracticedSubject}</strong></div>
                <div>
                  <span>{t("recommendedNext", preferredLanguage)}</span>
                  <strong>{practicedSubjects.length ? formatPracticeToday(weakestSubjectRaw, preferredLanguage) : t("startPracticingRecommendation", preferredLanguage)}</strong>
                </div>
              </div>
            </section>

            <section className="dashboard-card">
              <h2 className="card-title"><FaTrophy /> {t("tournamentHistory", preferredLanguage)}</h2>
              <div className="profile-list">
                {tournamentHistory.length ? (
                  tournamentHistory.map((item) => (
                    <div className="tournament-history-row" key={item.id}>
                      <div><strong>{item.title}</strong><span>{item.date} - {t("rank", preferredLanguage)} {item.rank}/{item.participants}</span></div>
                      <strong>{item.points} {t("pts", preferredLanguage)}</strong>
                      <span><RewardText text={item.reward} /></span>
                    </div>
                  ))
                ) : (
                  <p className="muted-copy">{t("noTournamentHistory", preferredLanguage)}</p>
                )}
              </div>
            </section>

            <section className="dashboard-card">
              <h2 className="card-title"><FaShieldAlt /> {t("preferencesSummary", preferredLanguage)}</h2>
              <div className="detail-list">
                <div><span>{t("selectedExamTrackTitle", preferredLanguage)}</span><strong>{examLabel}</strong></div>
                <div><span>{t("language", preferredLanguage)}</span><strong>{languageLabel}</strong></div>
                <div><span>{t("publicLeaderboard", preferredLanguage)}</span><strong>{t("on", preferredLanguage)}</strong></div>
                <div><span>{t("notifications", preferredLanguage)}</span><strong>{t("futureFeature", preferredLanguage)}</strong></div>
                <div><span>{t("soundEffects", preferredLanguage)}</span><strong>{soundMuted ? <><FaVolumeMute /> {t("muted", preferredLanguage)}</> : <><FaVolumeUp /> {t("on", preferredLanguage)}</>}</strong></div>
              </div>
            </section>
          </aside>
        </div>
      </section>

      <EditProfileModal
        isOpen={isEditOpen}
        currentName={realName}
        currentImage={avatarImage}
        onCancel={() => setIsEditOpen(false)}
        onSave={handleSaveProfile}
      />
    </DashboardLayout>
  );
}

export default Profile;
