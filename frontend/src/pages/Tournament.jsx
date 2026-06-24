import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBalanceScale,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaCoins,
  FaCrown,
  FaGift,
  FaGraduationCap,
  FaLanguage,
  FaListAlt,
  FaMedal,
  FaShieldAlt,
  FaTrophy,
  FaUserCheck,
  FaUsers,
} from "react-icons/fa";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  mockLeaderboardUsers,
  mockTournament,
} from "../data/gamificationMockData";
import { getActiveTournamentSession, getThisWeekTournamentAttempt } from "../utils/tournamentUtils";
import "./Tournament.css";

const JOINED_KEY = "prepquest_tournament_joined_preview";

const examLabels = {
  "nayab-subba": "Nayab Subba",
  "sakha-adhikrit": "Sakha Adhikrit",
};

const languageLabels = {
  english: "English",
  nepali: "Nepali",
  both: "Both",
};

function formatPreference(value, labels) {
  const normalized = String(value || "").trim().toLowerCase();
  return labels[normalized] || value || "Not selected";
}

function Tournament() {
  const navigate = useNavigate();
  const rulesRef = useRef(null);
  const { user: authUser } = useAuth();
  const userName = authUser?.fullName || authUser?.name || localStorage.getItem("userName") || "Aspirant";
  const selectedExam = localStorage.getItem("selectedExam") || "sakha-adhikrit";
  const preferredLanguage = localStorage.getItem("preferredLanguage") || "english";
  const [joined, setJoined] = useState(() => localStorage.getItem(JOINED_KEY) === "true");
  const completedAttempt = getThisWeekTournamentAttempt();
  const hasActiveSession = Boolean(getActiveTournamentSession());
  const previewLeaderboard = mockLeaderboardUsers.slice(0, 5).map((user) => ({
    rank: user.rank,
    name: user.isCurrentUser ? userName : user.name,
    exam: user.isCurrentUser ? formatPreference(selectedExam, examLabels) : user.examTrack,
    points: user.tournamentPoints,
    isCurrentUser: user.isCurrentUser,
  }));

  const handlePrimaryAction = () => {
    if (completedAttempt) {
      navigate("/tournament/result");
      return;
    }
    if (!joined) {
      localStorage.setItem(JOINED_KEY, "true");
      setJoined(true);
      return;
    }
    navigate("/tournament/session");
  };

  const primaryLabel = completedAttempt
    ? "View My Result"
    : !joined
      ? "Join Friday Battle"
      : hasActiveSession
        ? "Resume Battle"
        : "Enter Battle Arena";

  const handleViewRules = () => {
    rulesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    rulesRef.current?.focus({ preventScroll: true });
  };

  return (
    <DashboardLayout activeKey="tournament">
      <section className="dashboard-content tournament-page">
        <header className="dashboard-card tournament-header-card">
          <div className="tournament-header-main">
            <span className="tournament-label-chip"><FaTrophy /> Friday Loksewa Battle</span>
            <h1>Friday Tournament</h1>
            <p>
              Compete every Friday in a fair Loksewa quiz battle. Earn XP, coins, badges,
              and leaderboard rank without betting or coin loss.
            </p>

            <div className="tournament-chip-row" aria-label="Tournament context">
              <span className="tournament-chip"><FaGraduationCap /> Exam: <strong>{formatPreference(selectedExam, examLabels)}</strong></span>
              <span className="tournament-chip"><FaLanguage /> Language: <strong>{formatPreference(preferredLanguage, languageLabels)}</strong></span>
              <span className="tournament-chip"><FaCalendarAlt /> {mockTournament.schedule}</span>
              <span className="tournament-chip safe"><FaShieldAlt /> No betting. No coin loss.</span>
            </div>

            {completedAttempt ? (
              <p className="tournament-success"><FaCheckCircle /> You scored {completedAttempt.totalScore} pts and finished rank #{completedAttempt.rank} this week.</p>
            ) : joined ? (
              <p className="tournament-success"><FaCheckCircle /> You're in. Enter the battle arena when you're ready.</p>
            ) : null}
          </div>

          <div className="tournament-header-actions">
            <button className="tournament-primary-btn" type="button" onClick={handlePrimaryAction}>
              <FaTrophy /> {primaryLabel}
            </button>
            <button className="tournament-secondary-btn" type="button" onClick={handleViewRules}>
              <FaListAlt /> View Rules
            </button>
          </div>
        </header>

        <section className="tournament-stats-grid" aria-label="Tournament status">
          <article className="stat-card tournament-stat-card">
            <div className="stat-icon"><FaCalendarAlt /></div>
            <div><div className="stat-value">Friday 7 PM</div><div className="stat-label">Next Battle</div><div className="stat-helper">Weekly tournament schedule</div></div>
          </article>
          <article className="stat-card tournament-stat-card">
            <div className="stat-icon"><FaClock /></div>
            <div><div className="stat-value">{mockTournament.startsIn.days} Days {String(mockTournament.startsIn.hours).padStart(2, "0")} Hours</div><div className="stat-label">Starts In</div><div className="stat-helper">Countdown preview</div></div>
          </article>
          <article className="stat-card tournament-stat-card">
            <div className="stat-icon"><FaUsers /></div>
            <div><div className="stat-value">{mockTournament.participants}</div><div className="stat-label">Participants</div><div className="stat-helper">Loksewa learners joining this week</div></div>
          </article>
          <article className="stat-card tournament-stat-card">
            <div className="stat-icon"><FaUserCheck /></div>
            <div>
              <div className="stat-value">{completedAttempt ? "Battle Complete" : joined ? "Ready to Battle" : "Not Joined"}</div>
              <div className="stat-label">Your Status</div>
              <div className="stat-helper">{completedAttempt ? `Rank #${completedAttempt.rank} this week` : joined ? "Enter the arena to start your 20 questions" : "Join to enter the Friday battle"}</div>
            </div>
          </article>
        </section>

        <div className="tournament-main-grid">
          <div className="tournament-left-column">
            <section className="dashboard-card tournament-card" ref={rulesRef} tabIndex={-1}>
              <div className="tournament-card-header">
                <h2 className="card-title"><FaBalanceScale /> How Scoring Works</h2>
                <span className="status-chip">Transparent</span>
              </div>
              <div className="tournament-rule-list">
                {[...mockTournament.scoring, { label: "No betting", value: "Users never lose coins" }].map((rule) => (
                  <div className="tournament-rule-row" key={rule.label}>
                    <span>{rule.label}</span>
                    <strong>{rule.value}</strong>
                  </div>
                ))}
              </div>
              <p className="tournament-note">Simple scoring keeps the competition transparent, fair, and motivating.</p>
            </section>

            <section className="dashboard-card tournament-card">
              <div className="tournament-card-header">
                <h2 className="card-title"><FaListAlt /> Battle Format</h2>
                <span className="status-chip">Preview</span>
              </div>
              <div className="tournament-format-grid">
                {mockTournament.format.map((item) => (
                  <div className="tournament-format-item" key={item}><FaCheckCircle /> {item}</div>
                ))}
              </div>
            </section>

            <section className="dashboard-card tournament-card">
              <div className="tournament-card-header">
                <h2 className="card-title"><FaShieldAlt /> Fair Play Rules</h2>
                <span className="status-chip">Ethical</span>
              </div>
              <div className="tournament-format-grid">
                {mockTournament.rules.slice(4).map((item) => (
                  <div className="tournament-format-item" key={item}><FaShieldAlt /> {item}</div>
                ))}
              </div>
            </section>
          </div>

          <aside className="tournament-right-column">
            <section className="dashboard-card tournament-card registration-card">
              <div className="tournament-card-header">
                <h2 className="card-title"><FaClock /> Registration Open</h2>
                <span className="status-chip">Live Preview</span>
              </div>
              <div className="tournament-detail-list">
                <div><span>Starts in</span><strong>{mockTournament.startsIn.days} days</strong></div>
                <div><span>Time</span><strong>{mockTournament.time}</strong></div>
                <div><span>Status</span><strong>{mockTournament.status}</strong></div>
              </div>
              {(joined || completedAttempt) && (
                <p className="tournament-success compact"><FaCheckCircle /> {completedAttempt ? `Rank #${completedAttempt.rank} — ${completedAttempt.totalScore} pts` : "You're in. Ready when you are."}</p>
              )}
              <button className="tournament-primary-btn full" type="button" onClick={handlePrimaryAction}>
                <FaTrophy /> {primaryLabel}
              </button>
            </section>

            <section className="dashboard-card tournament-card">
              <div className="tournament-card-header">
                <h2 className="card-title"><FaMedal /> Tournament Leaderboard Preview</h2>
              </div>
              <div className="tournament-leaderboard-list">
                {previewLeaderboard.map((row) => (
                  <div className={`tournament-leaderboard-row${row.isCurrentUser ? " current-user" : ""}`} key={row.rank}>
                    <span className={`leaderboard-rank rank-${row.rank}`}>{row.rank}</span>
                    <div>
                      <strong>{row.name}</strong>
                      <span>{row.exam}</span>
                    </div>
                    <strong>{row.points} pts</strong>
                  </div>
                ))}
              </div>
              <div className="your-rank">
                Your rank: {completedAttempt ? `#${completedAttempt.rank} of ${completedAttempt.totalParticipants}` : joined ? "Ranked after you finish the battle" : "Not joined yet"}
              </div>
            </section>

            <section className="dashboard-card tournament-card">
              <div className="tournament-card-header">
                <h2 className="card-title"><FaGift /> Tournament Rewards</h2>
                <span className="gold-chip"><FaCrown /> Friday Battle Rewards</span>
              </div>
              <div className="tournament-reward-list">
                {mockTournament.rewards.map((tier) => (
                  <div className="tournament-reward-row" key={tier.rank}>
                    <span>{tier.rank}</span>
                    <strong>{tier.reward}</strong>
                  </div>
                ))}
              </div>
              <p className="tournament-note"><FaCoins /> XP and coins are awarded automatically when you complete the Friday Battle below.</p>
            </section>
          </aside>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default Tournament;
