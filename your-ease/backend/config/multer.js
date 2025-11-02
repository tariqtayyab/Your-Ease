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

// Cloudinary storage for both images and videos
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "yourease_categories",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "mp4", "mov", "avi", "mkv"],
    resource_type: "auto", // This allows both images and videos
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  }
});

export default upload;