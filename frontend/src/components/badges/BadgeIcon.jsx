import { useId } from "react";
import "./BadgeIcon.css";

/**
 * Visual rarity ramp. `from`/`to` drive the shape gradient, `stroke` the metal
 * edge, `glyph` the engraved center icon, and `ring` the accent glow / pill.
 * Mythic uses a warm coral/orange that is intentionally distinct from the four
 * cooler tiers below it.
 */
export const RARITY_THEME = {
  Common: { from: "#5eead4", to: "#0f9b8e", stroke: "#0b6b62", glyph: "#04231f", ring: "#2dd4bf" },
  Rare: { from: "#7cc9ff", to: "#2f7fe0", stroke: "#1c5cb0", glyph: "#06203f", ring: "#38bdf8" },
  Epic: { from: "#c79bff", to: "#8b3df0", stroke: "#5b21b6", glyph: "#1d0a3d", ring: "#a855f7" },
  Legendary: { from: "#ffe08a", to: "#f59e0b", stroke: "#b45309", glyph: "#3a1d00", ring: "#fbbf24" },
  Mythic: { from: "#ffcaa3", to: "#ff5a5f", stroke: "#c81e4a", glyph: "#3d0a14", ring: "#ff7a59" },
};

const SIZE_PRESETS = { xs: 34, sm: 46, md: 60, lg: 76, xl: 104 };

// Outer geometry per shape, all drawn inside a 0..100 viewBox.
const STARBURST_POINTS =
  "50,5 57.3,32.5 81.8,18.2 67.6,42.7 95,50 67.6,57.3 81.8,81.8 57.3,67.6 50,95 42.7,67.6 18.2,81.8 32.5,57.3 5,50 32.5,42.7 18.2,18.2 42.7,32.5";

function renderShape(shape, props) {
  switch (shape) {
    case "circle":
      return <circle cx="50" cy="50" r="43" {...props} />;
    case "hexagon":
      return <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" {...props} />;
    case "shield":
      return (
        <path
          d="M50 6 L86 18 L86 50 C86 73 69 88 50 95 C31 88 14 73 14 50 L14 18 Z"
          {...props}
        />
      );
    case "crown":
      return <path d="M9 33 L28 52 L50 22 L72 52 L91 33 L85 84 L15 84 Z" {...props} />;
    case "starburst":
      return <polygon points={STARBURST_POINTS} {...props} />;
    case "pentagon":
    default:
      return <polygon points="50,7 91,37 75,87 25,87 9,37" {...props} />;
  }
}

// Center glyphs in a 24x24 space; centered/scaled by the caller.
function renderGlyph(iconKind, color) {
  const fill = { fill: color };
  const line = { fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (iconKind) {
    case "book":
      return (
        <path
          {...fill}
          d="M12 6.5C10.6 5.3 8.4 4.5 6 4.5c-1 0-2 .1-2.8.4v12.7c.9-.3 1.8-.4 2.8-.4 2.4 0 4.6.8 6 2zM12 6.5c1.4-1.2 3.6-2 6-2 1 0 2 .1 2.8.4v12.7c-.8-.3-1.8-.4-2.8-.4-2.4 0-4.6.8-6 2z"
        />
      );
    case "flame":
      return (
        <path
          {...fill}
          d="M12 2.5c.6 3 2.4 4.2 3.6 5.8C16.6 9.6 17 11 17 12.5a5 5 0 0 1-10 0c0-1.4.5-2.6 1.3-3.6.2 1 .8 1.7 1.6 2.1-.3-2.4.3-5 1.1-8.5z"
        />
      );
    case "calendar":
      return (
        <g {...line}>
          <rect x="3.5" y="5" width="17" height="15" rx="2" />
          <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" />
          <line x1="8" y1="3" x2="8" y2="6.5" />
          <line x1="16" y1="3" x2="16" y2="6.5" />
        </g>
      );
    case "clipboard":
      return (
        <g {...line}>
          <rect x="5" y="4.5" width="14" height="16" rx="2" />
          <rect x="9" y="2.5" width="6" height="4" rx="1.2" fill={color} />
          <line x1="8.5" y1="11" x2="15.5" y2="11" />
          <line x1="8.5" y1="14.5" x2="15.5" y2="14.5" />
        </g>
      );
    case "trophy":
      return (
        <path
          {...fill}
          d="M7 4h10v3a5 5 0 0 1-10 0zM7 5.2H4.6a2.4 2.4 0 0 0 0 4.8H7zM17 5.2h2.4a2.4 2.4 0 0 1 0 4.8H17zM10.4 12.2h3.2l.5 3.8h-4.2zM8 18h8v2.4H8z"
        />
      );
    case "target":
      return (
        <g {...line}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.6" fill={color} stroke="none" />
        </g>
      );
    case "crown":
      return (
        <path
          {...fill}
          d="M3 8l3.6 4.4L12 4l5.4 8.4L21 8l-2 11.5H5zM5 20.5h14V22.5H5z"
        />
      );
    case "lightning":
      return <path {...fill} d="M13 2L5 13h5l-1 9 9-12h-6l1-8z" />;
    case "star":
    default:
      return (
        <path
          {...fill}
          d="M12 3l2.6 5.7 6.2.6-4.7 4.2 1.4 6.1L12 16.9 6.5 19.6l1.4-6.1L3.2 9.3l6.2-.6z"
        />
      );
  }
}

function BadgeIcon({
  shape = "pentagon",
  rarity = "Common",
  iconKind = "star",
  size = "sm",
  locked = false,
  isSecret = false,
  earned = false,
}) {
  const uid = useId().replace(/[:]/g, "");
  const theme = RARITY_THEME[rarity] || RARITY_THEME.Common;
  const px = typeof size === "number" ? size : SIZE_PRESETS[size] || SIZE_PRESETS.sm;
  const isMythic = rarity === "Mythic";
  // Hidden achievements stay masked until they are actually earned.
  const showSecret = isSecret && !earned;

  const fillId = `bf-${uid}`;
  const sheenId = `bs-${uid}`;
  const clipId = `bc-${uid}`;
  const shimmerId = `bsh-${uid}`;

  const classes = [
    "badge-icon",
    `rarity-${rarity.toLowerCase()}`,
    locked ? "is-locked" : "",
    earned ? "is-earned" : "",
    isMythic ? "is-mythic" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} style={{ "--badge-ring": theme.ring }}>
      <svg
        className="badge-icon-svg"
        width={px}
        height={px}
        viewBox="0 0 100 100"
        role="img"
        aria-label={`${rarity} badge`}
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={theme.from} />
            <stop offset="1" stopColor={theme.to} />
          </linearGradient>
          <radialGradient id={sheenId} cx="0.5" cy="0.32" r="0.7">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="0.6" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={shimmerId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <clipPath id={clipId}>{renderShape(shape, {})}</clipPath>
        </defs>

        {/* Outer gem body + metal edge */}
        {renderShape(shape, { fill: `url(#${fillId})`, stroke: theme.stroke, strokeWidth: 4, strokeLinejoin: "round" })}
        {/* Top-light sheen for a glossy, beveled look */}
        {renderShape(shape, { fill: `url(#${sheenId})`, opacity: 0.9 })}

        {/* Center glyph or hidden-badge placeholder */}
        {showSecret ? (
          <text
            x="50"
            y="53"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="44"
            fontWeight="800"
            fontFamily="inherit"
            fill={theme.glyph}
          >
            ?
          </text>
        ) : (
          <g transform="translate(50 51) scale(1.7) translate(-12 -12)">
            {renderGlyph(iconKind, theme.glyph)}
          </g>
        )}

        {/* Mythic-only animated sheen sweep (paused via CSS for reduced motion) */}
        {isMythic && !locked && (
          <g clipPath={`url(#${clipId})`}>
            <rect className="badge-icon-shimmer" x="-60" y="0" width="50" height="100" fill={`url(#${shimmerId})`} />
          </g>
        )}
      </svg>
    </span>
  );
}

export default BadgeIcon;
