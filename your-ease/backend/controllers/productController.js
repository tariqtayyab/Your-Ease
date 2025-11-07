import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import Category from "../models/Category.js";
import Review from "../models/Review.js";

// OPTIMIZED: Generate multiple optimized image URLs from Cloudinary
const generateOptimizedImageUrls = (cloudinaryPath) => {
  // Extract public ID without existing transformations
  const parts = cloudinaryPath.split('/upload/');
  if (parts.length !== 2) return { original: cloudinaryPath };
  
  const publicId = parts[1];
  
  return {
    original: cloudinaryPath,
    webp: `https://res.cloudinary.com/dhxydnzrx/image/upload/f_webp,q_auto:good/${publicId}`,
    webp_medium: `https://res.cloudinary.com/dhxydnzrx/image/upload/w_600,h_600,c_limit,f_webp,q_auto:good/${publicId}`,
    webp_thumbnail: `https://res.cloudinary.com/dhxydnzrx/image/upload/w_300,h_300,c_fill,f_webp,q_auto:good/${publicId}`,
    fallback_jpeg: `https://res.cloudinary.com/dhxydnzrx/image/upload/f_jpg,q_auto:good/${publicId}`
  };
};

// ENHANCED: Process uploaded files with ACTUAL WebP conversion
const processUploadedFiles = (files) => {
  return files.map(file => {
    const isVideo = file.resource_type === 'video' || 
                   file.mimetype?.startsWith('video/') ||
                   file.originalname?.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm|wmv|flv|3gp|m4v)$/);
    
    if (isVideo) {
      return {
        url: file.path,
        type: 'video'
      };
    } else {
      // With actual conversion, file is already stored as WebP
      const optimizedUrls = generateOptimizedImageUrls(file.path);
      
      return {
        url: file.path, // Direct WebP URL (already converted during upload)
        type: 'image',
        format: 'webp', // Mark as actual WebP file
        optimized_urls: optimizedUrls // Keep multiple sizes for flexibility
      };
    }
  });
};

// GET /api/products - list all products (with optional category filter)
export const getProducts = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = {};
  if (category) filter.category = category;
  
  const products = await Product.find(filter)
    .populate('activeSale') // ADDED: Populate active sale data
    .select('-ratingDistribution')
    .sort({ position: 1, createdAt: -1 });
  
  res.json(products);
});

// GET /api/products/:id
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category")
    .populate('activeSale') // ADDED: Populate active sale data
    .select('-ratingDistribution');
  
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// POST /api/products
export const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    shortDescription,
    specifications,
    oldPrice = 0,
    currentPrice = 0,
    category: categoryId,
    countInStock = 0,
    isHotSelling = false,
    position = 0,
    options = [],
    activeSale = null
  } = req.body;

  // Handle images from Cloudinary file uploads with WebP optimization
  let images = [];
  
  if (req.files && req.files.length > 0) {
    images = processUploadedFiles(req.files);
  }
  
  if (req.body.images) {
    try {
      const parsedImages = typeof req.body.images === "string" ? JSON.parse(req.body.images) : req.body.images;
      const formattedExistingImages = parsedImages.map(img => {
        if (typeof img === 'string') {
          return {
            url: img,
            type: img.toLowerCase().includes('video') ? 'video' : 'image'
          };
        }
        return img;
      });
      images = [...images, ...formattedExistingImages];
    } catch (error) {
      console.error("Error parsing images:", error);
    }
  }

  // Parse options if it's a string
  let parsedOptions = options;
  if (typeof options === 'string') {
    try {
      parsedOptions = JSON.parse(options);
    } catch (error) {
      console.error("Error parsing options:", error);
      parsedOptions = [];
    }
  }

  // Parse specifications from string to object if needed
  let parsedSpecifications = {};
  if (specifications) {
    if (typeof specifications === 'string') {
      try {
        parsedSpecifications = JSON.parse(specifications);
      } catch (error) {
        const lines = specifications.split('\n');
        lines.forEach(line => {
          const colonIndex = line.indexOf(':');
          if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            if (key && value) {
              parsedSpecifications[key] = value;
            }
          }
        });
      }
    } else {
      parsedSpecifications = specifications;
    }
  }

  const product = await Product.create({
    title,
    description,
    shortDescription,
    specifications: parsedSpecifications,
    images,
    oldPrice,
    currentPrice,
    category: categoryId || null,
    countInStock,
    isHotSelling,
    position: parseInt(position) || 0,
    options: parsedOptions,
    activeSale,
  });

  if (categoryId) {
    await Category.findByIdAndUpdate(categoryId, { $push: { products: product._id } });
  }

  res.status(201).json(product);
});

// PUT /api/products/:id
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const updates = req.body;
  
  // Handle new file uploads to Cloudinary with WebP optimization
  if (req.files && req.files.length > 0) {
    const newImages = processUploadedFiles(req.files);
    
    if (updates.images) {
      try {
        const existingImages = typeof updates.images === "string" ? JSON.parse(updates.images) : updates.images;
        const formattedExistingImages = existingImages.map(img => {
          if (typeof img === 'string') {
            return {
              url: img,
              type: img.toLowerCase().includes('video') ? 'video' : 'image'
            };
          }
          return img;
        });
        updates.images = [...formattedExistingImages, ...newImages];
      } catch (error) {
        console.error("Error parsing existing images:", error);
        updates.images = newImages;
      }
    } else {
      updates.images = newImages;
    }
  } else if (updates.images && typeof updates.images === "string") {
    try { 
      const parsedImages = JSON.parse(updates.images);
      updates.images = parsedImages.map(img => {
        if (typeof img === 'string') {
          return {
            url: img,
            type: img.toLowerCase().includes('video') ? 'video' : 'image'
          };
        }
        return img;
      });
    } catch (error) {
      console.error("Error parsing images string:", error);
    }
  }

  // Parse options if it's a string
  if (updates.options && typeof updates.options === "string") {
    try {
      updates.options = JSON.parse(updates.options);
    } catch (error) {
      console.error("Error parsing options string:", error);
    }
  }

  // Parse specifications if it's a string
  if (updates.specifications && typeof updates.specifications === "string") {
    try {
      updates.specifications = JSON.parse(updates.specifications);
    } catch (error) {
      const lines = updates.specifications.split('\n');
      const specs = {};
      lines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          if (key && value) {
            specs[key] = value;
          }
        }
      });
      updates.specifications = specs;
    }
  }

  Object.assign(product, updates);
  await product.save();

  if (updates.category) {
    await Category.updateMany({ products: product._id }, { $pull: { products: product._id } });
    await Category.findByIdAndUpdate(updates.category, { $addToSet: { products: product._id } });
  }

  res.json(product);
});

// DELETE /api/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  // Remove product from category
  if (product.category) {
    await Category.findByIdAndUpdate(product.category, { $pull: { products: product._id } });
  }

  // DELETE ALL REVIEWS RELATED TO THIS PRODUCT
  try {
    const deleteResult = await Review.deleteMany({ product: req.params.id });
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} reviews for product ${req.params.id}`);
  } catch (error) {
    console.error("❌ Error deleting product reviews:", error);
  }

  await product.deleteOne();
  res.json({ 
    message: "Product and associated reviews removed successfully",
    productId: req.params.id
  });
});

// UPDATE PRODUCT POSITIONS
export const updateProductPositions = asyncHandler(async (req, res) => {
  const { updates } = req.body;
  
  if (!Array.isArray(updates)) {
    return res.status(400).json({ message: "Updates array is required" });
  }

  const bulkOps = updates.map(update => ({
    updateOne: {
      filter: { _id: update.productId },
      update: { position: update.position }
    }
  }));

  await Product.bulkWrite(bulkOps);
  
  res.json({ message: "Product positions updated successfully" });
});

// MIGRATION: Active Sale Field
export const migrateActiveSaleField = asyncHandler(async (req, res) => {
  try {
    console.log('🔄 Starting activeSale field migration...');
    
    const result = await Product.updateMany(
      { activeSale: { $exists: false } },
      { $set: { activeSale: null } }
    );
    
    console.log(`✅ Migration completed: ${result.modifiedCount} products updated`);
    
    res.json({
      message: `Active sale field migration completed successfully`,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    res.status(500).json({
      message: 'Migration failed',
      error: error.message
    });
  }
});

export const migrateImagesToWebP = asyncHandler(async (req, res) => {
  try {
    console.log('🔄 Starting WebP image migration...');
    
    const products = await Product.find({});
    let migratedCount = 0;
    let errorCount = 0;
    let alreadyMigratedCount = 0;

    for (const product of products) {
      try {
        let needsUpdate = false;
        const updatedImages = [];

        for (const image of product.images) {
          if (image.type === 'image' && image.url) {
            // CHECK if already has WebP transformation to avoid duplicates
            const hasWebPTransform = image.url.includes('/f_webp,');
            const isAlreadyWebP = image.format === 'webp';
            
            if (!hasWebPTransform && !isAlreadyWebP) {
              // Extract clean public ID (remove any existing transformations)
              const urlParts = image.url.split('/upload/');
              if (urlParts.length === 2) {
                const publicIdWithVersion = urlParts[1];
                
                // Create clean WebP URL with SINGLE transformation
                const webpUrl = `https://res.cloudinary.com/dhxydnzrx/image/upload/f_webp,q_auto:good/${publicIdWithVersion}`;
                
                updatedImages.push({
                  ...image,
                  url: webpUrl,
                  format: 'webp',
                  optimized_urls: generateOptimizedImageUrls(webpUrl),
                  original_url: image.url // Keep original for reference
                });
                needsUpdate = true;
                console.log(`✅ Migrated: ${image.url.substring(0, 50)}...`);
              }
            } else {
              // Already migrated, just ensure format is set
              if (!image.format) {
                updatedImages.push({
                  ...image,
                  format: 'webp'
                });
                needsUpdate = true;
              } else {
                updatedImages.push(image);
                alreadyMigratedCount++;
              }
            }
          } else {
            // Videos or non-image files
            updatedImages.push(image);
          }
        }

        if (needsUpdate) {
          product.images = updatedImages;
          await product.save();
          migratedCount++;
        }
      } catch (productError) {
        console.error(`❌ Error migrating product ${product._id}:`, productError.message);
        errorCount++;
      }
    }

    console.log(`🎉 WebP migration completed!`);
    console.log(`✅ Newly migrated: ${migratedCount} products`);
    console.log(`📝 Already migrated: ${alreadyMigratedCount} products`);
    console.log(`❌ Errors: ${errorCount} products`);

    res.json({
      message: `WebP migration completed successfully`,
      migratedCount,
      alreadyMigratedCount,
      errorCount,
      totalProducts: products.length,
      note: 'Duplicate transformations indicate multiple migration runs'
    });
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    res.status(500).json({
      message: 'WebP migration failed',
      error: error.message
    });
  }
});

// ADD THIS: Cleanup script to fix already-migrated images with duplicates
export const cleanupDuplicateTransformations = asyncHandler(async (req, res) => {
  try {
    console.log('🧹 Cleaning up duplicate WebP transformations...');
    
    const products = await Product.find({});
    let cleanedCount = 0;

    for (const product of products) {
      let needsCleanup = false;
      const cleanedImages = [];

      for (const image of product.images) {
        if (image.type === 'image' && image.url && image.url.includes('/f_webp,')) {
          // Count how many duplicate transformations exist
          const transformations = image.url.split('/upload/')[0].split('/f_webp,').length - 1;
          
          if (transformations > 1) {
            // Extract clean public ID and create SINGLE transformation
            const urlParts = image.url.split('/upload/');
            if (urlParts.length === 2) {
              const publicIdWithVersion = urlParts[1];
              const cleanWebpUrl = `https://res.cloudinary.com/dhxydnzrx/image/upload/f_webp,q_auto:good/${publicIdWithVersion}`;
              
              cleanedImages.push({
                ...image,
                url: cleanWebpUrl,
                optimized_urls: generateOptimizedImageUrls(cleanWebpUrl)
              });
              needsCleanup = true;
              console.log(`🧹 Fixed ${transformations} duplicates: ${image.url.substring(0, 60)}...`);
            }
          } else {
            cleanedImages.push(image);
          }
        } else {
          cleanedImages.push(image);
        }
      }

      if (needsCleanup) {
        product.images = cleanedImages;
        await product.save();
        cleanedCount++;
      }
    }

    res.json({
      message: `Duplicate transformations cleanup completed`,
      cleanedCount,
      totalProducts: products.length
    });
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    res.status(500).json({
      message: 'Cleanup failed',
      error: error.message
    });
  }
});