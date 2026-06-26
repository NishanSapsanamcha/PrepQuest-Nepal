import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBalanceScale,
  FaCheckCircle,
  FaClock,
  FaCrown,
  FaExclamationTriangle,
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
import { CoinIcon, RewardDisplay } from "../components/common/Coin";
import { getCurrentTournaments, registerForTournament } from "../services/tournamentService";
import "./Tournament.css";

const examLabels = {
  "nayab-subba": "Nayab Subba",
  "sakha-adhikrit": "Sakha Adhikrit",
};

const languageLabels = {
  english: "English",
  nepali: "Nepali",
  both: "Both",
};

const rewards = [
  { rank: "1st Place", coins: 500, xp: 500, badge: "Gold Champion Badge" },
  { rank: "2nd Place", coins: 300, xp: 300, badge: "Silver Champion Badge" },
  { rank: "3rd Place", coins: 150, xp: 200, badge: "Bronze Champion Badge" },
  { rank: "Top 10", badge: "Top Performer Badge" },
  { rank: "All Participants", coins: 50, xp: 100 },
];

function formatPreference(value, labels) {
  return labels[String(value || "").trim().toLowerCase()] || value || "Not selected";
}

function formatCountdown(seconds = 0) {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${minutes}m ${String(secs).padStart(2, "0")}s`;
}

function formatRegistrationCount(count = 0) {
  return `${count} ${count === 1 ? "user" : "users"} registered`;
}

function getAction(tournament) {
  const registered = Boolean(tournament?.registration);
  if (!tournament) return { label: "Unavailable", disabled: true, kind: "disabled" };
  if (tournament.status === "registration_open" && !registered) return { label: "Join Tournament", disabled: false, kind: "join" };
  if (tournament.status === "registration_open" && registered) return { label: "Registered", disabled: true, kind: "registered" };
  if (tournament.status === "ready_room" && registered) return { label: "Enter Tournament", disabled: false, kind: "enter" };
  if (tournament.status === "ready_room" && !registered) return { label: "Registration Closed", disabled: true, kind: "closed" };
  if (["live", "reveal", "checkpoint"].includes(tournament.status) && registered) return { label: "Enter Battle", disabled: false, kind: "enter" };
  if (["live", "reveal", "checkpoint"].includes(tournament.status) && !registered) return { label: "Registration Closed", disabled: true, kind: "closed" };
  if (tournament.status === "finished" || tournament.status === "results_published") return { label: "View Results", disabled: false, kind: "results" };
  return { label: "Registration Closed", disabled: true, kind: "closed" };
}

function Tournament() {
  const navigate = useNavigate();
  const rulesRef = useRef(null);
  const selectedExam = localStorage.getItem("selectedExam") || "";
  const preferredLanguage = localStorage.getItem("preferredLanguage") || "";
  const [tournament, setTournament] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const data = await getCurrentTournaments();
      const nextTournament = data.tournament;
      setTournament(nextTournament);
      setError("");
      if (nextTournament?.registration) {
        setMessage("You're already registered for this tournament.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Tournament server is unavailable.");
    }
  };

  useEffect(() => {
    load();
    const id = window.setInterval(load, 1000);
    return () => window.clearInterval(id);
  }, []);

  const action = getAction(tournament);
  const registered = Boolean(tournament?.registration);

  const handleAction = async () => {
    if (!tournament || action.disabled) return;
    if (action.kind === "enter") {
      navigate(`/tournament/session?id=${encodeURIComponent(tournament.id)}`);
      return;
    }
    if (action.kind === "results") {
      navigate(`/tournament/result?id=${encodeURIComponent(tournament.id)}`);
      return;
    }
    if (action.kind !== "join") return;

    setBusy(true);
    setMessage("");
    setError("");
    try {
      const data = await registerForTournament(tournament.id, { selectedExam, preferredLanguage });
      setMessage(data.message || "You're already registered for this tournament.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not register for this tournament.");
    } finally {
      setBusy(false);
    }
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
            <span className="tournament-label-chip"><FaTrophy /> Friday Live Tournament</span>
            <h1>Friday Live Tournament</h1>
            <p>
              Register once, wait for the server countdown, then enter a timed live Loksewa battle
              with checkpoint rankings and final podium results.
            </p>

            <div className="tournament-chip-row" aria-label="Tournament context">
              <span className="tournament-chip"><FaClock /> Starts in: <strong>{formatCountdown(tournament?.secondsToStart || 0)}</strong></span>
              <span className="tournament-chip"><FaGraduationCap /> Exam: <strong>{formatPreference(selectedExam, examLabels)}</strong></span>
              <span className="tournament-chip"><FaLanguage /> Language: <strong>{formatPreference(preferredLanguage, languageLabels)}</strong></span>
              <span className="tournament-chip safe"><FaShieldAlt /> No betting. No coin loss.</span>
            </div>

            {message && <p className="tournament-success"><FaCheckCircle /> {message}</p>}
            {error && <p className="tournament-error"><FaExclamationTriangle /> {error}</p>}
          </div>

          <div className="tournament-header-actions">
            <button className="tournament-primary-btn" type="button" disabled={action.disabled || busy} onClick={handleAction}>
              <FaTrophy /> {busy ? "Please wait..." : action.label}
            </button>
            <button className="tournament-secondary-btn" type="button" onClick={handleViewRules}>
              <FaListAlt /> View Rules
            </button>
          </div>
        </header>

        <section className="tournament-stats-grid" aria-label="Tournament status">
          <article className="stat-card tournament-stat-card">
            <div className="stat-icon"><FaClock /></div>
            <div><div className="stat-value">{formatCountdown(tournament?.secondsToStart || 0)}</div><div className="stat-label">Registration Countdown</div><div className="stat-helper">Battle starts automatically</div></div>
          </article>
          <article className="stat-card tournament-stat-card">
            <div className="stat-icon"><FaUsers /></div>
            <div><div className="stat-value">{tournament?.registrationCount ?? 0}</div><div className="stat-label">Registered Users</div><div className="stat-helper">{formatRegistrationCount(tournament?.registrationCount || 0)}</div></div>
          </article>
          <article className="stat-card tournament-stat-card">
            <div className="stat-icon"><FaUserCheck /></div>
            <div><div className="stat-value">{registered ? "Registered" : "Not Registered"}</div><div className="stat-label">Your Status</div><div className="stat-helper">{registered ? "You're already registered for this tournament." : "Join before countdown reaches zero"}</div></div>
          </article>
          <article className="stat-card tournament-stat-card">
            <div className="stat-icon"><FaShieldAlt /></div>
            <div><div className="stat-value">{String(tournament?.status || "loading").replaceAll("_", " ")}</div><div className="stat-label">Tournament Status</div><div className="stat-helper">Server controlled</div></div>
          </article>
        </section>

        <div className="tournament-main-grid">
          <div className="tournament-left-column">
            <section className="dashboard-card tournament-card registration-card">
              <div className="tournament-card-header">
                <h2 className="card-title"><FaTrophy /> Friday Live Tournament</h2>
                <span className="status-chip">{formatRegistrationCount(tournament?.registrationCount || 0)}</span>
              </div>
              <div className="tournament-detail-list">
                <div><span>Status</span><strong>{String(tournament?.status || "loading").replaceAll("_", " ")}</strong></div>
              <div><span>{tournament?.status === "ready_room" ? "Ready Room" : "Countdown"}</span><strong>{tournament?.status === "ready_room" ? `${tournament?.readyCountdownSeconds || 0}s` : formatCountdown(tournament?.secondsToStart || 0)}</strong></div>
                <div><span>Questions</span><strong>{tournament?.questionCount || 20} mixed questions, {tournament?.timePerQuestion || 15}s each</strong></div>
                <div><span>Ranking</span><strong>After questions 5, 10, and 15</strong></div>
              </div>

              {registered ? (
                <p className="tournament-success compact"><FaCheckCircle /> You're already registered for this tournament.</p>
              ) : tournament?.status !== "registration_open" ? (
                <p className="tournament-note"><FaExclamationTriangle /> Registration Closed.</p>
              ) : null}

              <button className="tournament-primary-btn full" type="button" disabled={action.disabled || busy} onClick={handleAction}>
                <FaTrophy /> {busy ? "Please wait..." : action.label}
              </button>
            </section>

            <section className="dashboard-card tournament-card" ref={rulesRef} tabIndex={-1}>
              <div className="tournament-card-header">
                <h2 className="card-title"><FaBalanceScale /> Live Battle Rules</h2>
                <span className="status-chip">Fair scoring</span>
              </div>
              <div className="tournament-format-grid">
                <div className="tournament-format-item"><FaCheckCircle /> 20 mixed Loksewa questions</div>
                <div className="tournament-format-item"><FaCheckCircle /> 15 seconds per question</div>
                <div className="tournament-format-item"><FaCheckCircle /> Correct answer gives +100 points</div>
                <div className="tournament-format-item"><FaCheckCircle /> Faster correct answers earn +0 to +50 speed bonus</div>
                <div className="tournament-format-item"><FaCheckCircle /> Maximum per question: 150 points</div>
                <div className="tournament-format-item"><FaCheckCircle /> Wrong or unanswered gives 0 points</div>
                <div className="tournament-format-item"><FaCheckCircle /> Answer locks after submit and cannot be changed</div>
                <div className="tournament-format-item"><FaCheckCircle /> Correct/wrong reveals only after timer closes</div>
                <div className="tournament-format-item"><FaCheckCircle /> Checkpoints after questions 5, 10, and 15</div>
                <div className="tournament-format-item"><FaCheckCircle /> Missed questions count as unanswered</div>
                <div className="tournament-format-item"><FaShieldAlt /> No betting. Users never lose coins.</div>
              </div>
              <div className="scoring-highlight-grid" aria-label="Tournament scoring examples">
                <div><span>Correct Answer</span><strong>+100 points</strong></div>
                <div><span>Speed Bonus</span><strong>+0 to +50</strong></div>
                <div><span>Max Per Question</span><strong>150 points</strong></div>
                <div><span>Wrong / Unanswered</span><strong>0 points</strong></div>
              </div>
              <p className="tournament-note">Choose carefully - once submitted, your answer cannot be changed. Correct with 15s left = 150 points; with 8s left = about 127; with 1s left = about 103.</p>
            </section>
          </div>

          <aside className="tournament-right-column">
            <section className="dashboard-card tournament-card">
              <div className="tournament-card-header">
                <h2 className="card-title"><FaMedal /> Leaderboard</h2>
              </div>
              <p className="empty-state">Leaderboard will appear after participants answer live questions.</p>
            </section>

            <section className="dashboard-card tournament-card">
              <div className="tournament-card-header">
                <h2 className="card-title"><FaGift /> Tournament Rewards</h2>
                <span className="gold-chip"><FaCrown /> Podium</span>
              </div>
              <div className="tournament-reward-list">
                {rewards.map(({ rank, coins, xp, badge }) => (
                  <div className="tournament-reward-row" key={rank}>
                    <span>{rank}</span>
                    {coins != null || xp != null ? (
                      <RewardDisplay coins={coins} xp={xp} extra={badge} />
                    ) : (
                      <strong>{badge}</strong>
                    )}
                  </div>
                ))}
              </div>
              <p className="tournament-note"><CoinIcon size="sm" /> Rewards are applied once when results are published.</p>
            </section>
          </aside>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default Tournament;
