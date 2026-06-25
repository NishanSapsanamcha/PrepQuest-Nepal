import { Op } from "sequelize";
import { practiceQuestions } from "../../../frontend/src/data/practiceQuestions.js";
import { mockTestQuestions } from "../../../frontend/src/data/mockTestQuestions.js";
import {
	Tournament,
	TournamentAnswer,
	TournamentRegistration,
	TournamentResult
} from "../models/index.js";

const QUESTION_COUNT = 20;
const ANSWER_SECONDS = 15;
const REVEAL_SECONDS = 3;
const CHECKPOINT_SECONDS = 15;
const QUESTION_BLOCK_SECONDS = ANSWER_SECONDS + REVEAL_SECONDS;
const CHECKPOINTS = new Set([5, 10, 15]);
const DEMO_SLOT_MS = 3 * 60 * 1000;
const DEMO_REGISTRATION_SECONDS = 45;
const DEMO_STARTING_SOON_SECONDS = 15;
const EXAM_LABELS = {
	"nayab-subba": "Nayab Subba",
	"sakha-adhikrit": "Sakha Adhikrit"
};
const VALID_LANGUAGES = new Set(["english", "nepali", "both"]);
const VALID_OPTIONS = new Set(["A", "B", "C", "D"]);

const rewardForRank = (rank) => {
	if (rank === 1) return { rewardCoins: 500, rewardXp: 500, badgeEarned: "Gold Champion Badge" };
	if (rank === 2) return { rewardCoins: 300, rewardXp: 300, badgeEarned: "Silver Champion Badge" };
	if (rank === 3) return { rewardCoins: 150, rewardXp: 200, badgeEarned: "Bronze Champion Badge" };
	if (rank <= 10) return { rewardCoins: 50, rewardXp: 100, badgeEarned: "Top Performer Badge" };
	return { rewardCoins: 50, rewardXp: 100, badgeEarned: null };
};

const normalizeExam = (value) => String(value || "").trim().toLowerCase() || "";
const normalizeLanguage = (value) => {
	const language = String(value || "").trim().toLowerCase();
	return VALID_LANGUAGES.has(language) ? language : "";
};

function isValidQuestion(question) {
	const optionKeys = question?.options?.map((option) => option.key) || [];
	return Boolean(
		question?.id &&
		question?.reviewed === true &&
		question?.question_en &&
		question?.question_np &&
		Array.isArray(question?.options) &&
		question.options.length === 4 &&
		["A", "B", "C", "D"].every((key) => optionKeys.includes(key)) &&
		VALID_OPTIONS.has(question?.correctOption)
	);
}

function questionMatchesExam(question, examTrack) {
	if (examTrack === "mixed") return true;
	const label = EXAM_LABELS[examTrack] || examTrack;
	return !question.examTracks?.length || question.examTracks.includes(label);
}

function deterministicShuffle(items, seed) {
	return [...items]
		.map((item, index) => {
			const text = `${seed}-${item.id}-${index}`;
			const score = Array.from(text).reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) % 1000003, 7);
			return { item, score };
		})
		.sort((a, b) => a.score - b.score)
		.map(({ item }) => item);
}

function selectQuestions(examTrack, seed) {
	return deterministicShuffle(
		[...practiceQuestions, ...mockTestQuestions].filter((question) => isValidQuestion(question) && questionMatchesExam(question, examTrack)),
		seed
	).slice(0, QUESTION_COUNT);
}

function getQuestionMap() {
	return new Map([...practiceQuestions, ...mockTestQuestions].filter(isValidQuestion).map((question) => [question.id, question]));
}

function getNextFridayAt7(now = new Date()) {
	const next = new Date(now);
	next.setHours(19, 0, 0, 0);
	const day = next.getDay();
	const daysUntilFriday = (5 - day + 7) % 7;
	next.setDate(next.getDate() + daysUntilFriday);
	if (next <= now) next.setDate(next.getDate() + 7);
	return next;
}

function getOfficialId(startAt) {
	const date = startAt.toISOString().slice(0, 10);
	return `official-friday-${date}`;
}

function getDemoSlotStart(now = new Date()) {
	return new Date(Math.floor(now.getTime() / DEMO_SLOT_MS) * DEMO_SLOT_MS);
}

function buildTimeline(startAt) {
	const segments = [];
	let cursor = startAt.getTime();
	for (let index = 0; index < QUESTION_COUNT; index += 1) {
		const startedAt = cursor;
		const answerEndsAt = startedAt + ANSWER_SECONDS * 1000;
		const revealEndsAt = answerEndsAt + REVEAL_SECONDS * 1000;
		segments.push({ type: "question", questionIndex: index, startedAt, answerEndsAt, revealEndsAt });
		cursor = revealEndsAt;
		if (CHECKPOINTS.has(index + 1)) {
			segments.push({ type: "checkpoint", afterQuestion: index + 1, startedAt: cursor, endsAt: cursor + CHECKPOINT_SECONDS * 1000 });
			cursor += CHECKPOINT_SECONDS * 1000;
		}
	}
	return { segments, endAt: new Date(cursor) };
}

function computeLivePhase(tournament, now = new Date()) {
	const startAt = new Date(tournament.startAt);
	const nowMs = now.getTime();
	const registrationStartAt = new Date(tournament.registrationStartAt).getTime();
	const startingSoonAt = startAt.getTime() - DEMO_STARTING_SOON_SECONDS * 1000;

	if (nowMs < registrationStartAt) return { status: "registration_open", phase: "registration", secondsToStart: Math.ceil((startAt - now) / 1000) };
	if (nowMs < startingSoonAt) return { status: "registration_open", phase: "registration", secondsToStart: Math.ceil((startAt - now) / 1000) };
	if (nowMs < startAt.getTime()) return { status: "starting_soon", phase: "starting_soon", secondsToStart: Math.ceil((startAt - now) / 1000) };

	const { segments } = buildTimeline(startAt);
	const active = segments.find((segment) => nowMs >= segment.startedAt && nowMs < (segment.revealEndsAt || segment.endsAt));
	if (!active) return { status: "results_published", phase: "finished", questionIndex: QUESTION_COUNT - 1, timeLeft: 0 };

	if (active.type === "checkpoint") {
		return {
			status: "checkpoint",
			phase: "checkpoint",
			afterQuestion: active.afterQuestion,
			countdownSeconds: Math.max(0, Math.ceil((active.endsAt - nowMs) / 1000))
		};
	}

	const answerOpen = nowMs < active.answerEndsAt;
	return {
		status: "live",
		phase: answerOpen ? "question" : "reveal",
		questionIndex: active.questionIndex,
		questionStartedAt: new Date(active.startedAt),
		timeLeft: answerOpen ? Math.max(0, Math.ceil((active.answerEndsAt - nowMs) / 1000)) : 0,
		revealCountdownSeconds: answerOpen ? 0 : Math.max(0, Math.ceil((active.revealEndsAt - nowMs) / 1000)),
		answerOpen
	};
}

async function ensureTournament(data) {
	const existing = await Tournament.findByPk(data.id);
	if (existing) return existing;
	const questions = selectQuestions(data.examTrack, data.id);
	const { endAt } = buildTimeline(data.startAt);
	return Tournament.create({
		...data,
		endAt,
		questionIds: questions.map((question) => question.id)
	});
}

async function ensureCurrentTournaments(now = new Date()) {
	const officialStartAt = getNextFridayAt7(now);
	const official = await ensureTournament({
		id: getOfficialId(officialStartAt),
		title: "Friday Loksewa Battle",
		examTrack: "mixed",
		type: "official",
		status: "registration_open",
		registrationStartAt: new Date(officialStartAt.getTime() - 6 * 24 * 60 * 60 * 1000),
		startAt: officialStartAt
	});

	const slotStart = getDemoSlotStart(now);
	const demoStartAt = new Date(slotStart.getTime() + (DEMO_REGISTRATION_SECONDS + DEMO_STARTING_SOON_SECONDS) * 1000);
	const demo = await ensureTournament({
		id: `demo-${slotStart.toISOString()}`,
		title: "Quick Demo Battle",
		examTrack: "mixed",
		type: "demo",
		status: "registration_open",
		registrationStartAt: slotStart,
		startAt: demoStartAt
	});

	return { official, demo };
}

async function refreshTournamentStatus(tournament, now = new Date()) {
	const phase = computeLivePhase(tournament, now);
	const updates = { status: phase.status };
	if (Number.isInteger(phase.questionIndex)) {
		updates.currentQuestionIndex = phase.questionIndex;
		updates.currentQuestionStartedAt = phase.questionStartedAt || tournament.currentQuestionStartedAt;
	}
	if (tournament.status !== updates.status || tournament.currentQuestionIndex !== updates.currentQuestionIndex) {
		await tournament.update(updates);
	}
	return { tournament, phase };
}

function publicTournament(tournament, phase, registrationCount = 0, registration = null) {
	return {
		id: tournament.id,
		title: tournament.title,
		type: tournament.type,
		examTrack: tournament.examTrack,
		status: phase.status,
		phase: phase.phase,
		registrationStartAt: tournament.registrationStartAt,
		startAt: tournament.startAt,
		endAt: tournament.endAt,
		secondsToStart: phase.secondsToStart || 0,
		registrationCount,
		questionCount: QUESTION_COUNT,
		timePerQuestion: ANSWER_SECONDS,
		registration: registration ? serializeRegistration(registration) : null
	};
}

function serializeRegistration(registration) {
	return {
		id: registration.id,
		tournamentId: registration.tournamentId,
		userId: registration.userId,
		displayName: registration.displayName,
		selectedExam: registration.selectedExam,
		preferredLanguage: registration.preferredLanguage,
		registeredAt: registration.registeredAt,
		status: registration.status,
		score: registration.score,
		correctAnswers: registration.correctAnswers,
		wrongAnswers: registration.wrongAnswers,
		unanswered: registration.unanswered,
		totalAnswered: registration.totalAnswered,
		totalTimeTaken: registration.totalTimeTaken
	};
}

async function getRegistration(tournamentId, userId) {
	if (!userId) return null;
	return TournamentRegistration.findOne({ where: { tournamentId, userId } });
}

async function getRegistrationCount(tournamentId) {
	return TournamentRegistration.count({ where: { tournamentId } });
}

async function getTournamentOrThrow(tournamentId) {
	const tournament = await Tournament.findByPk(tournamentId);
	if (!tournament) {
		const current = await ensureCurrentTournaments();
		if (current.demo.id === tournamentId) return current.demo;
		if (current.official.id === tournamentId) return current.official;
		const error = new Error("Tournament not found");
		error.statusCode = 404;
		throw error;
	}
	return tournament;
}

async function getLeaderboard(tournamentId, currentUserId = null) {
	const registrations = await TournamentRegistration.findAll({ where: { tournamentId } });
	const rows = registrations
		.map((registration) => ({
			userId: registration.userId,
			displayName: registration.displayName,
			selectedExam: registration.selectedExam,
			preferredLanguage: registration.preferredLanguage,
			registeredAt: registration.registeredAt,
			score: registration.score,
			correctAnswers: registration.correctAnswers,
			wrongAnswers: registration.wrongAnswers,
			unanswered: registration.unanswered,
			totalAnswered: registration.totalAnswered,
			totalTimeTaken: registration.totalTimeTaken,
			isCurrentUser: registration.userId === currentUserId
		}))
		.sort((a, b) => {
			if (b.score !== a.score) return b.score - a.score;
			if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
			if (a.totalTimeTaken !== b.totalTimeTaken) return a.totalTimeTaken - b.totalTimeTaken;
			return new Date(a.registeredAt) - new Date(b.registeredAt);
		})
		.map((row, index) => ({ ...row, rank: index + 1 }));

	return rows;
}

function publicQuestion(question, reveal = false) {
	if (!question) return null;
	return {
		id: question.id,
		subjectId: question.subjectId,
		subject: question.subject,
		topic: question.topic,
		difficulty: question.difficulty,
		question_en: question.question_en,
		question_np: question.question_np,
		options: question.options,
		...(reveal ? {
			correctOption: question.correctOption,
			explanation_en: question.explanation_en,
			explanation_np: question.explanation_np
		} : {})
	};
}

async function buildLiveState(tournamentId, userId) {
	const tournament = await getTournamentOrThrow(tournamentId);
	const { phase } = await refreshTournamentStatus(tournament);
	const registration = await getRegistration(tournament.id, userId);
	const questionMap = getQuestionMap();
	const questionIds = tournament.questionIds || [];
	const currentQuestion = questionMap.get(questionIds[phase.questionIndex]);
	const userAnswer = Number.isInteger(phase.questionIndex)
		? await TournamentAnswer.findOne({ where: { tournamentId: tournament.id, userId, questionIndex: phase.questionIndex } })
		: null;
	const leaderboard = await getLeaderboard(tournament.id, userId);

	if (phase.status === "results_published") {
		await publishResults(tournament.id);
	}

	return {
		tournament: publicTournament(tournament, phase, await getRegistrationCount(tournament.id), registration),
		registration: registration ? serializeRegistration(registration) : null,
		phase,
		question: publicQuestion(currentQuestion, phase.phase === "reveal"),
		answer: userAnswer ? {
			selectedOptionKey: userAnswer.selectedOptionKey,
			isCorrect: phase.phase === "reveal" ? userAnswer.isCorrect : null,
			pointsEarned: phase.phase === "reveal" ? userAnswer.pointsEarned : null,
			locked: true
		} : null,
		leaderboard: leaderboard.slice(0, phase.phase === "checkpoint" ? 5 : 10),
		currentUserRank: leaderboard.find((row) => row.userId === userId) || null
	};
}

async function registerUser(tournamentId, user, payload) {
	const tournament = await getTournamentOrThrow(tournamentId);
	const { phase } = await refreshTournamentStatus(tournament);
	const selectedExam = normalizeExam(payload.selectedExam);
	const preferredLanguage = normalizeLanguage(payload.preferredLanguage);

	if (!selectedExam) {
		const error = new Error("Select an exam before registering");
		error.statusCode = 400;
		throw error;
	}
	if (!preferredLanguage) {
		const error = new Error("Choose a preferred language before registering");
		error.statusCode = 400;
		throw error;
	}
	if (phase.status !== "registration_open") {
		const error = new Error("Registration Closed.");
		error.statusCode = 409;
		throw error;
	}
	if (tournament.examTrack !== "mixed" && tournament.examTrack !== selectedExam) {
		const error = new Error("Your selected exam does not match this tournament");
		error.statusCode = 400;
		throw error;
	}

	const existing = await getRegistration(tournament.id, user.id);
	if (existing) {
		return { registration: existing, alreadyRegistered: true };
	}

	const registration = await TournamentRegistration.create({
		tournamentId: tournament.id,
		userId: user.id,
		displayName: user.fullName || user.email,
		selectedExam,
		preferredLanguage,
		registeredAt: new Date(),
		status: "registered"
	});

	return { registration, alreadyRegistered: false };
}

async function submitAnswer(tournamentId, userId, selectedOptionKey) {
	const tournament = await getTournamentOrThrow(tournamentId);
	const { phase } = await refreshTournamentStatus(tournament);
	const registration = await getRegistration(tournament.id, userId);
	if (!registration) {
		const error = new Error("You must register before answering");
		error.statusCode = 403;
		throw error;
	}
	if (phase.phase !== "question" || !phase.answerOpen) {
		const error = new Error("Answer window is closed");
		error.statusCode = 409;
		throw error;
	}
	if (!VALID_OPTIONS.has(selectedOptionKey)) {
		const error = new Error("Choose a valid answer option");
		error.statusCode = 400;
		throw error;
	}

	const existing = await TournamentAnswer.findOne({
		where: { tournamentId: tournament.id, userId, questionIndex: phase.questionIndex }
	});
	if (existing) {
		const error = new Error("Answer already locked for this question");
		error.statusCode = 409;
		throw error;
	}

	const question = getQuestionMap().get(tournament.questionIds[phase.questionIndex]);
	if (!question) {
		const error = new Error("Tournament question is unavailable");
		error.statusCode = 409;
		throw error;
	}

	const now = new Date();
	const timeLeft = Math.max(0, (new Date(phase.questionStartedAt).getTime() + ANSWER_SECONDS * 1000 - now.getTime()) / 1000);
	const timeTaken = Math.max(0, ANSWER_SECONDS - timeLeft);
	const isCorrect = selectedOptionKey === question.correctOption;
	const pointsEarned = isCorrect ? 100 + Math.round((timeLeft / ANSWER_SECONDS) * 50) : 0;

	const answer = await TournamentAnswer.create({
		tournamentId: tournament.id,
		userId,
		questionId: question.id,
		questionIndex: phase.questionIndex,
		selectedOptionKey,
		isCorrect,
		timeLeft,
		timeTaken,
		pointsEarned,
		answeredAt: now
	});

	await registration.increment({
		score: pointsEarned,
		correctAnswers: isCorrect ? 1 : 0,
		wrongAnswers: isCorrect ? 0 : 1,
		totalAnswered: 1,
		totalTimeTaken: timeTaken
	});

	return {
		selectedOptionKey: answer.selectedOptionKey,
		locked: true,
		message: "Answer locked. Waiting for reveal."
	};
}

async function publishResults(tournamentId) {
	const tournament = await getTournamentOrThrow(tournamentId);
	const registrations = await TournamentRegistration.findAll({
		where: { tournamentId },
		order: [["registeredAt", "ASC"]]
	});
	const leaderboard = await getLeaderboard(tournamentId);

	await Promise.all(registrations.map(async (registration) => {
		const rankRow = leaderboard.find((row) => row.userId === registration.userId);
		const unanswered = Math.max(0, QUESTION_COUNT - registration.totalAnswered);
		const reward = rewardForRank(rankRow?.rank || leaderboard.length || 1);
		await registration.update({ unanswered, status: "completed" });

		const existing = await TournamentResult.findOne({ where: { tournamentId, userId: registration.userId } });
		if (existing) return existing;
		return TournamentResult.create({
			tournamentId,
			userId: registration.userId,
			finalScore: registration.score,
			finalRank: rankRow?.rank || leaderboard.length || 1,
			correctAnswers: registration.correctAnswers,
			wrongAnswers: registration.wrongAnswers,
			unanswered,
			totalTimeTaken: registration.totalTimeTaken,
			rewardXp: reward.rewardXp,
			rewardCoins: reward.rewardCoins,
			badgeEarned: reward.badgeEarned,
			rewardsApplied: true
		});
	}));

	if (tournament.status !== "results_published") {
		await tournament.update({ status: "results_published" });
	}
}

async function getResults(tournamentId, userId) {
	const tournament = await getTournamentOrThrow(tournamentId);
	const { phase } = await refreshTournamentStatus(tournament);
	if (phase.status === "results_published") {
		await publishResults(tournamentId);
	}
	const leaderboard = await getLeaderboard(tournamentId, userId);
	const results = await TournamentResult.findAll({ where: { tournamentId } });
	const resultMap = new Map(results.map((result) => [result.userId, result]));
	const answers = await TournamentAnswer.findAll({ where: { tournamentId, userId }, order: [["questionIndex", "ASC"]] });
	const questionMap = getQuestionMap();
	const registration = await getRegistration(tournamentId, userId);

	return {
		tournament: publicTournament(tournament, phase, await getRegistrationCount(tournamentId), registration),
		podium: leaderboard.slice(0, 3).map((row) => ({ ...row, result: resultMap.get(row.userId) || null })),
		leaderboard: leaderboard.map((row) => ({ ...row, result: resultMap.get(row.userId) || null })),
		currentUser: leaderboard.find((row) => row.userId === userId) || null,
		currentUserResult: resultMap.get(userId) || null,
		answers: answers.map((answer) => {
			const question = questionMap.get(answer.questionId);
			return {
				...publicQuestion(question, true),
				questionId: answer.questionId,
				selectedOptionKey: answer.selectedOptionKey,
				isCorrect: answer.isCorrect,
				pointsEarned: answer.pointsEarned,
				score: answer.pointsEarned,
				timeTaken: answer.timeTaken
			};
		})
	};
}

async function getCurrent(userId = null) {
	const { official, demo } = await ensureCurrentTournaments();
	const [officialRegistration, demoRegistration] = await Promise.all([
		getRegistration(official.id, userId),
		getRegistration(demo.id, userId)
	]);
	const [officialCount, demoCount] = await Promise.all([
		getRegistrationCount(official.id),
		getRegistrationCount(demo.id)
	]);
	const officialPhase = (await refreshTournamentStatus(official)).phase;
	const demoPhase = (await refreshTournamentStatus(demo)).phase;
	return {
		official: publicTournament(official, officialPhase, officialCount, officialRegistration),
		demo: publicTournament(demo, demoPhase, demoCount, demoRegistration)
	};
}

async function findRecentTournamentForResults() {
	const tournament = await Tournament.findOne({
		where: { status: { [Op.in]: ["finished", "results_published"] } },
		order: [["startAt", "DESC"]]
	});
	return tournament;
}

export {
	ANSWER_SECONDS,
	CHECKPOINT_SECONDS,
	QUESTION_COUNT,
	buildLiveState,
	ensureCurrentTournaments,
	findRecentTournamentForResults,
	getCurrent,
	getLeaderboard,
	getRegistration,
	getRegistrationCount,
	getResults,
	getTournamentOrThrow,
	publicTournament,
	refreshTournamentStatus,
	registerUser,
	submitAnswer
};
