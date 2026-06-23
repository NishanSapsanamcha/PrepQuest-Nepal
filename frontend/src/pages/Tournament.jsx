import { useRef, useState } from "react";
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
import {
  mockCurrentUser,
  mockLeaderboardUsers,
  mockTournament,
} from "../data/gamificationMockData";
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

const previewLeaderboard = mockLeaderboardUsers.slice(0, 5).map((user) => ({
  rank: user.rank,
  name: user.name,
  exam: user.examTrack,
  points: user.tournamentPoints,
}));

function formatPreference(value, labels) {
  const normalized = String(value || "").trim().toLowerCase();
  return labels[normalized] || value || "Not selected";
}

function Tournament() {
  const rulesRef = useRef(null);
  const selectedExam = localStorage.getItem("selectedExam") || mockCurrentUser.examTrack;
  const preferredLanguage = localStorage.getItem("preferredLanguage") || mockCurrentUser.languageMode;
  const [joined, setJoined] = useState(() => localStorage.getItem(JOINED_KEY) === "true");

  const handleJoin = () => {
    localStorage.setItem(JOINED_KEY, "true");
    setJoined(true);
  };

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

            {joined && <p className="tournament-success"><FaCheckCircle /> You joined the Friday Battle preview.</p>}
          </div>

          <div className="tournament-header-actions">
            <button className="tournament-primary-btn" type="button" onClick={handleJoin}>
              <FaTrophy /> {joined ? "Joined" : "Join Friday Battle"}
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
            <div><div className="stat-value">{mockTournament.participants}</div><div className="stat-label">Participants</div><div className="stat-helper">Mock registered learners</div></div>
          </article>
          <article className="stat-card tournament-stat-card">
            <div className="stat-icon"><FaUserCheck /></div>
            <div><div className="stat-value">{joined ? "Joined" : "Not Joined"}</div><div className="stat-label">Your Status</div><div className="stat-helper">{joined ? "You are in the Friday preview" : "Join to enter the Friday battle"}</div></div>
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
              {joined && <p className="tournament-success compact"><FaCheckCircle /> You joined the Friday Battle preview.</p>}
              <button className="tournament-primary-btn full" type="button" onClick={handleJoin}>
                <FaTrophy /> {joined ? "Joined" : "Join Friday Battle"}
              </button>
            </section>

            <section className="dashboard-card tournament-card">
              <div className="tournament-card-header">
                <h2 className="card-title"><FaMedal /> Mock Leaderboard Preview</h2>
              </div>
              <div className="tournament-leaderboard-list">
                {previewLeaderboard.map((row) => (
                  <div className="tournament-leaderboard-row" key={row.rank}>
                    <span className={`leaderboard-rank rank-${row.rank}`}>{row.rank}</span>
                    <div>
                      <strong>{row.name}</strong>
                      <span>{row.exam}</span>
                    </div>
                    <strong>{row.points} pts</strong>
                  </div>
                ))}
              </div>
              <div className="your-rank">Your preview rank: {joined ? "Joined - rank after battle" : "Not joined yet"}</div>
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
              <p className="tournament-note"><FaCoins /> Prototype display only. Rewards are not added to XP or coin balance from this page.</p>
            </section>
          </aside>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default Tournament;
