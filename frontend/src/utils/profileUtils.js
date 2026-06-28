/**
 * Editable profile identity (display name + avatar image).
 *
 * The authenticated account name lives in AuthContext / `userName`, but those
 * get re-synced from the server on every login. User-made edits on the Profile
 * page are stored here, in a dedicated per-account localStorage key, so they
 * persist and take precedence without fighting the auth sync. The key is wiped
 * on account switch (see PER_ACCOUNT_KEYS in storageUtils).
 */
const PROFILE_KEY = "prepquest_profile";

function readProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getProfileOverrides() {
  const data = readProfile();
  return {
    displayName: typeof data.displayName === "string" ? data.displayName : "",
    avatarImage: typeof data.avatarImage === "string" ? data.avatarImage : "",
  };
}

/**
 * Merge-save overrides. Only the provided fields change, so editing just the
 * name preserves the existing image and vice-versa.
 * Pass `avatarImage: ""` (or null) to explicitly reset to the initials avatar.
 */
export function saveProfileOverrides(updates = {}) {
  const next = { ...readProfile() };

  if (typeof updates.displayName === "string") {
    next.displayName = updates.displayName.trim();
  }
  if ("avatarImage" in updates) {
    next.avatarImage = updates.avatarImage || "";
  }

  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  } catch {
    // Storage full (likely an oversized image) — keep the previous value.
  }

  // Keep the app-wide display name in sync so other pages reflect the edit.
  if (typeof updates.displayName === "string" && next.displayName) {
    localStorage.setItem("userName", next.displayName);
  }

  return getProfileOverrides();
}

export function getInitials(name) {
  return (
    String(name || "")
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ME"
  );
}
