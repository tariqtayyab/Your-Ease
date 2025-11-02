// controllers/productController.js - UPDATED
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
    .select('-ratingDistribution') // Exclude heavy distribution data if not needed
    .sort({ position: 1, createdAt: -1 });
  
  res.json(products);
});

// GET /api/products/:id
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category")
    .select('-ratingDistribution'); // Exclude distribution for single product if not needed
  
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
    options = [] // ADD OPTIONS FIELD
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
        // Try to parse as JSON first
        parsedSpecifications = JSON.parse(specifications);
      } catch (error) {
        // If JSON parsing fails, try to parse as key-value pairs
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
    options: parsedOptions, // ADD OPTIONS TO PRODUCT CREATION
    // Rating fields will use defaults (0)
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
                     file.mimetype?.startsWith('video/') ||
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
      // Try to parse as JSON first
      updates.specifications = JSON.parse(updates.specifications);
    } catch (error) {
      // If JSON parsing fails, try to parse as key-value pairs
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

// DELETE /api/products/:id - UPDATED TO DELETE RELATED REVIEWS
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
    // Continue with product deletion even if review deletion fails
  }

  await product.deleteOne();
  res.json({ 
    message: "Product and associated reviews removed successfully",
    productId: req.params.id
  });
});

// ADD THIS NEW FUNCTION FOR UPDATING PRODUCT POSITIONS
export const updateProductPositions = asyncHandler(async (req, res) => {
  const { updates } = req.body; // Array of { productId, position }
  
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