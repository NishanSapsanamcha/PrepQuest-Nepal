import { useEffect, useState } from "react";
import BadgeIcon from "./BadgeIcon";
import "./BadgeUnlockToast.css";

const CELEBRATORY = ["Legendary", "Mythic"];
const CONFETTI = Array.from({ length: 14 });

/**
 * Badge-earned toast. Pass a `badge` object to show it; pass `null` to hide.
 * Mythic/Legendary unlocks get confetti + a glow pop; lower tiers slide in
 * understated. CSS-only, auto-dismisses, and respects prefers-reduced-motion.
 */
function BadgeUnlockToast({ badge, onClose, duration = 4200 }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!badge) return undefined;
    setLeaving(false);
    const exitTimer = setTimeout(() => setLeaving(true), duration);
    const closeTimer = setTimeout(() => onClose?.(), duration + 360);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [badge, duration, onClose]);

  if (!badge) return null;

  const celebratory = CELEBRATORY.includes(badge.rarity);

  return (
    <div
      className={`badge-unlock-toast rarity-${badge.rarity.toLowerCase()}${celebratory ? " celebratory" : ""}${leaving ? " leaving" : ""}`}
      role="status"
      aria-live="polite"
    >
      {celebratory && (
        <div className="badge-unlock-confetti" aria-hidden="true">
          {CONFETTI.map((_, i) => (
            <span key={i} className={`confetti-piece confetti-${i % 7}`} />
          ))}
        </div>
      )}
      <div className="badge-unlock-emblem">
        <BadgeIcon shape={badge.shape} iconKind={badge.iconKind} rarity={badge.rarity} size="lg" earned />
      </div>
      <div className="badge-unlock-copy">
        <p className="badge-unlock-kicker">{celebratory ? "Rare Badge Unlocked!" : "Badge Unlocked"}</p>
        <strong className="badge-unlock-name">{badge.name}</strong>
        <span className={`rarity-pill rarity-${badge.rarity.toLowerCase()}`}>{badge.rarity}</span>
      </div>
      <button className="badge-unlock-close" type="button" onClick={() => onClose?.()} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}

export default BadgeUnlockToast;
