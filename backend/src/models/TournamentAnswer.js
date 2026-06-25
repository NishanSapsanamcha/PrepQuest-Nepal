import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

class TournamentAnswer extends Model {}

TournamentAnswer.init(
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
		questionId: {
			type: DataTypes.STRING(120),
			allowNull: false
		},
		questionIndex: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		selectedOptionKey: {
			type: DataTypes.STRING(4),
			allowNull: false
		},
		isCorrect: {
			type: DataTypes.BOOLEAN,
			allowNull: false
		},
		timeLeft: {
			type: DataTypes.FLOAT,
			allowNull: false
		},
		timeTaken: {
			type: DataTypes.FLOAT,
			allowNull: false
		},
		pointsEarned: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		answeredAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW
		}
	},
	{
		sequelize,
		modelName: "TournamentAnswer",
		tableName: "tournament_answers",
		timestamps: true,
		underscored: true,
		indexes: [
			{
				unique: true,
				fields: ["tournament_id", "user_id", "question_index"]
			}
		]
	}
);

export default TournamentAnswer;
