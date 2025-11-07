import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// OPTIMIZED Cloudinary Storage with WebP conversion
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype?.startsWith('video/') || 
                   file.originalname?.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm|wmv|flv|3gp|m4v)$/);
    
    if (isVideo) {
      return {
        folder: "yourease_categories",
        resource_type: "video",
        allowed_formats: ["mp4", "mov", "avi", "mkv", "webm"],
        transformation: [
          { quality: "auto", fetch_format: "auto" }
        ]
      };
    } else {
      // 🔥 ACTUAL WEBP CONVERSION FOR CATEGORY IMAGES
      return {
        folder: "yourease_categories",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
        transformation: [
          { 
            width: 800, 
            height: 800, 
            crop: "limit",
            quality: "auto:best", 
            fetch_format: "webp" 
          }
        ]
      };
    }
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // Reduced from 100MB to 50MB for categories
  }
});

export default upload;