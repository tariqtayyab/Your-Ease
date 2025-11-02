// models/productModel.js - UPDATED
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
  specifications: { 
    type: Map,
    of: String,
    default: {}
  },
  oldPrice: { type: Number, default: 0 },
  currentPrice: { type: Number, default: 0 },
  countInStock: { type: Number, default: 0 },
  isHotSelling: { type: Boolean, default: false },
  position: { 
    type: Number, 
    default: 0
  },
  images: [{ 
    url: { type: String },
    type: { type: String, enum: ["image", "video"], default: "image" }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
  // ADD THESE NEW FIELDS FOR RATINGS
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  ratingDistribution: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 }
  },
  
  // ADD OPTIONS FIELD
  options: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    values: [{
      type: String,
      required: true,
      trim: true
    }],
    required: {
      type: Boolean,
      default: false
    }
  }]
}, { timestamps: true });

export default mongoose.model("Product", productSchema);