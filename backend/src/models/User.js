import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

const SALT_ROUNDS = 12;

const normalizeText = (value) => value?.trim().toLowerCase();

class User extends Model {
	async validatePassword(password) {
		return bcrypt.compare(password, this.password);
	}

	async validateSecurityAnswer(answer) {
		if (!this.securityAnswerHash) {
			return false;
		}

		return bcrypt.compare(normalizeText(answer), this.securityAnswerHash);
	}

	createResetToken(ttlMinutes = 15) {
		const plainToken = randomBytes(32).toString("hex");

		this.resetPasswordTokenHash = createHash("sha256").update(plainToken).digest("hex");
		this.resetPasswordTokenExpiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

		return plainToken;
	}

	clearResetToken() {
		this.resetPasswordTokenHash = null;
		this.resetPasswordTokenExpiresAt = null;
	}

	toJSON() {
		const values = { ...this.get() };

		delete values.password;
		delete values.securityAnswerHash;
		delete values.resetPasswordTokenHash;

		return values;
	}
}

User.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true
		},
		fullName: {
			type: DataTypes.STRING(120),
			allowNull: false,
			validate: {
				notEmpty: {
					msg: "Full name is required"
				},
				len: {
					args: [2, 120],
					msg: "Full name must be between 2 and 120 characters"
				}
			}
		},
		email: {
			type: DataTypes.STRING(191),
			allowNull: false,
			unique: true,
			validate: {
				isEmail: {
					msg: "Enter a valid email address"
				}
			},
			set(value) {
				this.setDataValue("email", value?.trim().toLowerCase());
			}
		},
		password: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		role: {
			type: DataTypes.ENUM("student", "admin"),
			allowNull: false,
			defaultValue: "student"
		},
		securityQuestion: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		securityAnswer: {
			type: DataTypes.VIRTUAL,
			set(value) {
				this.setDataValue("securityAnswer", value);
			}
		},
		securityAnswerHash: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		resetPasswordTokenHash: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		resetPasswordTokenExpiresAt: {
			type: DataTypes.DATE,
			allowNull: true
		},
		lastLoginAt: {
			type: DataTypes.DATE,
			allowNull: true
		},
		isActive: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true
		}
	},
	{
		sequelize,
		modelName: "User",
		tableName: "users",
		timestamps: true,
		underscored: true,
		hooks: {
			beforeSave: async (user) => {
				if (user.changed("password")) {
					user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
				}

				const securityAnswer = user.getDataValue("securityAnswer");
				if (typeof securityAnswer === "string" && securityAnswer.trim()) {
					user.securityAnswerHash = await bcrypt.hash(normalizeText(securityAnswer), SALT_ROUNDS);
					user.setDataValue("securityAnswer", undefined);
				}
			}
		}
	}
);

export default User;
