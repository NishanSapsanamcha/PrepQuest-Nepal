import { ApiError } from "./errorMiddleware.js";
import { User } from "../models/index.js";
import { verifyToken } from "../utils/generateToken.js";

const getBearerToken = (header = "") => {
	if (!header.startsWith("Bearer ")) return null;
	return header.slice("Bearer ".length).trim();
};

const protect = async (req, res, next) => {
	try {
		const token = req.cookies?.authToken || getBearerToken(req.headers.authorization || "");
		if (!token) {
			throw new ApiError(401, "Login required");
		}

		const decoded = verifyToken(token);
		const user = await User.findByPk(decoded.sub);
		if (!user || !user.isActive) {
			throw new ApiError(401, "Login required");
		}

		req.user = user;
		next();
	} catch (error) {
		next(error.statusCode ? error : new ApiError(401, "Login required"));
	}
};

export { protect };
