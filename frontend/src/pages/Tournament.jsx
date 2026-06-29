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
import { getPreferredLanguage, t, translateExamName, formatMixedQuestions, formatRegisteredCount } from "../data/translations";
import TournamentCup from "../assets/level/tournamentcup-transparent.png";
import "./Tournament.css";

const examLabels = {
  "nayab-subba": "Nayab Subba",
  "sakha-adhikrit": "Sakha Adhikrit",
};

// Reward rows use translation keys for both the rank label and badge name.
const rewards = [
  { rankKey: "firstPlace", coins: 500, xp: 500, badgeKey: "goldChampionBadge" },
  { rankKey: "secondPlace", coins: 300, xp: 300, badgeKey: "silverChampionBadge" },
  { rankKey: "thirdPlace", coins: 150, xp: 200, badgeKey: "bronzeChampionBadge" },
  { rankKey: "top10", badgeKey: "topPerformerBadge" },
  { rankKey: "allParticipants", coins: 50, xp: 100 },
];

function formatExamPreference(value, lang) {
  const english = examLabels[String(value || "").trim().toLowerCase()];
  return english ? translateExamName(english, lang) : (value || t("notSelected", lang));
}

function formatLanguagePreference(value, lang) {
  const mode = String(value || "").trim().toLowerCase();
  if (mode === "english") return "English";
  if (mode === "nepali") return "नेपाली";
  if (mode === "both") return t("both", lang);
  return t("notSelected", lang);
}

function formatCountdown(seconds = 0) {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${minutes}m ${String(secs).padStart(2, "0")}s`;
}

function getAction(tournament, lang) {
  const registered = Boolean(tournament?.registration);
  if (!tournament) return { label: t("unavailable", lang), disabled: true, kind: "disabled" };
  if (tournament.status === "registration_open" && !registered) return { label: t("joinTournament", lang), disabled: false, kind: "join" };
  if (tournament.status === "registration_open" && registered) return { label: t("registered", lang), disabled: true, kind: "registered" };
  if (tournament.status === "ready_room" && registered) return { label: t("enterTournament", lang), disabled: false, kind: "enter" };
  if (tournament.status === "ready_room" && !registered) return { label: t("registrationClosed", lang), disabled: true, kind: "closed" };
  if (["live", "reveal", "checkpoint"].includes(tournament.status) && registered) return { label: t("enterBattle", lang), disabled: false, kind: "enter" };
  if (["live", "reveal", "checkpoint"].includes(tournament.status) && !registered) return { label: t("registrationClosed", lang), disabled: true, kind: "closed" };
  if (tournament.status === "finished" || tournament.status === "results_published") return { label: t("viewResults", lang), disabled: false, kind: "results" };
  return { label: t("registrationClosed", lang), disabled: true, kind: "closed" };
}

function Tournament() {
  const navigate = useNavigate();
  const rulesRef = useRef(null);
  const selectedExam = localStorage.getItem("selectedExam") || "";
  const preferredLanguage = localStorage.getItem("preferredLanguage") || "";
  const lang = getPreferredLanguage();
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
        setMessage(t("alreadyRegistered", lang));
      }
    } catch (err) {
      setError(err.response?.data?.message || t("tournamentServerUnavailable", lang));
    }
  };

  useEffect(() => {
    load();
    const id = window.setInterval(load, 1000);
    return () => window.clearInterval(id);
  }, []);

  const action = getAction(tournament, lang);
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
      setMessage(data.message || t("alreadyRegistered", lang));
      await load();
    } catch (err) {
      setError(err.response?.data?.message || t("couldNotRegister", lang));
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
            <span className="tournament-label-chip"><FaTrophy /> {t("fridayLiveTournament", lang)}</span>
            <h1>{t("fridayLiveTournament", lang)}</h1>
            <p>{t("tournamentIntro", lang)}</p>

            <div className="tournament-chip-row" aria-label="Tournament context">
              <span className="tournament-chip"><FaClock /> {t("startsIn", lang)}: <strong>{formatCountdown(tournament?.secondsToStart || 0)}</strong></span>
              <span className="tournament-chip"><FaGraduationCap /> {t("exam", lang)}: <strong>{formatExamPreference(selectedExam, lang)}</strong></span>
              <span className="tournament-chip"><FaLanguage /> {t("language", lang)}: <strong>{formatLanguagePreference(preferredLanguage, lang)}</strong></span>
              <span className="tournament-chip safe"><FaShieldAlt /> {t("noBettingNoCoinLoss", lang)}</span>
            </div>

            {message && <p className="tournament-success"><FaCheckCircle /> {message}</p>}
            {error && <p className="tournament-error"><FaExclamationTriangle /> {error}</p>}
          </div>

          <div className="tournament-header-actions">
            <button className="tournament-primary-btn" type="button" disabled={action.disabled || busy} onClick={handleAction}>
              <FaTrophy /> {busy ? t("pleaseWait", lang) : action.label}
            </button>
            <button className="tournament-secondary-btn" type="button" onClick={handleViewRules}>
              <FaListAlt /> {t("viewRules", lang)}
            </button>
          </div>

          <div className="tournament-header-cup" aria-hidden="true">
            <span className="cup-glow" />
            <img className="tournament-cup-img" src={TournamentCup} alt="" />
          </div>
        </header>

        <section className="tournament-stats-grid" aria-label="Tournament status">
          <article className="stat-card tournament-stat-card">
            <div className="stat-icon"><FaClock /></div>
            <div><div className="stat-value">{formatCountdown(tournament?.secondsToStart || 0)}</div><div className="stat-label">{t("registrationCountdown", lang)}</div><div className="stat-helper">{t("battleStartsAuto", lang)}</div></div>
          </article>
          <article className="stat-card tournament-stat-card">
            <div className="stat-icon"><FaUsers /></div>
            <div><div className="stat-value">{tournament?.registrationCount ?? 0}</div><div className="stat-label">{t("registeredUsers", lang)}</div><div className="stat-helper">{formatRegisteredCount(tournament?.registrationCount || 0, lang)}</div></div>
          </article>
          <article className="stat-card tournament-stat-card">
            <div className="stat-icon"><FaUserCheck /></div>
            <div><div className="stat-value">{registered ? t("registered", lang) : t("notRegistered", lang)}</div><div className="stat-label">{t("yourStatus", lang)}</div><div className="stat-helper">{registered ? t("alreadyRegistered", lang) : t("joinBeforeCountdown", lang)}</div></div>
          </article>
          <article className="stat-card tournament-stat-card">
            <div className="stat-icon"><FaShieldAlt /></div>
            <div><div className="stat-value">{String(tournament?.status || "loading").replaceAll("_", " ")}</div><div className="stat-label">{t("tournamentStatus", lang)}</div><div className="stat-helper">{t("serverControlled", lang)}</div></div>
          </article>
        </section>

        <div className="tournament-main-grid">
          <div className="tournament-left-column">
            <section className="dashboard-card tournament-card registration-card">
              <div className="tournament-card-header">
                <h2 className="card-title"><FaTrophy /> {t("fridayLiveTournament", lang)}</h2>
                <span className="status-chip">{formatRegisteredCount(tournament?.registrationCount || 0, lang)}</span>
              </div>
              <div className="tournament-detail-list">
                <div><span>{t("statusWord", lang)}</span><strong>{String(tournament?.status || "loading").replaceAll("_", " ")}</strong></div>
              <div><span>{tournament?.status === "ready_room" ? t("readyRoom", lang) : t("countdown", lang)}</span><strong>{tournament?.status === "ready_room" ? `${tournament?.readyCountdownSeconds || 0}s` : formatCountdown(tournament?.secondsToStart || 0)}</strong></div>
                <div><span>{t("questionsWord", lang)}</span><strong>{formatMixedQuestions(tournament?.questionCount || 20, tournament?.timePerQuestion || 15, lang)}</strong></div>
                <div><span>{t("ranking", lang)}</span><strong>{t("afterQuestions51015", lang)}</strong></div>
              </div>

              {registered ? (
                <p className="tournament-success compact"><FaCheckCircle /> {t("alreadyRegistered", lang)}</p>
              ) : tournament?.status !== "registration_open" ? (
                <p className="tournament-note"><FaExclamationTriangle /> {t("registrationClosedDot", lang)}</p>
              ) : null}

              <button className="tournament-primary-btn full" type="button" disabled={action.disabled || busy} onClick={handleAction}>
                <FaTrophy /> {busy ? t("pleaseWait", lang) : action.label}
              </button>
            </section>

            <section className="dashboard-card tournament-card" ref={rulesRef} tabIndex={-1}>
              <div className="tournament-card-header">
                <h2 className="card-title"><FaBalanceScale /> {t("liveBattleRules", lang)}</h2>
                <span className="status-chip">{t("fairScoring", lang)}</span>
              </div>
              <div className="tournament-format-grid">
                <div className="tournament-format-item"><FaCheckCircle /> {t("rule20Questions", lang)}</div>
                <div className="tournament-format-item"><FaCheckCircle /> {t("rule15Seconds", lang)}</div>
                <div className="tournament-format-item"><FaCheckCircle /> {t("ruleCorrect100", lang)}</div>
                <div className="tournament-format-item"><FaCheckCircle /> {t("ruleSpeedBonus", lang)}</div>
                <div className="tournament-format-item"><FaCheckCircle /> {t("ruleMax150", lang)}</div>
                <div className="tournament-format-item"><FaCheckCircle /> {t("ruleWrong0", lang)}</div>
                <div className="tournament-format-item"><FaCheckCircle /> {t("ruleAnswerLocks", lang)}</div>
                <div className="tournament-format-item"><FaCheckCircle /> {t("ruleRevealAfterTimer", lang)}</div>
                <div className="tournament-format-item"><FaCheckCircle /> {t("ruleCheckpoints", lang)}</div>
                <div className="tournament-format-item"><FaCheckCircle /> {t("ruleMissedUnanswered", lang)}</div>
                <div className="tournament-format-item"><FaShieldAlt /> {t("ruleNoBetting", lang)}</div>
              </div>
              <div className="scoring-highlight-grid" aria-label="Tournament scoring examples">
                <div><span>{t("correctAnswerLabel", lang)}</span><strong>+100</strong></div>
                <div><span>{t("speedBonus", lang)}</span><strong>+0 to +50</strong></div>
                <div><span>{t("maxPerQuestion", lang)}</span><strong>150</strong></div>
                <div><span>{t("wrongUnanswered", lang)}</span><strong>0</strong></div>
              </div>
              <p className="tournament-note">{t("scoringNote", lang)}</p>
            </section>
          </div>

          <aside className="tournament-right-column">
            <section className="dashboard-card tournament-card">
              <div className="tournament-card-header">
                <h2 className="card-title"><FaMedal /> {t("leaderboard", lang)}</h2>
              </div>
              <p className="empty-state">{t("leaderboardWillAppear", lang)}</p>
            </section>

            <section className="dashboard-card tournament-card">
              <div className="tournament-card-header">
                <h2 className="card-title"><FaGift /> {t("tournamentRewards", lang)}</h2>
                <span className="gold-chip"><FaCrown /> {t("podium", lang)}</span>
              </div>
              <div className="tournament-reward-list">
                {rewards.map(({ rankKey, coins, xp, badgeKey }) => (
                  <div className="tournament-reward-row" key={rankKey}>
                    <span>{t(rankKey, lang)}</span>
                    {coins != null || xp != null ? (
                      <RewardDisplay coins={coins} xp={xp} extra={badgeKey ? t(badgeKey, lang) : undefined} />
                    ) : (
                      <strong>{t(badgeKey, lang)}</strong>
                    )}
                  </div>
                ))}
              </div>
              <p className="tournament-note"><CoinIcon size="sm" /> {t("rewardsAppliedOnce", lang)}</p>
            </section>
          </aside>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default Tournament;
