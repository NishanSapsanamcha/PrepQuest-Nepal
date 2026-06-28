import { examTracks } from "../data/examTracks";
import { mockLeaderboardUsers } from "../data/gamificationMockData";
import { getUser, saveUser } from "./storageUtils";
import { getValidatedQuestions, normalizeExamId, normalizeLanguageMode } from "./practiceUtils";
import { addXPTransaction, calculateAccuracy, calculateTotalXPFromTransactions, XP_REWARDS } from "./xpUtils";
import { awardActivityCoins, COIN_REWARDS, getActiveUserId } from "../services/coinService";

const ATTEMPTS_KEY = "prepquest_tournament_attempts";
const ACTIVE_KEY = "prepquest_tournament_active";
const RESULT_KEY = "prepquest_tournament_latest_result";

export const QUESTION_COUNT = 20;
export const TIME_PER_QUESTION_SECONDS = 15;
export const BASE_POINTS_PER_QUESTION = 100;
export const LEADERBOARD_CHECKPOINTS = [5, 10, 15, 20];
export const LEADERBOARD_DISPLAY_LIMIT = 6;
const COIN_PARTICIPATION = 50;

function readJson(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export function getLocalWeekKey(date = new Date()) {
  return `${date.getFullYear()}-W${String(getISOWeek(date)).padStart(2, "0")}`;
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

function getTournamentContext() {
  const user = getUser();
  const selectedExam = normalizeExamId(localStorage.getItem("selectedExam") || user.selectedExam);
  const preferredLanguage = normalizeLanguageMode(localStorage.getItem("preferredLanguage") || user.preferredLanguage);
  return { user, selectedExam, preferredLanguage };
}

export function getTournamentAttempts() {
  return readJson(ATTEMPTS_KEY, []);
}

export function saveTournamentAttempts(attempts) {
  writeJson(ATTEMPTS_KEY, attempts);
}

export function getThisWeekTournamentAttempt(weekKey = getLocalWeekKey()) {
  return getTournamentAttempts().find((attempt) => attempt.weekKey === weekKey) || null;
}

export function hasCompletedTournamentThisWeek(weekKey = getLocalWeekKey()) {
  return Boolean(getThisWeekTournamentAttempt(weekKey));
}

export function getActiveTournamentSession() {
  return readJson(ACTIVE_KEY, null);
}

export function saveActiveTournamentSession(session) {
  writeJson(ACTIVE_KEY, session);
}

export function clearActiveTournamentSession() {
  localStorage.removeItem(ACTIVE_KEY);
}

export function getLatestTournamentResult() {
  return readJson(RESULT_KEY, null);
}

export function saveLatestTournamentResult(result) {
  writeJson(RESULT_KEY, result);
}

// Mirror the REAL backend tournament result (from /tournaments/results/latest)
// into the local badge store so the badge engine can award tournament badges
// (Friday Fighter / Champion / Top 10 ...). The backend remains the source of
// truth — this is a derived cache fed FROM the backend, upserted per tournament
// id and never invented. Returns true if the local mirror changed.
export function mirrorTournamentResult(data) {
  const result = data?.currentUserResult;
  if (!result || !Number.isFinite(Number(result.finalRank))) return false;

  const backendId = String(data?.tournament?.id || "latest");
  const existing = getTournamentAttempts();
  const prior = existing.find((a) => a.backendId === backendId);

  // Idempotent: skip if we already mirrored this exact result.
  if (prior && prior.rank === result.finalRank && prior.totalScore === result.finalScore) {
    return false;
  }

  const attempt = {
    id: `backend-${backendId}`,
    backendId,
    weekKey: getLocalWeekKey(),
    selectedExam: data?.tournament?.selectedExam || "",
    rank: result.finalRank,
    totalScore: result.finalScore || 0,
    correctAnswers: result.correctAnswers || 0,
    totalParticipants: data?.leaderboard?.length || 0,
    rankLabel: result.finalRank <= 3 ? ["", "1st Place", "2nd Place", "3rd Place"][result.finalRank] : null,
    xpEarned: result.rewardXp || 0,
    coinsEarned: result.rewardCoins || 0,
    completedAt: new Date().toISOString(),
    source: "backend",
  };

  const next = [attempt, ...existing.filter((a) => a.backendId !== backendId)];
  saveTournamentAttempts(next);
  return true;
}

function examMatches(question, selectedExamLabel) {
  return !question.examTracks?.length || question.examTracks.includes(selectedExamLabel);
}

export function selectTournamentQuestions(selectedExam, weekKey) {
  const examId = normalizeExamId(selectedExam);
  const selectedExamLabel = examTracks[examId]?.name || "Sakha Adhikrit";
  const validQuestions = getValidatedQuestions().filter((question) => examMatches(question, selectedExamLabel));
  return deterministicShuffle(validQuestions, `tournament-${weekKey}`).slice(0, QUESTION_COUNT);
}

export function buildTournamentSession() {
  const { selectedExam, preferredLanguage } = getTournamentContext();
  const weekKey = getLocalWeekKey();
  const questions = selectTournamentQuestions(selectedExam, weekKey);

  if (questions.length < QUESTION_COUNT) {
    return { ok: false, reason: "not_enough_questions", questions };
  }

  const session = {
    id: `tournament-${weekKey}`,
    weekKey,
    selectedExam,
    preferredLanguage,
    startedAt: new Date().toISOString(),
    currentIndex: 0,
    questions,
    answers: [],
  };

  saveActiveTournamentSession(session);
  return { ok: true, session };
}

// TimeRemaining is normalized to a 0-1 fraction of the per-question timer so an
// instant correct answer scores the full BASE_POINTS_PER_QUESTION and a correct
// answer in the closing second still floors at half that value.
export function computeQuestionScore({ isCorrect, timeRemainingSeconds }) {
  if (!isCorrect) return 0;
  const speedFraction = Math.max(0, Math.min(1, timeRemainingSeconds / TIME_PER_QUESTION_SECONDS));
  return Math.round(BASE_POINTS_PER_QUESTION * 0.5 + speedFraction * BASE_POINTS_PER_QUESTION * 0.5);
}

// mockLeaderboardUsers' tournamentPoints is a season-long/lifetime stat (can run
// into the thousands) - not comparable to a single 20-question, 2000-point-max
// battle. Re-derive a believable score for THIS battle from each competitor's
// accuracy, scaled to how many questions have been completed so far, so the
// live/checkpoint leaderboard never shows an unbeatable, out-of-range number.
function estimateBattleScore(competitor, questionsCompleted) {
  const accuracyFactor = Math.min(1, Math.max(0, (competitor.tournamentAccuracy ?? competitor.accuracy ?? 70) / 100));
  const perQuestionAverage = accuracyFactor * BASE_POINTS_PER_QUESTION * 0.75;
  return Math.round(perQuestionAverage * questionsCompleted);
}

export function getMergedLeaderboard(liveScore, questionsCompleted = QUESTION_COUNT) {
  const others = mockLeaderboardUsers
    .filter((user) => !user.isCurrentUser)
    .map((user) => ({ ...user, tournamentPoints: estimateBattleScore(user, questionsCompleted) }));
  const examId = normalizeExamId(localStorage.getItem("selectedExam"));
  const you = {
    id: "you",
    name: "You",
    initials: "YOU",
    examTrack: examTracks[examId]?.name || "Sakha Adhikrit",
    tournamentPoints: liveScore,
    isCurrentUser: true,
  };
  return [...others, you]
    .sort((a, b) => b.tournamentPoints - a.tournamentPoints)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

// Keeps the in-battle/result leaderboard widget compact regardless of how many
// mock competitors exist - shows the top N, and always includes "you" even if
// your real rank falls outside that top N.
export function getDisplayLeaderboard(fullLeaderboard, limit = LEADERBOARD_DISPLAY_LIMIT) {
  const top = fullLeaderboard.slice(0, limit);
  if (top.some((row) => row.isCurrentUser)) return top;
  const you = fullLeaderboard.find((row) => row.isCurrentUser);
  return you ? [...top.slice(0, limit - 1), you] : top;
}

function getRankReward(rank) {
  if (rank === 1) return { coins: 500, xp: XP_REWARDS.TOURNAMENT_RANK_1, label: "1st Place" };
  if (rank === 2) return { coins: 300, xp: XP_REWARDS.TOURNAMENT_RANK_2, label: "2nd Place" };
  if (rank === 3) return { coins: 150, xp: XP_REWARDS.TOURNAMENT_RANK_3, label: "3rd Place" };
  return null;
}

export function completeTournament(session) {
  const weekKey = session.weekKey;
  const existingAttempt = getThisWeekTournamentAttempt(weekKey);
  if (existingAttempt) {
    saveLatestTournamentResult(existingAttempt);
    clearActiveTournamentSession();
    return existingAttempt;
  }

  const completedAt = new Date().toISOString();
  const answers = session.answers.map((answer) => {
    const question = session.questions.find((item) => item.id === answer.questionId);
    const isCorrect = answer.selectedOptionKey === question?.correctOption;
    return {
      questionId: answer.questionId,
      subject: question?.subject || "",
      subjectId: question?.subjectId || "",
      topic: question?.topic || "",
      difficulty: question?.difficulty || "",
      question_en: question?.question_en || "",
      question_np: question?.question_np || "",
      options: question?.options || [],
      selectedOptionKey: answer.selectedOptionKey,
      correctOption: question?.correctOption || "",
      isCorrect,
      score: answer.score || 0,
      timeRemainingSeconds: answer.timeRemainingSeconds ?? null,
      explanation_en: question?.explanation_en || "",
      explanation_np: question?.explanation_np || "",
    };
  });

  const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
  const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
  const accuracy = calculateAccuracy(correctAnswers, session.questions.length);
  const leaderboard = getMergedLeaderboard(totalScore);
  const rank = leaderboard.findIndex((row) => row.id === "you") + 1;
  const rankReward = getRankReward(rank);
  const xpEarned = XP_REWARDS.TOURNAMENT_PARTICIPATION + (rankReward?.xp || 0);
  const coinsEarned = COIN_PARTICIPATION + (rankReward?.coins || 0);

  const attempt = {
    id: session.id,
    weekKey,
    selectedExam: session.selectedExam,
    preferredLanguage: session.preferredLanguage,
    totalScore,
    maxScore: session.questions.length * BASE_POINTS_PER_QUESTION,
    correctAnswers,
    wrongAnswers: session.questions.length - correctAnswers,
    accuracy,
    rank,
    totalParticipants: leaderboard.length,
    rankLabel: rankReward?.label || null,
    xpEarned,
    coinsEarned,
    completedAt,
    answers,
    leaderboard,
  };

  addXPTransaction({
    id: `tournament_participation_${weekKey}`,
    type: "tournament_participation",
    amount: XP_REWARDS.TOURNAMENT_PARTICIPATION,
    date: weekKey,
    source: "Friday Tournament",
    reason: "Completed the Friday Tournament",
    createdAt: completedAt,
  });

  if (rankReward) {
    addXPTransaction({
      id: `tournament_rank_bonus_${weekKey}`,
      type: "tournament_rank_bonus",
      amount: rankReward.xp,
      date: weekKey,
      source: "Friday Tournament",
      reason: `Finished ${rankReward.label}`,
      createdAt: completedAt,
    });
  }

  const user = getUser();
  saveUser({
    ...user,
    totalXp: calculateTotalXPFromTransactions(),
  });

  // Real coin rewards through the central engine. Applied once per tournament
  // (idempotency keyed by week + reward type), never duplicated on refresh.
  const userId = getActiveUserId();
  awardActivityCoins([
    {
      amount: COIN_REWARDS.TOURNAMENT_PARTICIPATION,
      source: "friday_tournament",
      sourceId: weekKey,
      reason: "Friday Tournament Participation",
      label: "Tournament Participation",
      idempotencyKey: `${userId}:${weekKey}:participation`,
      createdAt: completedAt,
    },
    {
      condition: Boolean(rankReward),
      amount: rankReward?.coins || 0,
      source: "friday_tournament",
      sourceId: weekKey,
      reason: rankReward ? `Finished ${rankReward.label}` : "Tournament rank reward",
      label: rankReward ? `${rankReward.label} Reward` : "Rank Reward",
      idempotencyKey: `${userId}:${weekKey}:finalRankReward`,
      createdAt: completedAt,
    },
  ]);

  saveTournamentAttempts([attempt, ...getTournamentAttempts()]);
  saveLatestTournamentResult(attempt);
  clearActiveTournamentSession();
  return attempt;
}
