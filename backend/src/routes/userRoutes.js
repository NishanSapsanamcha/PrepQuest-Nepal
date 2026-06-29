import { Router } from "express";
import { getDailyReward, syncDailyReward } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/me/daily-reward", protect, getDailyReward);
router.put("/me/daily-reward", protect, syncDailyReward);

export default router;
