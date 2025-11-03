// models/Sale.js
import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  // "all" for all products, or array of specific product IDs
  productSelection: {
    type: String,
    enum: ["all", "selected"],
    default: "selected"
  },
  // Array of product IDs if productSelection is "selected"
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  }],
  // For tracking which products have sale prices applied
  appliedProducts: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    originalPrice: Number,
    salePrice: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
saleSchema.index({ startDate: 1, endDate: 1 });
saleSchema.index({ isActive: 1 });

export default mongoose.model("Sale", saleSchema);