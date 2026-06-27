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

// Prefer a background-removed "<name>-transparent" file when present so the
// badge blends into the dark card instead of showing a square image edge.
const pick = (map, name) => map[`${name}-transparent`] || map[name] || null;

// Summary-strip stat badges (null when the art has not been added yet).
export const gamificationIcons = {
  xp: pick(root, "xp-badge"),
  coins: pick(root, "coin-star"),
  streak: pick(root, "streak-flame"),
  badges: pick(root, "badge-earned"),
};

// Subject card badges, keyed by subject.id. `subjects/<id>.png` files are
// picked up automatically; the Nepali flag badge may live at the root too.
export const subjectIconAssets = {
  ...subjects,
  nepali: pick(root, "nepali-language-badge") || pick(subjects, "nepali"),
};

// Decorative hero/header artwork for the Subject Practice Modes page.
export const heroMountain = pick(root, "mountain");

// Subject level badge artwork keyed by level number (1–6). A missing file
// falls back to null so the UI can render its built-in badge instead.
export const levelBadgeAssets = {
  1: pick(root, "level1"),
  2: pick(root, "level2"),
  3: pick(root, "level3"),
  4: pick(root, "level4"),
  5: pick(root, "level5"),
  6: pick(root, "level6"),
};

export function getLevelBadge(level) {
  return levelBadgeAssets[level] || levelBadgeAssets[1] || null;
}

// Practice mode card artwork keyed by the mode name used across the app.
export const practiceModeIcons = {
  "Quick Practice": pick(root, "quick-practice"),
  "Topic Practice": pick(root, "topic-practice"),
  "Mixed Practice": pick(root, "mixed-practice"),
  "Weak Area Practice": pick(root, "weak-area-practice"),
  "Accuracy Challenge": pick(root, "accuracy-challenge"),
  "Advanced Revision": pick(root, "advanced-revision"),
};

export default gamificationIcons;
