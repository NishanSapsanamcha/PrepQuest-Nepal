/**
 * Premium badge art for the Practice UI.
 *
 * Drop image files (PNG/WebP/SVG) into `frontend/public/assets/practice/` and
 * map them here. Any key left undefined falls back to the built-in CSS gem/hex
 * icon — and NO network request is made for unmapped icons, so there is never a
 * 404 for art you have not added yet.
 *
 * Example once you add files:
 *   export const STAT_ICON_ASSETS = {
 *     xp: "/assets/practice/xp.png",
 *     coin: "/assets/practice/coin.png",
 *     streak: "/assets/practice/streak.png",
 *     badges: "/assets/practice/badges.png",
 *   };
 *   export const SUBJECT_ICON_ASSETS = {
 *     nepali: "/assets/practice/subjects/nepali.png", // Nepal flag badge
 *   };
 */

// Summary-strip stat badges (keys: xp | coin | streak | badges)
export const STAT_ICON_ASSETS = {};

// Subject card badges (keys: subject.id, e.g. "general-knowledge", "nepali")
export const SUBJECT_ICON_ASSETS = {};
