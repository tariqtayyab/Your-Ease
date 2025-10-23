import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";
import Product from "../models/productModel.js";

// Helper function to update product rating stats
const updateProductRatingStats = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const product = await Product.findById(productId);
  
  if (reviews.length === 0) {
    product.rating = 0;
  } else {
    product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
  }
  
  await product.save();
};

// @desc    Get reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate("user", "name")
    .sort({ createdAt: -1 });

  res.json(reviews);
});

// @desc    Create a review
// @route   POST /api/products/:productId/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  
  const product = await Product.findById(req.params.productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Handle media files from Cloudinary
  let media = [];
  if (req.files && req.files.length > 0) {
    media = req.files.map(file => ({
      url: file.path,
      public_id: file.filename,
      type: file.resource_type === 'video' ? 'video' : 'image'
    }));
  }

  const review = await Review.create({
    product: req.params.productId,
    user: req.user.name,
    rating: Number(rating),
    comment,
    media
  });

  // Update product rating
  await updateProductRatingStats(req.params.productId);

  await review.populate("user", "name");
  res.status(201).json(review);
});

// @desc    Update review helpful count
// @route   PUT /api/reviews/:id/helpful
// @access  Private
export const updateReviewHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  review.helpful += 1;
  await review.save();

  res.json({ helpful: review.helpful });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  // Check if user owns the review or is admin
  if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return res.status(403).json({ message: "Not authorized to delete this review" });
  }

  await review.deleteOne();

  // Update product rating
  await updateProductRatingStats(review.product);

  res.json({ message: "Review removed" });
});