import Review from '../models/Review.js';
import Product from '../models/productModel.js';
import asyncHandler from 'express-async-handler';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import fetch from 'node-fetch';

// Download image from Daraz URL
const downloadImage = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Download error:', error.message);
    throw error;
  }
};

// Upload buffer to Cloudinary with WebP conversion
const uploadToCloudinary = (imageBuffer, productId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `your-ease/reviews/${productId}`,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [
          { 
            width: 1200, 
            height: 1200, 
            crop: "limit",
            quality: "auto:good", 
            fetch_format: "webp" 
          }
        ],
        format: 'webp' // Force actual WebP storage
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    streamifier.createReadStream(imageBuffer).pipe(uploadStream);
  });
};

// Process single image (download + upload with WebP conversion)
const processImage = async (imageUrl, productId) => {
  try {
    console.log(`⬇️ Downloading: ${imageUrl.substring(0, 50)}...`);
    const imageBuffer = await downloadImage(imageUrl);
    
    console.log(`⬆️ Uploading to Cloudinary as WebP...`);
    const uploadResult = await uploadToCloudinary(imageBuffer, productId);
    
    return {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      type: 'image',
      format: 'webp' // Mark as WebP format
    };
  } catch (error) {
    console.error(`❌ Image processing failed: ${error.message}`);
    return null;
  }
};

// Import reviews from scraped JSON file
const importDarazReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { reviewsData } = req.body;

  try {
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const importedReviews = [];
    const errors = [];
    let totalImagesProcessed = 0;

    console.log(`🚀 Starting import of ${reviewsData.reviews.length} reviews with WebP conversion...`);

    // Process each review from scraped data
    for (const [index, scrapedReview] of reviewsData.reviews.entries()) {
      try {
        console.log(`\n📝 Processing review ${index + 1}/${reviewsData.reviews.length} from ${scrapedReview.username}`);

        // Check if review already exists (by comment content)
        const existingReview = await Review.findOne({
          product: productId,
          comment: { $regex: scrapedReview.text.substring(0, 50), $options: 'i' },
          rating: scrapedReview.rating
        });

        if (existingReview) {
          console.log(`⏭️ Skipping duplicate review from ${scrapedReview.username}`);
          errors.push(`Review already exists: ${scrapedReview.username}`);
          continue;
        }

        // Process all images for this review with WebP conversion
        const media = [];
        if (scrapedReview.images && scrapedReview.images.length > 0) {
          console.log(`🖼️ Processing ${scrapedReview.images.length} images as WebP...`);
          
          for (const [imgIndex, image] of scrapedReview.images.entries()) {
            const processedImage = await processImage(image.url, productId);
            if (processedImage) {
              media.push(processedImage);
              totalImagesProcessed++;
              console.log(`✅ Image ${imgIndex + 1}/${scrapedReview.images.length} converted to WebP`);
            } else {
              console.log(`❌ Failed to process image ${imgIndex + 1}`);
            }
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        // Create review in database (for imported Daraz reviews)
        const newReview = await Review.create({
          product: productId,
          user: scrapedReview.username,
          rating: scrapedReview.rating,
          comment: scrapedReview.text,
          media: media,
          reviewDate: scrapedReview.date, // Store Daraz date
          isImported: true // Mark as imported review
        });

        importedReviews.push(newReview);
        console.log(`✅ Review imported successfully (${media.length} WebP images)`);

      } catch (reviewError) {
        const errorMsg = `Failed to import review from ${scrapedReview.username}: ${reviewError.message}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    // Update product rating stats
    await updateProductRatingStats(productId);

    console.log(`🎉 Import completed! ${importedReviews.length} reviews, ${totalImagesProcessed} WebP images`);

    res.status(200).json({
      message: 'Reviews import completed with WebP conversion',
      imported: importedReviews.length,
      totalImages: totalImagesProcessed,
      errors: errors.length,
      imageFormat: 'webp', // Indicate images are stored as WebP
      details: {
        importedReviews: importedReviews.map(r => ({
          id: r._id,
          rating: r.rating,
          images: r.media.length,
          format: 'webp'
        })),
        errors: errors
      }
    });

  } catch (error) {
    console.error('💥 Import failed:', error);
    res.status(500).json({
      message: 'Import failed',
      error: error.message
    });
  }
});

// Helper function to update product rating stats
const updateProductRatingStats = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const product = await Product.findById(productId);
  
  const totalReviews = reviews.length;
  if (totalReviews === 0) {
    product.rating = 0;
    await product.save();
    return;
  }
  
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
  
  await Product.findByIdAndUpdate(productId, {
    rating: parseFloat(averageRating.toFixed(1))
  });
};

export { importDarazReviews };