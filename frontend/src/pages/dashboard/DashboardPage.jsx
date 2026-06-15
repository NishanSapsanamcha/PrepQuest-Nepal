import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBook,
  FaBookOpen,
  FaBriefcase,
  FaBuilding,
  FaCheck,
  FaCheckCircle,
  FaCoins,
  FaExclamationCircle,
  FaFire,
  FaFileAlt,
  FaGift,
  FaGlobe,
  FaGraduationCap,
  FaLanguage,
  FaLightbulb,
  FaLock,
  FaMedal,
  FaNewspaper,
  FaRegCircle,
  FaShieldAlt,
  FaTrophy,
  FaUser,
} from "react-icons/fa";
import {
  FiActivity,
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClipboard,
  FiFileText,
  FiGrid,
  FiHelpCircle,
  FiLogOut,
  FiSettings,
  FiStar,
  FiTarget,
  FiTrendingUp,
  FiUser,
  FiZap,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
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
  "daily-quiz": "/daily-quiz",
  "mock-tests": "/mock-tests",
  practice: "/practice",
  tournament: "/tournament",
  leaderboard: "/leaderboard",
  badges: "/badges",
  profile: "/profile",
};

const existingRoutes = new Set(["/dashboard", "/login", "/signup", "/forgot-password", "/setup"]);

const subjectData = {
  "nayab-subba": [
    { name: "General Knowledge", progress: 60, accuracy: 75, solved: "120/200", Icon: FaGlobe },
    { name: "Constitution of Nepal", progress: 45, accuracy: 62, solved: "90/200", Icon: FaFileAlt },
    { name: "Current Affairs", progress: 35, accuracy: 68, solved: "70/200", Icon: FaNewspaper },
    { name: "IQ / Mental Ability", progress: 50, accuracy: 72, solved: "100/200", Icon: FiZap },
    { name: "Nepali Grammar", progress: 55, accuracy: 70, solved: "110/200", Icon: FaBook },
    { name: "English Grammar", progress: 65, accuracy: 78, solved: "130/200", Icon: FiBookOpen },
  ],
  "sakha-adhikrit": [
    { name: "General Knowledge", progress: 60, accuracy: 75, solved: "120/200", Icon: FaGlobe },
    { name: "Constitution of Nepal", progress: 45, accuracy: 62, solved: "90/200", Icon: FaFileAlt },
    { name: "Current Affairs", progress: 35, accuracy: 68, solved: "70/200", Icon: FaNewspaper },
    { name: "Governance Basics", progress: 52, accuracy: 71, solved: "104/200", Icon: FaBuilding },
    { name: "Public Administration", progress: 48, accuracy: 66, solved: "96/200", Icon: FaBriefcase },
    { name: "General Ability / IQ", progress: 50, accuracy: 72, solved: "100/200", Icon: FiZap },
    { name: "Nepali", progress: 55, accuracy: 70, solved: "110/200", Icon: FaBook },
    { name: "English", progress: 65, accuracy: 78, solved: "130/200", Icon: FiBookOpen },
  ],
};

const sidebarItems = [
  { key: "dashboard", label: "Dashboard", Icon: FiGrid },
  { key: "progression", label: "Progression", Icon: FiTrendingUp },
  { key: "practice", label: "Practice", Icon: FiBookOpen },
  { key: "daily-quiz", label: "Daily Quiz", Icon: FiHelpCircle },
  { key: "mock-tests", label: "Mock Tests", Icon: FiClipboard },
  { key: "tournament", label: "Tournament", Icon: FaTrophy },
  { key: "leaderboard", label: "Leaderboard", Icon: FiBarChart2 },
  { key: "badges", label: "Badges", Icon: FaMedal },
  { key: "suggestions", label: "Suggestions", Icon: FaLightbulb },
  { key: "profile", label: "Profile", Icon: FiUser },
];

const statCards = [
  { value: "Level 5", label: "XP / Focused Learner", helper: "1,250 XP earned", Icon: HiOutlineSparkles },
  { value: "340", label: "Coins", helper: "Use coins for extra mock tests", Icon: FaCoins },
  { value: "4 Days", label: "Current Streak", helper: "Complete one activity today", Icon: FaFire },
  { value: "2/3", label: "Free Mocks Left", helper: "Resets daily", Icon: FiFileText },
];

const missions = [
  { label: "Complete 1 daily quiz", completed: true },
  { label: "Take 1 mock test", completed: false },
  { label: "Practice your weak subject", completed: false },
];

const quickActions = [
  { title: "Daily Quiz", copy: "10 mixed questions based on your exam track.", button: "Start", routeKey: "daily-quiz", Icon: FiHelpCircle },
  { title: "Mock Test", copy: "Get score, accuracy, and weak-area feedback.", button: "Start", routeKey: "mock-tests", Icon: FiClipboard },
  { title: "Subject Practice", copy: "Choose a subject and improve weak areas.", button: "Choose", routeKey: "practice", Icon: FiBookOpen },
];

const leaderboardUsers = [
  { rank: 1, name: "Aayush", xp: "2,400 XP", className: "medal" },
  { rank: 2, name: "Suman", xp: "2,100 XP", className: "medal silver" },
  { rank: 3, name: "Ramesh", xp: "1,850 XP", className: "medal bronze" },
];

const recentActivities = [
  { title: "Completed Daily Quiz", reward: "+50 XP", time: "Today", Icon: FaCheckCircle },
  { title: "Finished Constitution Practice", reward: "+30 Coins", time: "Today", Icon: FiBookOpen },
  { title: "Mock Test Score: 82%", reward: "+100 XP", time: "1 day ago", Icon: FiTarget },
  { title: "Streak increased to 4 days", reward: "Momentum kept", time: "1 day ago", Icon: FaFire },
];

const weeklyXpData = [
  { day: "Mon", xp: 120 },
  { day: "Tue", xp: 80 },
  { day: "Wed", xp: 150 },
  { day: "Thu", xp: 200 },
  { day: "Fri", xp: 300 },
  { day: "Sat", xp: 100 },
  { day: "Sun", xp: 180 },
];

const progressionData = {
  currentLevel: 5,
  currentXP: 1250,
  nextLevelXP: 2000,
  xpRemaining: 750,
  progressPercent: 62,
  currentRank: "Focused Learner",
  nextRank: "Kharidar Candidate",
  ranks: [
    "New Aspirant",
    "Focused Learner",
    "Kharidar Candidate",
    "Nayab Subba Candidate",
    "Officer Candidate",
    "Loksewa Warrior",
    "PrepQuest Legend",
  ],
};

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const progressionRef = useRef(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem("sidebarCollapsed") === "true");
  const [showProgression, setShowProgression] = useState(false);

  const selectedExam = localStorage.getItem("selectedExam") || "sakha-adhikrit";
  const preferredLanguage = localStorage.getItem("preferredLanguage") || "english";
  const userName = user?.fullName || user?.name || localStorage.getItem("userName") || "Aspirant";

  const examLabel = examNames[selectedExam] || "Sakha Adhikrit";
  const languageLabel = languageNames[preferredLanguage] || "English";

  const weakSubjects = useMemo(() => {
    const subjects = subjectData[selectedExam] || subjectData["sakha-adhikrit"];
    const requiredWeakAreas = [
      { name: "Constitution of Nepal", progress: 45, accuracy: 62, solved: "90/200", Icon: FaFileAlt },
      { name: "Current Affairs", progress: 35, accuracy: 68, solved: "70/200", Icon: FaNewspaper },
      { name: "Public Administration", progress: 48, accuracy: 66, solved: "96/200", Icon: FaBriefcase },
    ];

    return requiredWeakAreas.map((fallback) => subjects.find((subject) => subject.name === fallback.name) || fallback);
  }, [selectedExam]);

  const maxWeeklyXp = Math.max(...weeklyXpData.map((day) => day.xp));
  const currentRankIndex = progressionData.ranks.indexOf(progressionData.currentRank);

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
      return;
    }

    console.log(`${routeKey} route is not connected yet.`);
  };

  const showProgressionSection = () => {
    setShowProgression(true);
    requestAnimationFrame(() => {
      progressionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleNavClick = (item) => {
    if (item.key === "dashboard") {
      navigate("/dashboard");
      return;
    }

    if (item.key === "progression") {
      showProgressionSection();
      return;
    }

    if (item.key === "suggestions") {
      console.log("Suggestions page will be connected in the next step.");
      return;
    }

    navigateIfAvailable(item.key);
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
            {sidebarCollapsed ? <FiChevronRight aria-hidden="true" /> : <FiChevronLeft aria-hidden="true" />}
          </button>
          <button className="brand-logo" type="button" aria-label="PrepQuest Nepal dashboard" onClick={() => navigate("/dashboard")}>
            <span className="brand-icon">
              <FaShieldAlt aria-hidden="true" />
            </span>
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
                title={label}
                aria-label={label}
                onClick={() => handleNavClick({ key, label })}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="nav-logout">
            <button className="nav-item logout" type="button" title="Logout" aria-label="Logout" onClick={handleLogout}>
              <FiLogOut aria-hidden="true" />
              <span>Logout</span>
            </button>
          </div>
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
                <span className="chip"><FaGraduationCap aria-hidden="true" /> Exam: <strong>{examLabel}</strong></span>
                <span className="chip"><FaLanguage aria-hidden="true" /> Language: <strong>{languageLabel}</strong></span>
              </div>
              <button className="outline-pill" type="button" onClick={handleChangePreferences}>
                <FiSettings aria-hidden="true" /> Change Preferences
              </button>
            </div>
          </header>

          <section className="dashboard-content">
            <section className="stats-grid" aria-label="Learning stats">
              {statCards.map(({ value, label, helper, Icon }) => (
                <article className="stat-card" key={label}>
                  <div className="stat-icon"><Icon aria-hidden="true" /></div>
                  <div>
                    <div className="stat-value">{value}</div>
                    <div className="stat-label">{label}</div>
                    <div className="stat-helper">{helper}</div>
                  </div>
                </article>
              ))}
            </section>

            <section className="dashboard-card progression-preview">
              <div>
                <p className="eyebrow">Your Progress</p>
                <h2>{progressionData.currentRank}</h2>
                <p><strong>1,250 / 2,000 XP</strong> earned. Next Rank: <strong>{progressionData.nextRank}</strong>.</p>
                <div className="preview-progress-row">
                  <span>Current Level: {progressionData.currentRank}</span>
                  <span>{progressionData.progressPercent}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progressionData.progressPercent}%` }} />
                </div>
              </div>
              <button className="outline-pill view-progression-btn" type="button" onClick={showProgressionSection}>
                <FiTrendingUp aria-hidden="true" /> View Progression
              </button>
            </section>

            <div className="dashboard-grid">
              <div className="main-column">
                <section className="dashboard-card mission-card">
                  <div className="card-heading">
                    <h2 className="card-title"><FiTarget aria-hidden="true" /> Today's Mission</h2>
                    <span className="status-chip">1/3 complete</span>
                  </div>
                  <div className="mission-progress">
                    <span>Daily mission progress</span>
                    <strong>1/3</strong>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: "33%" }} /></div>
                  </div>
                  <div className="mission-list">
                    {missions.map(({ label, completed }) => (
                      <div className={`mission-item${completed ? " completed" : ""}`} key={label}>
                        {completed ? <FaCheckCircle aria-hidden="true" /> : <FaRegCircle aria-hidden="true" />}
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mission-reward"><FaGift aria-hidden="true" /> +50 XP +30 Coins</div>
                  <button className="btn btn-full" type="button" onClick={() => navigateIfAvailable("daily-quiz")}>Start Daily Quiz</button>
                </section>

                <section className="dashboard-card">
                  <h2 className="card-title"><FiZap aria-hidden="true" /> Quick Actions</h2>
                  <div className="quick-actions-grid">
                    {quickActions.map(({ title, copy, button, routeKey, Icon }) => (
                      <article className="action-card" key={title}>
                        <div className="action-icon"><Icon aria-hidden="true" /></div>
                        <h3>{title}</h3>
                        <p>{copy}</p>
                        <button className="action-btn" type="button" onClick={() => navigateIfAvailable(routeKey)}>{button}</button>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="dashboard-card weak-subjects-card">
                  <div className="card-heading">
                    <h2 className="card-title"><FaExclamationCircle aria-hidden="true" /> Weak Subjects</h2>
                    <span className="status-chip">Top 3</span>
                  </div>
                  <p className="card-copy">Focus here first to raise your mock score faster.</p>
                  <div className="weak-subject-list">
                    {weakSubjects.map(({ name, accuracy, solved, Icon }) => (
                      <article className="weak-subject-item" key={name}>
                        <div className="weak-subject-top">
                          <div className="weak-subject-name"><Icon aria-hidden="true" /> {name}</div>
                          <strong>{accuracy}%</strong>
                        </div>
                        <div className="weak-subject-meta">
                          <span>Accuracy</span>
                          <span>{solved} solved</span>
                        </div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${accuracy}%` }} /></div>
                      </article>
                    ))}
                  </div>
                  <button className="btn btn-full btn-secondary" type="button" onClick={() => navigateIfAvailable("practice")}>
                    View All Subjects / Practice Weak Areas
                  </button>
                </section>

                <section className="dashboard-card">
                  <h2 className="card-title"><FiActivity aria-hidden="true" /> Recent Activity</h2>
                  <div className="activity-list">
                    {recentActivities.map(({ title, reward, time, Icon }) => (
                      <article className="activity-item" key={`${title}-${time}`}>
                        <div className="activity-icon"><Icon aria-hidden="true" /></div>
                        <div><p>{title}</p><span>{reward}</span></div>
                        <time>{time}</time>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="dashboard-card">
                  <h2 className="card-title"><FiCalendar aria-hidden="true" /> Weekly XP Progress</h2>
                  <div className="chart-container">
                    {weeklyXpData.map(({ day, xp }) => (
                      <div className="chart-bar-wrapper" key={day}>
                        <div className="chart-bar" style={{ height: `${Math.round((xp / maxWeeklyXp) * 100)}%` }} />
                        <div className="chart-value">{xp}</div>
                        <div className="chart-label">{day}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <section
                  className="dashboard-card progression-card progression-details"
                  id="learning-progression"
                  hidden={!showProgression}
                  ref={progressionRef}
                >
                  <div className="card-heading">
                    <h2 className="card-title"><FiTrendingUp aria-hidden="true" /> Learning Progression</h2>
                    <span className="status-chip">{progressionData.progressPercent}% complete</span>
                  </div>
                  <div className="progression-overview">
                    <div className="progression-hero">
                      <span className="progression-level">Level {progressionData.currentLevel}</span>
                      <h3>{progressionData.currentRank}</h3>
                      <p>Next Rank: <strong>{progressionData.nextRank}</strong></p>
                    </div>
                    <div className="xp-panel">
                      <div className="xp-row">
                        <span>XP Progress</span>
                        <strong>{progressionData.currentXP.toLocaleString()} / {progressionData.nextLevelXP.toLocaleString()} XP</strong>
                      </div>
                      <div className="progress-bar xp-progress-bar">
                        <div className="progress-fill" style={{ width: `${progressionData.progressPercent}%` }} />
                      </div>
                      <p><strong>{progressionData.progressPercent}%</strong> complete to next level. <span>{progressionData.xpRemaining} XP remaining</span>.</p>
                    </div>
                  </div>
                  <div className="rank-timeline" aria-label="Rank journey">
                    {progressionData.ranks.map((rank, index) => {
                      const state = index < currentRankIndex ? "completed" : index === currentRankIndex ? "current" : "locked";
                      return (
                        <div className={`rank-step ${state}`} key={rank}>
                          <span className="rank-node">
                            {state === "locked" ? <FaLock aria-hidden="true" /> : <FaCheck aria-hidden="true" />}
                          </span>
                          <span className="rank-label">{rank}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              <aside className="side-column">
                <section className="dashboard-card">
                  <h2 className="card-title"><FiFileText aria-hidden="true" /> Mock Tests Today</h2>
                  <div className="mock-progress"><span>Free mocks remaining</span><strong>2/3</strong></div>
                  <p className="card-copy">Complete a mock test to earn <strong>+100 XP</strong> and <strong>+40 coins</strong>.</p>
                  <p className="muted-copy">Extra mock tests cost 100 coins after your free limit.</p>
                  <button className="btn btn-full" type="button" onClick={() => navigateIfAvailable("mock-tests")}>Start Free Mock</button>
                </section>

                <section className="dashboard-card tournament-card">
                  <div className="card-heading">
                    <h2 className="card-title"><FaTrophy aria-hidden="true" /> Weekly Tournament</h2>
                    <span className="gold-chip">Friday 7 PM</span>
                  </div>
                  <p className="tournament-description">Compete with other Loksewa learners every Friday. Answer timed questions, earn points, and win XP, coins, and badges.</p>
                  <div className="reward-badges">
                    <span>1st: 500 Coins</span>
                    <span>2nd: 300 Coins</span>
                    <span>3rd: 150 Coins</span>
                    <span>Everyone: 50 Coins</span>
                  </div>
                  <p className="ethical-note">No coin betting. Everyone earns participation rewards.</p>
                  <button className="btn btn-full btn-secondary" type="button" onClick={() => navigateIfAvailable("tournament")}>View Tournament</button>
                </section>

                <section className="dashboard-card">
                  <h2 className="card-title"><FiAward aria-hidden="true" /> Weekly Leaderboard</h2>
                  <div className="leaderboard-list">
                    {leaderboardUsers.map(({ rank, name, xp, className }) => (
                      <article className="leaderboard-item top" key={rank}>
                        <span className={`leaderboard-rank ${className}`}>{rank}</span>
                        <span className="leaderboard-name">{name}</span>
                        <strong>{xp}</strong>
                      </article>
                    ))}
                  </div>
                  <div className="your-rank">Your Rank: <strong>#12</strong> this week</div>
                  <button className="btn btn-full btn-secondary" type="button" onClick={() => navigateIfAvailable("leaderboard")}>View Full Leaderboard</button>
                </section>

                <section className="dashboard-card">
                  <h2 className="card-title"><FiStar aria-hidden="true" /> Next Badge</h2>
                  <div className="badge-container">
                    <div className="badge-item"><FaMedal aria-hidden="true" /></div>
                    <h3>7-Day Warrior</h3>
                    <p>4/7 days completed</p>
                    <div className="progress-bar"><div className="progress-fill gold-fill" style={{ width: "57%" }} /></div>
                    <span>Reward: +150 coins + badge</span>
                  </div>
                  <button className="btn btn-full btn-secondary" type="button" onClick={() => navigateIfAvailable("badges")}>View Badges</button>
                </section>

                <section className="dashboard-card">
                  <h2 className="card-title"><FaUser aria-hidden="true" /> Profile Summary</h2>
                  <div className="profile-list">
                    <div className="profile-item"><span>Name</span><strong>{userName}</strong></div>
                    <div className="profile-item"><span>Exam</span><strong>{examLabel}</strong></div>
                    <div className="profile-item"><span>Language</span><strong>{languageLabel}</strong></div>
                    <div className="profile-item"><span>Rank</span><strong>{progressionData.currentRank}</strong></div>
                    <div className="profile-item"><span>Accuracy</span><strong>72%</strong></div>
                  </div>
                  <button className="btn btn-full btn-secondary" type="button" onClick={() => navigateIfAvailable("profile")}>View Profile</button>
                </section>
              </aside>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default DashboardPage;
