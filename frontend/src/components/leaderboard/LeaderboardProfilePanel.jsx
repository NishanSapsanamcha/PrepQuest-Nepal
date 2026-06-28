import { useEffect } from "react";
import { FaCheckCircle, FaTimes, FaTrophy } from "react-icons/fa";
import BadgeIcon from "../badges/BadgeIcon";
import genericBadge from "../../assets/level/bages.png";
import "./LeaderboardProfilePanel.css";

/**
 * Privacy-safe leaderboard profile preview. Hidden by default — the parent only
 * renders it after a "View Profile" click. Shows public data only (name, exam
 * track, level, total XP, badges, rank, points). For the real current user the
 * earned badges are the real BadgeIcon set; seeded demo competitors fall back to
 * a generic badge image repeated up to their count.
 */
function LeaderboardProfilePanel({ user, onClose }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!user) return null;

  const earned = Array.isArray(user.earnedBadges) ? user.earnedBadges : [];
  const badgeCount = Number(user.badges) || 0;
  const totalXp = Number(user.totalXP ?? user.lifetimeXP ?? 0);
  const genericShown = !earned.length && badgeCount ? Math.min(badgeCount, 5) : 0;

  return (
    <div className="lb-profile-overlay" role="presentation" onMouseDown={onClose}>
      <aside
        className="leaderboard-profile-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`${user.name} profile`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="profile-close-btn" type="button" aria-label="Close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="lb-profile-head">
          <div className="lb-profile-avatar">
            {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <span>{user.initials}</span>}
          </div>
          <div className="lb-profile-identity">
            <h3>{user.name}<FaCheckCircle className="lb-verified" aria-label="Privacy-safe profile" /></h3>
            <p>{user.examTrack}</p>
          </div>
        </div>

        <div className="lb-profile-stats">
          <div><span>Level</span><strong>Lv {user.level || 1}</strong></div>
          <div><span>Total XP</span><strong>{totalXp.toLocaleString()}</strong></div>
          <div><span>Badges</span><strong>{badgeCount}</strong></div>
        </div>

        <div className="lb-profile-section">
          <p className="lb-profile-label">Earned Badges</p>
          {earned.length ? (
            <div className="lb-badge-row">
              {earned.slice(0, 5).map((badge) => (
                <BadgeIcon key={badge.id} shape={badge.shape} iconKind={badge.iconKind} rarity={badge.rarity} size="xs" earned />
              ))}
              {earned.length > 5 ? <span className="lb-badge-more">+{earned.length - 5}</span> : null}
            </div>
          ) : genericShown ? (
            <div className="lb-badge-row">
              {Array.from({ length: genericShown }).map((_, index) => (
                <img className="lb-badge-generic" src={genericBadge} alt="" key={index} />
              ))}
              {badgeCount > 5 ? <span className="lb-badge-more">+{badgeCount - 5}</span> : null}
            </div>
          ) : (
            <p className="lb-empty">No badges earned yet</p>
          )}
        </div>

        <div className="lb-profile-rank">
          <span className="lb-profile-rank-icon"><FaTrophy /></span>
          <div>
            <strong>Rank #{user.rank}</strong>
            <span>
              {Number(user.displayPoints || 0).toLocaleString()} points
              {user.topPercent ? ` · Top ${user.topPercent}% of ${user.examTrack}` : ""}
            </span>
          </div>
        </div>

        <div className="lb-profile-about">
          <p className="lb-profile-label">About</p>
          <p>{user.about || "This learner is building progress on PrepQuest Nepal."}</p>
        </div>
      </aside>
    </div>
  );
}

export default LeaderboardProfilePanel;
