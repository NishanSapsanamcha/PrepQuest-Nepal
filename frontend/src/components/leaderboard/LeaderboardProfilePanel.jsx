import { useEffect } from "react";
import { FaCheckCircle, FaGraduationCap, FaTimes, FaTrophy } from "react-icons/fa";
import BadgeIcon from "../badges/BadgeIcon";
import genericBadge from "../../assets/level/bages.png";
import "./LeaderboardProfilePanel.css";

/**
 * Privacy-safe leaderboard profile preview rendered as an inline side panel (NOT
 * a modal). The parent leaderboard shell shifts into a two-column layout and
 * docks this panel on the right, keeping the table visible. Shows public data
 * only (name, exam track, level, total XP, badges, rank, points). For the real
 * current user the earned badges are the real BadgeIcon set; seeded competitors
 * fall back to a generic badge image repeated up to their count.
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
  const points = Number(user.displayPoints ?? user.tournamentPoints ?? user.totalXP ?? 0);
  const genericShown = !earned.length && badgeCount ? Math.min(badgeCount, 5) : 0;

  return (
    <aside
      className="leaderboard-profile-panel"
      role="complementary"
      aria-label={`${user.name} profile`}
    >
      <button className="profile-close-btn" type="button" aria-label="Close profile" onClick={onClose}>
        <FaTimes />
      </button>

      <div className="lb-profile-head">
        <div className="lb-profile-avatar">
          {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <span>{user.initials}</span>}
          <span className="lb-profile-online" aria-hidden="true" />
        </div>
        <div className="lb-profile-identity">
          <h3>{user.name}<FaCheckCircle className="lb-verified" aria-label="Privacy-safe profile" /></h3>
          <p><FaGraduationCap aria-hidden="true" /> {user.examTrack}</p>
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

      <div className="lb-profile-section">
        <p className="lb-profile-label">Current Rank</p>
        <div className="lb-profile-rank">
          <span className={`lb-profile-rank-shield rank-${user.rank <= 3 ? user.rank : "default"}`}>
            <FaTrophy aria-hidden="true" />
            <em>{user.rank}</em>
          </span>
          <div className="lb-profile-rank-meta">
            <strong>Rank #{user.rank}</strong>
            <span>{user.topPercent ? `Top ${user.topPercent}% of PrepQuest Nepal` : "Climbing the ranks"}</span>
            <span className="lb-profile-points"><FaTrophy aria-hidden="true" /> {points.toLocaleString()} points</span>
          </div>
        </div>
      </div>

      <div className="lb-profile-about">
        <p className="lb-profile-label">About {String(user.name || "").split(/\s+/)[0]}</p>
        <p>{user.about || "This learner is building progress on PrepQuest Nepal."}</p>
      </div>
    </aside>
  );
}

export default LeaderboardProfilePanel;
