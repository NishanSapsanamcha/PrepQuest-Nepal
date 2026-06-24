export const mockCurrentUser = {
  id: "user_misan",
  name: "Misan Rijal",
  initials: "MR",
  examTrack: "Sakha Adhikrit",
  languageMode: "Nepali",
  totalXP: 120,
  coins: 410,
  streak: 4,
  freeMocksLeft: 2,
  level: 1,
  currentRank: "New Aspirant",
  nextRank: "Focused Learner",
  nextRankXP: 500,
  xpToNextRank: 380,
  overallAccuracy: 72,
  totalQuestionsAttempted: 86,
  totalCorrect: 62,
  badgesEarned: 12,
  subjectsPracticed: 6,
  strongestSubject: "General Knowledge",
  weakestSubject: "Constitution of Nepal",
  mostPracticedSubject: "General Ability / IQ",
  weeklyRank: 2,
  tournamentRank: 2,
  publicLeaderboard: true,
};

export const rankThresholds = [
  { rank: "New Aspirant", xp: 0 },
  { rank: "Focused Learner", xp: 500 },
  { rank: "Kharidar Candidate", xp: 1500 },
  { rank: "Nayab Subba Candidate", xp: 3000 },
  { rank: "Officer Candidate", xp: 5000 },
  { rank: "Loksewa Warrior", xp: 8000 },
  { rank: "Public Service Master", xp: 12000 },
  { rank: "PrepQuest Legend", xp: 20000 },
];

export const mockTournament = {
  id: "friday_loksewa_battle",
  title: "Friday Loksewa Battle",
  type: "Mixed Loksewa Battle",
  status: "Registration Open",
  schedule: "Every Friday",
  time: "Friday 7 PM",
  startsIn: { days: 3, hours: 4, minutes: 20 },
  participants: 128,
  userJoined: false,
  questions: 25,
  estimatedTime: "20 minutes",
  examTracks: ["Nayab Subba", "Sakha Adhikrit"],
  rules: [
    "Correct answer gives +100 points",
    "Faster correct answers can earn up to +50 speed bonus",
    "5 correct answers in a row gives +100 streak bonus",
    "Wrong answers give 0 points",
    "No coin betting is allowed",
    "No user loses coins for joining",
    "Everyone receives participation rewards",
  ],
  scoring: [
    { label: "Correct Answer", value: "+100 points" },
    { label: "Speed Bonus", value: "Up to +50 points" },
    { label: "5 Correct Streak", value: "+100 bonus" },
    { label: "Wrong Answer", value: "0 points" },
  ],
  rewards: [
    { rank: "1st Place", reward: "500 coins + 500 XP + Gold Champion Badge" },
    { rank: "2nd Place", reward: "300 coins + 300 XP + Silver Champion Badge" },
    { rank: "3rd Place", reward: "150 coins + 200 XP + Bronze Champion Badge" },
    { rank: "Top 10", reward: "Top Performer Badge" },
    { rank: "Everyone", reward: "50 coins + 100 XP" },
  ],
  format: [
    "20-30 mixed Loksewa questions",
    "Each question has a timer",
    "Final ranking is shown at the end",
    "Rewards are based on performance",
    "Participation-safe format",
  ],
};

const subjectStats = (baseXp, accuracy, solved) => ({
  "Constitution of Nepal": { xp: baseXp, accuracy, questionsSolved: solved },
  "General Knowledge": { xp: Math.round(baseXp * 0.9), accuracy: Math.max(60, accuracy - 2), questionsSolved: Math.round(solved * 0.92) },
  "Current Affairs": { xp: Math.round(baseXp * 0.78), accuracy: Math.max(60, accuracy - 4), questionsSolved: Math.round(solved * 0.8) },
  "IQ / Mental Ability": { xp: Math.round(baseXp * 0.74), accuracy: Math.max(60, accuracy - 5), questionsSolved: Math.round(solved * 0.76) },
  Nepali: { xp: Math.round(baseXp * 0.68), accuracy: Math.max(60, accuracy - 6), questionsSolved: Math.round(solved * 0.7) },
  English: { xp: Math.round(baseXp * 0.66), accuracy: Math.max(60, accuracy - 7), questionsSolved: Math.round(solved * 0.68) },
  "Governance Basics": { xp: Math.round(baseXp * 0.82), accuracy: Math.max(60, accuracy - 3), questionsSolved: Math.round(solved * 0.84) },
  "Public Administration Basics": { xp: Math.round(baseXp * 0.72), accuracy: Math.max(60, accuracy - 5), questionsSolved: Math.round(solved * 0.74) },
});

export const mockLeaderboardUsers = [
  { id: "u1", rank: 1, name: "Aayush", initials: "AA", examTrack: "Nayab Subba", weeklyXP: 2450, monthlyXP: 8500, lifetimeXP: 22100, examXP: 2450, tournamentPoints: 6350, tournamentAccuracy: 91, speedBonus: 310, reward: "500 coins + 500 XP", accuracy: 91, streak: 12, longestStreak: 18, badges: 18, tournamentWins: 3, rankTitle: "Nayab Subba Candidate", trend: "up", subjectStats: subjectStats(1360, 91, 170) },
  { id: "u2", rank: 2, name: "Suman Adhikari", initials: "SA", examTrack: "Nayab Subba", weeklyXP: 2180, monthlyXP: 7400, lifetimeXP: 19800, examXP: 2180, tournamentPoints: 5940, tournamentAccuracy: 88, speedBonus: 280, reward: "300 coins + 300 XP", accuracy: 88, streak: 9, longestStreak: 14, badges: 15, tournamentWins: 2, rankTitle: "Focused Learner", trend: "same", subjectStats: subjectStats(1220, 88, 152) },
  { id: "u3", rank: 3, name: "Prajal Danai", initials: "PD", examTrack: "Sakha Adhikrit", weeklyXP: 1970, monthlyXP: 6800, lifetimeXP: 17600, examXP: 1970, tournamentPoints: 6900, tournamentAccuracy: 84, speedBonus: 300, reward: "500 coins + 500 XP", accuracy: 84, streak: 4, longestStreak: 11, badges: 12, tournamentWins: 2, rankTitle: "New Aspirant", trend: "up", subjectStats: subjectStats(1200, 84, 140) },
  { id: "user_misan", rank: 4, name: "Misan Rijal", initials: "MR", examTrack: "Sakha Adhikrit", weeklyXP: 1800, monthlyXP: 6100, lifetimeXP: 15800, examXP: 1800, tournamentPoints: 6100, tournamentAccuracy: 82, speedBonus: 240, reward: "300 coins + 300 XP", accuracy: 82, streak: 6, longestStreak: 13, badges: 10, tournamentWins: 1, rankTitle: "New Aspirant", trend: "up", isCurrentUser: true, subjectStats: subjectStats(1120, 82, 132) },
  { id: "u4", rank: 5, name: "Nisha", initials: "NS", examTrack: "Sakha Adhikrit", weeklyXP: 1810, monthlyXP: 5950, lifetimeXP: 14900, examXP: 1810, tournamentPoints: 5950, tournamentAccuracy: 80, speedBonus: 210, reward: "150 coins + 200 XP", accuracy: 80, streak: 7, longestStreak: 10, badges: 10, tournamentWins: 0, rankTitle: "Focused Learner", trend: "down", subjectStats: subjectStats(1060, 80, 126) },
  { id: "u5", rank: 6, name: "Ramesh", initials: "RK", examTrack: "Nayab Subba", weeklyXP: 1650, monthlyXP: 5400, lifetimeXP: 14200, examXP: 1650, tournamentPoints: 5120, tournamentAccuracy: 79, speedBonus: 190, reward: "150 coins + 200 XP", accuracy: 79, streak: 6, longestStreak: 9, badges: 9, tournamentWins: 1, rankTitle: "Focused Learner", trend: "up", subjectStats: subjectStats(980, 79, 116) },
  { id: "u6", rank: 7, name: "Anita", initials: "AT", examTrack: "Sakha Adhikrit", weeklyXP: 1510, monthlyXP: 5000, lifetimeXP: 11800, examXP: 1510, tournamentPoints: 4200, tournamentAccuracy: 77, speedBonus: 165, reward: "50 coins + 100 XP", accuracy: 77, streak: 5, longestStreak: 8, badges: 8, tournamentWins: 0, rankTitle: "New Aspirant", trend: "same", subjectStats: subjectStats(880, 77, 100) },
  { id: "u7", rank: 8, name: "Bikash", initials: "BK", examTrack: "Nayab Subba", weeklyXP: 1390, monthlyXP: 4700, lifetimeXP: 10600, examXP: 1390, tournamentPoints: 3860, tournamentAccuracy: 75, speedBonus: 145, reward: "50 coins + 100 XP", accuracy: 75, streak: 3, longestStreak: 7, badges: 7, tournamentWins: 0, rankTitle: "New Aspirant", trend: "down", subjectStats: subjectStats(820, 75, 94) },
  { id: "u8", rank: 9, name: "Kritika", initials: "KT", examTrack: "Sakha Adhikrit", weeklyXP: 1280, monthlyXP: 4200, lifetimeXP: 9800, examXP: 1280, tournamentPoints: 3600, tournamentAccuracy: 73, speedBonus: 130, reward: "50 coins + 100 XP", accuracy: 73, streak: 8, longestStreak: 8, badges: 6, tournamentWins: 0, rankTitle: "New Aspirant", trend: "up", subjectStats: subjectStats(760, 73, 88) },
  { id: "u9", rank: 10, name: "Deepak Thapa", initials: "DT", examTrack: "Nayab Subba", weeklyXP: 1190, monthlyXP: 3980, lifetimeXP: 8900, examXP: 1190, tournamentPoints: 3200, tournamentAccuracy: 72, speedBonus: 120, reward: "50 coins + 100 XP", accuracy: 72, streak: 5, longestStreak: 6, badges: 6, tournamentWins: 0, rankTitle: "New Aspirant", trend: "same", subjectStats: subjectStats(700, 72, 82) },
  { id: "u10", rank: 11, name: "Sarita Karki", initials: "SK", examTrack: "Sakha Adhikrit", weeklyXP: 1110, monthlyXP: 3700, lifetimeXP: 7600, examXP: 1110, tournamentPoints: 2980, tournamentAccuracy: 70, speedBonus: 100, reward: "50 coins + 100 XP", accuracy: 70, streak: 4, longestStreak: 5, badges: 5, tournamentWins: 0, rankTitle: "New Aspirant", trend: "up", subjectStats: subjectStats(640, 70, 76) },
  { id: "u11", rank: 12, name: "Bishal Rai", initials: "BR", examTrack: "Nayab Subba", weeklyXP: 1030, monthlyXP: 3400, lifetimeXP: 6900, examXP: 1030, tournamentPoints: 2650, tournamentAccuracy: 69, speedBonus: 90, reward: "50 coins + 100 XP", accuracy: 69, streak: 2, longestStreak: 4, badges: 4, tournamentWins: 0, rankTitle: "New Aspirant", trend: "down", subjectStats: subjectStats(600, 69, 70) },
];

export const mockSubjectLeaderboards = {
  "Constitution of Nepal": [
    { rank: 1, name: "Suman Adhikari", score: 94, solved: 180 },
    { rank: 2, name: "Aayush", score: 91, solved: 165 },
    { rank: 3, name: "Prajal Danai", score: 82, solved: 98 },
  ],
  "General Knowledge": [
    { rank: 1, name: "Aayush", score: 96, solved: 210 },
    { rank: 2, name: "Nisha", score: 89, solved: 155 },
    { rank: 3, name: "Prajal Danai", score: 86, solved: 120 },
  ],
  "General Ability / IQ": [
    { rank: 1, name: "Prajal Danai", score: 88, solved: 140 },
    { rank: 2, name: "Ramesh", score: 84, solved: 112 },
    { rank: 3, name: "Anita", score: 81, solved: 100 },
  ],
};

export const mockBadges = [
  { id: "first_step", name: "First Step Badge", description: "Complete your first quiz.", category: "Starter", rarity: "Common", status: "earned", progress: 1, target: 1, icon: "starter", reward: "+20 XP", earnedAt: "2026-06-20" },
  { id: "constitution_starter", name: "Constitution Starter", description: "Complete your first Constitution practice.", category: "Practice", rarity: "Common", status: "earned", progress: 1, target: 1, icon: "book", reward: "+20 XP", earnedAt: "2026-06-20" },
  { id: "daily_learner", name: "Daily Learner", description: "Complete 3 daily quizzes.", category: "Daily Quiz", rarity: "Common", status: "earned", progress: 3, target: 3, icon: "calendar", reward: "+50 XP", earnedAt: "2026-06-21" },
  { id: "seven_day_warrior", name: "7-Day Warrior", description: "Maintain a 7-day study streak.", category: "Streak", rarity: "Rare", status: "locked", progress: 4, target: 7, icon: "fire", reward: "+150 coins", earnedAt: null },
  { id: "thirty_day_legend", name: "30-Day Legend", description: "Maintain a 30-day study streak.", category: "Streak", rarity: "Epic", status: "locked", progress: 4, target: 30, icon: "fire", reward: "+500 coins", earnedAt: null },
  { id: "mock_beginner", name: "Mock Beginner", description: "Complete your first mock test.", category: "Mock Test", rarity: "Common", status: "locked", progress: 0, target: 1, icon: "clipboard", reward: "+50 XP", earnedAt: null },
  { id: "mock_master", name: "Mock Master", description: "Complete 10 mock tests.", category: "Mock Test", rarity: "Rare", status: "locked", progress: 0, target: 10, icon: "clipboard", reward: "+300 XP", earnedAt: null },
  { id: "gk_champion", name: "GK Champion", description: "Score 90% or above in General Knowledge.", category: "Subject Mastery", rarity: "Rare", status: "locked", progress: 86, target: 90, icon: "target", reward: "+100 XP", earnedAt: null },
  { id: "constitution_expert", name: "Constitution Expert", description: "Reach 85% accuracy in Constitution of Nepal.", category: "Subject Mastery", rarity: "Rare", status: "locked", progress: 72, target: 85, icon: "book", reward: "+100 XP", earnedAt: null },
  { id: "accuracy_master", name: "Accuracy Master", description: "Maintain 85% overall accuracy.", category: "Accuracy", rarity: "Epic", status: "locked", progress: 72, target: 85, icon: "target", reward: "+200 XP", earnedAt: null },
  { id: "friday_fighter", name: "Friday Fighter", description: "Join your first Friday tournament.", category: "Tournament", rarity: "Common", status: "locked", progress: 0, target: 1, icon: "trophy", reward: "+50 coins", earnedAt: null },
  { id: "friday_champion", name: "Friday Champion", description: "Rank 1 in a Friday tournament.", category: "Tournament", rarity: "Legendary", status: "locked", progress: 0, target: 1, icon: "trophy", reward: "500 coins + 500 XP", earnedAt: null },
  { id: "top_10_contender", name: "Top 10 Contender", description: "Place in the top 10 of a Friday tournament.", category: "Tournament", rarity: "Rare", status: "locked", progress: 0, target: 1, icon: "medal", reward: "Top Performer title", earnedAt: null },
  { id: "comeback_learner", name: "Comeback Learner", description: "Return after missing 3 study days.", category: "Streak", rarity: "Rare", status: "locked", progress: 0, target: 1, icon: "refresh", reward: "+50 XP", earnedAt: null },
  { id: "subject_specialist", name: "Subject Specialist", description: "Complete 100 questions in one subject.", category: "Subject Mastery", rarity: "Epic", status: "locked", progress: 86, target: 100, icon: "book", reward: "+200 XP", earnedAt: null },
  { id: "public_service_master", name: "Public Service Master", description: "Reach Public Service Master rank.", category: "Rank", rarity: "Legendary", status: "locked", progress: 120, target: 12000, icon: "crown", reward: "Special rank frame", earnedAt: null },
  { id: "perfect_daily", name: "Perfect Daily", description: "Score 10/10 in a daily quiz.", category: "Daily Quiz", rarity: "Rare", status: "locked", progress: 8, target: 10, icon: "check", reward: "+30 XP", earnedAt: null },
  { id: "review_hero", name: "Review Hero", description: "Master 25 wrong answers through review.", category: "Review", rarity: "Rare", status: "locked", progress: 9, target: 25, icon: "review", reward: "+100 XP", earnedAt: null },
  { id: "no_mistake_run", name: "No Mistake Run", description: "Complete a practice set without any wrong answer.", category: "Accuracy", rarity: "Epic", status: "locked", progress: 0, target: 1, icon: "target", reward: "+150 XP", earnedAt: null },
  { id: "early_bird", name: "Early Bird", description: "Complete daily quiz before 8 AM.", category: "Daily Quiz", rarity: "Rare", status: "locked", progress: 0, target: 1, icon: "sun", reward: "+30 coins", earnedAt: null },
  { id: "night_owl", name: "Night Owl", description: "Study after 10 PM for 5 days.", category: "Streak", rarity: "Rare", status: "locked", progress: 2, target: 5, icon: "moon", reward: "+60 coins", earnedAt: null },
  { id: "loksewa_warrior", name: "Loksewa Warrior", description: "Reach 8,000 XP.", category: "Rank", rarity: "Epic", status: "locked", progress: 120, target: 8000, icon: "shield", reward: "Warrior title", earnedAt: null },
  { id: "prepquest_legend", name: "PrepQuest Legend", description: "Reach 20,000 XP.", category: "Rank", rarity: "Mythic", status: "locked", progress: 120, target: 20000, icon: "crown", reward: "Legend profile theme", earnedAt: null },
  { id: "rare_climber", name: "Rare Climber", description: "Move up 20 leaderboard positions in one week.", category: "Leaderboard", rarity: "Legendary", status: "locked", progress: 5, target: 20, icon: "trending", reward: "Rare Climber badge", earnedAt: null },
];

export const mockProfileActivity = [
  { id: 1, type: "daily_quiz", title: "Completed Daily Quiz", detail: "Scored 8/10 and earned +50 XP", date: "Today" },
  { id: 2, type: "practice", title: "Practiced General Ability / IQ", detail: "Answered 10 questions with 80% accuracy", date: "Today" },
  { id: 3, type: "badge", title: "Unlocked Daily Learner", detail: "Completed 3 daily quizzes", date: "Yesterday" },
  { id: 4, type: "review", title: "Reviewed Wrong Answers", detail: "Mastered 3 saved mistakes", date: "2 days ago" },
  { id: 5, type: "streak", title: "Streak Increased", detail: "Reached 4-day learning streak", date: "2 days ago" },
];

export const mockTournamentHistory = [
  { id: "t1", title: "Friday Loksewa Battle", date: "2026-06-19", rank: 12, participants: 96, points: 640, reward: "50 coins + 100 XP", status: "Completed" },
  { id: "t2", title: "Mixed Loksewa Battle", date: "2026-06-12", rank: 18, participants: 84, points: 520, reward: "50 coins + 100 XP", status: "Completed" },
];

