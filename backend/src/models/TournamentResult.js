import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

class TournamentResult extends Model {}

TournamentResult.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true
		},
		tournamentId: {
			type: DataTypes.STRING(80),
			allowNull: false
		},
		userId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		finalScore: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		finalRank: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		correctAnswers: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		wrongAnswers: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		unanswered: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		totalTimeTaken: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 0
		},
		speedBonusTotal: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		rewardXp: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		rewardCoins: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		badgeEarned: {
			type: DataTypes.STRING(120),
			allowNull: true
		},
		rewardsApplied: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		}
	},
	{
		sequelize,
		modelName: "TournamentResult",
		tableName: "tournament_results",
		timestamps: true,
		underscored: true,
		indexes: [
			{
				unique: true,
				fields: ["tournament_id", "user_id"]
			}
		]
	}
);

export default TournamentResult;
