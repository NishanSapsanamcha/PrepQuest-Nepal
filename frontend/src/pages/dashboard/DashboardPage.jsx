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
import { buildSubjectCardData, getExamSubjects, getNormalizedSubjectProgress, normalizeExamId } from "../../utils/practiceUtils";
import { calculateTotalXPFromTransactions, getNextLevelProgress, getXPTransactions } from "../../utils/xpUtils";
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

const ranks = [
  "New Aspirant",
  "Focused Learner",
  "Kharidar Candidate",
  "Nayab Subba Candidate",
  "Officer Candidate",
  "Loksewa Warrior",
  "PrepQuest Legend",
];

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const progressionRef = useRef(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true"
  );
  const [showProgression, setShowProgression] = useState(false);

  const selectedExam = normalizeExamId(localStorage.getItem("selectedExam") || "nayab-subba");
  const preferredLanguage = localStorage.getItem("preferredLanguage") || "english";
  const userName = user?.fullName || user?.name || localStorage.getItem("userName") || "Aspirant";
  const totalXp = calculateTotalXPFromTransactions();
  const xpProgress = getNextLevelProgress(totalXp);
  const currentRank = ranks[Math.min(ranks.length - 1, xpProgress.currentLevel.level - 1)] || ranks[0];
  const nextRank = ranks[Math.min(ranks.length - 1, xpProgress.currentLevel.level)] || "Highest rank reached";
  const xpTransactions = getXPTransactions();
  const subjectCards = getExamSubjects(selectedExam).map((subject) =>
    buildSubjectCardData(subject, getNormalizedSubjectProgress(), selectedExam)
  );
  const weeklyXpData = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => ({
    day,
    xp: xpTransactions
      .filter((transaction) => new Date(transaction.createdAt).getDay() === index)
      .reduce((sum, transaction) => sum + transaction.amount, 0),
  }));

  const examLabel = examNames[selectedExam] || "Nayab Subba";
  const languageLabel = languageNames[preferredLanguage] || "English";

  const weakSubjects = useMemo(() => {
    return subjectCards
      .filter((subject) => subject.progress.questionsSolved > 0)
      .sort((a, b) => (a.accuracy ?? 101) - (b.accuracy ?? 101))
      .slice(0, 3);
  }, [subjectCards]);

  const maxWeeklyXp = Math.max(1, ...weeklyXpData.map((d) => d.xp));
  const currentRankIndex = ranks.indexOf(currentRank);

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
                  <div className="stat-value">Level {xpProgress.currentLevel.level}</div>
                  <div className="stat-label">XP / {currentRank}</div>
                  <div className="stat-helper">{totalXp.toLocaleString()} XP earned</div>
                </div>
              </article>
              <article className="stat-card">
                <div className="stat-icon"><Coins /></div>
                <div>
                  <div className="stat-value">0</div>
                  <div className="stat-label">Coins</div>
                  <div className="stat-helper">Coin rewards are coming later</div>
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
                <h2>{currentRank}</h2>
                <p>
                  <strong>{totalXp.toLocaleString()} / {xpProgress.nextLevelXp.toLocaleString()} XP</strong> earned. Next Rank: <strong>{nextRank}</strong>.
                </p>
                <div className="preview-progress-row">
                  <span>Current Level: {currentRank}</span>
                  <span>{xpProgress.percent}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${xpProgress.percent}%` }} />
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
                  <div className="mission-reward"><Gift /> Mission rewards coming later</div>
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
                    {weakSubjects.length ? weakSubjects.map(({ name, accuracy, progress, Icon = BookOpen }) => (
                      <article className="weak-subject-item" key={name}>
                        <div className="weak-subject-top">
                          <div className="weak-subject-name"><Icon /> {name}</div>
                          <strong>{accuracy}%</strong>
                        </div>
                        <div className="weak-subject-meta">
                          <span>Accuracy</span>
                          <span>{progress.questionsSolved} solved</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${accuracy}%` }} />
                        </div>
                      </article>
                    )) : <p className="card-copy">Complete practice sessions to generate weak subject insights.</p>}
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
                    {xpTransactions.slice(0, 4).map((transaction) => (
                      <article className="activity-item" key={transaction.id}>
                        <div className="activity-icon"><CheckCircle /></div>
                        <div><p>{transaction.subjectName || "Practice"} correct answer</p><span>+{transaction.amount} XP</span></div>
                        <time>{new Date(transaction.createdAt).toLocaleDateString()}</time>
                      </article>
                    ))}
                    {!xpTransactions.length && (
                      <article className="activity-item">
                        <div className="activity-icon"><BookOpen /></div>
                        <div><p>No XP activity yet</p><span>Correct practice answers will appear here</span></div>
                        <time>Now</time>
                      </article>
                    )}
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
                    <span className="status-chip">{xpProgress.percent}% complete</span>
                  </div>
                  <div className="progression-overview">
                    <div className="progression-hero">
                      <span className="progression-level">Level {xpProgress.currentLevel.level}</span>
                      <h3>{currentRank}</h3>
                      <p>Next Rank: <strong>{nextRank}</strong></p>
                    </div>
                    <div className="xp-panel">
                      <div className="xp-row">
                        <span>XP Progress</span>
                        <strong>
                          {totalXp.toLocaleString()} / {xpProgress.nextLevelXp.toLocaleString()} XP
                        </strong>
                      </div>
                      <div className="progress-bar xp-progress-bar">
                        <div className="progress-fill" style={{ width: `${xpProgress.percent}%` }} />
                      </div>
                      <p>
                        <strong>{xpProgress.percent}%</strong> complete to next level.{" "}
                        <span>{xpProgress.remainingXp} XP remaining</span>.
                      </p>
                    </div>
                  </div>
                  <div className="rank-timeline" aria-label="Rank journey">
                    {ranks.map((rank, index) => {
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
                    Mock test rewards are coming later.
                  </p>
                  <p className="muted-copy">Mock tests are not connected to XP yet.</p>
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
                    Compete with other Loksewa learners every Friday. Tournament rewards are coming later.
                  </p>
                  <div className="reward-badges">
                    <span>Rewards coming later</span>
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
                      <span className="leaderboard-name">{userName}</span>
                      <strong>{totalXp.toLocaleString()} XP</strong>
                    </article>
                  </div>
                  <div className="your-rank">Leaderboard will expand when more users are connected.</div>
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
                    <span>Badge rewards coming later</span>
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
                    <div className="profile-item"><span>Rank</span><strong>{currentRank}</strong></div>
                    <div className="profile-item"><span>Total XP</span><strong>{totalXp.toLocaleString()} XP</strong></div>
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
