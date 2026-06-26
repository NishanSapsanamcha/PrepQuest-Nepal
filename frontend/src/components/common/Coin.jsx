import { useId } from "react";
import { FaStar } from "react-icons/fa";
import "./Coin.css";

/**
 * Premium gold "star coin" reward currency.
 *
 * A single, reusable visual language for every coin shown in the app: a polished
 * gold/orange disc with a beveled rim, an engraved star, a glossy top highlight
 * and a soft drop shadow so it reads as a real game reward on the dark navy UI.
 *
 * Exposes three building blocks:
 *  - <CoinIcon size="sm" />              the coin graphic on its own
 *  - <CoinValue amount={50} />           coin icon + amount (no redundant "coins")
 *  - <RewardDisplay coins={150} xp={200} /> a scannable coin + XP reward row
 */

const SIZE_PRESETS = { xs: 16, sm: 20, md: 28, lg: 40, xl: 64 };

// Five-point star engraved into the coin face (outer r≈22, inner r≈9 @ 0..100).
const STAR_POINTS =
  "50,28 55.29,42.72 70.92,43.2 55.29,52.78 62.93,67.8 50,59 37.07,67.8 44.71,52.78 29.08,43.2 44.71,42.72";

export function CoinIcon({ size = "sm", className = "", title = "coins", ...rest }) {
  const uid = useId().replace(/[:]/g, "");
  const px = typeof size === "number" ? size : SIZE_PRESETS[size] || SIZE_PRESETS.sm;

  const faceId = `cf-${uid}`;
  const rimId = `cr-${uid}`;
  const sheenId = `cs-${uid}`;
  const starId = `cstar-${uid}`;

  return (
    <span className={`coin-icon ${className}`.trim()}>
      {/* Inline width/height beat the global `.dashboard-page svg { width: 1.15rem }`
          rule that would otherwise shrink the coin everywhere it is used. */}
      <svg
        className="coin-icon-svg"
        width={px}
        height={px}
        style={{ width: px, height: px }}
        viewBox="0 0 100 100"
        role="img"
        aria-label={title}
      >
        <defs>
          {/* Outer metal rim: bright top, deep amber bottom */}
          <linearGradient id={rimId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe27a" />
            <stop offset="0.45" stopColor="#fcae3c" />
            <stop offset="1" stopColor="#e07a16" />
          </linearGradient>
          {/* Recessed coin face */}
          <linearGradient id={faceId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffd14d" />
            <stop offset="0.5" stopColor="#fbab2f" />
            <stop offset="1" stopColor="#f5901a" />
          </linearGradient>
          {/* Engraved star: lighter top edge gives it a 3D bevel */}
          <linearGradient id={starId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff0bd" />
            <stop offset="1" stopColor="#f9a526" />
          </linearGradient>
          {/* Glossy top-light highlight */}
          <radialGradient id={sheenId} cx="0.5" cy="0.28" r="0.65">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer disc + darker edge for a clean minted rim */}
        <circle cx="50" cy="50" r="47" fill={`url(#${rimId})`} stroke="#c4660c" strokeWidth="2.5" />
        {/* Inner ring groove (engraved bevel between rim and face) */}
        <circle cx="50" cy="50" r="38" fill="none" stroke="#d97612" strokeWidth="3" opacity="0.55" />
        <circle cx="50" cy="50" r="36" fill={`url(#${faceId})`} stroke="#ffe9a8" strokeWidth="1.2" />

        {/* Engraved star with a soft drop shadow for depth */}
        <polygon points={STAR_POINTS} fill="#d2730f" opacity="0.5" transform="translate(0 1.4)" />
        <polygon points={STAR_POINTS} fill={`url(#${starId})`} stroke="#e07a16" strokeWidth="0.8" strokeLinejoin="round" />

        {/* Glossy highlight sweep across the top */}
        <ellipse cx="42" cy="30" rx="30" ry="17" fill={`url(#${sheenId})`} />
      </svg>
    </span>
  );
}

export function CoinValue({ amount, size = "sm", prefix = "", className = "", ...rest }) {
  const formatted =
    typeof amount === "number" ? amount.toLocaleString() : amount;
  return (
    <span className={`coin-value ${className}`.trim()} {...rest}>
      <CoinIcon size={size} />
      <span className="coin-value-amount">
        {prefix}
        {formatted}
      </span>
    </span>
  );
}

/**
 * Scannable reward row: coin amount paired with an XP amount so the two read as
 * distinct rewards instead of a run-on string like "500 coins + 500 XP".
 */
export function RewardDisplay({ coins, xp, size = "sm", className = "", stacked = false, extra }) {
  return (
    <span className={`reward-display ${stacked ? "is-stacked" : ""} ${className}`.trim()}>
      {coins != null && <CoinValue amount={coins} size={size} prefix={coins > 0 ? "+" : ""} />}
      {xp != null && (
        <span className="reward-xp">
          <FaStar className="reward-xp-icon" aria-hidden="true" />
          <span className="reward-xp-amount">
            {xp > 0 ? "+" : ""}
            {typeof xp === "number" ? xp.toLocaleString() : xp} XP
          </span>
        </span>
      )}
      {extra && <span className="reward-extra">{extra}</span>}
    </span>
  );
}

/**
 * Renders a free-form reward string (e.g. "+150 coins", "500 coins + 500 XP")
 * with inline coin / XP icons swapped in for the words, so badge and prize
 * reward labels share the same currency visual as everything else.
 */
const REWARD_TOKEN_RE = /(\+?\d[\d,]*)\s*(coins?|xp)/gi;

export function RewardText({ text, size = "sm", className = "" }) {
  if (!text) return null;
  const nodes = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = REWARD_TOKEN_RE.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const amount = match[1];
    const unit = match[2].toLowerCase();
    if (unit === "xp") {
      nodes.push(
        <span className="reward-xp" key={key++}>
          <FaStar className="reward-xp-icon" aria-hidden="true" />
          <span className="reward-xp-amount">{amount} XP</span>
        </span>
      );
    } else {
      nodes.push(
        <span className="coin-value" key={key++}>
          <CoinIcon size={size} />
          <span className="coin-value-amount">{amount}</span>
        </span>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  // No coin/XP token found — render the original text untouched.
  if (!nodes.length) return <span className={`reward-text ${className}`.trim()}>{text}</span>;
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return <span className={`reward-text ${className}`.trim()}>{nodes}</span>;
}

export default CoinIcon;
