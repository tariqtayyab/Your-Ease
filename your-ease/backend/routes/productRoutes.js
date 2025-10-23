// backend/routes/productRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Import your existing Cloudinary configuration
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Cloudinary configuration for products
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "yourease_products",
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
router.get("/", getProducts);
router.get("/:id", getProduct);

// Admin routes - USE CLOUDINARY
router.post("/", protect, admin, upload.array("images"), createProduct);
router.put("/:id", protect, admin, upload.array("images"), updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

export default router;