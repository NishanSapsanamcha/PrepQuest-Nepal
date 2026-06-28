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
import { getTodayDailyQuizAttempt } from "../../utils/dailyQuizUtils";
import { canClaimDailyReward, DAILY_REWARD_CLAIMED_EVENT, getDailyRewardState, getNepalRewardDate } from "../../utils/dailyRewardUtils";
import { getMockDashboardStats, hasCompletedMockToday } from "../../utils/mockTestUtils";
import { buildSubjectCardData, getExamSubjects, getNormalizedSubjectProgress, normalizeExamId } from "../../utils/practiceUtils";
import { calculateTotalXPFromTransactions, getNextLevelProgress, getOverallRankProgress } from "../../utils/xpUtils";
import { CoinIcon } from "../../components/common/Coin";
import { getUserCoinBalance } from "../../services/coinService";
import "./DashboardPage.css";

const examNames = {
  "nayab-subba": "Nayab Subba",
  "sakha-adhikrit": "Sakha Adhikrit",
};

const languageNames = {
  nepali: "Nepali",
  english: "English",
  both: "Both",
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
  { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { key: "progression", label: "Progression", Icon: Route },
  { key: "practice", label: "Practice", Icon: BookOpenCheck },
  { key: "daily-quiz", label: "Daily Quiz", Icon: CircleHelp },
  { key: "mock-tests", label: "Mock Tests", Icon: ClipboardList },
  { key: "tournament", label: "Tournament", Icon: Trophy },
  { key: "leaderboard", label: "Leaderboard", Icon: Award },
  { key: "badges", label: "Badges", Icon: Medal },
  { key: "profile", label: "Profile", Icon: UserRound },
];

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true"
  );

  const selectedExam = normalizeExamId(localStorage.getItem("selectedExam") || "nayab-subba");
  const preferredLanguage = localStorage.getItem("preferredLanguage") || "english";
  const userName = user?.fullName || user?.name || localStorage.getItem("userName") || "Aspirant";
  const totalXp = calculateTotalXPFromTransactions();
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
  const currentStreak = getCurrentStreak();
  const missionCompletedCount = (dailyQuizCompleted ? 1 : 0) + (mockCompletedToday ? 1 : 0);
  const missionProgressPercent = Math.round((missionCompletedCount / 3) * 100);
  const xpProgress = getNextLevelProgress(totalXp);
  const rankProgress = getOverallRankProgress(totalXp);
  const { currentRank, nextRank } = rankProgress;
  const isMaxRank = rankProgress.rankIndex >= rankJourney.length - 1;
  // Real rank badge art for the current rank (no generic icon / no white box).
  const rankBadge = (rankJourney[rankProgress.rankIndex] || rankJourney[0]).badge;
  // Premium image icons shared with the practice/question UI.
  const coinIcon = gamificationIcons.coins;
  const streakIcon = gamificationIcons.streak;
  const subjectCards = getExamSubjects(selectedExam).map((subject) =>
    buildSubjectCardData(subject, getNormalizedSubjectProgress(), selectedExam)
  );

  const examLabel = examNames[selectedExam] || "Nayab Subba";
  const languageLabel = languageNames[preferredLanguage] || "English";

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
    if (key === "logout") { handleLogout(); return; }
    navigateIfAvailable(key);
  };

  const handleChangePreferences = () => {
    navigate("/setup", { state: { allowPreferenceChange: true } });
  };

  const handleLogout = () => {
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
            {sidebarItems.map(({ key, label, Icon }) => (
              <button
                type="button"
                className={`nav-item${key === "dashboard" ? " active" : ""}`}
                key={key}
                data-nav={key}
                title={label}
                aria-label={label}
                onClick={() => handleNavClick(key)}
              >
                <Icon />
                <span>{label}</span>
              </button>
            ))}
            <button
              type="button"
              className="nav-item logout"
              data-nav="logout"
              title="Logout"
              aria-label="Logout"
              onClick={() => handleNavClick("logout")}
            >
              <LogOut />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        <div className="main-content">
          <header className="dashboard-header">
            <div className="header-left">
              <p className="eyebrow">Welcome back, <span>{userName}</span></p>
              <h1>PrepQuest Dashboard</h1>
              <p>Track progress, earn rewards, and prepare smarter for <strong>{examLabel}</strong>.</p>
            </div>
            <div className="header-right">
              <div className="header-chips">
                <span className="chip"><GraduationCap /> Exam: <strong>{examLabel}</strong></span>
                <span className="chip"><Languages /> Language: <strong>{languageLabel}</strong></span>
              </div>
              <button className="outline-pill" type="button" onClick={handleChangePreferences}>
                <Settings /> Change Preferences
              </button>
            </div>
          </header>

          <section className="dashboard-content">

            {/* Top stats — Level/Rank, Coins, Streak only */}
            <section className="stats-grid stats-grid-3" aria-label="Learning stats">
              <article className="stat-card level-stat-card">
                <span className="rank-badge-icon">
                  <img src={rankBadge} alt={currentRank} />
                </span>
                <div>
                  <div className="stat-value">Level {xpProgress.currentLevel.level}</div>
                  <div className="stat-label">{currentRank}</div>
                  <div className="stat-helper">{totalXp.toLocaleString()} XP earned</div>
                </div>
              </article>
              <article className="stat-card coin-stat-card">
                {coinIcon ? (
                  <span className="dashboard-stat-icon coin">
                    <img className="dashboard-stat-icon-img" src={coinIcon} alt="Coins" />
                  </span>
                ) : (
                  <CoinIcon size="lg" className="stat-coin" />
                )}
                <div>
                  <div className="stat-value coin-stat-value">{coins.toLocaleString()}</div>
                  <div className="stat-label">Coins</div>
                </div>
              </article>
              <article className="stat-card streak-stat-card">
                {streakIcon ? (
                  <span className="dashboard-stat-icon streak">
                    <img className="dashboard-stat-icon-img" src={streakIcon} alt="Streak" />
                  </span>
                ) : (
                  <div className="stat-icon"><Flame /></div>
                )}
                <div>
                  <div className="stat-value">{dailyRewardState.currentStreak} {dailyRewardState.currentStreak === 1 ? "Day" : "Days"}</div>
                  <div className="stat-label">Current Streak</div>
                  <div className="stat-helper">
                    {dailyRewardClaimedToday ? "Streak protected for today." : "Claim today's reward to keep your streak."}
                    {dailyRewardState.bestStreak > 0 ? ` Best: ${dailyRewardState.bestStreak} ${dailyRewardState.bestStreak === 1 ? "Day" : "Days"}` : ""}
                  </div>
                </div>
              </article>
            </section>

            {/* Today's Mission — the hero / main action section */}
            <section className="dashboard-card mission-card hero-mission">
              <div className="mission-left">
                <p className="mission-title">Today&apos;s Mission</p>
                <div className="mission-visual" aria-hidden="true">
                  <img className="mission-image" src={missionImg} alt="" />
                </div>
              </div>
              <div className="mission-tasks">
                <div className={`mission-item${dailyQuizCompleted ? " completed" : ""}`}>
                  {dailyQuizCompleted ? <CheckCircle2 /> : <Circle />}<span>Complete 1 daily quiz</span>
                </div>
                <div className={`mission-item${mockCompletedToday ? " completed" : ""}`}>
                  {mockCompletedToday ? <CheckCircle2 /> : <Circle />}<span>Take 1 mock test</span>
                </div>
                <div className="mission-item">
                  <Circle /><span>Practice your weak subject</span>
                </div>
              </div>
              <div className="mission-cta">
                <span className="mission-reward"><Gift /> Complete all to earn bonus coins!</span>
                <button
                  className="btn mission-start-btn"
                  type="button"
                  onClick={() => navigate(dailyQuizCompleted ? "/daily-quiz/result" : "/daily-quiz")}
                >
                  {dailyQuizCompleted ? "Review Daily Quiz" : "Start Daily Quiz"} <ChevronRight />
                </button>
              </div>
            </section>

            {/* Your Progress — below the mission */}
            <section className="dashboard-card your-progress-card">
              <div className="your-progress-info">
                <p className="eyebrow">Your Progress</p>
                <h2>{currentRank}</h2>
                <p className="your-progress-xp">
                  <strong>{totalXp.toLocaleString()} / {rankProgress.nextRankXp.toLocaleString()} XP</strong> earned
                </p>
              </div>
              <div className="your-progress-track">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${rankProgress.percent}%` }} />
                </div>
                <span className="your-progress-percent">{rankProgress.percent}%</span>
              </div>
              <div className="your-progress-next">
                <span>Next Rank:</span>
                <strong>{isMaxRank ? "Top rank reached" : nextRank}</strong>
              </div>
              <button className="outline-pill view-progression-btn" type="button" onClick={() => navigate("/progression")}>
                View Progression <ChevronRight />
              </button>
            </section>

            {/* Quick Actions + Weak Subjects / Focus Area */}
            <div className="dashboard-bottom-grid">
              <section className="dashboard-card">
                <h2 className="card-title">Quick Actions</h2>
                <div className="quick-actions-grid">
                  <button className="qa-card" type="button" onClick={() => navigateIfAvailable("daily-quiz")}>
                    <span className="qa-icon qa-teal"><CircleHelp /></span>
                    <span className="qa-label">Daily Quiz</span>
                  </button>
                  <button className="qa-card" type="button" onClick={() => navigateIfAvailable("mock-tests")}>
                    <span className="qa-icon qa-blue"><ClipboardList /></span>
                    <span className="qa-label">Mock Test</span>
                  </button>
                  <button className="qa-card" type="button" onClick={() => navigateIfAvailable("practice")}>
                    <span className="qa-icon qa-purple"><BookOpen /></span>
                    <span className="qa-label">Subject Practice</span>
                  </button>
                </div>
              </section>

              <section className="dashboard-card focus-area-card">
                <h2 className="card-title">Weak Subjects / Focus Area</h2>
                {topWeakSubject ? (
                  <div className="focus-area-body">
                    <span className="focus-icon"><GraduationCap /></span>
                    <div className="focus-copy">
                      <div className="focus-top">
                        <strong className="focus-name">{topWeakSubject.name}</strong>
                        <span className="focus-accuracy">{topWeakSubject.accuracy}%</span>
                      </div>
                      <div className="focus-meta">
                        <span>Accuracy</span>
                        <span>{topWeakSubject.progress.questionsSolved} solved</span>
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
                      <strong className="focus-name">Not enough practice yet</strong>
                      <p className="card-copy">Complete a practice session to reveal your focus area.</p>
                    </div>
                  </div>
                )}
                <button className="outline-pill focus-cta" type="button" onClick={() => navigateIfAvailable("practice")}>
                  Practice Weak Areas <ChevronRight />
                </button>
              </section>
            </div>

          </section>
        </div>
      </div>
    </main>
  );
}

export default DashboardPage;
