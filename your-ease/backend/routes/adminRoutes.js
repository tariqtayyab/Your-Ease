import express from "express";
import {
  // getBanners, addBanner, updateBanner, deleteBanner,
  getCategories, addCategory, updateCategory, deleteCategory,
  getProducts, addProduct, updateProduct, deleteProduct
} from "../controllers/adminController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use((req, res, next) => {
  console.log("🧭 Request handled by adminRoutes:", req.originalUrl);
  next();
});



/* Banners */
// router.get("/banners", getBanners);
// router.post("/banners", protect, admin, addBanner);
// router.put("/banners/:id", protect, admin, updateBanner);
// router.delete("/banners/:id", protect, admin, deleteBanner);

/* Categories */
router.get("/categories", getCategories);
router.post("/categories", protect, admin, addCategory);
router.put("/categories/:id", protect, admin, updateCategory);
router.delete("/categories/:id", protect, admin, deleteCategory);

/* Products */
router.get("/products", getProducts); // query: ?categoryId=xxx or ?hot=true
router.post("/products", protect, admin, addProduct);
router.put("/products/:id", protect, admin, updateProduct);
router.delete("/products/:id", protect, admin, deleteProduct);

export default router;
