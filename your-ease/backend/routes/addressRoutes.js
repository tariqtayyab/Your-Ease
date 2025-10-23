import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from "../controllers/addressController.js";

const router = express.Router();

router.route("/")
  .get(protect, getAddresses)
  .post(protect, addAddress);

router.route("/:id")
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

router.route("/:id/default")
  .patch(protect, setDefaultAddress);

export default router;