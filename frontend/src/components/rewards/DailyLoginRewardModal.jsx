import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { FaCalendarCheck, FaCheck, FaCheckCircle, FaFire, FaGift, FaLock, FaTimes, FaTrophy } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useBadgeCelebration } from "../../context/BadgeCelebrationContext";
import usePrepQuestSound from "../../hooks/usePrepQuestSound";
import dailyRewardHero from "../../images/daily.png";
import {
  calculateStreakAfterClaim,
  claimDailyReward,
  getDailyRewardState,
  getMiniTrackerWeek,
  getNepalRewardDate,
  getNextRewardPreview,
  getTodayReward,
  shouldShowDailyRewardModal,
} from "../../utils/dailyRewardUtils";
import { CoinValue } from "../common/Coin";
import "./DailyLoginRewardModal.css";

// Pages a user can land on before/without ever reaching the authenticated app
// shell (login, signup, password recovery, first-run exam/language setup).
// The reward modal must never appear over these, even for a returning user
// whose token is still valid (e.g. they navigate back to /login manually).
const PRE_APP_PATHS = new Set(["/", "/login", "/signup", "/forgot-password", "/setup"]);

function RewardAmount({ reward, size = "lg" }) {
  if (reward.type === "xp") {
    return <span className="dlr-xp-amount">+{reward.amount} XP</span>;
  }
  return <CoinValue amount={reward.amount} size={size} prefix="+" />;
}

function DailyLoginRewardModal() {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const { celebrate } = useBadgeCelebration();
  const { playClick, playComplete } = usePrepQuestSound();
  const [isOpen, setIsOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState(null);
  // Decide at most once per signed-in session (not once per route change) -
  // otherwise navigating between pages while the reward sits unclaimed would
  // pop the modal back up on every click.
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      hasCheckedRef.current = false;
      setIsOpen(false);
      return;
    }
    // Still on a pre-app route (e.g. a returning user's stale tab sitting on
    // /login) - wait for real navigation into the app before deciding.
    if (PRE_APP_PATHS.has(pathname) || hasCheckedRef.current) return;
    hasCheckedRef.current = true;
    setIsOpen(shouldShowDailyRewardModal());
  }, [isAuthenticated, pathname]);

  if (!isOpen) return null;

  const todayKey = getNepalRewardDate();
  const state = getDailyRewardState();
  const projection = calculateStreakAfterClaim(state, todayKey);
  const todayReward = getTodayReward(state, todayKey);
  const previewReward = claimResult ? null : getNextRewardPreview(state, todayKey);
  const miniWeek = getMiniTrackerWeek(claimResult ? claimResult.cycleDay : projection.cycleDay);

  const handleClose = () => setIsOpen(false);

  const handleClaim = () => {
    if (claiming) return;
    setClaiming(true);
    const result = claimDailyReward();
    setClaiming(false);
    if (!result.claimed) {
      setIsOpen(false);
      return;
    }
    setClaimResult(result);
    playComplete();
    // Re-evaluate badges now that the streak just changed (e.g. Day 30).
    celebrate();
  };

  const handleContinue = () => {
    playClick();
    setIsOpen(false);
  };

  return (
    <div className="dlr-overlay" role="presentation" onMouseDown={claimResult ? handleContinue : handleClose}>
      <section
        className="dlr-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dlr-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {!claimResult && (
          <button className="dlr-close" type="button" aria-label="Close" onClick={handleClose}>
            <FaTimes />
          </button>
        )}

        {!claimResult ? (
          <>
            <div className="dlr-header">
              <FaCalendarCheck className="dlr-header-icon" />
              <h2 id="dlr-title">Daily Login Reward</h2>
            </div>
            <p className="dlr-subtitle">Welcome back! Keep your streak alive and earn rewards.</p>

            <div className="dlr-reward-card">
              <span className="dlr-day-chip">Day {projection.cycleDay}</span>
              <p className="dlr-today-label">Today&apos;s Reward</p>
              <div className="dlr-amount">
                <RewardAmount reward={todayReward} />
              </div>
              <img src={dailyRewardHero} alt="" className="dlr-hero-image" />

              <div className="dlr-stats-row">
                <div className="dlr-stat">
                  <FaFire className="dlr-stat-icon streak" />
                  <div>
                    <span>Current Streak</span>
                    <strong>{projection.currentStreak} {projection.currentStreak === 1 ? "Day" : "Days"}</strong>
                  </div>
                </div>
                <div className="dlr-stat-divider" />
                <div className="dlr-stat">
                  <FaTrophy className="dlr-stat-icon best" />
                  <div>
                    <span>Best Streak</span>
                    <strong>{Math.max(projection.bestStreak, state.bestStreak)} {Math.max(projection.bestStreak, state.bestStreak) === 1 ? "Day" : "Days"}</strong>
                  </div>
                </div>
              </div>
            </div>

            <button className="dlr-claim-btn" type="button" disabled={claiming} onClick={handleClaim}>
              <FaGift /> {claiming ? "Claiming..." : "Claim Reward"}
            </button>

            <div className="dlr-mini-tracker" aria-label="This week's reward progress">
              {miniWeek.map((node) => (
                <div className={`dlr-node ${node.status}`} key={node.day}>
                  <span className="dlr-node-circle">
                    {node.status === "claimed" ? <FaCheck /> : node.status === "locked" ? <FaLock /> : node.day}
                  </span>
                  <span className="dlr-node-label">{node.day}</span>
                </div>
              ))}
            </div>
            <p className="dlr-footer">
              {previewReward ? `Come back tomorrow for Day ${previewReward.cycleDay} reward!` : "Come back tomorrow for your next reward!"}
            </p>
          </>
        ) : (
          <div className="dlr-success">
            <div className="dlr-success-icon-wrap">
              <FaCheckCircle className="dlr-success-icon" />
            </div>
            <h2>Reward Claimed!</h2>
            <p className="dlr-success-amount">
              <RewardAmount reward={claimResult.reward} size="md" /> added to your account.
            </p>
            <p className="dlr-success-streak">
              Current streak: <strong>{claimResult.currentStreak} {claimResult.currentStreak === 1 ? "Day" : "Days"}</strong>
              {claimResult.isNewBest && <span className="dlr-new-best"> &middot; New best!</span>}
            </p>
            <button className="dlr-claim-btn" type="button" onClick={handleContinue}>
              Continue
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default DailyLoginRewardModal;
