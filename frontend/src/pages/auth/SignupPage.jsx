import { useState } from "react";
import {
  FaBookOpen,
  FaChartLine,
  FaExclamationCircle,
  FaFire,
  FaLock,
  FaShieldAlt,
  FaTrophy,
  FaUserPlus,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { CoinIcon } from "../../components/common/Coin";
import { registerUser } from "../../services/authService";
import "./SignupPage.css";

const getSignupErrorMessage = (submitError) => {
  const data = submitError?.response?.data;
  const firstDetail = Array.isArray(data?.errors) ? data.errors.find(Boolean) : "";

  return firstDetail || data?.message || "Unable to create your account right now.";
};

function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    securityQuestion: "",
    securityAnswer: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
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
      const response = await registerUser(formData);
      login(response, true);
      navigate("/dashboard", { replace: true });
    } catch (submitError) {
      setError(getSignupErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup-page">
      <div className="app-shell">
        <section className="brand-panel" aria-label="PrepQuest Nepal">
          <div className="brand-logo">
            <div className="logo-mark" aria-hidden="true">
              <div className="logo-icon">
                <FaShieldAlt aria-hidden="true" />
              </div>
            </div>
            <div className="logo-text">
              <span className="logo-text-main">PrepQuest</span>
              <span className="logo-text-sub">Nepal</span>
            </div>
          </div>

          <div className="hero-content">
            <h1 className="hero-title">
              Start Your PrepQuest Journey Today.
              <br />
              <span className="highlight">Build your Loksewa habit.</span>
            </h1>
            <p className="hero-subtitle">
              Create your account to begin daily quizzes, mock tests, XP rewards, streaks, badges,
              and Friday Loksewa battles.
            </p>
          </div>

          <div className="dashboard-preview">
            <div className="preview-header">
              <div className="preview-level">
                <div className="level-badge">1</div>
                <div className="level-info">
                  <span className="level-label">Level</span>
                  <span className="level-name">New Aspirant</span>
                </div>
              </div>
              <span className="preview-status">Starter Account</span>
            </div>

            <div className="preview-grid signup-preview-grid">
              <div className="preview-stat">
                <div className="preview-stat-value">0</div>
                <div className="preview-stat-label">XP Earned</div>
              </div>
              <div className="preview-stat">
                <div className="preview-stat-value">3</div>
                <div className="preview-stat-label">Free Mocks</div>
              </div>
              <div className="preview-stat">
                <div className="preview-stat-value preview-stat-icon">
                  <FaTrophy aria-hidden="true" />
                </div>
                <div className="preview-stat-label">First Badge</div>
              </div>
            </div>

            <div className="progress-section">
              <span className="progress-label">Progress</span>
              <div className="progress-track">
                <div className="progress-fill signup-progress-fill"></div>
              </div>
              <span className="progress-value">Ready</span>
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
                <FaChartLine aria-hidden="true" />
              </div>
              <div className="mini-card-title">Mock Tests</div>
            </div>
            <div className="mini-card">
              <div className="mini-card-icon streak">
                <CoinIcon size="sm" />
              </div>
              <div className="mini-card-title">XP &amp; Coins</div>
            </div>
            <div className="mini-card">
              <div className="mini-card-icon battle">
                <FaFire aria-hidden="true" />
              </div>
              <div className="mini-card-title">Badges &amp; Streaks</div>
            </div>
          </div>
        </section>

        <section className="auth-panel" aria-label="Create account">
          <div className="signup-card">
            <header className="signup-header">
              <span className="auth-badge">
                <FaUserPlus aria-hidden="true" /> Create Student Account
              </span>
              <h2 className="auth-title">Create Your Account</h2>
              <p className="auth-subtitle">
                Start your gamified Loksewa preparation and save your XP, coins, streaks, badges,
                and progress.
              </p>
            </header>

            <form className="signup-form" onSubmit={handleSubmit}>
              {error ? (
                <div className="form-error" role="alert" aria-live="polite">
                  <span className="form-error-icon">
                    <FaExclamationCircle aria-hidden="true" />
                  </span>
                  <div className="form-error-content">
                    <strong>Account could not be created</strong>
                    <span>{error}</span>
                  </div>
                </div>
              ) : null}
              <div className="signup-form-scroll">
                <div className="form-group">
                  <label htmlFor="fullname">Full Name</label>
                  <input
                    type="text"
                    id="fullname"
                    name="fullName"
                    className="auth-input"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signup-email">Email Address</label>
                  <input
                    type="email"
                    id="signup-email"
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
                  <label htmlFor="signup-password">Password</label>
                  <input
                    type="password"
                    id="signup-password"
                    name="password"
                    className="auth-input"
                    placeholder="Create a password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <input
                    type="password"
                    id="confirm-password"
                    name="confirmPassword"
                    className="auth-input"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="security-question">Security Question</label>
                  <select
                    id="security-question"
                    name="securityQuestion"
                    className="auth-select"
                    value={formData.securityQuestion}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      Select a security question
                    </option>
                    <option value="nickname">What is your childhood nickname?</option>
                    <option value="school">What is the name of your first school?</option>
                    <option value="birthplace">What is your birthplace?</option>
                    <option value="teacher">What is your favorite teacher's name?</option>
                    <option value="book">What is your favorite book?</option>
                  </select>
                  <span className="helper-text">
                    This question will help you recover your password later.
                  </span>
                </div>

                <div className="form-group">
                  <label htmlFor="security-answer">Security Answer</label>
                  <input
                    type="text"
                    id="security-answer"
                    name="securityAnswer"
                    className="auth-input"
                    placeholder="Enter your answer"
                    autoComplete="off"
                    value={formData.securityAnswer}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <footer className="signup-footer">
                <button type="submit" className="signup-button" disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </button>
                <p className="login-text">
                  Already have an account?{" "}
                  <Link to="/login" className="auth-link">
                    Login
                  </Link>
                </p>
                <div className="signup-security-note">
                  <FaLock aria-hidden="true" /> Your account details help keep your progress safe.
                </div>
              </footer>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

export default SignupPage;
