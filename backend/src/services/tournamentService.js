import { Op } from "sequelize";
import { practiceQuestions } from "../../../frontend/src/data/practiceQuestions.js";
import { mockTestQuestions } from "../../../frontend/src/data/mockTestQuestions.js";
import {
	Tournament,
	TournamentAnswer,
	TournamentRegistration,
	TournamentResult,
	User
} from "../models/index.js";

const QUESTION_COUNT = 20;
const ANSWER_SECONDS = 15;
const READY_SECONDS = 10;
const REVEAL_SECONDS = 3;
const CHECKPOINT_SECONDS = 15;
const CHECKPOINTS = new Set([5, 10, 15]);
const DEMO_REGISTRATION_SECONDS = 180;
const EXAM_LABELS = {
	"nayab-subba": "Nayab Subba",
	"sakha-adhikrit": "Sakha Adhikrit"
};
const VALID_LANGUAGES = new Set(["english", "nepali", "both"]);
const VALID_OPTIONS = new Set(["A", "B", "C", "D"]);
const DEMO_PARTICIPANTS = [
	{ id: "22222222-2222-4222-8222-222222222222", name: "Aayush Sharma", email: "demo.aayush@prepquest.local", selectedExam: "sakha-adhikrit", preferredLanguage: "nepali" },
	{ id: "11111111-1111-4111-8111-111111111111", name: "Suman Adhikari", email: "demo.suman@prepquest.local", selectedExam: "sakha-adhikrit", preferredLanguage: "nepali" },
	{ id: "33333333-3333-4333-8333-333333333333", name: "Ramesh Thapa", email: "demo.ramesh@prepquest.local", selectedExam: "nayab-subba", preferredLanguage: "nepali" },
	{ id: "44444444-4444-4444-8444-444444444444", name: "Nisha Karki", email: "demo.nisha@prepquest.local", selectedExam: "sakha-adhikrit", preferredLanguage: "nepali" },
	{ id: "55555555-5555-4555-8555-555555555555", name: "Prabin Gurung", email: "demo.prabin@prepquest.local", selectedExam: "nayab-subba", preferredLanguage: "nepali" }
];

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
	const validQuestions = deterministicShuffle(
		[...practiceQuestions, ...mockTestQuestions].filter((question) => isValidQuestion(question) && questionMatchesExam(question, examTrack)),
		seed
	);
	const bySubject = new Map();
	validQuestions.forEach((question) => {
		const key = question.subjectId || question.subject || "mixed";
		bySubject.set(key, [...(bySubject.get(key) || []), question]);
	});

	const mixed = [];
	const subjectQueues = [...bySubject.values()];
	while (mixed.length < QUESTION_COUNT && subjectQueues.some((queue) => queue.length > 0)) {
		subjectQueues.forEach((queue) => {
			if (mixed.length < QUESTION_COUNT && queue.length) {
				mixed.push(queue.shift());
			}
		});
	}
	return mixed;
}

function getQuestionMap() {
	return new Map([...practiceQuestions, ...mockTestQuestions].filter(isValidQuestion).map((question) => [question.id, question]));
}

function buildTimeline(startAt) {
	const segments = [];
	let cursor = startAt.getTime() + READY_SECONDS * 1000;
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
	const firstQuestionAt = new Date(startAt.getTime() + READY_SECONDS * 1000);
	const nowMs = now.getTime();
	const registrationStartAt = new Date(tournament.registrationStartAt).getTime();

	if (nowMs < registrationStartAt) return { status: "registration_open", phase: "registration", secondsToStart: Math.ceil((startAt - now) / 1000) };
	if (nowMs < startAt.getTime()) return { status: "registration_open", phase: "registration", secondsToStart: Math.ceil((startAt - now) / 1000) };
	if (nowMs < firstQuestionAt.getTime()) {
		return {
			status: "ready_room",
			phase: "ready_room",
			readyCountdownSeconds: Math.max(0, Math.ceil((firstQuestionAt - now) / 1000)),
			questionStartsAt: firstQuestionAt
		};
	}

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
		status: answerOpen ? "live" : "reveal",
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
	const tournament = await Tournament.create({
		...data,
		endAt,
		questionIds: questions.map((question) => question.id)
	});
	await seedDemoParticipants(tournament);
	return tournament;
}

async function seedDemoParticipants(tournament) {
	await Promise.all(DEMO_PARTICIPANTS.map(async (participant, index) => {
		const [user] = await User.findOrCreate({
			where: { id: participant.id },
			defaults: {
				id: participant.id,
				fullName: participant.name,
				email: participant.email,
				password: "DemoUser123!",
				role: "student",
				securityQuestion: "Demo participant?",
				securityAnswer: "yes"
			}
		});

		await TournamentRegistration.findOrCreate({
			where: { tournamentId: tournament.id, userId: user.id },
			defaults: {
				tournamentId: tournament.id,
				userId: user.id,
				displayName: participant.name,
				selectedExam: participant.selectedExam,
				preferredLanguage: participant.preferredLanguage,
				registeredAt: new Date(new Date(tournament.registrationStartAt).getTime() + (index + 1) * 1000),
				status: "registered"
			}
		});
	}));
}

async function ensureCurrentTournament(now = new Date()) {
	const active = await Tournament.findOne({
		where: {
			title: "Friday Live Tournament",
			status: { [Op.in]: ["registration_open", "ready_room", "live", "reveal", "checkpoint", "finished"] }
		},
		order: [["registrationStartAt", "DESC"]]
	});

	if (active) {
		const { phase } = await refreshTournamentStatus(active, now);
		if (phase.status !== "results_published") {
			await seedDemoParticipants(active);
			return active;
		}
	}

	const registrationStartAt = now;
	const startAt = new Date(now.getTime() + DEMO_REGISTRATION_SECONDS * 1000);
	return ensureTournament({
		id: `friday-live-${registrationStartAt.toISOString().replaceAll(":", "-")}`,
		title: "Friday Live Tournament",
		examTrack: "mixed",
		type: "demo",
		status: "registration_open",
		registrationStartAt,
		startAt
	});
}

async function refreshTournamentStatus(tournament, now = new Date()) {
	const phase = computeLivePhase(tournament, now);
	const updates = { status: phase.status };
	const hasQuestionIndex = Number.isInteger(phase.questionIndex);
	if (hasQuestionIndex) {
		updates.currentQuestionIndex = phase.questionIndex;
		updates.currentQuestionStartedAt = phase.questionStartedAt || tournament.currentQuestionStartedAt;
	}
	if (tournament.status !== updates.status || (hasQuestionIndex && tournament.currentQuestionIndex !== updates.currentQuestionIndex)) {
		await tournament.update(updates);
	}
	await syncDemoParticipantAnswers(tournament, phase);
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
		readyCountdownSeconds: phase.readyCountdownSeconds || 0,
		questionStartsAt: phase.questionStartsAt || null,
		registrationCount,
		questionCount: QUESTION_COUNT,
		timePerQuestion: ANSWER_SECONDS,
		registration: registration ? serializeRegistration(registration) : null
	};
}

function serializeRegistration(registration, answeredQuestionLimit = null) {
	const unanswered = answeredQuestionLimit === null
		? registration.unanswered
		: Math.max(registration.unanswered || 0, Math.max(0, answeredQuestionLimit - registration.totalAnswered));
	return {
		id: registration.id,
		tournamentId: registration.tournamentId,
		userId: registration.userId,
		displayName: registration.displayName,
		selectedExam: registration.selectedExam,
		preferredLanguage: registration.preferredLanguage,
		registeredAt: registration.registeredAt,
		status: registration.status,
		readyStatus: registration.readyStatus,
		score: registration.score,
		correctAnswers: registration.correctAnswers,
		wrongAnswers: registration.wrongAnswers,
		unanswered,
		totalAnswered: registration.totalAnswered,
		totalTimeTaken: registration.totalTimeTaken,
		speedBonusTotal: registration.speedBonusTotal || 0
	};
}

function serializeParticipant(registration, currentUserId = null) {
	return {
		userId: registration.userId,
		displayName: registration.displayName,
		selectedExam: registration.selectedExam,
		preferredLanguage: registration.preferredLanguage,
		registeredAt: registration.registeredAt,
		readyStatus: registration.readyStatus,
		isCurrentUser: registration.userId === currentUserId
	};
}

async function getRegistration(tournamentId, userId) {
	if (!userId) return null;
	return TournamentRegistration.findOne({ where: { tournamentId, userId } });
}

async function getRegistrationCount(tournamentId) {
	return TournamentRegistration.count({ where: { tournamentId } });
}

async function getParticipants(tournamentId, currentUserId = null) {
	const registrations = await TournamentRegistration.findAll({
		where: { tournamentId },
		order: [["registeredAt", "ASC"]]
	});
	return registrations.map((registration) => serializeParticipant(registration, currentUserId));
}

async function getTournamentOrThrow(tournamentId) {
	const tournament = await Tournament.findByPk(tournamentId);
	if (!tournament) {
		const current = await ensureCurrentTournament();
		if (current.id === tournamentId) return current;
		const error = new Error("Tournament not found");
		error.statusCode = 404;
		throw error;
	}
	return tournament;
}

function getAnsweredQuestionLimit(phase) {
	if (phase.phase === "registration") return 0;
	if (phase.phase === "checkpoint") return phase.afterQuestion || 0;
	if (phase.phase === "reveal") return (phase.questionIndex || 0) + 1;
	if (phase.phase === "question") return phase.questionIndex || 0;
	if (phase.phase === "finished") return QUESTION_COUNT;
	return 0;
}

function getDemoAnswerProfile(participantIndex, questionIndex) {
	const unanswered = ((questionIndex * 7 + participantIndex * 5) % 17) === 0;
	const accuracyBuckets = [0.62, 0.78, 0.58, 0.86, 0.7];
	const correctnessRoll = ((questionIndex * 13 + participantIndex * 19) % 100) / 100;
	const isCorrect = !unanswered && correctnessRoll < accuracyBuckets[participantIndex % accuracyBuckets.length];
	const timeTaken = 2 + ((participantIndex * 3 + questionIndex * 5) % 13);
	const timeLeft = Math.max(1, ANSWER_SECONDS - timeTaken);
	return { timeLeft, isCorrect, unanswered };
}

async function syncDemoParticipantAnswers(tournament, phase) {
	const limit = getAnsweredQuestionLimit(phase);
	if (limit <= 0) return;

	const questionMap = getQuestionMap();
	await Promise.all(DEMO_PARTICIPANTS.map(async (participant, participantIndex) => {
		const registration = await getRegistration(tournament.id, participant.id);
		if (!registration) return;

		for (let questionIndex = 0; questionIndex < limit; questionIndex += 1) {
			const questionId = tournament.questionIds?.[questionIndex];
			const question = questionMap.get(questionId);
			if (!question) continue;

			const existing = await TournamentAnswer.findOne({
				where: { tournamentId: tournament.id, userId: participant.id, questionIndex }
			});
			if (existing) continue;

			const profile = getDemoAnswerProfile(participantIndex, questionIndex);
			if (profile.unanswered) continue;
			const selectedOptionKey = profile.isCorrect
				? question.correctOption
				: ["A", "B", "C", "D"].find((key) => key !== question.correctOption);
			const timeTaken = ANSWER_SECONDS - profile.timeLeft;
			const speedBonus = profile.isCorrect ? Math.round((profile.timeLeft / ANSWER_SECONDS) * 50) : 0;
			const pointsEarned = profile.isCorrect ? 100 + speedBonus : 0;

			await TournamentAnswer.create({
				tournamentId: tournament.id,
				userId: participant.id,
				questionId,
				questionIndex,
				selectedOptionKey,
				isCorrect: profile.isCorrect,
				timeLeft: profile.timeLeft,
				timeTaken,
				pointsEarned,
				speedBonus,
				answeredAt: new Date(new Date(tournament.startAt).getTime() + questionIndex * (ANSWER_SECONDS + REVEAL_SECONDS) * 1000 + timeTaken * 1000)
			});

			await registration.increment({
				score: pointsEarned,
				correctAnswers: profile.isCorrect ? 1 : 0,
				wrongAnswers: profile.isCorrect ? 0 : 1,
				totalAnswered: 1,
				totalTimeTaken: timeTaken,
				speedBonusTotal: speedBonus
			});
		}
	}));
}

async function getLeaderboard(tournamentId, currentUserId = null, answeredQuestionLimit = QUESTION_COUNT) {
	const registrations = await TournamentRegistration.findAll({ where: { tournamentId } });
	const rows = registrations
		.map((registration) => {
			const liveUnanswered = Math.max(registration.unanswered || 0, Math.max(0, answeredQuestionLimit - registration.totalAnswered));
			return {
				userId: registration.userId,
				displayName: registration.displayName,
				selectedExam: registration.selectedExam,
				preferredLanguage: registration.preferredLanguage,
				registeredAt: registration.registeredAt,
				score: registration.score,
				correctAnswers: registration.correctAnswers,
				wrongAnswers: registration.wrongAnswers,
				unanswered: liveUnanswered,
				totalAnswered: registration.totalAnswered,
				totalTimeTaken: registration.totalTimeTaken,
				speedBonusTotal: registration.speedBonusTotal || 0,
				reward: rewardForRank(0),
				isCurrentUser: registration.userId === currentUserId
			};
		})
		.sort((a, b) => {
			if (b.score !== a.score) return b.score - a.score;
			if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
			if (a.totalTimeTaken !== b.totalTimeTaken) return a.totalTimeTaken - b.totalTimeTaken;
			if (a.unanswered !== b.unanswered) return a.unanswered - b.unanswered;
			return new Date(a.registeredAt) - new Date(b.registeredAt);
		})
		.map((row, index) => ({ ...row, rank: index + 1, reward: rewardForRank(index + 1) }));

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
	const answeredQuestionLimit = getAnsweredQuestionLimit(phase);
	const leaderboard = await getLeaderboard(tournament.id, userId, answeredQuestionLimit);
	const serializedRegistration = registration ? serializeRegistration(registration, answeredQuestionLimit) : null;
	const tournamentPayload = publicTournament(tournament, phase, await getRegistrationCount(tournament.id), registration);
	tournamentPayload.registration = serializedRegistration;

	if (phase.status === "results_published") {
		await publishResults(tournament.id);
	}

	return {
		tournament: tournamentPayload,
		registration: serializedRegistration,
		phase,
		participants: await getParticipants(tournament.id, userId),
		question: publicQuestion(currentQuestion, phase.phase === "reveal"),
		answer: userAnswer ? {
			selectedOptionKey: userAnswer.selectedOptionKey,
			isCorrect: phase.phase === "reveal" ? userAnswer.isCorrect : null,
			pointsEarned: phase.phase === "reveal" ? userAnswer.pointsEarned : null,
			speedBonus: phase.phase === "reveal" ? userAnswer.speedBonus : null,
			basePoints: phase.phase === "reveal" && userAnswer.isCorrect ? 100 : 0,
			locked: true
		} : null,
		leaderboard,
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

async function markUserReady(tournamentId, userId) {
	const tournament = await getTournamentOrThrow(tournamentId);
	const { phase } = await refreshTournamentStatus(tournament);
	const registration = await getRegistration(tournament.id, userId);
	if (!registration) {
		const error = new Error("You must register before entering the ready room");
		error.statusCode = 403;
		throw error;
	}
	if (!["ready_room", "live", "reveal", "checkpoint"].includes(phase.status)) {
		const error = new Error("Ready room is not open yet");
		error.statusCode = 409;
		throw error;
	}
	await registration.update({ readyStatus: true });
	return registration;
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
	const speedBonus = isCorrect ? Math.round((timeLeft / ANSWER_SECONDS) * 50) : 0;
	const pointsEarned = isCorrect ? 100 + speedBonus : 0;

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
		speedBonus,
		answeredAt: now
	});

	await registration.increment({
		score: pointsEarned,
		correctAnswers: isCorrect ? 1 : 0,
		wrongAnswers: isCorrect ? 0 : 1,
		totalAnswered: 1,
		totalTimeTaken: timeTaken,
		speedBonusTotal: speedBonus
	});

	return {
		selectedOptionKey: answer.selectedOptionKey,
		speedBonus,
		pointsEarned,
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
	const leaderboard = await getLeaderboard(tournamentId, null, QUESTION_COUNT);

	await Promise.all(registrations.map(async (registration) => {
		const rankRow = leaderboard.find((row) => row.userId === registration.userId);
		const unanswered = Math.max(0, QUESTION_COUNT - registration.totalAnswered);
		const reward = rewardForRank(rankRow?.rank || leaderboard.length || 1);
		await registration.update({ unanswered, status: "completed" });

		const existing = await TournamentResult.findOne({ where: { tournamentId, userId: registration.userId } });
		const resultPayload = {
			tournamentId,
			userId: registration.userId,
			finalScore: registration.score,
			finalRank: rankRow?.rank || leaderboard.length || 1,
			correctAnswers: registration.correctAnswers,
			wrongAnswers: registration.wrongAnswers,
			unanswered,
			totalTimeTaken: registration.totalTimeTaken,
			speedBonusTotal: registration.speedBonusTotal || 0,
			rewardXp: reward.rewardXp,
			rewardCoins: reward.rewardCoins,
			badgeEarned: reward.badgeEarned,
			rewardsApplied: true
		};
		if (existing) {
			return existing.update(resultPayload);
		}
		return TournamentResult.create(resultPayload);
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
	const leaderboard = await getLeaderboard(tournamentId, userId, QUESTION_COUNT);
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
				timeTaken: answer.timeTaken,
				speedBonus: answer.speedBonus || 0,
				basePoints: answer.isCorrect ? 100 : 0
			};
		})
	};
}

async function getCurrent(userId = null) {
	const tournament = await ensureCurrentTournament();
	const registration = await getRegistration(tournament.id, userId);
	const count = await getRegistrationCount(tournament.id);
	const phase = (await refreshTournamentStatus(tournament)).phase;
	return {
		tournament: publicTournament(tournament, phase, count, registration)
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
	ensureCurrentTournament,
	findRecentTournamentForResults,
	getCurrent,
	getLeaderboard,
	getParticipants,
	getRegistration,
	getRegistrationCount,
	getResults,
	getTournamentOrThrow,
	markUserReady,
	publicTournament,
	refreshTournamentStatus,
	registerUser,
	submitAnswer
};
