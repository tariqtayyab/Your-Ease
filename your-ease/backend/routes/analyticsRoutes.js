import express from "express";
import { 
  trackEvent, 
  getDashboardData, 
  getRealTimeData,
  getDataExport,
  getPrivacySettings,
  getProductAnalytics  // ✅ Added missing import
} from "../controllers/analyticsController.js";
import { 
  cleanupOldAnalyticsData, 
  exportUserData, 
  anonymizeUserData 
} from "../controllers/dataRetentionController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public tracking endpoint (with consent check)
router.post("/track", trackEvent);

// Data export and privacy routes
router.get("/export", protect, exportUserData);
router.post("/anonymize", protect, anonymizeUserData);
router.get("/privacy-settings", protect, getPrivacySettings);

// Product analytics route
router.get("/products/:productId", protect, admin, getProductAnalytics);

// Admin analytics routes
router.get("/dashboard", protect, admin, getDashboardData);
router.get("/realtime", protect, admin, getRealTimeData);
router.post("/cleanup", protect, admin, cleanupOldAnalyticsData);

export default router;