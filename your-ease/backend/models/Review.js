import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    media: [{
      url: String,
      public_id: String,
      type: {
        type: String,
        default: "image"
      }
    }],
    helpful: {
      type: Number,
      default: 0,
    },
    // Make it optional - only for imported reviews
    reviewDate: {
      type: String,
      default: "" // Optional field
    },
    
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;