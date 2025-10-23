// routes/bannerRoutes.js
import express from "express";
console.log("🔄 Importing multer...");
import upload from "../config/multer.js";
console.log("✅ Multer imported:", upload ? "YES" : "NO");
import Banner from "../models/Banner.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// routes/bannerRoutes.js
router.post("/",protect,admin, upload.single("image"), async (req, res) => {
  console.log("🧭 [POST] /api/banners route reached");
  console.log("📦 Request body:", req.body);
  console.log("📁 Request file:", req.file);
  console.log("🔑 Auth headers:", req.headers.authorization ? "Present" : "Missing");

  try {
    if (!req.file) {
      console.log("❌ No image file received in request");
      return res.status(400).json({ message: "No image file uploaded" });
    }

    console.log("✅ File received from multer:", {
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Test database connection
    console.log("🔄 Testing database connection...");
    const imageUrl = req.file.path;
    
    console.log("💾 Creating banner in database...");
    const banner = await Banner.create({ image: imageUrl });

    console.log("✅ Banner created successfully:", banner._id);
    res.status(201).json({ 
      message: "✅ Banner added successfully", 
      banner: {
        _id: banner._id,
        image: banner.image,
        createdAt: banner.createdAt
      }
    });
    
  } catch (error) {
    console.error("❌ UPLOAD ERROR DETAILS:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Check for specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation error: " + error.message });
    }
    if (error.name === 'MongoServerError') {
      return res.status(500).json({ message: "Database error: " + error.message });
    }
    
    res.status(500).json({ 
      message: "Server error during upload",
      error: error.message 
    });
  }
});

// ✅ Get all banners
router.get("/", async (req, res) => {
  console.log("🧭 [GET] /api/banners route reached");
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    console.error("❌ Get banners error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Delete banner
router.delete("/:id", protect, admin, async (req, res) => {
  console.log("🧭 [DELETE] /api/banners/:id route reached");
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    await banner.deleteOne();
    res.json({ message: "🗑️ Banner deleted successfully" });
  } catch (error) {
    console.error("❌ Delete banner error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

export default router;
