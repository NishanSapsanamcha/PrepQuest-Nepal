// Badge catalog seed + backfill.
//
// Run standalone:  node src/seeders/badgeSeeder.js
//
// Uses bulkCreate with updateOnDuplicate so it is safe to re-run: it inserts
// new badges and backfills shape / icon_kind / rarity / is_secret on existing
// rows. It only touches the `badges` catalog table, never `user_badges`, so
// earned_at timestamps and user progress are always preserved.
import "dotenv/config";
import { fileURLToPath } from "url";
import { sequelize } from "../config/database.js";
import Badge from "../models/Badge.js";

// Default outer shape per category (Mythic badges override to "starburst").
const SHAPE_BY_CATEGORY = {
	Starter: "pentagon",
	Practice: "pentagon",
	"Mock Test": "pentagon",
	"Daily Quiz": "crown",
	Rank: "crown",
	Streak: "hexagon",
	Accuracy: "circle",
	"Subject Mastery": "shield",
	Review: "shield",
	Tournament: "starburst",
	Leaderboard: "starburst"
};

const shapeFor = (category, rarity) =>
	rarity === "Mythic" ? "starburst" : SHAPE_BY_CATEGORY[category] || "pentagon";

// Catalog definitions. iconKind/isSecret are explicit; shape is derived above.
const BADGE_DEFS = [
	{ id: "first_step", name: "First Step Badge", description: "Complete your first quiz.", category: "Starter", rarity: "Common", iconKind: "star", target: 1, reward: "+20 XP" },
	{ id: "constitution_starter", name: "Constitution Starter", description: "Complete your first Constitution practice.", category: "Practice", rarity: "Common", iconKind: "book", target: 1, reward: "+20 XP" },
	{ id: "daily_learner", name: "Daily Learner", description: "Complete 3 daily quizzes.", category: "Daily Quiz", rarity: "Common", iconKind: "calendar", target: 3, reward: "+50 XP" },
	{ id: "seven_day_warrior", name: "7-Day Warrior", description: "Maintain a 7-day study streak.", category: "Streak", rarity: "Rare", iconKind: "flame", target: 7, reward: "+150 coins" },
	{ id: "thirty_day_legend", name: "30-Day Legend", description: "Maintain a 30-day study streak.", category: "Streak", rarity: "Epic", iconKind: "flame", target: 30, reward: "+500 coins" },
	{ id: "mock_beginner", name: "Mock Beginner", description: "Complete your first mock test.", category: "Mock Test", rarity: "Common", iconKind: "clipboard", target: 1, reward: "+50 XP" },
	{ id: "mock_master", name: "Mock Master", description: "Complete 10 mock tests.", category: "Mock Test", rarity: "Rare", iconKind: "clipboard", target: 10, reward: "+300 XP" },
	{ id: "gk_champion", name: "GK Champion", description: "Score 90% or above in General Knowledge.", category: "Subject Mastery", rarity: "Rare", iconKind: "target", target: 90, reward: "+100 XP" },
	{ id: "constitution_expert", name: "Constitution Expert", description: "Reach 85% accuracy in Constitution of Nepal.", category: "Subject Mastery", rarity: "Rare", iconKind: "book", target: 85, reward: "+100 XP" },
	{ id: "accuracy_master", name: "Accuracy Master", description: "Maintain 85% overall accuracy.", category: "Accuracy", rarity: "Epic", iconKind: "target", target: 85, reward: "+200 XP" },
	{ id: "friday_fighter", name: "Friday Fighter", description: "Join your first Friday tournament.", category: "Tournament", rarity: "Common", iconKind: "trophy", target: 1, reward: "+50 coins" },
	{ id: "friday_champion", name: "Friday Champion", description: "Rank 1 in a Friday tournament.", category: "Tournament", rarity: "Legendary", iconKind: "trophy", target: 1, reward: "500 coins + 500 XP" },
	{ id: "top_10_contender", name: "Top 10 Contender", description: "Place in the top 10 of a Friday tournament.", category: "Tournament", rarity: "Rare", iconKind: "trophy", target: 1, reward: "Top Performer title" },
	{ id: "comeback_learner", name: "Comeback Learner", description: "Return after missing 3 study days.", category: "Streak", rarity: "Rare", iconKind: "lightning", target: 1, reward: "+50 XP" },
	{ id: "subject_specialist", name: "Subject Specialist", description: "Complete 100 questions in one subject.", category: "Subject Mastery", rarity: "Epic", iconKind: "book", target: 100, reward: "+200 XP" },
	{ id: "public_service_master", name: "Public Service Master", description: "Reach Public Service Master rank.", category: "Rank", rarity: "Legendary", iconKind: "crown", target: 12000, reward: "Special rank frame" },
	{ id: "perfect_daily", name: "Perfect Daily", description: "Score 10/10 in a daily quiz.", category: "Daily Quiz", rarity: "Rare", iconKind: "star", target: 10, reward: "+30 XP" },
	{ id: "review_hero", name: "Review Hero", description: "Master 25 wrong answers through review.", category: "Review", rarity: "Rare", iconKind: "clipboard", target: 25, reward: "+100 XP" },
	{ id: "no_mistake_run", name: "No Mistake Run", description: "Complete a practice set without any wrong answer.", category: "Accuracy", rarity: "Epic", iconKind: "target", target: 1, reward: "+150 XP" },
	{ id: "early_bird", name: "Early Bird", description: "Complete daily quiz before 8 AM.", category: "Daily Quiz", rarity: "Rare", iconKind: "star", target: 1, reward: "+30 coins" },
	{ id: "night_owl", name: "Night Owl", description: "Study after 10 PM for 5 days.", category: "Streak", rarity: "Rare", iconKind: "star", target: 5, reward: "+60 coins" },
	{ id: "loksewa_warrior", name: "Loksewa Warrior", description: "Reach 8,000 XP.", category: "Rank", rarity: "Epic", iconKind: "target", target: 8000, reward: "Warrior title" },
	{ id: "rare_climber", name: "Rare Climber", description: "Move up 20 leaderboard positions in one week.", category: "Leaderboard", rarity: "Legendary", iconKind: "lightning", target: 20, reward: "Rare Climber badge" },

	// --- Mythic tier: the rarest achievements ---
	{ id: "prepquest_legend", name: "PrepQuest Legend", description: "Reach 20,000 XP.", category: "Rank", rarity: "Mythic", iconKind: "crown", target: 20000, reward: "Legend profile theme" },
	{ id: "flawless_mind", name: "Flawless Mind", description: "Answer 500 questions with 100% accuracy.", category: "Accuracy", rarity: "Mythic", iconKind: "target", target: 500, reward: "Mythic profile aura" },
	{ id: "streak_centurion", name: "Centurion", description: "Maintain a 100-day study streak.", category: "Streak", rarity: "Mythic", iconKind: "flame", target: 100, reward: "Eternal Flame frame" },
	{ id: "omnischolar", name: "Omnischolar", description: "Complete every subject's mastery track.", category: "Subject Mastery", rarity: "Mythic", iconKind: "book", target: 8, reward: "Omnischolar title + theme" },
	{ id: "tournament_apex", name: "Tournament Apex", description: "Finish in the top 1% of a Friday tournament.", category: "Tournament", rarity: "Mythic", iconKind: "trophy", target: 1, reward: "Apex Champion crown", isSecret: true }
];

export const badgeSeedRows = BADGE_DEFS.map((def) => ({
	isSecret: false,
	...def,
	shape: shapeFor(def.category, def.rarity)
}));

export const seedBadges = async () => {
	await Badge.bulkCreate(badgeSeedRows, {
		updateOnDuplicate: ["name", "description", "category", "rarity", "shape", "icon_kind", "target", "reward", "is_secret"]
	});
	return badgeSeedRows.length;
};

// Allow running directly: `node src/seeders/badgeSeeder.js`
const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
	try {
		await sequelize.sync();
		const count = await seedBadges();
		console.log(`[SEED] Upserted ${count} badge definitions.`);
		await sequelize.close();
	} catch (error) {
		console.error("[SEED] Badge seeding failed:", error.message);
		process.exit(1);
	}
}

export default seedBadges;
