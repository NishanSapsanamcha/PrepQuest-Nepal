import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export const BADGE_RARITIES = ["Common", "Rare", "Epic", "Legendary", "Mythic"];
export const BADGE_SHAPES = ["pentagon", "hexagon", "circle", "shield", "crown", "starburst"];
export const BADGE_ICON_KINDS = [
	"star",
	"book",
	"flame",
	"calendar",
	"clipboard",
	"trophy",
	"target",
	"crown",
	"lightning"
];

// Catalog of badge definitions. Per-user progress / earned state lives in
// user_badges so this table can be reseeded without touching earned data.
class Badge extends Model {}

Badge.init(
	{
		id: {
			type: DataTypes.STRING(80),
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING(120),
			allowNull: false
		},
		description: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: ""
		},
		category: {
			type: DataTypes.STRING(60),
			allowNull: false
		},
		// Rarity ramp; Mythic is the new top tier above Legendary.
		rarity: {
			type: DataTypes.STRING(20),
			allowNull: false,
			defaultValue: "Common",
			validate: { isIn: [BADGE_RARITIES] }
		},
		// Outer geometry of the gem-style badge.
		shape: {
			type: DataTypes.STRING(20),
			allowNull: false,
			defaultValue: "pentagon",
			validate: { isIn: [BADGE_SHAPES] }
		},
		// Center glyph id.
		iconKind: {
			type: DataTypes.STRING(20),
			allowNull: false,
			defaultValue: "star",
			validate: { isIn: [BADGE_ICON_KINDS] }
		},
		target: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1
		},
		reward: {
			type: DataTypes.STRING(120),
			allowNull: true
		},
		// Hidden achievement: shows as "???" until earned.
		isSecret: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		}
	},
	{
		sequelize,
		modelName: "Badge",
		tableName: "badges",
		timestamps: true,
		underscored: true
	}
);

export default Badge;
