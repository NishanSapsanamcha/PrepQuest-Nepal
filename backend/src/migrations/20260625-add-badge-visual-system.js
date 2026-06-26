// Migration: badge visual system.
//
// Adds the gem-style visual columns to the badge catalog and ensures the
// badges / user_badges tables exist. Idempotent (safe to run more than once)
// and non-destructive: it never drops or rewrites user_badges, so earned_at
// timestamps and user progress are preserved.
//
// The project boots with sequelize.sync() + ensureRuntimeSchema(), so this is
// also usable as a one-off script:
//   node src/migrations/20260625-add-badge-visual-system.js
import "dotenv/config";
import { DataTypes } from "sequelize";
import { fileURLToPath } from "url";
import { sequelize } from "../config/database.js";

const RARITIES = ["Common", "Rare", "Epic", "Legendary", "Mythic"];

const tableExists = async (queryInterface, tableName) => {
	const tables = await queryInterface.showAllTables();
	return tables
		.map((t) => (typeof t === "string" ? t : t.tableName).toLowerCase())
		.includes(tableName.toLowerCase());
};

const addColumnIfMissing = async (queryInterface, tableName, columnName, definition) => {
	const table = await queryInterface.describeTable(tableName);
	if (!table[columnName]) {
		await queryInterface.addColumn(tableName, columnName, definition);
	}
};

const removeColumnIfPresent = async (queryInterface, tableName, columnName) => {
	const table = await queryInterface.describeTable(tableName);
	if (table[columnName]) {
		await queryInterface.removeColumn(tableName, columnName);
	}
};

export async function up(queryInterface) {
	// 1. Create the catalog table if it does not exist yet.
	if (!(await tableExists(queryInterface, "badges"))) {
		await queryInterface.createTable("badges", {
			id: { type: DataTypes.STRING(80), primaryKey: true },
			name: { type: DataTypes.STRING(120), allowNull: false },
			description: { type: DataTypes.STRING(255), allowNull: false, defaultValue: "" },
			category: { type: DataTypes.STRING(60), allowNull: false },
			rarity: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "Common" },
			shape: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "pentagon" },
			icon_kind: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "star" },
			target: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
			reward: { type: DataTypes.STRING(120), allowNull: true },
			is_secret: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
			created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
			updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
		});
	} else {
		// Existing badges table: add the new visual columns (and backfill via
		// the seeder afterwards). rarity stays VARCHAR; the check below allows
		// the new Mythic tier.
		await addColumnIfMissing(queryInterface, "badges", "shape", {
			type: DataTypes.STRING(20),
			allowNull: false,
			defaultValue: "pentagon"
		});
		await addColumnIfMissing(queryInterface, "badges", "icon_kind", {
			type: DataTypes.STRING(20),
			allowNull: false,
			defaultValue: "star"
		});
		await addColumnIfMissing(queryInterface, "badges", "is_secret", {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		});
		await addColumnIfMissing(queryInterface, "badges", "rarity", {
			type: DataTypes.STRING(20),
			allowNull: false,
			defaultValue: "Common"
		});
	}

	// 2. Extend the rarity check constraint to include Mythic (Postgres).
	const allowed = RARITIES.map((r) => `'${r}'`).join(", ");
	await queryInterface.sequelize
		.query('ALTER TABLE "badges" DROP CONSTRAINT IF EXISTS "badges_rarity_check"')
		.catch(() => {});
	await queryInterface.sequelize
		.query(`ALTER TABLE "badges" ADD CONSTRAINT "badges_rarity_check" CHECK (rarity IN (${allowed}))`)
		.catch(() => {});

	// 3. Create the per-user progress table if it does not exist.
	if (!(await tableExists(queryInterface, "user_badges"))) {
		await queryInterface.createTable("user_badges", {
			id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
			user_id: { type: DataTypes.UUID, allowNull: false },
			badge_id: { type: DataTypes.STRING(80), allowNull: false },
			progress: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
			earned_at: { type: DataTypes.DATE, allowNull: true },
			created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
			updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
		});
		await queryInterface.addIndex("user_badges", ["user_id", "badge_id"], {
			unique: true,
			name: "user_badges_user_id_badge_id"
		});
	}
}

export async function down(queryInterface) {
	// Reverse only the additive visual columns; leave tables/earned data intact.
	await queryInterface.sequelize
		.query('ALTER TABLE "badges" DROP CONSTRAINT IF EXISTS "badges_rarity_check"')
		.catch(() => {});
	if (await tableExists(queryInterface, "badges")) {
		await removeColumnIfPresent(queryInterface, "badges", "shape");
		await removeColumnIfPresent(queryInterface, "badges", "icon_kind");
		await removeColumnIfPresent(queryInterface, "badges", "is_secret");
	}
}

// Allow running directly as a one-off script.
const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
	try {
		await up(sequelize.getQueryInterface());
		console.log("[MIGRATION] Badge visual system applied.");
		await sequelize.close();
	} catch (error) {
		console.error("[MIGRATION] Failed:", error.message);
		process.exit(1);
	}
}
