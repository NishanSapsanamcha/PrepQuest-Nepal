import badgeImg from "../../assets/level/bages.png";
import "./AchievementBadge.css";

/**
 * General-purpose badge / achievement icon.
 *
 * Renders the shared `bages.png` emblem (teal/gold star shield) for every place
 * the app needs a *generic* badge icon — "Badges Earned" stat cards, achievement
 * counts, badge placeholders, etc. It is intentionally NOT used for the rank
 * journey (those keep their own per-rank art) nor the badge catalog (BadgeIcon
 * draws unique per-badge gems). The PNG ships with a true transparent background
 * (stripped via tooling), so it blends into the dark UI with no box/frame.
 *
 * size: xs(44) · sm(64) · md(80) · lg(96, default) · xl(120)
 */
const SIZE_CLASS = { xs: "xsmall", sm: "small", md: "medium", lg: "", xl: "large" };

function AchievementBadge({ size = "lg", alt = "Achievement badge", className = "", glow = true }) {
  const sizeClass = SIZE_CLASS[size] ?? "";
  return (
    <span className={`badge-icon-shell${glow ? "" : " no-glow"}${className ? ` ${className}` : ""}`}>
      <img
        src={badgeImg}
        alt={alt}
        className={`badge-icon-img${sizeClass ? ` ${sizeClass}` : ""}`}
        loading="lazy"
      />
    </span>
  );
}

export default AchievementBadge;
