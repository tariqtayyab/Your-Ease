import express from "express";
import multer from "multer";
import {
  getProductReviews,
  createReview,
  updateReviewHelpful,
  deleteReview,
  getProductReviewStats,
  migrateProductRatings
} from "../controllers/reviewController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Import your existing Cloudinary configuration
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Cloudinary configuration for reviews
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "yourease_reviews",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "bmp", "svg", "mp4", "mov", "avi", "mkv", "webm", "wmv", "flv", "3gp", "m4v"],
    resource_type: "auto",
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// Public routes
router.get("/products/:productId/reviews", getProductReviews);
router.get('/:productId/reviews/stats', getProductReviewStats);
// Protected routes
router.post("/products/:productId/reviews", protect, upload.array("media", 5), createReview); // Max 5 files
router.put("/reviews/:id/helpful", protect, updateReviewHelpful);
router.delete("/reviews/:id", protect, deleteReview);
router.post('/migrate-ratings', protect, admin, migrateProductRatings);

export default router;