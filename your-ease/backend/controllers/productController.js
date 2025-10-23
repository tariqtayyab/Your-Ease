// backend/controllers/productController.js
import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import Category from "../models/Category.js";

// GET /api/products - list all products (with optional category filter)
export const getProducts = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = {};
  if (category) filter.category = category;
  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
});

// GET /api/products/:id
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// POST /api/products
export const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    shortDescription,
    oldPrice = 0,
    currentPrice = 0,
    category: categoryId,
    countInStock = 0,
    isHotSelling = false,
  } = req.body;

  // Handle images from Cloudinary file uploads
  let images = [];
  
  // If files were uploaded via Cloudinary
  if (req.files && req.files.length > 0) {
  images = req.files.map(file => {
    // Better video detection from Cloudinary response
    const isVideo = file.resource_type === 'video' || 
                   file.mimetype?.startsWith('video/') ||
                   file.originalname?.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm|wmv|flv|3gp|m4v)$/);
    
    return {
      url: file.path, // Cloudinary URL
      type: isVideo ? 'video' : 'image'
    };
  });
}
  
  // If images are also sent as JSON (for existing images during edit)
  if (req.body.images) {
    try {
      const parsedImages = typeof req.body.images === "string" ? JSON.parse(req.body.images) : req.body.images;
      // Ensure proper structure for existing images
      const formattedExistingImages = parsedImages.map(img => {
        if (typeof img === 'string') {
          return {
            url: img,
            type: img.toLowerCase().includes('video') ? 'video' : 'image'
          };
        }
        return img; // Already in correct format
      });
      images = [...images, ...formattedExistingImages];
    } catch (error) {
      console.error("Error parsing images:", error);
    }
  }

  const product = await Product.create({
    title,
    description,
    shortDescription,
    images,
    oldPrice,
    currentPrice,
    category: categoryId || null,
    countInStock,
    isHotSelling,
  });

  // Add product to category.products if category provided
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
    // Better video detection from Cloudinary response
    const isVideo = file.resource_type === 'video' || 
                   file.mimetype?.startsWith('video/') ||
                   file.originalname?.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm|wmv|flv|3gp|m4v)$/);
    
    return {
      url: file.path, // Cloudinary URL
      type: isVideo ? 'video' : 'image'
    };
  });
    
    // If images field exists, combine with new Cloudinary uploads
    if (updates.images) {
      try {
        const existingImages = typeof updates.images === "string" ? JSON.parse(updates.images) : updates.images;
        // Ensure proper structure for existing images
        const formattedExistingImages = existingImages.map(img => {
          if (typeof img === 'string') {
            return {
              url: img,
              type: img.toLowerCase().includes('video') ? 'video' : 'image'
            };
          }
          return img; // Already in correct format
        });
        updates.images = [...formattedExistingImages, ...newImages];
      } catch (error) {
        console.error("Error parsing existing images:", error);
        updates.images = newImages;
      }
    } else {
      // If no images field, use the Cloudinary uploads
      updates.images = newImages;
    }
  } else if (updates.images && typeof updates.images === "string") {
    // Handle images sent as JSON string
    try { 
      const parsedImages = JSON.parse(updates.images);
      // Ensure proper structure
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

  Object.assign(product, updates);
  await product.save();

  // If category changed, update category lists
  if (updates.category) {
    // remove from old categories if needed
    await Category.updateMany({ products: product._id }, { $pull: { products: product._id } });
    await Category.findByIdAndUpdate(updates.category, { $addToSet: { products: product._id } });
  }

  res.json(product);
});

// DELETE /api/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  // remove from category
  if (product.category) {
    await Category.findByIdAndUpdate(product.category, { $pull: { products: product._id } });
  }

  await product.deleteOne();
  res.json({ message: "Product removed" });
});