import { useMemo, useRef, useState } from "react";
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
  Coins,
  FileCheck,
  FileText,
  Flame,
  Gift,
  Globe,
  GraduationCap,
  Languages,
  LayoutDashboard,
  Lightbulb,
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

const existingRoutes = new Set(["/dashboard", "/badges", "/leaderboard", "/tournament", "/profile", "/login", "/signup", "/forgot-password", "/setup"]);

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
  { key: "suggestions", label: "Suggestions", Icon: Lightbulb },
  { key: "profile", label: "Profile", Icon: UserRound },
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true"
  );
  const [showProgression, setShowProgression] = useState(false);

  const selectedExam = localStorage.getItem("selectedExam") || "nayab-subba";
  const preferredLanguage = localStorage.getItem("preferredLanguage") || "english";
  const userName = user?.fullName || user?.name || localStorage.getItem("userName") || "Aspirant";

  const examLabel = examNames[selectedExam] || "Nayab Subba";
  const languageLabel = languageNames[preferredLanguage] || "English";

  const weakSubjects = useMemo(() => {
    const subjects = subjectData[selectedExam] || subjectData["nayab-subba"];
    const requiredWeakAreas = [
      { name: "Constitution of Nepal", progress: 45, accuracy: 62, solved: "90/200", Icon: FileText },
      { name: "Current Affairs", progress: 35, accuracy: 68, solved: "70/200", Icon: Newspaper },
      { name: "Public Administration", progress: 48, accuracy: 66, solved: "96/200", Icon: Briefcase },
    ];
    return requiredWeakAreas.map(
      (fallback) => subjects.find((subject) => subject.name === fallback.name) || fallback
    );
  }, [selectedExam]);

  const maxWeeklyXp = Math.max(...weeklyXpData.map((d) => d.xp));
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

  const handleNavClick = (key) => {
    if (key === "dashboard") { navigate("/dashboard"); return; }
    if (key === "progression") { showProgressionSection(); return; }
    if (key === "suggestions") { console.log("Suggestions page will be connected in the next step."); return; }
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
          </nav>

          <div className="nav-logout">
            <button
              className="nav-item logout"
              type="button"
              title="Logout"
              aria-label="Logout"
              onClick={handleLogout}
            >
              <LogOut />
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
                <span className="chip"><GraduationCap /> Exam: <strong>{examLabel}</strong></span>
                <span className="chip"><Languages /> Language: <strong>{languageLabel}</strong></span>
              </div>
              <button className="outline-pill" type="button" onClick={handleChangePreferences}>
                <Settings /> Change Preferences
              </button>
            </div>
          </header>

          <section className="dashboard-content">

            {/* Stats Grid */}
            <section className="stats-grid" aria-label="Learning stats">
              <article className="stat-card">
                <div className="stat-icon"><Sparkles /></div>
                <div>
                  <div className="stat-value">Level 5</div>
                  <div className="stat-label">XP / Focused Learner</div>
                  <div className="stat-helper">1,250 XP earned</div>
                </div>
              </article>
              <article className="stat-card">
                <div className="stat-icon"><Coins /></div>
                <div>
                  <div className="stat-value">340</div>
                  <div className="stat-label">Coins</div>
                  <div className="stat-helper">Use coins for extra mock tests</div>
                </div>
              </article>
              <article className="stat-card">
                <div className="stat-icon"><Flame /></div>
                <div>
                  <div className="stat-value">4 Days</div>
                  <div className="stat-label">Current Streak</div>
                  <div className="stat-helper">Complete one activity today</div>
                </div>
              </article>
              <article className="stat-card">
                <div className="stat-icon"><FileCheck /></div>
                <div>
                  <div className="stat-value">2/3</div>
                  <div className="stat-label">Free Mocks Left</div>
                  <div className="stat-helper">Resets daily</div>
                </div>
              </article>
            </section>

            {/* Progression Preview */}
            <section className="dashboard-card progression-preview">
              <div>
                <p className="eyebrow">Your Progress</p>
                <h2>Focused Learner</h2>
                <p>
                  <strong>1,250 / 2,000 XP</strong> earned. Next Rank: <strong>{progressionData.nextRank}</strong>.
                </p>
                <div className="preview-progress-row">
                  <span>Current Level: {progressionData.currentRank}</span>
                  <span>{progressionData.progressPercent}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progressionData.progressPercent}%` }} />
                </div>
              </div>
              <button className="outline-pill view-progression-btn" type="button" onClick={showProgressionSection}>
                <Route /> View Progression
              </button>
            </section>

            <div className="dashboard-grid">
              {/* Main Column */}
              <div className="main-column">

                {/* Today's Mission */}
                <section className="dashboard-card mission-card">
                  <div className="card-heading">
                    <h2 className="card-title"><Target /> Today&apos;s Mission</h2>
                    <span className="status-chip">1/3 complete</span>
                  </div>
                  <div className="mission-progress">
                    <span>Daily mission progress</span>
                    <strong>1/3</strong>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: "33%" }} />
                    </div>
                  </div>
                  <div className="mission-list">
                    <div className="mission-item completed">
                      <CheckCircle2 /><span>Complete 1 daily quiz</span>
                    </div>
                    <div className="mission-item">
                      <Circle /><span>Take 1 mock test</span>
                    </div>
                    <div className="mission-item">
                      <Circle /><span>Practice your weak subject</span>
                    </div>
                  </div>
                  <div className="mission-reward"><Gift /> +50 XP +30 Coins</div>
                  <button className="btn btn-full" type="button" onClick={() => navigateIfAvailable("daily-quiz")}>
                    Start Daily Quiz
                  </button>
                </section>

                {/* Quick Actions */}
                <section className="dashboard-card">
                  <h2 className="card-title"><Zap /> Quick Actions</h2>
                  <div className="quick-actions-grid">
                    <article className="action-card">
                      <div className="action-icon"><CircleHelp /></div>
                      <h3>Daily Quiz</h3>
                      <p>10 mixed questions based on your exam track.</p>
                      <button className="action-btn" type="button" onClick={() => navigateIfAvailable("daily-quiz")}>Start</button>
                    </article>
                    <article className="action-card">
                      <div className="action-icon"><ClipboardList /></div>
                      <h3>Mock Test</h3>
                      <p>Get score, accuracy, and weak-area feedback.</p>
                      <button className="action-btn" type="button" onClick={() => navigateIfAvailable("mock-tests")}>Start</button>
                    </article>
                    <article className="action-card">
                      <div className="action-icon"><BookOpen /></div>
                      <h3>Subject Practice</h3>
                      <p>Choose a subject and improve weak areas.</p>
                      <button className="action-btn" type="button" onClick={() => navigateIfAvailable("practice")}>Choose</button>
                    </article>
                  </div>
                </section>

                {/* Weak Subjects */}
                <section className="dashboard-card weak-subjects-card">
                  <div className="card-heading">
                    <h2 className="card-title"><AlertCircle /> Weak Subjects</h2>
                    <span className="status-chip">Top 3</span>
                  </div>
                  <p className="card-copy">Focus here first to raise your mock score faster.</p>
                  <div className="weak-subject-list">
                    {weakSubjects.map(({ name, accuracy, solved, Icon }) => (
                      <article className="weak-subject-item" key={name}>
                        <div className="weak-subject-top">
                          <div className="weak-subject-name"><Icon /> {name}</div>
                          <strong>{accuracy}%</strong>
                        </div>
                        <div className="weak-subject-meta">
                          <span>Accuracy</span>
                          <span>{solved} solved</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${accuracy}%` }} />
                        </div>
                      </article>
                    ))}
                  </div>
                  <button
                    className="btn btn-full btn-secondary"
                    type="button"
                    onClick={() => navigateIfAvailable("practice")}
                  >
                    View All Subjects / Practice Weak Areas
                  </button>
                </section>

                {/* Recent Activity */}
                <section className="dashboard-card">
                  <h2 className="card-title"><Activity /> Recent Activity</h2>
                  <div className="activity-list">
                    <article className="activity-item">
                      <div className="activity-icon"><CheckCircle /></div>
                      <div><p>Completed Daily Quiz</p><span>+50 XP</span></div>
                      <time>Today</time>
                    </article>
                    <article className="activity-item">
                      <div className="activity-icon"><BookOpen /></div>
                      <div><p>Finished Constitution Practice</p><span>+30 Coins</span></div>
                      <time>Today</time>
                    </article>
                    <article className="activity-item">
                      <div className="activity-icon"><Target /></div>
                      <div><p>Mock Test Score: 82%</p><span>+100 XP</span></div>
                      <time>1 day ago</time>
                    </article>
                    <article className="activity-item">
                      <div className="activity-icon"><Flame /></div>
                      <div><p>Streak increased to 4 days</p><span>Momentum kept</span></div>
                      <time>1 day ago</time>
                    </article>
                  </div>
                </section>

                {/* Weekly XP Chart */}
                <section className="dashboard-card">
                  <h2 className="card-title"><Calendar /> Weekly XP Progress</h2>
                  <div className="chart-container">
                    {weeklyXpData.map(({ day, xp }) => (
                      <div className="chart-bar-wrapper" key={day}>
                        <div
                          className="chart-bar"
                          style={{ height: `${Math.round((xp / maxWeeklyXp) * 100)}%` }}
                        />
                        <div className="chart-value">{xp}</div>
                        <div className="chart-label">{day}</div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Learning Progression */}
                <section
                  className="dashboard-card progression-card progression-details"
                  id="learning-progression"
                  hidden={!showProgression}
                  ref={progressionRef}
                >
                  <div className="card-heading">
                    <h2 className="card-title"><Route /> Learning Progression</h2>
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
                        <strong>
                          {progressionData.currentXP.toLocaleString()} / {progressionData.nextLevelXP.toLocaleString()} XP
                        </strong>
                      </div>
                      <div className="progress-bar xp-progress-bar">
                        <div className="progress-fill" style={{ width: `${progressionData.progressPercent}%` }} />
                      </div>
                      <p>
                        <strong>{progressionData.progressPercent}%</strong> complete to next level.{" "}
                        <span>{progressionData.xpRemaining} XP remaining</span>.
                      </p>
                    </div>
                  </div>
                  <div className="rank-timeline" aria-label="Rank journey">
                    {progressionData.ranks.map((rank, index) => {
                      const state =
                        index < currentRankIndex ? "completed"
                        : index === currentRankIndex ? "current"
                        : "locked";
                      return (
                        <div className={`rank-step ${state}`} key={rank}>
                          <span className="rank-node">
                            {state === "locked" ? <Lock /> : <Check />}
                          </span>
                          <span className="rank-label">{rank}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>

              </div>

              {/* Side Column */}
              <aside className="side-column">

                {/* Mock Tests */}
                <section className="dashboard-card">
                  <h2 className="card-title"><FileCheck /> Mock Tests Today</h2>
                  <div className="mock-progress">
                    <span>Free mocks remaining</span>
                    <strong>2/3</strong>
                  </div>
                  <p className="card-copy">
                    Complete a mock test to earn <strong>+100 XP</strong> and <strong>+40 coins</strong>.
                  </p>
                  <p className="muted-copy">Extra mock tests cost 100 coins after your free limit.</p>
                  <button className="btn btn-full" type="button" onClick={() => navigateIfAvailable("mock-tests")}>
                    Start Free Mock
                  </button>
                </section>

                {/* Tournament */}
                <section className="dashboard-card tournament-card">
                  <div className="card-heading">
                    <h2 className="card-title"><Trophy /> Weekly Tournament</h2>
                    <span className="gold-chip">Friday 7 PM</span>
                  </div>
                  <p className="tournament-description">
                    Compete with other Loksewa learners every Friday. Answer timed questions, earn points, and win XP, coins, and badges.
                  </p>
                  <div className="reward-badges">
                    <span>1st: 500 Coins</span>
                    <span>2nd: 300 Coins</span>
                    <span>3rd: 150 Coins</span>
                    <span>Everyone: 50 Coins</span>
                  </div>
                  <p className="ethical-note">No coin betting. Everyone earns participation rewards.</p>
                  <button className="btn btn-full btn-secondary" type="button" onClick={() => navigateIfAvailable("tournament")}>
                    View Tournament
                  </button>
                </section>

                {/* Leaderboard */}
                <section className="dashboard-card">
                  <h2 className="card-title"><Award /> Weekly Leaderboard</h2>
                  <div className="leaderboard-list">
                    <article className="leaderboard-item top">
                      <span className="leaderboard-rank medal">1</span>
                      <span className="leaderboard-name">Aayush</span>
                      <strong>2,400 XP</strong>
                    </article>
                    <article className="leaderboard-item top">
                      <span className="leaderboard-rank medal silver">2</span>
                      <span className="leaderboard-name">Suman</span>
                      <strong>2,100 XP</strong>
                    </article>
                    <article className="leaderboard-item top">
                      <span className="leaderboard-rank medal bronze">3</span>
                      <span className="leaderboard-name">Ramesh</span>
                      <strong>1,850 XP</strong>
                    </article>
                  </div>
                  <div className="your-rank">Your Rank: <strong>#12</strong> this week</div>
                  <button className="btn btn-full btn-secondary" type="button" onClick={() => navigateIfAvailable("leaderboard")}>
                    View Full Leaderboard
                  </button>
                </section>

                {/* Next Badge */}
                <section className="dashboard-card">
                  <h2 className="card-title"><Star /> Next Badge</h2>
                  <div className="badge-container">
                    <div className="badge-item"><Medal /></div>
                    <h3>7-Day Warrior</h3>
                    <p>4/7 days completed</p>
                    <div className="progress-bar">
                      <div className="progress-fill gold-fill" style={{ width: "57%" }} />
                    </div>
                    <span>Reward: +150 coins + badge</span>
                  </div>
                  <button className="btn btn-full btn-secondary" type="button" onClick={() => navigateIfAvailable("badges")}>
                    View Badges
                  </button>
                </section>

                {/* Profile Summary */}
                <section className="dashboard-card">
                  <h2 className="card-title"><User /> Profile Summary</h2>
                  <div className="profile-list">
                    <div className="profile-item"><span>Name</span><strong>{userName}</strong></div>
                    <div className="profile-item"><span>Exam</span><strong>{examLabel}</strong></div>
                    <div className="profile-item"><span>Language</span><strong>{languageLabel}</strong></div>
                    <div className="profile-item"><span>Rank</span><strong>Focused Learner</strong></div>
                    <div className="profile-item"><span>Accuracy</span><strong>72%</strong></div>
                  </div>
                  <button className="btn btn-full btn-secondary" type="button" onClick={() => navigateIfAvailable("profile")}>
                    View Profile
                  </button>
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
