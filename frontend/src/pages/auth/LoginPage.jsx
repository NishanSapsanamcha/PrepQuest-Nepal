import { useState } from "react";
import {
  FaBookOpen,
  FaCoins,
  FaExclamationCircle,
  FaFire,
  FaLock,
  FaShieldAlt,
  FaTrophy
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/authService";
import { Link } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "", remember: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password
      });

      login(response, formData.remember);

      const onboardingCompleted = localStorage.getItem("onboardingCompleted");
      const selectedExam = localStorage.getItem("selectedExam");
      const preferredLanguage = localStorage.getItem("preferredLanguage");

      if (onboardingCompleted === "true" && selectedExam && preferredLanguage) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/setup", { replace: true });
      }
    } catch (submitError) {
      const status = submitError?.response?.status;
      setError(
        status === 401
          ? "Invalid email or password. Create an account first if you have not signed up yet."
          : submitError?.response?.data?.message || "Unable to login right now."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="app-shell">
        <div className="brand-panel">
          <div className="brand-logo">
            <div className="logo-mark">
              <div className="logo-icon">
                <FaShieldAlt aria-hidden="true" />
              </div>
            </div>
            <div className="logo-text">
              <span className="logo-text-main">PrepQuest</span>{" "}
              <span className="logo-text-sub">Nepal</span>
            </div>
          </div>
          <div className="hero-content">
            <h1 className="hero-title">
              Start Strong. Stay Consistent.
              <br />
              <span className="highlight">Prepare for Loksewa.</span>
            </h1>
            <p className="hero-subtitle">
              Build your daily preparation habit with quizzes, mock tests, XP, coins, streaks, badges,
              and weekly Loksewa battles.
            </p>
          </div>
          <div className="dashboard-preview">
            <div className="preview-header">
              <div className="preview-level">
                <div className="level-badge">1</div>
                <div className="level-info">
                  <span className="level-label">Level</span>{" "}
                  <span className="level-name">New Aspirant</span>
                </div>
              </div>
              <span className="preview-status">Friday Battle Ready</span>
            </div>
            <div className="preview-grid">
              <div className="preview-stat">
                <div className="preview-stat-value">3</div>
                <div className="preview-stat-label">Free Mocks</div>
              </div>
              <div className="preview-stat">
                <div className="preview-stat-value">60%</div>
                <div className="preview-stat-label">Goal Today</div>
              </div>
            </div>
            <div className="progress-section">
              <span className="progress-label">Daily Progress</span>
              <div className="progress-track">
                <div className="progress-fill"></div>
              </div>
              <span className="progress-value">60%</span>
            </div>
          </div>
          <div className="gamification-cards">
            <div className="mini-card">
              <div className="mini-card-icon quiz">
                <FaBookOpen aria-hidden="true" />
              </div>
              <div className="mini-card-title">Daily Quiz</div>
            </div>
            <div className="mini-card">
              <div className="mini-card-icon xp">
                <FaCoins aria-hidden="true" />
              </div>
              <div className="mini-card-title">XP &amp; Coins</div>
            </div>
            <div className="mini-card">
              <div className="mini-card-icon streak">
                <FaFire aria-hidden="true" />
              </div>
              <div className="mini-card-title">Streaks</div>
            </div>
            <div className="mini-card">
              <div className="mini-card-icon battle">
                <FaTrophy aria-hidden="true" />
              </div>
              <div className="mini-card-title">Friday Battle</div>
            </div>
          </div>
        </div>
        <div className="auth-panel">
          <div className="login-card">
            <span className="auth-badge">
              <FaLock aria-hidden="true" /> Secure Student Login
            </span>
            <h2 className="auth-title">Welcome Back, Aspirant</h2>
            <p className="auth-subtitle">
              Continue your PrepQuest journey and keep your progress moving.
            </p>
            <form className="auth-form" onSubmit={handleSubmit}>
              {error ? (
                <div className="form-error" role="alert" aria-live="polite">
                  <span className="form-error-icon">
                    <FaExclamationCircle aria-hidden="true" />
                  </span>
                  <div className="form-error-content">
                    <strong>Login failed</strong>
                    <span>{error}</span>
                    <Link to="/signup">Create an account</Link>
                  </div>
                </div>
              ) : null}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>{" "}
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="auth-input"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>{" "}
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="auth-input"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                  />{" "}
                  <span>Remember me</span>
                </label>{" "}
                <Link to="/forgot-password" className="forgot-link">
                  Forgot Password?
                </Link>
              </div>
              <button type="submit" className="login-button" disabled={loading} aria-busy={loading}>
                {loading ? "Logging in..." : "Login to Dashboard"}
              </button>
              <div className="security-note">
                <span className="security-icon">
                  <FaShieldAlt aria-hidden="true" />
                </span>{" "}
                Your progress, coins, badges, streaks, and mock test history are securely saved.
              </div>
            </form>
            <p className="signup-text">
              New to PrepQuest Nepal? <Link to="/signup">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
