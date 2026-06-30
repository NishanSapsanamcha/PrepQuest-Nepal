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
import { FaMedal, FaTrophy } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { t } from "../../data/translations";
import LogoutConfirmModal from "../common/LogoutConfirmModal";
import "../../pages/dashboard/DashboardPage.css";

const routeTargets = {
  dashboard: "/dashboard",
  progression: "/progression",
  practice: "/practice",
  "daily-quiz": "/daily-quiz",
  "mock-tests": "/mock-tests",
  tournament: "/tournament",
  leaderboard: "/leaderboard",
  badges: "/badges",
  profile: "/profile",
};

const connectedRoutes = new Set(["/dashboard", "/progression", "/practice", "/daily-quiz", "/mock-tests", "/tournament", "/leaderboard", "/badges", "/profile"]);

const sidebarItems = [
  { key: "dashboard", labelKey: "dashboard", Icon: FiHome },
  { key: "progression", labelKey: "progression", Icon: FiBarChart2 },
  { key: "practice", labelKey: "practice", Icon: FiBookOpen },
  { key: "daily-quiz", labelKey: "dailyQuiz", Icon: FiHelpCircle },
  { key: "mock-tests", labelKey: "mockTest", Icon: FiTarget },
  { key: "tournament", labelKey: "tournament", Icon: FaTrophy },
  { key: "leaderboard", labelKey: "leaderboard", Icon: FiAward },
  { key: "badges", labelKey: "badges", Icon: FaMedal },
  { key: "profile", labelKey: "profile", Icon: FiUser },
];

function DashboardLayout({ activeKey, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const isPracticeRoute = location.pathname.startsWith("/practice");
  const isDailyQuizRoute = location.pathname.startsWith("/daily-quiz");
  const isMockRoute = location.pathname.startsWith("/mock-tests");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => isPracticeRoute || isDailyQuizRoute || isMockRoute || localStorage.getItem("sidebarCollapsed") === "true"
  );
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const currentActiveKey = activeKey || (isPracticeRoute ? "practice" : isDailyQuizRoute ? "daily-quiz" : isMockRoute ? "mock-tests" : "dashboard");

  const handleSidebarToggle = () => {
    setSidebarCollapsed((current) => {
      const next = !current;
      localStorage.setItem("sidebarCollapsed", String(next));
      return next;
    });
  };

  const handleNavClick = (key) => {
    if (key === "logout") {
      setShowLogoutConfirm(true);
      return;
    }
    const target = routeTargets[key];
    if (target && connectedRoutes.has(target)) {
      navigate(target);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
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
            {sidebarItems.map(({ key, label, labelKey, Icon }) => {
              const navLabel = label || t(labelKey);
              return (
              <button
                type="button"
                className={`nav-item${key === currentActiveKey ? " active" : ""}`}
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
              title={t("logout")}
              aria-label={t("logout")}
              onClick={() => handleNavClick("logout")}
            >
              <FiLogOut />
              <span>{t("logout")}</span>
            </button>
          </nav>
        </aside>

        <div className="main-content">{children}</div>
      </div>

      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </main>
  );
}

export default DashboardLayout;
