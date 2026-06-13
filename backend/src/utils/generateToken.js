import jwt from "jsonwebtoken";

const getJwtSecret = () => process.env.JWT_SECRET || "prepquest-nepal-dev-secret";

const generateToken = (payload, options = {}) => {
	return jwt.sign(payload, getJwtSecret(), {
		expiresIn: process.env.JWT_EXPIRES_IN || "7d",
		...options
	});
};

const verifyToken = (token, options = {}) => {
	return jwt.verify(token, getJwtSecret(), options);
};

export { generateToken, verifyToken };
