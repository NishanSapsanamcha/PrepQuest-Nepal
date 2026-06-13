import { useState } from "react";
import {
  FaArrowLeft,
  FaChartLine,
  FaCheckCircle,
  FaCoins,
  FaEnvelope,
  FaKey,
  FaLock,
  FaQuestionCircle,
  FaShieldAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import "./ForgotPasswordPage.css";

function ForgotPasswordPage() {
  const [step, setStep] = useState("email");

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setStep("question");
  };

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    setStep("reset");
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    setStep("success");
  };

  return (
    <main className="forgot-page">
      <div className="app-shell">
        <section className="brand-panel" aria-label="PrepQuest Nepal account recovery">
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
              Recover Access. Keep Progress Safe.
              <br />
              <span className="highlight">Your journey continues.</span>
            </h1>
            <p className="hero-subtitle">
              Use your registered email and security question to safely recover your PrepQuest
              account.
            </p>
          </div>

          <div className="recovery-preview">
            <div className="recovery-step active">
              <span className="recovery-step-icon">
                <FaEnvelope aria-hidden="true" />
              </span>
              <div>
                <span className="recovery-step-label">Step 1</span>
                <strong>Email Lookup</strong>
              </div>
            </div>
            <div className={`recovery-step ${step !== "email" ? "active" : ""}`}>
              <span className="recovery-step-icon">
                <FaQuestionCircle aria-hidden="true" />
              </span>
              <div>
                <span className="recovery-step-label">Step 2</span>
                <strong>Security Check</strong>
              </div>
            </div>
            <div className={`recovery-step ${step === "reset" || step === "success" ? "active" : ""}`}>
              <span className="recovery-step-icon">
                <FaKey aria-hidden="true" />
              </span>
              <div>
                <span className="recovery-step-label">Step 3</span>
                <strong>New Password</strong>
              </div>
            </div>
          </div>

          <div className="gamification-cards">
            <div className="mini-card">
              <div className="mini-card-icon quiz">
                <FaQuestionCircle aria-hidden="true" />
              </div>
              <div className="mini-card-title">Secure Question</div>
            </div>
            <div className="mini-card">
              <div className="mini-card-icon xp">
                <FaShieldAlt aria-hidden="true" />
              </div>
              <div className="mini-card-title">Saved Progress</div>
            </div>
            <div className="mini-card">
              <div className="mini-card-icon streak">
                <FaCoins aria-hidden="true" />
              </div>
              <div className="mini-card-title">XP &amp; Coins Protected</div>
            </div>
            <div className="mini-card">
              <div className="mini-card-icon battle">
                <FaChartLine aria-hidden="true" />
              </div>
              <div className="mini-card-title">Back to Dashboard</div>
            </div>
          </div>
        </section>

        <section className="auth-panel" aria-label="Forgot password">
          <div className="forgot-card">
            {step === "email" && (
              <>
                <span className="auth-badge">
                  <FaLock aria-hidden="true" /> Account Recovery
                </span>
                <h2 className="auth-title">Recover Your Account</h2>
                <p className="auth-subtitle">
                  Enter your email address to find your PrepQuest security question.
                </p>
                <form className="forgot-form" onSubmit={handleEmailSubmit}>
                  <div className="form-group">
                    <label htmlFor="recovery-email">Email Address</label>
                    <input
                      type="email"
                      id="recovery-email"
                      className="auth-input"
                      placeholder="Enter your registered email"
                      autoComplete="email"
                    />
                  </div>
                  <button type="submit" className="forgot-button">
                    Continue
                  </button>
                </form>
                <Link to="/login" className="back-link">
                  <FaArrowLeft aria-hidden="true" /> Back to Login
                </Link>
              </>
            )}

            {step === "question" && (
              <>
                <span className="auth-badge">
                  <FaQuestionCircle aria-hidden="true" /> Security Check
                </span>
                <h2 className="auth-title">Security Verification</h2>
                <p className="auth-subtitle">Answer your security question to continue.</p>
                <form className="forgot-form" onSubmit={handleQuestionSubmit}>
                  <div className="question-card">
                    <span className="question-icon">
                      <FaQuestionCircle aria-hidden="true" />
                    </span>
                    What is your favorite teacher's name?
                  </div>
                  <div className="form-group">
                    <label htmlFor="security-answer">Security Answer</label>
                    <input
                      type="text"
                      id="security-answer"
                      className="auth-input"
                      placeholder="Enter your answer"
                      autoComplete="off"
                    />
                  </div>
                  <button type="submit" className="forgot-button">
                    Verify Answer
                  </button>
                </form>
                <button type="button" className="text-button" onClick={() => setStep("email")}>
                  Use another email
                </button>
              </>
            )}

            {step === "reset" && (
              <>
                <span className="auth-badge">
                  <FaKey aria-hidden="true" /> Password Reset
                </span>
                <h2 className="auth-title">Create New Password</h2>
                <p className="auth-subtitle">
                  Enter a new password for your PrepQuest account.
                </p>
                <form className="forgot-form" onSubmit={handleResetSubmit}>
                  <div className="form-group">
                    <label htmlFor="new-password">New Password</label>
                    <input
                      type="password"
                      id="new-password"
                      className="auth-input"
                      placeholder="Enter new password"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirm-new-password">Confirm Password</label>
                    <input
                      type="password"
                      id="confirm-new-password"
                      className="auth-input"
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                    />
                  </div>
                  <button type="submit" className="forgot-button">
                    Reset Password
                  </button>
                </form>
                <Link to="/login" className="back-link">
                  <FaArrowLeft aria-hidden="true" /> Back to Login
                </Link>
              </>
            )}

            {step === "success" && (
              <div className="success-card">
                <div className="success-icon">
                  <FaCheckCircle aria-hidden="true" />
                </div>
                <h2 className="auth-title">Password Reset Complete</h2>
                <p className="auth-subtitle">
                  Password reset successfully. You can now login with your new password.
                </p>
                <Link to="/login" className="forgot-button success-link">
                  Go to Login
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default ForgotPasswordPage;
