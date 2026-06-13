import { Router } from "express";
import {
	register,
	login,
	requestPasswordReset,
	resetPassword,
	verifySecurityAnswer
} from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", requestPasswordReset);
router.post("/forgot-password/verify", verifySecurityAnswer);
router.post("/reset-password", resetPassword);

export default router;
