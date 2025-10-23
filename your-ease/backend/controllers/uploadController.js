// backend/controllers/uploadController.js
import path from "path";
import asyncHandler from "express-async-handler";

// Uploads handled by multer in route file; this controller simply returns file info
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  // file served via /uploads/<filename>
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ url: fileUrl });
});
