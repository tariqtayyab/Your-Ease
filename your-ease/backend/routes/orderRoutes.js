import express from "express";
import { protect, admin, optionalAuth, requireUserOrGuest } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getUserOrders,
  getOrderDetails,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getFilteredOrders,
  getGuestOrder
} from "../controllers/orderController.js";

const router = express.Router();

// Guest orders use optionalAuth, regular orders use protect
router.post("/", optionalAuth, createOrder);
router.get("/myorders", optionalAuth, getUserOrders); // Now supports guest with email query
router.get("/guest", getGuestOrder); // Public route for guest order lookup
router.get("/:id", optionalAuth, getOrderDetails); // Supports guest access with email
router.put("/:id/cancel", optionalAuth, cancelOrder); // Supports guest cancellation
router.get("/", protect, admin, getAllOrders);
router.put("/:id/status", protect, admin, updateOrderStatus);
router.get('/admin/filtered', protect, admin, getFilteredOrders);

export default router;