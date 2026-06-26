/**
 * Premium gamification artwork loader.
 *
 * Drop the uploaded image files into THIS folder using these exact base names
 * (any of .png/.webp/.svg/.jpg works):
 *
 *   xp-badge.png               → Total XP stat
 *   coin-star.png              → Coins stat
 *   streak-flame.png           → Current Streak stat
 *   badge-earned.png           → Badges Earned stat
 *   nepali-language-badge.png  → Nepali subject card  (or subjects/nepali.png)
 *   subjects/<subjectId>.png   → any other subject badge (optional)
 *
 * Files are auto-detected at build time via Vite's import.meta.glob, so adding
 * them needs NO code change. A missing file simply falls back to the built-in
 * CSS/icon, and the build never breaks on absent art.
 */

const ROOT = import.meta.glob("./*.{png,webp,svg,jpg,jpeg,avif}", { eager: true, import: "default" });
const SUBJECTS = import.meta.glob("./subjects/*.{png,webp,svg,jpg,jpeg,avif}", { eager: true, import: "default" });

// Map { "./xp-badge.png": url } → { "xp-badge": url }
function byBaseName(modules) {
  return Object.entries(modules).reduce((acc, [path, url]) => {
    const base = path.split("/").pop().replace(/\.[^.]+$/, "");
    acc[base] = url;
    return acc;
  }, {});
}

const root = byBaseName(ROOT);
const subjects = byBaseName(SUBJECTS);

// Summary-strip stat badges (null when the art has not been added yet).
export const gamificationIcons = {
  xp: root["xp-badge"] || null,
  coins: root["coin-star"] || null,
  streak: root["streak-flame"] || null,
  badges: root["badge-earned"] || null,
};

// Subject card badges, keyed by subject.id. `subjects/<id>.png` files are
// picked up automatically; the Nepali flag badge may live at the root too.
export const subjectIconAssets = {
  ...subjects,
  nepali: root["nepali-language-badge"] || subjects.nepali || null,
};

export default gamificationIcons;
