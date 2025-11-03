// routes/saleRoutes.js
import express from "express";
import {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
  getActiveSales
} from "../controllers/saleController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes
router.route("/")
  .post(protect, admin, createSale)
  .get(protect, admin, getSales);

router.route("/:id")
  .get(protect, admin, getSaleById)
  .put(protect, admin, updateSale)
  .delete(protect, admin, deleteSale);

// Public route for active sales
router.get("/active/current", getActiveSales);

export default router;