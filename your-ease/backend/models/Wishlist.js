import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true // One wishlist per user
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Compound index for faster queries
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ "items.product": 1 });

export default mongoose.model("Wishlist", wishlistSchema);