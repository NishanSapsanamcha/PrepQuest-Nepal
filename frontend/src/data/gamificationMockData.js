
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
  questions: 20,
  estimatedTime: "8 minutes",
  examTracks: ["Nayab Subba", "Sakha Adhikrit"],
  rules: [
    "Each question gives up to +100 points based on speed and accuracy",
    "Instant correct answers earn the full 100 points",
    "Correct answers in the final seconds still earn at least 50 points",
    "Wrong or unanswered questions give 0 points",
    "Live leaderboard appears after Questions 5, 10, 15, and 20",
    "No coin betting is allowed",
    "No user loses coins for joining",
    "Everyone receives participation rewards",
  ],
  scoring: [
    { label: "Instant Correct Answer", value: "100 points" },
    { label: "Correct Answer, Low Time Left", value: "~50 points" },
    { label: "Wrong or Unanswered", value: "0 points" },
    { label: "Per-Question Timer", value: "15 seconds" },
  ],
  rewards: [
    { rank: "1st Place", reward: "500 coins + 500 XP" },
    { rank: "2nd Place", reward: "300 coins + 300 XP" },
    { rank: "3rd Place", reward: "150 coins + 200 XP" },
    { rank: "Everyone", reward: "50 coins + 100 XP" },
  ],
  format: [
    "20 mixed Loksewa questions",
    "Each question has a 15-second timer",
    "Live leaderboard shown every 5 questions",
    "Final ranking and rewards are shown at the end",
    "Participation-safe format",
  ],
};

export const mockLeaderboardUsers = [
  { id: "u1", rank: 1, name: "Aayush", initials: "AA", examTrack: "Nayab Subba", weeklyXP: 2450, monthlyXP: 8400, tournamentPoints: 920, accuracy: 91, streak: 12, badges: 18, rankTitle: "Nayab Subba Candidate", trend: "up" },
  { id: "u2", rank: 2, name: "Suman Adhikari", initials: "SA", examTrack: "Nayab Subba", weeklyXP: 2180, monthlyXP: 7600, tournamentPoints: 880, accuracy: 88, streak: 9, badges: 15, rankTitle: "Focused Learner", trend: "same" },
  { id: "u3", rank: 3, name: "You", initials: "ME", examTrack: "Sakha Adhikrit", weeklyXP: 1970, monthlyXP: 6900, tournamentPoints: 820, accuracy: 84, streak: 4, badges: 12, rankTitle: "New Aspirant", trend: "up", isCurrentUser: true },
  { id: "u4", rank: 4, name: "Nisha", initials: "NS", examTrack: "Sakha Adhikrit", weeklyXP: 1810, monthlyXP: 6100, tournamentPoints: 760, accuracy: 82, streak: 7, badges: 10, rankTitle: "Focused Learner", trend: "down" },
  { id: "u5", rank: 5, name: "Ramesh", initials: "RK", examTrack: "Nayab Subba", weeklyXP: 1650, monthlyXP: 5400, tournamentPoints: 710, accuracy: 79, streak: 6, badges: 9, rankTitle: "Focused Learner", trend: "up" },
  { id: "u6", rank: 6, name: "Anita", initials: "AT", examTrack: "Sakha Adhikrit", weeklyXP: 1510, monthlyXP: 5000, tournamentPoints: 690, accuracy: 77, streak: 5, badges: 8, rankTitle: "New Aspirant", trend: "same" },
  { id: "u7", rank: 7, name: "Bikash", initials: "BK", examTrack: "Nayab Subba", weeklyXP: 1390, monthlyXP: 4700, tournamentPoints: 640, accuracy: 75, streak: 3, badges: 7, rankTitle: "New Aspirant", trend: "down" },
  { id: "u8", rank: 8, name: "Kritika", initials: "KT", examTrack: "Sakha Adhikrit", weeklyXP: 1280, monthlyXP: 4200, tournamentPoints: 610, accuracy: 73, streak: 8, badges: 6, rankTitle: "New Aspirant", trend: "up" },
];

export const mockSubjectLeaderboards = {
  "Constitution of Nepal": [
    { rank: 1, name: "Suman Adhikari", score: 94, solved: 180 },
    { rank: 2, name: "Aayush", score: 91, solved: 165 },
    { rank: 3, name: "You", score: 82, solved: 98, isCurrentUser: true },
  ],
  "General Knowledge": [
    { rank: 1, name: "Aayush", score: 96, solved: 210 },
    { rank: 2, name: "Nisha", score: 89, solved: 155 },
    { rank: 3, name: "You", score: 86, solved: 120, isCurrentUser: true },
  ],
  "General Ability / IQ": [
    { rank: 1, name: "You", score: 88, solved: 140, isCurrentUser: true },
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

