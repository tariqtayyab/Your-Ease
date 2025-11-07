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

// OPTIMIZED Cloudinary Storage for reviews with WebP conversion
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype?.startsWith('video/') || 
                   file.originalname?.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm|wmv|flv|3gp|m4v)$/);
    
    if (isVideo) {
      return {
        folder: "yourease_reviews",
        resource_type: "video",
        allowed_formats: ["mp4", "mov", "avi", "mkv", "webm"],
        transformation: [
          { quality: "auto", fetch_format: "auto" }
        ]
      };
    } else {
      // 🔥 ACTUAL WEBP CONVERSION FOR REVIEW IMAGES
      return {
        folder: "yourease_reviews",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "bmp"],
        transformation: [
          { 
            width: 1200, 
            height: 1200, 
            crop: "limit",
            quality: "auto:good", 
            fetch_format: "webp" 
          }
        ],
        format: 'webp' // Force actual WebP storage
      };
    }
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