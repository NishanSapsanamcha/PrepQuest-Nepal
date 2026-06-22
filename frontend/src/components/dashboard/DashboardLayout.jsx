import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiHelpCircle,
  FiHome,
  FiLogOut,
  FiShield,
  FiTarget,
  FiUser,
} from "react-icons/fi";
import { FaLightbulb, FaMedal, FaTrophy } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "../../pages/dashboard/DashboardPage.css";

const routeTargets = {
  dashboard: "/dashboard",
  practice: "/practice",
  "daily-quiz": "/daily-quiz",
  "mock-tests": "/mock-tests",
  tournament: "/tournament",
  leaderboard: "/leaderboard",
  badges: "/badges",
  profile: "/profile",
};

const connectedRoutes = new Set(["/dashboard", "/practice"]);

const sidebarItems = [
  { key: "dashboard", label: "Dashboard", Icon: FiHome },
  { key: "progression", label: "Progression", Icon: FiBarChart2 },
  { key: "practice", label: "Practice", Icon: FiBookOpen },
  { key: "daily-quiz", label: "Daily Quiz", Icon: FiHelpCircle },
  { key: "mock-tests", label: "Mock Tests", Icon: FiTarget },
  { key: "tournament", label: "Tournament", Icon: FaTrophy },
  { key: "leaderboard", label: "Leaderboard", Icon: FiAward },
  { key: "badges", label: "Badges", Icon: FaMedal },
  { key: "suggestions", label: "Suggestions", Icon: FaLightbulb },
  { key: "profile", label: "Profile", Icon: FiUser },
];

function DashboardLayout({ activeKey, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const isPracticeRoute = location.pathname.startsWith("/practice");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => isPracticeRoute || localStorage.getItem("sidebarCollapsed") === "true"
  );

  const currentActiveKey = activeKey || (isPracticeRoute ? "practice" : "dashboard");

  const handleSidebarToggle = () => {
    setSidebarCollapsed((current) => {
      const next = !current;
      localStorage.setItem("sidebarCollapsed", String(next));
      return next;
    });
  };

  const handleNavClick = (key) => {
    const target = routeTargets[key];
    if (target && connectedRoutes.has(target)) {
      navigate(target);
      return;
    }
    console.log(`${key} route is not connected yet.`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className={`dashboard-page ${currentActiveKey}-dashboard-page${sidebarCollapsed ? " sidebar-collapsed" : " sidebar-expanded-by-user"}`}>
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
            {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>

          <button
            className="brand-logo"
            type="button"
            aria-label="PrepQuest Nepal dashboard"
            onClick={() => navigate("/dashboard")}
          >
            <span className="brand-icon">{currentActiveKey === "practice" ? "PQ" : <FiShield />}</span>
            <span className="brand-copy">
              <span className="brand-title">
                Prep{currentActiveKey === "practice" ? <strong>Quest</strong> : "Quest"}
              </span>
              <span className="brand-subtitle">Nepal</span>
            </span>
          </button>

          <nav className="sidebar-nav">
            {sidebarItems.map(({ key, label, Icon }) => (
              <button
                type="button"
                className={`nav-item${key === currentActiveKey ? " active" : ""}`}
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
            <button className="nav-item logout" type="button" title="Logout" aria-label="Logout" onClick={handleLogout}>
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <div className="main-content">{children}</div>
      </div>
    </main>
  );
}

export default DashboardLayout;
