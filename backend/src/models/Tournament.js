import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

class Tournament extends Model {}

Tournament.init(
	{
		id: {
			type: DataTypes.STRING(80),
			primaryKey: true
		},
		title: {
			type: DataTypes.STRING(160),
			allowNull: false
		},
		examTrack: {
			type: DataTypes.STRING(80),
			allowNull: false,
			defaultValue: "mixed"
		},
		type: {
			type: DataTypes.ENUM("official", "demo", "mixed"),
			allowNull: false
		},
		status: {
			type: DataTypes.ENUM("registration_open", "starting_soon", "live", "checkpoint", "finished", "results_published"),
			allowNull: false,
			defaultValue: "registration_open"
		},
		registrationStartAt: {
			type: DataTypes.DATE,
			allowNull: false
		},
		startAt: {
			type: DataTypes.DATE,
			allowNull: false
		},
		endAt: {
			type: DataTypes.DATE,
			allowNull: false
		},
		currentQuestionIndex: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		currentQuestionStartedAt: {
			type: DataTypes.DATE,
			allowNull: true
		},
		questionIds: {
			type: DataTypes.JSONB,
			allowNull: false,
			defaultValue: []
		}
	},
	{
		sequelize,
		modelName: "Tournament",
		tableName: "tournaments",
		timestamps: true,
		underscored: true
	}
);

export default Tournament;
