import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPayment
} from "../controllers/paymentController.js";

const router = express.Router();

router.route("/")
  .get(protect, getPaymentMethods)
  .post(protect, addPaymentMethod);

router.route("/:id")
  .put(protect, updatePaymentMethod)
  .delete(protect, deletePaymentMethod);

router.route("/:id/default")
  .patch(protect, setDefaultPayment);

export default router;