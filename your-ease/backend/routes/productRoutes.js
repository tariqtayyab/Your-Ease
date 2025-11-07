import express from "express";
import multer from "multer";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductPositions,
  migrateActiveSaleField,
  migrateImagesToWebP,
  cleanupDuplicateTransformations
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// OPTIMIZED Cloudinary Storage with WebP conversion
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype?.startsWith('video/') || 
                   file.originalname?.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm|wmv|flv|3gp|m4v)$/);
    
    if (isVideo) {
      return {
        folder: "yourease_products",
        resource_type: "video",
        allowed_formats: ["mp4", "mov", "avi", "mkv", "webm"],
        transformation: [
          { quality: "auto", fetch_format: "auto" }
        ]
      };
    } else {
      // ACTUAL WEBP CONVERSION ON UPLOAD - FIXED
      return {
        folder: "yourease_products",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
        transformation: [
          { 
            width: 1200, 
            height: 1200, 
            crop: "limit",
            quality: "auto:good", 
            fetch_format: "webp" 
          }
        ]
      };
    }
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // Reduced from 100MB to 50MB
  }
});

// Public routes
router.get("/", getProducts);
router.get("/:id", getProduct);

// Admin routes
router.post("/", protect, admin, upload.array("images"), createProduct);
router.put("/:id", protect, admin, upload.array("images"), updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.put("/", protect, admin, updateProductPositions); 

// Migration routes
router.route("/migrate/active-sale")
  .post(protect, admin, migrateActiveSaleField);
router.route("/migrate/images-webp") // ADD THIS NEW ROUTE
  .post(protect, admin, migrateImagesToWebP);
router.route("/migrate/cleanup-duplicates")
  .post(protect, admin, cleanupDuplicateTransformations);

export default router;