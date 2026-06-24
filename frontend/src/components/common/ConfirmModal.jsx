import { useEffect, useRef } from "react";
import { FaShieldAlt } from "react-icons/fa";

function ConfirmModal({
  isOpen,
  title,
  description,
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  onCancel,
  onConfirm,
  confirmAriaLabel,
}) {
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCancel?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="pq-modal-overlay" role="presentation" onMouseDown={onCancel}>
      <section
        className="pq-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pq-confirm-title"
        aria-describedby="pq-confirm-description"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="pq-modal-icon" aria-hidden="true"><FaShieldAlt /></div>
        <div>
          <h2 id="pq-confirm-title">{title}</h2>
          <p id="pq-confirm-description">{description}</p>
        </div>
        <div className="pq-modal-actions">
          <button ref={cancelButtonRef} className="btn btn-secondary" type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className="btn" type="button" aria-label={confirmAriaLabel || confirmLabel} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmModal;
