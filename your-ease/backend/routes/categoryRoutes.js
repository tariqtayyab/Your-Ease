import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  addProductToCategory,
  updateProduct,
  deleteProduct
} from "../controllers/categoryController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../config/multer.js"; // Import the updated multer config

const router = express.Router();

// Public get categories w/ products
router.get("/", getCategories);

// Admin create/update/delete category with file upload
router.post("/", protect, admin, upload.single("media"), createCategory); // Single file for category
router.put("/:id", protect, admin, upload.single("media"), updateCategory); // Single file for category
router.delete("/:id", protect, admin, deleteCategory);

// Admin product endpoints with multiple file upload
router.post("/:id/products", protect, admin, upload.array("media", 10), addProductToCategory); // Multiple files for products
router.put("/:catId/products/:prodId", protect, admin, updateProduct);
router.delete("/:catId/products/:prodId", protect, admin, deleteProduct);

export default router;