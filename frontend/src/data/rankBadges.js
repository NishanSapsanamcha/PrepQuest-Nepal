/**
 * Overall rank-journey badge artwork + ladder config.
 *
 * The XP thresholds themselves stay in `gamificationMockData.js`
 * (`rankThresholds`) — the single source of truth consumed by
 * `getOverallRankProgress`. This module only attaches a stable `key` and the
 * matching badge image to each tier, in the same order, so the Profile rank
 * journey never drifts from the real rank math.
 *
 * The badge PNGs have had their baked-in white/gray backgrounds stripped to
 * true alpha transparency (originals kept in assets/level/_original_backup/),
 * so they blend straight into the dark UI. They render with `object-fit:
 * contain` on a transparent wrapper (Profile.css .rank-badge-art) — no box,
 * frame, or background-color behind them.
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

// Intentional two-line label wrapping so the badge row stays clean and balanced
// (short labels stay on one line). Keyed by rank key.
const LABEL_LINES = {
  newAspirant: ["New Aspirant"],
  focusedLearner: ["Focused", "Learner"],
  kharidarCandidate: ["Kharidar", "Candidate"],
  nayabSubbaCandidate: ["Nayab Subba", "Candidate"],
  officerCandidate: ["Officer", "Candidate"],
  loksewaWarrior: ["Loksewa", "Warrior"],
  publicServiceMaster: ["Public Service", "Master"],
  prepQuestLegend: ["PrepQuest", "Legend"],
};

// Ladder used by the rank journey row. Derived from `rankThresholds` so XP
// values are never duplicated/hardcoded here.
export const rankJourney = rankThresholds.map((tier, index) => {
  const key = RANK_KEYS[index] || `rank_${index}`;
  return {
    key,
    label: tier.rank,
    labelLines: LABEL_LINES[key] || [tier.rank],
    minXp: tier.xp,
    badge: rankBadgeMap[key] || NewAspirantBadge,
  };
});
