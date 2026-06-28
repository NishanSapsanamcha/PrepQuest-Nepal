import { useEffect, useRef, useState } from "react";
import { FaCamera, FaTimes, FaTrashAlt, FaUser } from "react-icons/fa";
import { getInitials } from "../../utils/profileUtils";
import "./EditProfileModal.css";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB raw file cap before downscale.
const AVATAR_MAX_DIMENSION = 320; // Downscale so the data URL stays small in localStorage.

// Resize/compress the chosen image to a small square-ish data URL so it fits
// comfortably in localStorage and renders crisply in the avatar frame.
function fileToScaledDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("That file isn't a valid image."));
      image.onload = () => {
        const scale = Math.min(1, AVATAR_MAX_DIMENSION / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, width, height);
        try {
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        } catch {
          reject(new Error("Could not process the image."));
        }
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function EditProfileModal({ isOpen, currentName, currentImage, onCancel, onSave }) {
  const [name, setName] = useState(currentName || "");
  const [image, setImage] = useState(currentImage || "");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const nameInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Re-seed the form whenever the modal (re)opens.
  useEffect(() => {
    if (!isOpen) return undefined;
    setName(currentName || "");
    setImage(currentImage || "");
    setError("");
    setProcessing(false);
    const focusTimer = setTimeout(() => nameInputRef.current?.focus(), 0);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCancel?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, currentName, currentImage, onCancel]);

  if (!isOpen) return null;

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (PNG, JPG, etc.).");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("Image is too large. Please pick one under 5MB.");
      return;
    }

    setProcessing(true);
    setError("");
    try {
      const dataUrl = await fileToScaledDataUrl(file);
      setImage(dataUrl);
    } catch (err) {
      setError(err.message || "Could not process that image.");
    } finally {
      setProcessing(false);
      // Allow re-selecting the same file later.
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name.");
      nameInputRef.current?.focus();
      return;
    }
    onSave?.({ displayName: trimmed, avatarImage: image });
  };

  const initials = getInitials(name || currentName);

  return (
    <div className="pq-modal-overlay" role="presentation" onMouseDown={onCancel}>
      <section
        className="edit-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="edit-profile-head">
          <h2 id="edit-profile-title">Edit Profile</h2>
          <button type="button" className="edit-profile-close" aria-label="Close" onClick={onCancel}>
            <FaTimes />
          </button>
        </header>

        <form className="edit-profile-form" onSubmit={handleSubmit}>
          <div className="edit-avatar-block">
            <div className="edit-avatar-preview" aria-hidden="true">
              {image ? <img src={image} alt="" /> : <span>{initials}</span>}
            </div>
            <div className="edit-avatar-actions">
              <button
                type="button"
                className="edit-avatar-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={processing}
              >
                <FaCamera /> {processing ? "Processing…" : image ? "Change Photo" : "Upload Photo"}
              </button>
              {image ? (
                <button type="button" className="edit-avatar-remove" onClick={() => setImage("")}>
                  <FaTrashAlt /> Remove
                </button>
              ) : null}
              <p className="edit-avatar-hint">PNG or JPG, up to 5MB.</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="edit-file-input"
              onChange={handleFileChange}
            />
          </div>

          <label className="edit-field">
            <span className="edit-field-label"><FaUser /> Full Name</span>
            <input
              ref={nameInputRef}
              type="text"
              className="edit-field-input"
              value={name}
              maxLength={60}
              placeholder="Your full name"
              onChange={(event) => {
                setName(event.target.value);
                if (error) setError("");
              }}
            />
          </label>

          {error ? <p className="edit-profile-error" role="alert">{error}</p> : null}

          <div className="edit-profile-actions">
            <button type="button" className="edit-btn edit-btn-ghost" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="edit-btn edit-btn-primary" disabled={processing}>
              Save Changes
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default EditProfileModal;
