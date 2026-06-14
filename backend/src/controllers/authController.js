import { createHash, randomBytes } from "node:crypto";
import { Op } from "sequelize";
import { z } from "zod";
import { ApiError } from "../middleware/errorMiddleware.js";
import { User } from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";

const passwordResetTtlMinutes = Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES || 15);

const authCookieOptions = {
	httpOnly: true,
	sameSite: "lax",
	secure: process.env.NODE_ENV === "production",
	maxAge: 7 * 24 * 60 * 60 * 1000
};

const loginSchema = z.object({
	email: z.string().trim().email("Enter a valid email address"),
	password: z.string().min(6, "Password must be at least 6 characters")
});

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

const forgotPasswordSchema = z.object({
	email: z.string().trim().email("Enter a valid email address")
});

const verifySecurityAnswerSchema = z.object({
	email: z.string().trim().email("Enter a valid email address"),
	securityAnswer: z.string().trim().min(1, "Security answer is required")
});

const resetPasswordSchema = z.object({
	resetToken: z.string().min(32),
	password: z.string().min(6, "Password must be at least 6 characters"),
	confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters")
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords do not match",
	path: ["confirmPassword"]
});

const sanitizeUser = (user) => user.toJSON();

const setAuthCookie = (res, token) => {
	res.cookie("authToken", token, authCookieOptions);
};

const buildAuthToken = (user) => {
	return generateToken({
		sub: user.id,
		email: user.email,
		role: user.role
	});
};

const register = asyncHandler(async (req, res) => {
	const { fullName, email, password, securityQuestion, securityAnswer } = registerSchema.parse(req.body);
	const normalizedEmail = email.toLowerCase();

	const existingUser = await User.findOne({ where: { email: normalizedEmail } });
	if (existingUser) {
		throw new ApiError(409, "An account with this email already exists");
	}

	const user = await User.create({
		fullName,
		email: normalizedEmail,
		password,
		role: "student",
		securityQuestion,
		securityAnswer
	});

	const token = buildAuthToken(user);
	setAuthCookie(res, token);

	return res.status(201).json({
		success: true,
		message: "Account created successfully",
		token,
		user: sanitizeUser(user)
	});
});

const login = asyncHandler(async (req, res) => {
	const { email, password } = loginSchema.parse(req.body);
	const user = await User.findOne({ where: { email: email.toLowerCase(), isActive: true } });

	if (!user) {
		throw new ApiError(401, "Invalid email or password");
	}

	const isPasswordValid = await user.validatePassword(password);
	if (!isPasswordValid) {
		throw new ApiError(401, "Invalid email or password");
	}

	user.lastLoginAt = new Date();
	await user.save({ hooks: false });

	const token = buildAuthToken(user);
	setAuthCookie(res, token);

	return res.status(200).json({
		success: true,
		message: "Login successful",
		token,
		user: sanitizeUser(user)
	});
});

const requestPasswordReset = asyncHandler(async (req, res) => {
	const { email } = forgotPasswordSchema.parse(req.body);
	const user = await User.findOne({ where: { email: email.toLowerCase(), isActive: true } });

	if (!user) {
		throw new ApiError(404, "No account found for that email address");
	}

	return res.status(200).json({
		success: true,
		message: "Security question loaded",
		email: user.email,
		securityQuestion: user.securityQuestion
	});
});

const verifySecurityAnswer = asyncHandler(async (req, res) => {
	const { email, securityAnswer } = verifySecurityAnswerSchema.parse(req.body);
	const user = await User.findOne({ where: { email: email.toLowerCase(), isActive: true } });

	if (!user) {
		throw new ApiError(404, "No account found for that email address");
	}

	const isAnswerValid = await user.validateSecurityAnswer(securityAnswer);
	if (!isAnswerValid) {
		throw new ApiError(401, "Security answer did not match");
	}

	const resetToken = randomBytes(32).toString("hex");
	user.resetPasswordTokenHash = createHash("sha256").update(resetToken).digest("hex");
	user.resetPasswordTokenExpiresAt = new Date(Date.now() + passwordResetTtlMinutes * 60 * 1000);
	await user.save({ hooks: false });

	return res.status(200).json({
		success: true,
		message: "Security answer verified",
		resetToken,
		expiresInMinutes: passwordResetTtlMinutes
	});
});

const resetPassword = asyncHandler(async (req, res) => {
	const { resetToken, password } = resetPasswordSchema.parse(req.body);
	const resetTokenHash = createHash("sha256").update(resetToken).digest("hex");

	const user = await User.findOne({
		where: {
			resetPasswordTokenHash: resetTokenHash,
			resetPasswordTokenExpiresAt: {
				[Op.gt]: new Date()
			},
			isActive: true
		}
	});

	if (!user) {
		throw new ApiError(400, "Reset token is invalid or has expired");
	}

	user.password = password;
	user.clearResetToken();
	await user.save();

	return res.status(200).json({
		success: true,
		message: "Password reset successful"
	});
});

export { login, register, requestPasswordReset, resetPassword, verifySecurityAnswer };
