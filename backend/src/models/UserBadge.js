import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

// Per-user badge progress + earned state. `earnedAt` is preserved across
// reseeds/migrations so existing achievements are never lost.
class UserBadge extends Model {}

UserBadge.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true
		},
		userId: {
			type: DataTypes.UUID,
			allowNull: false
		},
		badgeId: {
			type: DataTypes.STRING(80),
			allowNull: false
		},
		progress: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		earnedAt: {
			type: DataTypes.DATE,
			allowNull: true
		}
	},
	{
		sequelize,
		modelName: "UserBadge",
		tableName: "user_badges",
		timestamps: true,
		underscored: true,
		indexes: [
			{
				unique: true,
				fields: ["user_id", "badge_id"]
			}
		]
	}
);

export default UserBadge;
