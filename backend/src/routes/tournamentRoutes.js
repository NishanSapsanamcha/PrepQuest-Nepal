import express from "express";
import {
	answer,
	current,
	leaderboard,
	liveState,
	myRegistration,
	ready,
	register,
	registrationCount,
	results,
	status
} from "../controllers/tournamentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/current", protect, current);
router.get("/:id/status", protect, status);
router.post("/:id/register", protect, register);
router.post("/:id/ready", protect, ready);
router.get("/:id/registration/me", protect, myRegistration);
router.get("/:id/registrations/count", protect, registrationCount);
router.get("/:id/live-state", protect, liveState);
router.post("/:id/answer", protect, answer);
router.get("/:id/leaderboard", protect, leaderboard);
router.get("/:id/results", protect, results);
router.get("/results/latest", protect, results);

export default router;
