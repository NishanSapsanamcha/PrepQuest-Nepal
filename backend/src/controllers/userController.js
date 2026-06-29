// User Controller - Handles per-account data that lives on the User record
// itself rather than in a dedicated domain table (e.g. the daily login
// streak snapshot, which mirrors the shape the frontend used to keep only
// in localStorage).
import { z } from "zod";
import asyncHandler from "../utils/asyncHandler.js";

// Shape mirrors `DEFAULT_STATE` in frontend/src/utils/dailyRewardUtils.js.
// Kept loose (numbers default-coerced, date nullable) since this is a
// best-effort sync of client-computed state, not a server-derived value.
const dailyRewardStateSchema = z.object({
	lastClaimedRewardDate: z.string().nullable().optional(),
	currentStreak: z.number().int().nonnegative().optional(),
	bestStreak: z.number().int().nonnegative().optional(),
	currentCycleDay: z.number().int().nonnegative().optional(),
	totalClaims: z.number().int().nonnegative().optional(),
	claimedRewardDates: z.array(z.string()).optional()
});

// Returns the authenticated user's saved daily-reward snapshot, or null if
// they have never claimed one (or it was never synced from an old session).
const getDailyReward = asyncHandler(async (req, res) => {
	return res.status(200).json({
		success: true,
		dailyRewardState: req.user.dailyRewardState || null
	});
});

// Overwrites the authenticated user's daily-reward snapshot with the
// frontend's current localStorage copy, keeping the streak durable across
// devices/cleared browsers. The frontend computes all the actual reward/
// streak math; this endpoint only stores the result.
const syncDailyReward = asyncHandler(async (req, res) => {
	const state = dailyRewardStateSchema.parse(req.body);

	req.user.dailyRewardState = state;
	await req.user.save({ hooks: false });

	return res.status(200).json({
		success: true,
		dailyRewardState: req.user.dailyRewardState
	});
});

export { getDailyReward, syncDailyReward };
