import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  isTrending: { type: Boolean, default: false },
  position: { 
    type: Number, 
    default: 0 
  },
  image: { type: String }, // Cloudinary URL for category image/video
  mediaType: { type: String, enum: ["image", "video"], default: "image" }, // Track if it's image or video
}, { timestamps: true });

export default mongoose.model("Category", categorySchema);
