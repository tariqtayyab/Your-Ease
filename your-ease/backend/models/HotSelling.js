// backend/models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    title: { type: String, default: "" }, // short title/summary
    description: { type: String, default: "" },
    images: [{ type: String }], // store upload path like /uploads/...
    price: { type: Number, required: true, default: 0 },
    oldPrice: { type: Number, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    countInStock: { type: Number, default: 0 },
    isHotSelling: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);

