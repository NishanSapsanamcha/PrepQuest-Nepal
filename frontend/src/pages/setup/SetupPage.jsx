import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Brain,
  Briefcase,
  CheckCircle,
  FileText,
  Languages,
  Lock,
  Shield,
  Sparkles,
  Target,
  Trophy
} from "lucide-react";
import "./SetupPage.css";

const examNames = {
  "nayab-subba": "Nayab Subba",
  "sakha-adhikrit": "Sakha Adhikrit"
};

const languageNames = {
  nepali: "Nepali",
  english: "English",
  both: "Both"
};

const features = [
  { label: "Adaptive Learning", Icon: Brain },
  { label: "Gamified Practice", Icon: Trophy },
  { label: "Progress Tracking", Icon: BarChart3 },
  { label: "Mock Tests", Icon: FileText }
];

const activeExams = [
  {
    title: "Nayab Subba",
    value: "nayab-subba",
    description: "GK, Constitution, Current Affairs, IQ, Nepali, English, and mock tests.",
    Icon: Shield
  },
  {
    title: "Sakha Adhikrit",
    value: "sakha-adhikrit",
    description: "GK, Governance, Public Administration, Constitution, and ability practice.",
    Icon: Briefcase
  }
];

const comingSoonExams = [
  {
    title: "Kharidar",
    description: "Entry-level Loksewa preparation track with GK, Nepali, English, and basic ability practice."
  },
  {
    title: "Computer Operator",
    description: "Computer-based Loksewa preparation with IT, computer fundamentals, GK, and aptitude practice."
  },
  {
    title: "Banking Exam",
    description: "Banking preparation track with quantitative ability, reasoning, English, and financial awareness."
  },
  {
    title: "Teacher Service Commission",
    description: "Teaching service preparation with pedagogy, GK, curriculum, and subject-based practice."
  }
];

const languages = [
  {
    title: "Nepali",
    value: "nepali",
    emoji: "🇳🇵",
    description: "नेपाली प्रश्न र व्याख्या"
  },
  {
    title: "English",
    value: "english",
    emoji: "🇬🇧",
    description: "English questions and explanations"
  },
  {
    title: "Both",
    value: "both",
    emoji: "🌐",
    description: "नेपाली + English together"
  }
];

function SetupPage() {
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const isReady = Boolean(selectedExam && selectedLanguage);

  const preview = useMemo(
    () => ({
      exam: selectedExam ? examNames[selectedExam] : "Not selected",
      language: selectedLanguage ? languageNames[selectedLanguage] : "Not selected",
      status: isReady ? "Ready ✓" : "Incomplete"
    }),
    [isReady, selectedExam, selectedLanguage]
  );

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem("onboardingCompleted");
    const storedExam = localStorage.getItem("selectedExam");
    const storedLanguage = localStorage.getItem("preferredLanguage");

    if (onboardingCompleted === "true" && storedExam && storedLanguage) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage("");
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  const handleComingSoon = () => {
    setToastMessage("This track is coming soon.");
  };

  const handleContinue = () => {
    if (!isReady) {
      return;
    }

    localStorage.setItem("selectedExam", selectedExam);
    localStorage.setItem("preferredLanguage", selectedLanguage);
    localStorage.setItem("onboardingCompleted", "true");
    navigate("/dashboard");
  };

  return (
    <main className="setup-page">
      <div className="main-wrapper">
        <div className="content-container">
          <div className="header-section">
            <div className="setup-badge">
              <Sparkles aria-hidden="true" />
              <span>One-time Setup</span>
            </div>
            <h1>Welcome to PrepQuest Nepal</h1>
            <p className="header-subtitle">
              Choose your exam track and preferred language to personalize your preparation journey.
            </p>
          </div>

          <div className="feature-grid">
            {features.map(({ label, Icon }) => (
              <div className="feature-item" key={label}>
                <Icon aria-hidden="true" />
                <p>{label}</p>
              </div>
            ))}
          </div>

          <div className="setup-preview">
            <span className="setup-preview-label">Your Setup:</span>
            <div className="setup-preview-items">
              <span className="preview-tag">
                Exam: <strong>{preview.exam}</strong>
              </span>
              <span className="preview-tag">
                Language: <strong>{preview.language}</strong>
              </span>
              <span className="preview-tag">
                Status: <strong className={`preview-status${isReady ? " ready" : ""}`}>{preview.status}</strong>
              </span>
            </div>
          </div>

          <section>
            <div className="section-header">
              <h2 className="section-title">
                <Target aria-hidden="true" />
                Choose Your Exam Track
              </h2>
              <p className="section-subtitle">Select the Loksewa exam you are preparing for.</p>
            </div>
            <div className="exam-grid">
              {activeExams.map(({ title, value, description, Icon }) => {
                const isSelected = selectedExam === value;

                return (
                  <button
                    type="button"
                    className={`card-active${isSelected ? " selected" : ""}`}
                    key={value}
                    onClick={() => setSelectedExam(value)}
                    aria-pressed={isSelected}
                    aria-label={`Select ${title} exam track`}
                  >
                    <CheckCircle className={`check-icon${isSelected ? " visible" : ""}`} aria-hidden="true" />
                    <span className="exam-card-content">
                      <span className="icon-wrapper active">
                        <Icon aria-hidden="true" />
                      </span>
                      <span className="text-content">
                        <span className="card-title">{title}</span>
                        <span className="card-description">{description}</span>
                      </span>
                    </span>
                  </button>
                );
              })}

              {comingSoonExams.map(({ title, description }) => (
                <button
                  type="button"
                  className="card-coming-soon"
                  key={title}
                  onClick={handleComingSoon}
                  aria-label={`${title} track coming soon`}
                >
                  <span className="coming-soon-badge">Coming Soon</span>
                  <span className="exam-card-content">
                    <span className="icon-wrapper disabled">
                      <Lock aria-hidden="true" />
                    </span>
                    <span className="text-content">
                      <span className="card-title">{title}</span>
                      <span className="card-description">{description}</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="section-header">
              <h2 className="section-title">
                <Languages aria-hidden="true" />
                Choose Your Language
              </h2>
              <p className="section-subtitle">Select how you want questions and explanations presented.</p>
            </div>
            <div className="language-grid">
              {languages.map(({ title, value, emoji, description }) => {
                const isSelected = selectedLanguage === value;

                return (
                  <button
                    type="button"
                    className={`card-active language-card-center${isSelected ? " selected" : ""}`}
                    key={value}
                    onClick={() => setSelectedLanguage(value)}
                    aria-pressed={isSelected}
                    aria-label={`Select ${title} language preference`}
                  >
                    <CheckCircle className={`check-icon${isSelected ? " visible" : ""}`} aria-hidden="true" />
                    <span className="language-emoji" aria-hidden="true">
                      {emoji}
                    </span>
                    <span className="card-title">{title}</span>
                    <span className="card-description">{description}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="continue-section">
            <p className="continue-title">Ready to continue?</p>
            <p className="continue-subtitle">Your exam track and language preference will be saved on this device.</p>
            <button type="button" className="continue-btn" disabled={!isReady} onClick={handleContinue}>
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className={`toast-msg${toastMessage ? " show" : ""}`} role="status" aria-live="polite">
        {toastMessage}
      </div>
    </main>
  );
}

export default SetupPage;
