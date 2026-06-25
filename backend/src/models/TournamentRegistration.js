import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

class TournamentRegistration extends Model {}

TournamentRegistration.init(
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
		displayName: {
			type: DataTypes.STRING(160),
			allowNull: false
		},
		selectedExam: {
			type: DataTypes.STRING(80),
			allowNull: false
		},
		preferredLanguage: {
			type: DataTypes.STRING(40),
			allowNull: false
		},
		registeredAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW
		},
		status: {
			type: DataTypes.ENUM("registered", "completed"),
			allowNull: false,
			defaultValue: "registered"
		},
		readyStatus: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		score: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
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
		totalAnswered: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		totalTimeTaken: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 0
		}
	},
	{
		sequelize,
		modelName: "TournamentRegistration",
		tableName: "tournament_registrations",
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

export default TournamentRegistration;
