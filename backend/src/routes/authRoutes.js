import { Router } from "express";
import {
	completeSetup,
	register,
	login,
	requestPasswordReset,
	resetPassword,
	verifySecurityAnswer
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", requestPasswordReset);
router.post("/forgot-password/verify", verifySecurityAnswer);
router.post("/reset-password", resetPassword);
router.patch("/setup", protect, completeSetup);

export default router;
