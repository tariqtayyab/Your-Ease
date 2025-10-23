import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
  getUserDashboard
} from "../controllers/userController.js";

const router = express.Router();

router.route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route("/preferences")
  .put(protect, updateUserPreferences);

router.route("/dashboard")
  .get(protect, getUserDashboard);

export default router;