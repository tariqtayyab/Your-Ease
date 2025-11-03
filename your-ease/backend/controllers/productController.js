// controllers/productController.js - UPDATED WITH ACTIVE SALE POPULATION
import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import Category from "../models/Category.js";
import Review from "../models/Review.js";

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
    activeSale = null // ADDED: Handle active sale if provided
  } = req.body;

  // Handle images from Cloudinary file uploads
  let images = [];
  
  if (req.files && req.files.length > 0) {
    images = req.files.map(file => {
      const isVideo = file.resource_type === 'video' || 
                     file.mimetype?.startsWith('video/') ||
                     file.originalname?.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm|wmv|flv|3gp|m4v)$/);
      
      return {
        url: file.path,
        type: isVideo ? 'video' : 'image'
      };
    });
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
    activeSale, // ADDED: Include active sale reference
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
  
  // Handle new file uploads to Cloudinary
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => {
      const isVideo = file.resource_type === 'video' || 
                     file.mimeType?.startsWith('video/') ||
                     file.originalname?.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm|wmv|flv|3gp|m4v)$/);
      
      return {
        url: file.path,
        type: isVideo ? 'video' : 'image'
      };
    });
    
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

// ADD THIS NEW ROUTE FOR MIGRATION
export const migrateActiveSaleField = asyncHandler(async (req, res) => {
  try {
    console.log('🔄 Starting activeSale field migration...');
    
    // Update all products to set activeSale: null if field doesn't exist
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