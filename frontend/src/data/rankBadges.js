/**
 * Overall rank-journey badge artwork + ladder config.
 *
 * The XP thresholds themselves stay in `gamificationMockData.js`
 * (`rankThresholds`) — the single source of truth consumed by
 * `getOverallRankProgress`. This module only attaches a stable `key` and the
 * matching badge image to each tier, in the same order, so the Profile rank
 * journey never drifts from the real rank math.
 *
 * TODO: a few of these PNGs still ship with light/near-white backgrounds.
 * Transparent (alpha) versions are preferred for perfect dark-theme polish —
 * until then the badges render with `object-fit: contain` on a transparent
 * wrapper (see Profile.css .rank-badge-art) so nothing looks cropped or boxed.
 */
import NewAspirantBadge from "../assets/level/New_aspirant.png";
import FocusedLearnerBadge from "../assets/level/focused_learner.png";
import KharidarCandidateBadge from "../assets/level/Kharidar_candidate.png";
import NayabSubbaBadge from "../assets/level/Nayab_subba.png";
import OfficerCandidateBadge from "../assets/level/Officer_candidate.png";
import LoksewaWarriorBadge from "../assets/level/Loksewa_warrior.png";
import PublicServiceMasterBadge from "../assets/level/public_service_master.png";
import LegendBadge from "../assets/level/Legend.png";
import { rankThresholds } from "./gamificationMockData";

export const rankBadgeMap = {
  newAspirant: NewAspirantBadge,
  focusedLearner: FocusedLearnerBadge,
  kharidarCandidate: KharidarCandidateBadge,
  nayabSubbaCandidate: NayabSubbaBadge,
  officerCandidate: OfficerCandidateBadge,
  loksewaWarrior: LoksewaWarriorBadge,
  publicServiceMaster: PublicServiceMasterBadge,
  prepQuestLegend: LegendBadge,
};

// Stable keys in the exact rank order of `rankThresholds`.
const RANK_KEYS = [
  "newAspirant",
  "focusedLearner",
  "kharidarCandidate",
  "nayabSubbaCandidate",
  "officerCandidate",
  "loksewaWarrior",
  "publicServiceMaster",
  "prepQuestLegend",
];

// Ladder used by the rank journey row. Derived from `rankThresholds` so XP
// values are never duplicated/hardcoded here.
export const rankJourney = rankThresholds.map((tier, index) => ({
  key: RANK_KEYS[index] || `rank_${index}`,
  label: tier.rank,
  minXp: tier.xp,
  badge: rankBadgeMap[RANK_KEYS[index]] || NewAspirantBadge,
}));
