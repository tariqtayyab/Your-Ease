// In your productModel.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  title: { type: String, required: true },
  shortDescription: { 
    type: String, 
    maxlength: 150,
    default: "" 
  },
  description: { type: String, default: "" },
  oldPrice: { type: Number, default: 0 },
  currentPrice: { type: Number, default: 0 },
  countInStock: { type: Number, default: 0 },
  isHotSelling: { type: Boolean, default: false }, // Add this line
  images: [{ 
    url: { type: String }, // Cloudinary URL
    type: { type: String, enum: ["image", "video"], default: "image" } // Media type
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("Product", productSchema);