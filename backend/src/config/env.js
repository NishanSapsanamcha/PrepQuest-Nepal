import "dotenv/config";

const env = {
	nodeEnv: process.env.NODE_ENV || "development",
	port: Number(process.env.PORT || 5000),
	clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
	jwtSecret: process.env.JWT_SECRET || "prepquest-nepal-dev-secret",
	jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
	passwordResetTokenTtlMinutes: Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES || 15)
};

export default env;
