import { useEffect } from "react";
import { FaFire, FaSignOutAlt, FaTimes } from "react-icons/fa";
import "./LogoutConfirmModal.css";

// Gamified logout confirmation - frames leaving as breaking your streak/
// mission progress so logging out is a deliberate choice, not a misclick.
function LogoutConfirmModal({ isOpen, onCancel, onConfirm }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCancel?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="logout-confirm-overlay" role="presentation" onMouseDown={onCancel}>
      <section
        className="logout-confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="logout-confirm-close" aria-label="Close" onClick={onCancel}>
          <FaTimes />
        </button>

        <div className="logout-confirm-icon">
          <FaSignOutAlt />
        </div>

        <h2 id="logout-confirm-title">Leaving already, Aspirant?</h2>
        <p className="logout-confirm-copy">
          Your XP, coins, and badges are safe. But today&apos;s mission stays unfinished until you come back and finish
          the grind.
        </p>
        <p className="logout-confirm-streak">
          <FaFire aria-hidden="true" /> Don&apos;t let your streak go cold.
        </p>

        <div className="logout-confirm-actions">
          <button type="button" className="logout-confirm-btn ghost" onClick={onCancel}>
            Stay &amp; Keep Going
          </button>
          <button type="button" className="logout-confirm-btn danger" onClick={onConfirm}>
            Yes, Logout
          </button>
        </div>
      </section>
    </div>
  );
}

export default LogoutConfirmModal;
