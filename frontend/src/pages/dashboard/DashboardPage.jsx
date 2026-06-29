import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  Award,
  Book,
  BookOpen,
  BookOpenCheck,
  Brain,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleHelp,
  ClipboardList,
  FileText,
  Flame,
  Gift,
  Globe,
  GraduationCap,
  Languages,
  LayoutDashboard,
  Lock,
  LogOut,
  Medal,
  Newspaper,
  Route,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Type,
  User,
  UserRound,
  Zap,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { rankThresholds } from "../../data/gamificationMockData";
import { rankJourney } from "../../data/rankBadges";
import { languageLabel as getLanguageLabel, t, translateExamName, translateRankName, translateSubjectName, formatDays, formatBestStreak } from "../../data/translations";
import { getCurrentStreak, getTodayDailyQuizAttempt } from "../../utils/dailyQuizUtils";
import { canClaimDailyReward, DAILY_REWARD_CLAIMED_EVENT, getDailyRewardState, getNepalRewardDate } from "../../utils/dailyRewardUtils";
import { getMockDashboardStats, hasCompletedMockToday } from "../../utils/mockTestUtils";
import { buildSubjectCardData, getExamSubjects, getNormalizedSubjectProgress, normalizeExamId } from "../../utils/practiceUtils";
import { calculateTotalXPFromTransactions, getOverallRankProgress } from "../../utils/xpUtils";
import { gamificationIcons } from "../../assets/gamification";
import { CoinIcon } from "../../components/common/Coin";
import LogoutConfirmModal from "../../components/common/LogoutConfirmModal";
import { getUserCoinBalance } from "../../services/coinService";
import missionArt from "../../assets/level/key_arrow-transparent.png";
import "./DashboardPage.css";

const examNames = {
  "nayab-subba": "Nayab Subba",
  "sakha-adhikrit": "Sakha Adhikrit",
};

const routeTargets = {
  progression: "/progression",
  practice: "/practice",
  "daily-quiz": "/daily-quiz",
  "mock-tests": "/mock-tests",
  tournament: "/tournament",
  leaderboard: "/leaderboard",
  badges: "/badges",
  profile: "/profile",
};

const existingRoutes = new Set(["/dashboard", "/progression", "/practice", "/daily-quiz", "/mock-tests", "/badges", "/leaderboard", "/tournament", "/profile", "/login", "/signup", "/forgot-password", "/setup"]);

const subjectData = {
  "nayab-subba": [
    { name: "General Knowledge", progress: 60, accuracy: 75, solved: "120/200", Icon: Globe },
    { name: "Constitution of Nepal", progress: 45, accuracy: 62, solved: "90/200", Icon: FileText },
    { name: "Current Affairs", progress: 35, accuracy: 68, solved: "70/200", Icon: Newspaper },
    { name: "IQ / Mental Ability", progress: 50, accuracy: 72, solved: "100/200", Icon: Brain },
    { name: "Nepali Grammar", progress: 55, accuracy: 70, solved: "110/200", Icon: Type },
    { name: "English Grammar", progress: 65, accuracy: 78, solved: "130/200", Icon: Book },
  ],
  "sakha-adhikrit": [
    { name: "General Knowledge", progress: 60, accuracy: 75, solved: "120/200", Icon: Globe },
    { name: "Constitution of Nepal", progress: 45, accuracy: 62, solved: "90/200", Icon: FileText },
    { name: "Current Affairs", progress: 35, accuracy: 68, solved: "70/200", Icon: Newspaper },
    { name: "Governance Basics", progress: 52, accuracy: 71, solved: "104/200", Icon: Building2 },
    { name: "Public Administration", progress: 48, accuracy: 66, solved: "96/200", Icon: Briefcase },
    { name: "General Ability / IQ", progress: 50, accuracy: 72, solved: "100/200", Icon: Brain },
    { name: "Nepali", progress: 55, accuracy: 70, solved: "110/200", Icon: Type },
    { name: "English", progress: 65, accuracy: 78, solved: "130/200", Icon: Book },
  ],
};

const sidebarItems = [
  { key: "dashboard", labelKey: "dashboard", Icon: LayoutDashboard },
  { key: "progression", labelKey: "progression", Icon: Route },
  { key: "practice", labelKey: "practice", Icon: BookOpenCheck },
  { key: "daily-quiz", labelKey: "dailyQuiz", Icon: CircleHelp },
  { key: "mock-tests", labelKey: "mockTest", Icon: ClipboardList },
  { key: "tournament", labelKey: "tournament", Icon: Trophy },
  { key: "leaderboard", labelKey: "leaderboard", Icon: Award },
  { key: "badges", labelKey: "badges", Icon: Medal },
  { key: "profile", labelKey: "profile", Icon: UserRound },
];

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true"
  );
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const selectedExam = normalizeExamId(localStorage.getItem("selectedExam") || "nayab-subba");
  const preferredLanguage = localStorage.getItem("preferredLanguage") || "english";
  const userName = user?.fullName || user?.name || localStorage.getItem("userName") || "Aspirant";
  const totalXp = calculateTotalXPFromTransactions();
  const coins = getUserCoinBalance();
  const todayDailyQuizAttempt = getTodayDailyQuizAttempt();
  const dailyQuizCompleted = Boolean(todayDailyQuizAttempt);
  const [, forceRefresh] = useState(0);
  useEffect(() => {
    const handleClaimed = () => forceRefresh((tick) => tick + 1);
    window.addEventListener(DAILY_REWARD_CLAIMED_EVENT, handleClaimed);
    return () => window.removeEventListener(DAILY_REWARD_CLAIMED_EVENT, handleClaimed);
  }, []);

  const dailyRewardState = getDailyRewardState();
  const dailyRewardClaimedToday = !canClaimDailyReward(dailyRewardState, getNepalRewardDate());
  const mockStats = getMockDashboardStats();
  const mockCompletedToday = hasCompletedMockToday();
  const missionCompletedCount = (dailyQuizCompleted ? 1 : 0) + (mockCompletedToday ? 1 : 0);
  const missionProgressPercent = Math.round((missionCompletedCount / 3) * 100);
  const rankProgress = getOverallRankProgress(totalXp);
  const { currentRank, nextRank } = rankProgress;
  const isMaxRank = rankProgress.rankIndex >= rankJourney.length - 1;
  // Real rank badge art for the current rank (no generic icon / no white box).
  const rankBadge = (rankJourney[rankProgress.rankIndex] || rankJourney[0]).badge;
  // Premium image icons shared with the practice/question UI.
  const coinIcon = gamificationIcons.coins;
  const streakIcon = gamificationIcons.streak;
  const missionImg = missionArt || gamificationIcons.mission;
  const subjectCards = getExamSubjects(selectedExam).map((subject) =>
    buildSubjectCardData(subject, getNormalizedSubjectProgress(), selectedExam)
  );

  const examLabel = translateExamName(examNames[selectedExam] || "Nayab Subba", preferredLanguage);
  const languageLabel = getLanguageLabel(preferredLanguage);
  const currentRankLabel = translateRankName(currentRank, preferredLanguage);
  const nextRankLabel = translateRankName(nextRank, preferredLanguage);

  const weakSubjects = useMemo(() => {
    return subjectCards
      .filter((subject) => subject.progress.questionsSolved > 0)
      .sort((a, b) => (a.accuracy ?? 101) - (b.accuracy ?? 101))
      .slice(0, 3);
  }, [subjectCards]);
  const topWeakSubject = weakSubjects[0] || null;

  const handleSidebarToggle = () => {
    setSidebarCollapsed((current) => {
      const next = !current;
      localStorage.setItem("sidebarCollapsed", String(next));
      return next;
    });
  };

  const navigateIfAvailable = (routeKey) => {
    const target = routeTargets[routeKey];
    if (target && existingRoutes.has(target)) {
      navigate(target);
    }
  };

  const handleNavClick = (key) => {
    if (key === "dashboard") { navigate("/dashboard"); return; }
    if (key === "logout") { setShowLogoutConfirm(true); return; }
    navigateIfAvailable(key);
  };

  const handleChangePreferences = () => {
    navigate("/setup", { state: { allowPreferenceChange: true } });
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className={`dashboard-page${sidebarCollapsed ? " sidebar-collapsed" : " sidebar-expanded-by-user"}`}>
      <div className="dashboard-wrapper">
        <aside className="sidebar" aria-label="Dashboard navigation">
          <button
            className="sidebar-toggle"
            type="button"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!sidebarCollapsed}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={handleSidebarToggle}
          >
            {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>

          <button
            className="brand-logo"
            type="button"
            aria-label="PrepQuest Nepal dashboard"
            onClick={() => navigate("/dashboard")}
          >
            <span className="brand-icon"><ShieldCheck /></span>
            <span className="brand-copy">
              <span className="brand-title">PrepQuest</span>
              <span className="brand-subtitle">Nepal</span>
            </span>
          </button>

          <nav className="sidebar-nav">
            {sidebarItems.map(({ key, label, labelKey, Icon }) => {
              const navLabel = label || t(labelKey, preferredLanguage);
              return (
              <button
                type="button"
                className={`nav-item${key === "dashboard" ? " active" : ""}`}
                key={key}
                data-nav={key}
                title={navLabel}
                aria-label={navLabel}
                onClick={() => handleNavClick(key)}
              >
                <Icon />
                <span>{navLabel}</span>
              </button>
              );
            })}
            <button
              type="button"
              className="nav-item logout"
              data-nav="logout"
              title={t("logout", preferredLanguage)}
              aria-label={t("logout", preferredLanguage)}
              onClick={() => handleNavClick("logout")}
            >
              <LogOut />
              <span>{t("logout", preferredLanguage)}</span>
            </button>
          </nav>
        </aside>

        <div className="main-content">
          <header className="dashboard-header">
            <div className="header-left">
              <p className="eyebrow">{t("welcomeBack", preferredLanguage)} <span>{userName}</span></p>
              <h1>PrepQuest {t("dashboard", preferredLanguage)}</h1>
              <p>
                {preferredLanguage === "nepali" ? (
                  <><strong>{examLabel}</strong> {t("dashboardSubtitlePrefix", preferredLanguage)}{t("dashboardSubtitleSuffix", preferredLanguage)}</>
                ) : (
                  <>{t("dashboardSubtitlePrefix", preferredLanguage)} <strong>{examLabel}</strong>{t("dashboardSubtitleSuffix", preferredLanguage)}</>
                )}
              </p>
            </div>
            <div className="header-right">
              <div className="header-chips">
                <span className="chip"><GraduationCap /> {t("exam", preferredLanguage)}: <strong>{examLabel}</strong></span>
                <span className="chip"><Languages /> {t("language", preferredLanguage)}: <strong>{languageLabel}</strong></span>
              </div>
              <button className="outline-pill" type="button" onClick={handleChangePreferences}>
                <Settings /> {t("changePreferences", preferredLanguage)}
              </button>
            </div>
          </header>

          <section className="dashboard-content">

            {/* Top stats — one connected banner: Level · Coins · Streak */}
            <section className="stats-banner" aria-label="Learning stats">
              <div className="stat-block">
                <span className="stat-art level">
                  <img src={rankBadge} alt={currentRankLabel} />
                </span>
                <div className="stat-info">
                  <div className="stat-value">{t("level", preferredLanguage)} {rankProgress.level}</div>
                  <div className="stat-label accent-level">{currentRankLabel}</div>
                  <div className="stat-helper">{totalXp.toLocaleString()} {t("xpEarned", preferredLanguage)}</div>
                </div>
              </div>

              <span className="stat-divider" aria-hidden="true" />

              <div className="stat-block">
                <span className="stat-art coin">
                  {coinIcon ? (
                    <img className="dashboard-stat-icon-img" src={coinIcon} alt={t("coins", preferredLanguage)} />
                  ) : (
                    <CoinIcon size="xl" />
                  )}
                </span>
                <div className="stat-info">
                  <div className="stat-value coin-stat-value">{coins.toLocaleString()}</div>
                  <div className="stat-label">{t("coins", preferredLanguage)}</div>
                </div>
              </div>

              <span className="stat-divider" aria-hidden="true" />

              <div className="stat-block">
                <span className="stat-art streak">
                  {streakIcon ? (
                    <img className="dashboard-stat-icon-img" src={streakIcon} alt="Streak" />
                  ) : (
                    <Flame />
                  )}
                </span>
                <div className="stat-info">
                  <div className="stat-value">{formatDays(dailyRewardState.currentStreak, preferredLanguage)}</div>
                  <div className="stat-label accent-streak">{t("currentStreak", preferredLanguage)}</div>
                  <div className="stat-helper">
                    {(() => {
                      const best = dailyRewardState.bestStreak > 0
                        ? dailyRewardState.bestStreak
                        : (dailyRewardState.currentStreak > 0 ? dailyRewardState.currentStreak : 0);
                      return formatBestStreak(best, preferredLanguage);
                    })()}
                  </div>
                </div>
              </div>
            </section>

            {/* Today's Mission — the hero / main action section */}
            <section className="dashboard-card mission-card hero-mission">
              <div className="mission-left">
                <p className="mission-title">{t("todayMission", preferredLanguage)}</p>
                <div className="mission-visual" aria-hidden="true">
                  {missionImg ? (
                    <img className="mission-image" src={missionImg} alt="" />
                  ) : (
                    <Target className="mission-image-fallback" />
                  )}
                </div>
              </div>
              <div className="mission-tasks">
                <div className={`mission-item${dailyQuizCompleted ? " completed" : ""}`}>
                  {dailyQuizCompleted ? <CheckCircle2 /> : <Circle />}<span>{t("completeDailyQuiz", preferredLanguage)}</span>
                </div>
                <div className={`mission-item${mockCompletedToday ? " completed" : ""}`}>
                  {mockCompletedToday ? <CheckCircle2 /> : <Circle />}<span>{t("takeMockTest", preferredLanguage)}</span>
                </div>
                <div className="mission-item">
                  <Circle /><span>{t("practiceWeakSubject", preferredLanguage)}</span>
                </div>
              </div>
              <div className="mission-cta">
                <span className="mission-reward"><Gift /> {t("completeBonusCoins", preferredLanguage)}</span>
                <button
                  className="btn mission-start-btn"
                  type="button"
                  onClick={() => navigate(dailyQuizCompleted ? "/daily-quiz/result" : "/daily-quiz")}
                >
                  {dailyQuizCompleted ? t("reviewDailyQuiz", preferredLanguage) : t("startDailyQuiz", preferredLanguage)} <ChevronRight />
                </button>
              </div>
            </section>

            {/* Your Progress — below the mission */}
            <section className="dashboard-card your-progress-card">
              <div className="your-progress-info">
                <p className="eyebrow">{t("yourProgress", preferredLanguage)}</p>
                <h2>{currentRankLabel}</h2>
                <p className="your-progress-xp">
                  <strong>{totalXp.toLocaleString()} / {rankProgress.nextRankXp.toLocaleString()} XP</strong> {t("earnedSuffix", preferredLanguage)}
                </p>
              </div>
              <div className="your-progress-track">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${rankProgress.percent}%` }} />
                </div>
                <span className="your-progress-percent">{rankProgress.percent}%</span>
              </div>
              <div className="your-progress-next">
                <span>{t("nextRank", preferredLanguage)}:</span>
                <strong>{isMaxRank ? t("topRankReached", preferredLanguage) : nextRankLabel}</strong>
              </div>
              <button className="outline-pill view-progression-btn" type="button" onClick={() => navigate("/progression")}>
                {t("viewProgression", preferredLanguage)} <ChevronRight />
              </button>
            </section>

            {/* Quick Actions + Weak Subjects / Focus Area */}
            <div className="dashboard-bottom-grid">
              <section className="dashboard-card">
                <h2 className="card-title">{t("quickActions", preferredLanguage)}</h2>
                <div className="quick-actions-grid">
                  <button className="qa-card" type="button" onClick={() => navigateIfAvailable("daily-quiz")}>
                    <span className="qa-icon qa-teal"><CircleHelp /></span>
                    <span className="qa-label">{t("dailyQuiz", preferredLanguage)}</span>
                  </button>
                  <button className="qa-card" type="button" onClick={() => navigateIfAvailable("mock-tests")}>
                    <span className="qa-icon qa-blue"><ClipboardList /></span>
                    <span className="qa-label">{t("mockTest", preferredLanguage)}</span>
                  </button>
                  <button className="qa-card" type="button" onClick={() => navigateIfAvailable("practice")}>
                    <span className="qa-icon qa-purple"><BookOpen /></span>
                    <span className="qa-label">{t("subjectPractice", preferredLanguage)}</span>
                  </button>
                </div>
              </section>

              <section className="dashboard-card focus-area-card">
                <h2 className="card-title">{t("practiceWeakSubject", preferredLanguage)}</h2>
                {topWeakSubject ? (
                  <div className="focus-area-body">
                    <span className="focus-icon"><GraduationCap /></span>
                    <div className="focus-copy">
                      <div className="focus-top">
                        <strong className="focus-name">{translateSubjectName(topWeakSubject.name, preferredLanguage)}</strong>
                        <span className="focus-accuracy">{topWeakSubject.accuracy}%</span>
                      </div>
                      <div className="focus-meta">
                        <span>{t("accuracy", preferredLanguage)}</span>
                        <span>{topWeakSubject.progress.questionsSolved} {t("solved", preferredLanguage)}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${topWeakSubject.accuracy}%` }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="focus-area-body">
                    <span className="focus-icon"><GraduationCap /></span>
                    <div className="focus-copy">
                      <strong className="focus-name">{t("notEnoughPracticeYet", preferredLanguage)}</strong>
                      <p className="card-copy">{t("completePracticeReveal", preferredLanguage)}</p>
                    </div>
                  </div>
                )}
                <button className="outline-pill focus-cta" type="button" onClick={() => navigateIfAvailable("practice")}>
                  {t("practiceWeakAreas", preferredLanguage)} <ChevronRight />
                </button>
              </section>
            </div>

          </section>
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </main>
  );
}

export default DashboardPage;
