// controllers/reviewController.js - UPDATED
import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";
import Product from "../models/productModel.js";

// IMPROVED Helper function to update product rating stats
const updateProductRatingStats = async (productId) => {
  try {
    const reviews = await Review.find({ product: productId });
    const product = await Product.findById(productId);
    
    if (!product) {
      console.error(`Product ${productId} not found for rating update`);
      return;
    }

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((acc, item) => acc + item.rating, 0) / totalReviews 
      : 0;

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingDistribution[review.rating]++;
      }
    });

    // Update product with new stats
    product.rating = parseFloat(averageRating.toFixed(1));
    product.numReviews = totalReviews;
    product.ratingDistribution = ratingDistribution;
    
    await product.save();
    console.log(`✅ Updated rating stats for product ${productId}: ${averageRating.toFixed(1)} stars, ${totalReviews} reviews`);
  } catch (error) {
    console.error('Error updating product rating stats:', error);
  }
};

// @desc    Get reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
export const getProductReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ product: req.params.productId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await Review.countDocuments({ product: req.params.productId });

  res.json({
    reviews,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total,
      hasMore: page < Math.ceil(total / limit)
    }
  });
});

// @desc    Get product review statistics
// @route   GET /api/products/:productId/reviews/stats
// @access  Public
export const getProductReviewStats = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).select('rating numReviews ratingDistribution');
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Return the stats directly from the product document
    res.json({
      totalReviews: product.numReviews || 0,
      averageRating: product.rating || 0,
      ratingDistribution: product.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({ 
      message: "Error fetching review stats", 
      error: error.message 
    });
  }
});

// @desc    Create a review
// @route   POST /api/products/:productId/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment, userName } = req.body;
  
  console.log('📝 Creating review...');
  console.log('User data:', req.user);
  console.log('Rating:', rating);
  console.log('Comment:', comment);
  console.log('User Name from form:', userName);

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

  try {
    // Use the userName from the form, fallback to authenticated user's name
    const displayName = userName?.trim() || req.user?.name || 'Anonymous';
    
    const reviewData = {
      product: req.params.productId,
      user: displayName, // Use the name from the form
      rating: Number(rating),
      comment,
      media
    };

    console.log('Review data to create:', reviewData);

    const review = await Review.create(reviewData);

    // Update product rating stats
    await updateProductRatingStats(req.params.productId);

    console.log('✅ Review created successfully');
    res.status(201).json(review);

  } catch (error) {
    console.error('❌ Error creating review:', error);
    res.status(500).json({ 
      message: "Error creating review", 
      error: error.message 
    });
  }
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

  // For string-based user names
  const isOwner = review.user === req.user.name;
  const isAdmin = req.user.isAdmin;

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "Not authorized to delete this review" });
  }

  const productId = review.product;
  await review.deleteOne();

  // Update product rating stats
  await updateProductRatingStats(productId);

  res.json({ message: "Review removed" });
});

export const migrateProductRatings = asyncHandler(async (req, res) => {
  try {
    console.log('🔄 Starting product ratings migration...');
    
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to update`);
    
    let updatedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        const reviews = await Review.find({ product: product._id });
        
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
          ? reviews.reduce((acc, item) => acc + item.rating, 0) / totalReviews 
          : 0;

        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(review => {
          if (review.rating >= 1 && review.rating <= 5) {
            ratingDistribution[review.rating]++;
          }
        });

        product.rating = parseFloat(averageRating.toFixed(1));
        product.numReviews = totalReviews;
        product.ratingDistribution = ratingDistribution;
        
        await product.save();
        updatedCount++;
        
        console.log(`✅ ${product.title} - ${averageRating.toFixed(1)} stars, ${totalReviews} reviews`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error updating product ${product._id}:`, error.message);
      }
    }

    res.json({
      message: 'Migration completed successfully',
      updated: updatedCount,
      errors: errorCount,
      total: products.length
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
    res.status(500).json({ message: 'Migration failed', error: error.message });
  }
});

// @desc    Update all product ratings (for migration or manual trigger)
// @route   POST /api/reviews/update-all-ratings
// @access  Private/Admin
export const updateAllProductRatings = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  let updatedCount = 0;

  for (const product of products) {
    await updateProductRatingStats(product._id);
    updatedCount++;
  }

  res.json({ 
    message: `Updated rating stats for ${updatedCount} products`,
    updatedCount 
  });
});