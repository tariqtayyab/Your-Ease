// backend/routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// store files in backend/uploads (make sure folder exists)
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// expects field name "images" for multiple files
router.post("/", upload.array("images"), (req, res) => {
  if (!req.files) return res.status(400).json({ message: "No files uploaded" });
  // return array of urls
  const urls = req.files.map((f) => `/uploads/${f.filename}`);
  res.json({ urls });
});

export default router;
