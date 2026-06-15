// Authentication Controller - Handles user login, registration, and password reset
// This module manages all authentication-related operations including user signup, signin, and password recovery
import { createHash, randomBytes } from "node:crypto";
import { Op } from "sequelize";
import { z } from "zod";
import { ApiError } from "../middleware/errorMiddleware.js";
import { User } from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";

// Password reset token expiration time in minutes - configurable via environment variable
const passwordResetTtlMinutes = Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES || 15);

// Cookie configuration for secure authentication token storage
// httpOnly prevents JavaScript access to the cookie, protecting against XSS attacks
// sameSite prevents CSRF attacks by restricting cookie transmission
// secure ensures cookies are only sent over HTTPS in production environment
const authCookieOptions = {
	httpOnly: true,
	sameSite: "lax",
	secure: process.env.NODE_ENV === "production",
	maxAge: 7 * 24 * 60 * 60 * 1000
};

// Zod schema for login validation
// Ensures email is valid format and password meets minimum length requirement
const loginSchema = z.object({
	email: z.string().trim().email("Enter a valid email address"),
	password: z.string().min(6, "Password must be at least 6 characters")
});

// Zod schema for user registration validation
// Validates all required fields and ensures passwords match
const registerSchema = z.object({
	fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
	email: z.string().trim().email("Enter a valid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
	securityQuestion: z.string().min(2, "Choose a security question"),
	securityAnswer: z.string().trim().min(1, "Security answer is required")
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords do not match",
	path: ["confirmPassword"]
});

// Zod schema for forgot password request
// Only requires email to identify the user account
const forgotPasswordSchema = z.object({
	email: z.string().trim().email("Enter a valid email address")
});

// Zod schema for security answer verification
// Used when user answers security question during password reset flow
const verifySecurityAnswerSchema = z.object({
	email: z.string().trim().email("Enter a valid email address"),
	securityAnswer: z.string().trim().min(1, "Security answer is required")
});

// Zod schema for password reset with token validation
// Ensures new password and confirmation password match
const resetPasswordSchema = z.object({
	resetToken: z.string().min(32),
	password: z.string().min(6, "Password must be at least 6 characters"),
	confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters")
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords do not match",
	path: ["confirmPassword"]
});

// Utility function to sanitize user data before sending to client
// Removes sensitive fields like password hashes from user object
const sanitizeUser = (user) => user.toJSON();

// Sets authentication cookie in HTTP response
// Uses secure cookie options to protect authentication token
const setAuthCookie = (res, token) => {
	res.cookie("authToken", token, authCookieOptions);
};

// Builds JWT authentication token for authenticated user
// Includes user ID, email, and role in token payload for authorization checks
const buildAuthToken = (user) => {
	return generateToken({
		sub: user.id,
		email: user.email,
		role: user.role
	});
};

// Register controller - Creates new user account with validation
// Handles user signup with email, password, and security question
// Generates JWT token and sets authentication cookie on successful registration
const register = asyncHandler(async (req, res) => {
	// Validate request body against registerSchema using Zod
	const { fullName, email, password, securityQuestion, securityAnswer } = registerSchema.parse(req.body);
	const normalizedEmail = email.toLowerCase();

	// Check if user with same email already exists
	const existingUser = await User.findOne({ where: { email: normalizedEmail } });
	if (existingUser) {
		throw new ApiError(409, "An account with this email already exists");
	}

	// Create new user with hashed password (hashing handled by User model hooks)
	const user = await User.create({
		fullName,
		email: normalizedEmail,
		password,
		role: "student",
		securityQuestion,
		securityAnswer
	});

	// Generate authentication token after successful user creation
	const token = buildAuthToken(user);
	setAuthCookie(res, token);

	// Return success response with token and sanitized user data
	return res.status(201).json({
		success: true,
		message: "Account created successfully",
		token,
		user: sanitizeUser(user)
	});
});

const login = asyncHandler(async (req, res) => {
	// Validate login credentials against loginSchema
	const { email, password } = loginSchema.parse(req.body);
	// Query database for active user with matching email
	const user = await User.findOne({ where: { email: email.toLowerCase(), isActive: true } });

	// Return error if user account not found
	if (!user) {
		throw new ApiError(401, "Invalid email or password");
	}

	// Validate password against stored hash using bcrypt
	const isPasswordValid = await user.validatePassword(password);
	if (!isPasswordValid) {
		throw new ApiError(401, "Invalid email or password");
	}

	// Update last login timestamp for user activity tracking
	user.lastLoginAt = new Date();
	await user.save({ hooks: false });

	// Generate new JWT token for authenticated session
	const token = buildAuthToken(user);
	setAuthCookie(res, token);

	// Return success with token and sanitized user information
	return res.status(200).json({
		success: true,
		message: "Login successful",
		token,
		user: sanitizeUser(user)
	});
});

const requestPasswordReset = asyncHandler(async (req, res) => {
	// Validate email format using forgotPasswordSchema
	const { email } = forgotPasswordSchema.parse(req.body);
	// Find active user by email address
	const user = await User.findOne({ where: { email: email.toLowerCase(), isActive: true } });

	// Return 404 if user account not found (prevents email enumeration)
	if (!user) {
		throw new ApiError(404, "No account found for that email address");
	}

	// Return security question for user verification step
	return res.status(200).json({
		success: true,
		message: "Security question loaded",
		email: user.email,
		securityQuestion: user.securityQuestion
	});
});

const verifySecurityAnswer = asyncHandler(async (req, res) => {
	// Validate security answer using verifySecurityAnswerSchema
	const { email, securityAnswer } = verifySecurityAnswerSchema.parse(req.body);
	// Find user by email to verify security answer against
	const user = await User.findOne({ where: { email: email.toLowerCase(), isActive: true } });

	// Return 404 if user not found
	if (!user) {
		throw new ApiError(404, "No account found for that email address");
	}

	// Validate security answer with stored hash (case-insensitive)
	const isAnswerValid = await user.validateSecurityAnswer(securityAnswer);
	if (!isAnswerValid) {
		throw new ApiError(401, "Security answer did not match");
	}

	// Generate secure random reset token (64 character hex string)
	const resetToken = randomBytes(32).toString("hex");
	// Hash reset token before storing in database for security
	user.resetPasswordTokenHash = createHash("sha256").update(resetToken).digest("hex");
	// Set token expiration time based on environment configuration
	user.resetPasswordTokenExpiresAt = new Date(Date.now() + passwordResetTtlMinutes * 60 * 1000);
	// Save token hash to database without triggering validation hooks
	await user.save({ hooks: false });

	// Return reset token to client (only valid for specified TTL)
	return res.status(200).json({
		success: true,
		message: "Security answer verified",
		resetToken,
		expiresInMinutes: passwordResetTtlMinutes
	});
});

const resetPassword = asyncHandler(async (req, res) => {
	// Validate reset token and new password using resetPasswordSchema
	const { resetToken, password } = resetPasswordSchema.parse(req.body);
	// Hash the provided reset token to compare with stored hash
	const resetTokenHash = createHash("sha256").update(resetToken).digest("hex");

	// Find user with valid, non-expired reset token
	const user = await User.findOne({
		where: {
			resetPasswordTokenHash: resetTokenHash,
			resetPasswordTokenExpiresAt: {
				[Op.gt]: new Date()  // Token must not be expired
			},
			isActive: true
		}
	});

	// Return error if token invalid or expired
	if (!user) {
		throw new ApiError(400, "Reset token is invalid or has expired");
	}

	// Update user password (gets hashed by User model hooks)
	user.password = password;
	// Clear reset token from user account after successful reset
	user.clearResetToken();
	// Save updated user with password validation hooks enabled
	await user.save();

	// Return success message to client
	return res.status(200).json({
		success: true,
		message: "Password reset successful"
	});
});

export { login, register, requestPasswordReset, resetPassword, verifySecurityAnswer };