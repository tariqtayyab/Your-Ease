import express from "express";
import multer from "multer";
import path from "path";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductPositions,
  migrateActiveSaleField // ADD THIS IMPORT
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

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
    fileSize: 100 * 1024 * 1024,
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
router.route("/migrate/active-sale")
  .post(protect, admin, migrateActiveSaleField);

export default router;