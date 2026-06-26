/**
 * Practice UI icon assets.
 *
 * The real artwork now lives in `src/assets/gamification/` and is auto-loaded
 * from there (drop files in — see that folder's README). This module just
 * re-shapes those imports into the maps the Practice components already consume,
 * so a missing file transparently falls back to the built-in CSS/icon.
 */
import { gamificationIcons, subjectIconAssets } from "../assets/gamification";

// Summary-strip stat badges (keys used by PracticePage: xp | coin | streak | badges)
export const STAT_ICON_ASSETS = {
  xp: gamificationIcons.xp,
  coin: gamificationIcons.coins,
  streak: gamificationIcons.streak,
  badges: gamificationIcons.badges,
};

// Subject card badges (keys: subject.id, e.g. "nepali")
export const SUBJECT_ICON_ASSETS = subjectIconAssets;
