import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBalanceScale,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaCoins,
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
  ["1st Place", "500 coins + 500 XP + Gold Champion Badge"],
  ["2nd Place", "300 coins + 300 XP + Silver Champion Badge"],
  ["3rd Place", "150 coins + 200 XP + Bronze Champion Badge"],
  ["Top 10", "Top Performer Badge"],
  ["All Participants", "50 coins + 100 XP"],
];

function formatPreference(value, labels) {
  return labels[String(value || "").trim().toLowerCase()] || value || "Not selected";
}

function formatCountdown(seconds = 0) {
  const safe = Math.max(0, seconds);
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (days) return `${days}d ${hours}h`;
  if (hours) return `${hours}h ${minutes}m`;
  return `${minutes}m ${String(secs).padStart(2, "0")}s`;
}

function getAction(tournament) {
  const registered = Boolean(tournament?.registration);
  if (!tournament) return { label: "Unavailable", disabled: true, kind: "disabled" };
  if (tournament.status === "registration_open" && !registered) return { label: "Join Tournament", disabled: false, kind: "join" };
  if (tournament.status === "registration_open" && registered) return { label: "Registered", disabled: true, kind: "registered" };
  if ((tournament.status === "starting_soon" || tournament.status === "live" || tournament.status === "checkpoint") && registered) {
    return { label: tournament.status === "live" ? "Rejoin Live Battle" : "Enter Battle", disabled: false, kind: "enter" };
  }
  if (tournament.status === "finished" || tournament.status === "results_published") return { label: "View Results", disabled: false, kind: "results" };
  return { label: "Registration Closed", disabled: true, kind: "closed" };
}

function TournamentCard({ tournament, selectedExam, preferredLanguage, onAction, busyId }) {
  const action = getAction(tournament);
  const registered = Boolean(tournament?.registration);
  const isDemo = tournament?.type === "demo";

  return (
    <section className="dashboard-card tournament-card registration-card">
      <div className="tournament-card-header">
        <h2 className="card-title">
          <FaTrophy /> {tournament?.title || "Tournament"}
        </h2>
        <span className={isDemo ? "status-chip demo-chip" : "status-chip"}>{isDemo ? "Quick Demo Battle" : "Official Friday"}</span>
      </div>

      <div className="tournament-detail-list">
        <div><span>Status</span><strong>{String(tournament?.status || "unavailable").replaceAll("_", " ")}</strong></div>
        <div><span>Registered</span><strong>{tournament?.registrationCount ?? 0} users registered</strong></div>
        <div><span>Starts in</span><strong>{formatCountdown(tournament?.secondsToStart || 0)}</strong></div>
        <div><span>Questions</span><strong>{tournament?.questionCount || 20} questions · {tournament?.timePerQuestion || 15}s each</strong></div>
      </div>

      {registered ? (
        <p className="tournament-success compact"><FaCheckCircle /> You're already registered for this tournament.</p>
      ) : tournament?.status !== "registration_open" ? (
        <p className="tournament-note"><FaExclamationTriangle /> Registration Closed.</p>
      ) : null}

      <button
        className="tournament-primary-btn full"
        type="button"
        disabled={action.disabled || busyId === tournament?.id}
        onClick={() => onAction(tournament, action)}
      >
        <FaTrophy /> {busyId === tournament?.id ? "Please wait..." : action.label}
      </button>

      <div className="tournament-chip-row compact-row">
        <span className="tournament-chip"><FaGraduationCap /> Exam: <strong>{formatPreference(selectedExam, examLabels)}</strong></span>
        <span className="tournament-chip"><FaLanguage /> Language: <strong>{formatPreference(preferredLanguage, languageLabels)}</strong></span>
      </div>
    </section>
  );
}

function Tournament() {
  const navigate = useNavigate();
  const rulesRef = useRef(null);
  const selectedExam = localStorage.getItem("selectedExam") || "";
  const preferredLanguage = localStorage.getItem("preferredLanguage") || "";
  const [state, setState] = useState({ official: null, demo: null });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = async () => {
    try {
      const data = await getCurrentTournaments();
      setState({ official: data.official, demo: data.demo });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Tournament server is unavailable.");
    }
  };

  useEffect(() => {
    load();
    const id = window.setInterval(load, 5000);
    return () => window.clearInterval(id);
  }, []);

  const totalRegistered = useMemo(
    () => (state.official?.registrationCount || 0) + (state.demo?.registrationCount || 0),
    [state.demo?.registrationCount, state.official?.registrationCount]
  );

  const handleAction = async (tournament, action) => {
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

    setBusyId(tournament.id);
    setMessage("");
    setError("");
    try {
      const data = await registerForTournament(tournament.id, { selectedExam, preferredLanguage });
      setMessage(data.message || "Tournament registration confirmed.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not register for this tournament.");
    } finally {
      setBusyId("");
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
            <span className="tournament-label-chip"><FaTrophy /> Friday Loksewa Battle</span>
            <h1>Friday Tournament</h1>
            <p>
              Register once, enter when the server opens the live battle, answer each timed question,
              and see checkpoint rankings and final podium results from real participant data.
            </p>

            <div className="tournament-chip-row" aria-label="Tournament context">
              <span className="tournament-chip"><FaCalendarAlt /> Official: Friday 7 PM</span>
              <span className="tournament-chip"><FaClock /> Demo: registration opens every 3 minutes</span>
              <span className="tournament-chip safe"><FaShieldAlt /> No betting. No coin loss.</span>
            </div>

            {message && <p className="tournament-success"><FaCheckCircle /> {message}</p>}
            {error && <p className="tournament-error"><FaExclamationTriangle /> {error}</p>}
          </div>

          <div className="tournament-header-actions">
            <button className="tournament-secondary-btn" type="button" onClick={handleViewRules}>
              <FaListAlt /> View Rules
            </button>
          </div>
        </header>

        <section className="tournament-stats-grid" aria-label="Tournament status">
          <article className="stat-card tournament-stat-card">
            <div className="stat-icon"><FaUsers /></div>
            <div><div className="stat-value">{totalRegistered}</div><div className="stat-label">Real Registrations</div><div className="stat-helper">From tournament backend</div></div>
          </article>
          <article className="stat-card tournament-stat-card">
            <div className="stat-icon"><FaUserCheck /></div>
            <div><div className="stat-value">{state.demo?.registration ? "Registered" : "Not Registered"}</div><div className="stat-label">Demo Battle</div><div className="stat-helper">Quick presentation flow</div></div>
          </article>
          <article className="stat-card tournament-stat-card">
            <div className="stat-icon"><FaClock /></div>
            <div><div className="stat-value">{formatCountdown(state.demo?.secondsToStart || 0)}</div><div className="stat-label">Demo Starts In</div><div className="stat-helper">Server countdown</div></div>
          </article>
          <article className="stat-card tournament-stat-card">
            <div className="stat-icon"><FaShieldAlt /></div>
            <div><div className="stat-value">Fair Play</div><div className="stat-label">No Betting</div><div className="stat-helper">Users never lose coins</div></div>
          </article>
        </section>

        <div className="tournament-main-grid">
          <div className="tournament-left-column">
            <TournamentCard
              tournament={state.demo}
              selectedExam={selectedExam}
              preferredLanguage={preferredLanguage}
              onAction={handleAction}
              busyId={busyId}
            />
            <TournamentCard
              tournament={state.official}
              selectedExam={selectedExam}
              preferredLanguage={preferredLanguage}
              onAction={handleAction}
              busyId={busyId}
            />

            <section className="dashboard-card tournament-card" ref={rulesRef} tabIndex={-1}>
              <div className="tournament-card-header">
                <h2 className="card-title"><FaBalanceScale /> Live Battle Rules</h2>
                <span className="status-chip">Server controlled</span>
              </div>
              <div className="tournament-format-grid">
                <div className="tournament-format-item"><FaCheckCircle /> 20 validated Loksewa questions</div>
                <div className="tournament-format-item"><FaCheckCircle /> 15 seconds per question</div>
                <div className="tournament-format-item"><FaCheckCircle /> Answer locks after submission</div>
                <div className="tournament-format-item"><FaCheckCircle /> Reveal happens only after timer ends</div>
                <div className="tournament-format-item"><FaCheckCircle /> Checkpoints after questions 5, 10, and 15</div>
                <div className="tournament-format-item"><FaCheckCircle /> Missed questions count as unanswered</div>
              </div>
            </section>
          </div>

          <aside className="tournament-right-column">
            <section className="dashboard-card tournament-card">
              <div className="tournament-card-header">
                <h2 className="card-title"><FaGift /> Tournament Rewards</h2>
                <span className="gold-chip"><FaCrown /> Podium</span>
              </div>
              <div className="tournament-reward-list">
                {rewards.map(([rank, reward]) => (
                  <div className="tournament-reward-row" key={rank}>
                    <span>{rank}</span>
                    <strong>{reward}</strong>
                  </div>
                ))}
              </div>
              <p className="tournament-note"><FaCoins /> Rewards are stored once by the backend and do not duplicate on refresh.</p>
            </section>

            <section className="dashboard-card tournament-card">
              <div className="tournament-card-header">
                <h2 className="card-title"><FaMedal /> Leaderboard</h2>
              </div>
              <p className="empty-state">Leaderboard will appear after users join and answer live questions.</p>
            </section>
          </aside>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default Tournament;
