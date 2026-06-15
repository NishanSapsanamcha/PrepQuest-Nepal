// User Model - Represents user accounts in the application
// Handles password hashing, security answer validation, and token management
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

// Bcrypt salt rounds for password hashing - higher value = more secure but slower
const SALT_ROUNDS = 12;

// Utility function to normalize text values for consistent comparison
// Converts to lowercase and trims whitespace
const normalizeText = (value) => value?.trim().toLowerCase();

// User Model Class extending Sequelize Model
// Provides custom methods for password and security validation
class User extends Model {
	// Validate provided password against stored bcrypt hash
	// Returns boolean - true if password matches, false otherwise
	async validatePassword(password) {
		return bcrypt.compare(password, this.password);
	}

	// Validate security answer against stored bcrypt hash
	// Compares normalized answer (lowercase, trimmed) against stored hash
	// Returns false if security answer hash doesn't exist
	async validateSecurityAnswer(answer) {
		if (!this.securityAnswerHash) {
			return false;
		}

		return bcrypt.compare(normalizeText(answer), this.securityAnswerHash);
	}

	// Generate password reset token for password recovery flow
	// Returns plain token to send to user, stores hashed version in database
	createResetToken(ttlMinutes = 15) {
		// Generate 32 bytes of random data and convert to hex string
		const plainToken = randomBytes(32).toString("hex");

		// Hash token using SHA256 before storing (never store plain tokens)
		this.resetPasswordTokenHash = createHash("sha256").update(plainToken).digest("hex");
		// Set expiration time based on TTL parameter (default 15 minutes)
		this.resetPasswordTokenExpiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

		// Return plain token to send to user (cannot be recovered from hash)
		return plainToken;
	}

	// Clear reset token data after password reset or when no longer needed
	// Sets both hash and expiration to null
	clearResetToken() {
		this.resetPasswordTokenHash = null;
		this.resetPasswordTokenExpiresAt = null;
	}

	// Override toJSON to exclude sensitive fields before sending to client
	// Removes password, security answer hash, and reset token from response
	toJSON() {
		const values = { ...this.get() };

		// Remove sensitive authentication fields from JSON response
		delete values.password;
		delete values.securityAnswerHash;
		delete values.resetPasswordTokenHash;

		return values;
	}
}

// Initialize User model with Sequelize configuration
// Defines database schema and validation rules
User.init(
	{
		// Primary key: UUID v4 for distributed system compatibility
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true
		},
		// User full name - required field
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
		// User email - unique, immutable, validated format
		email: {
			type: DataTypes.STRING(191),
			allowNull: false,
			unique: true,
			validate: {
				isEmail: {
					msg: "Enter a valid email address"
				}
			},
			// Automatically normalize email to lowercase when set
			set(value) {
				this.setDataValue("email", value?.trim().toLowerCase());
			}
		},
		// Password field - stored as bcrypt hash (never plain text)
		password: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		// User role for authorization - student or admin
		role: {
			type: DataTypes.ENUM("student", "admin"),
			allowNull: false,
			defaultValue: "student"
		},
		// Security question for password recovery
		securityQuestion: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		// Virtual property - security answer not stored directly
		// Instead, bcrypt hash is stored in securityAnswerHash
		securityAnswer: {
			type: DataTypes.VIRTUAL,
			set(value) {
				this.setDataValue("securityAnswer", value);
			}
		},
		// Bcrypt hash of security answer - never store plain text
		securityAnswerHash: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		// SHA256 hash of password reset token
		resetPasswordTokenHash: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		// Expiration time for password reset token
		resetPasswordTokenExpiresAt: {
			type: DataTypes.DATE,
			allowNull: true
		},
		// Track last successful login for user activity monitoring
		lastLoginAt: {
			type: DataTypes.DATE,
			allowNull: true
		},
		// Soft delete flag - users can be deactivated without deleting records
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
		timestamps: true,  // Adds createdAt and updatedAt fields
		underscored: true,  // Use snake_case for database column names
		// Database hooks for automatic data processing
		hooks: {
			beforeValidate: async (user) => {
				const securityAnswer = user.getDataValue("securityAnswer");
				if (typeof securityAnswer === "string" && securityAnswer.trim()) {
					// Normalize and hash security answer using bcrypt
					user.securityAnswerHash = await bcrypt.hash(normalizeText(securityAnswer), SALT_ROUNDS);
					// Remove plain text security answer from memory
					user.setDataValue("securityAnswer", undefined);
				}
			},
			beforeSave: async (user) => {
				if (user.changed("password")) {
					user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
				}
			}
		}
	}
);

export default User;
