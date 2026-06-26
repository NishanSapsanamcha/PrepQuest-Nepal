import asyncHandler from "../utils/asyncHandler.js";
import {
	buildLiveState,
	findRecentTournamentForResults,
	getCurrent,
	getLeaderboard,
	getParticipants,
	getRegistration,
	getRegistrationCount,
	getResults,
	getTournamentOrThrow,
	markUserReady,
	refreshTournamentStatus,
	registerUser,
	submitAnswer
} from "../services/tournamentService.js";

const current = asyncHandler(async (req, res) => {
	const tournaments = await getCurrent(req.user?.id || null);
	res.json({ success: true, ...tournaments });
});

const status = asyncHandler(async (req, res) => {
	const tournament = await getTournamentOrThrow(req.params.id);
	const refreshed = await refreshTournamentStatus(tournament);
	res.json({ success: true, tournament: refreshed.tournament, phase: refreshed.phase });
});

const register = asyncHandler(async (req, res) => {
	const result = await registerUser(req.params.id, req.user, req.body);
	res.status(result.alreadyRegistered ? 200 : 201).json({
		success: true,
		message: result.alreadyRegistered ? "You're already registered for this tournament." : "Tournament registration confirmed.",
		alreadyRegistered: result.alreadyRegistered,
		registration: result.registration
	});
});

const myRegistration = asyncHandler(async (req, res) => {
	const registration = await getRegistration(req.params.id, req.user.id);
	res.json({ success: true, registration });
});

const registrationCount = asyncHandler(async (req, res) => {
	const count = await getRegistrationCount(req.params.id);
	res.json({ success: true, count });
});

const participants = asyncHandler(async (req, res) => {
	const rows = await getParticipants(req.params.id, req.user.id);
	res.json({ success: true, participants: rows });
});

const liveState = asyncHandler(async (req, res) => {
	const state = await buildLiveState(req.params.id, req.user.id);
	res.json({ success: true, ...state });
});

const answer = asyncHandler(async (req, res) => {
	const lockedAnswer = await submitAnswer(req.params.id, req.user.id, req.body.selectedOptionKey);
	res.status(201).json({ success: true, answer: lockedAnswer });
});

const ready = asyncHandler(async (req, res) => {
	const registration = await markUserReady(req.params.id, req.user.id);
	res.json({ success: true, message: "You're ready. Question 1 starts on server time.", registration });
});

const leaderboard = asyncHandler(async (req, res) => {
	const rows = await getLeaderboard(req.params.id, req.user.id);
	res.json({ success: true, leaderboard: rows });
});

const checkpoint = asyncHandler(async (req, res) => {
	const tournament = await getTournamentOrThrow(req.params.id);
	const refreshed = await refreshTournamentStatus(tournament);
	const rows = await getLeaderboard(req.params.id, req.user.id);
	res.json({ success: true, phase: refreshed.phase, leaderboard: rows });
});

const results = asyncHandler(async (req, res) => {
	const tournamentId = req.params.id || (await findRecentTournamentForResults())?.id;
	if (!tournamentId) {
		return res.json({
			success: true,
			tournament: null,
			podium: [],
			leaderboard: [],
			currentUser: null,
			currentUserResult: null,
			answers: []
		});
	}
	const data = await getResults(tournamentId, req.user.id);
	res.json({ success: true, ...data });
});

const applyRewards = asyncHandler(async (req, res) => {
	const data = await getResults(req.params.id, req.user.id);
	res.json({ success: true, message: "Rewards have been saved once and will not duplicate on refresh.", ...data });
});

export {
	answer,
	applyRewards,
	checkpoint,
	current,
	leaderboard,
	liveState,
	myRegistration,
	participants,
	ready,
	register,
	registrationCount,
	results,
	status
};
