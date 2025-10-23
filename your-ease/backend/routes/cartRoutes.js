// backend/routes/cartRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getCart, addToCart, removeFromCart, clearCart } from "../controllers/cartController.js";

const router = express.Router();

router.use(protect);
router.get("/", getCart);
router.post("/", addToCart); // body: { productId, qty }
router.delete("/:productId", removeFromCart);
router.delete("/", clearCart);

export default router;
