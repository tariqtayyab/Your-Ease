import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";
import Product from "../models/productModel.js";

// GET /api/categories
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ position: 1, createdAt: -1 }).lean();
  const catIds = categories.map(c => c._id);
  
  // CHANGED: Sort products by position, then by creation date
  const products = await Product.find({ category: { $in: catIds } })
    .sort({ position: 1, createdAt: -1 })
    .lean();

  const map = {};
  for (const p of products) {
    const id = String(p.category);
    if (!map[id]) map[id] = [];
    map[id].push(p);
  }

  const out = categories.map(c => ({
    ...c,
    products: map[String(c._id)] || []
  }));

  res.json(out);
});

// ... rest of your existing code remains the same ...

// POST /api/categories (with file upload)
export const createCategory = asyncHandler(async (req, res) => {
  const { name, isTrending, position } = req.body; // CHANGED: Added position
  
  if (!name) return res.status(400).json({ message: "Category name required" });
  
  const exists = await Category.findOne({ name });
  if (exists) return res.status(400).json({ message: "Category already exists" });

  // Determine media type
  let mediaType = "image";
  if (req.file) {
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
    mediaType = videoExtensions.includes(fileExtension) ? "video" : "image";
  }
  const cat = await Category.create({ 
    name, 
    isTrending: !!isTrending,
    position: position ? parseInt(position) : 0, // CHANGED: Added position
    image: req.file ? req.file.path : null,
    mediaType: req.file ? mediaType : "image"
  });

  res.status(201).json(cat);
});

// PUT /api/categories/:id (with optional file upload)
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, isTrending, position } = req.body; // CHANGED: Added position
  const category = await Category.findById(req.params.id);
  
  if (!category) return res.status(404).json({ message: "Category not found" });

  if (name !== undefined) category.name = name;
  if (isTrending !== undefined) category.isTrending = isTrending;
  if (position !== undefined) category.position = parseInt(position) || 0; // CHANGED: Added position

  // Update image/video if new file is uploaded
  if (req.file) {
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
    category.mediaType = videoExtensions.includes(fileExtension) ? "video" : "image";
    category.image = req.file.path;
  }

  await category.save();
  res.json(category);
});

// DELETE /api/categories/:id (unchanged)
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });
  await Product.deleteMany({ category: category._id });
  await category.deleteOne();
  res.json({ message: "Category removed" });
});

// POST /api/categories/:id/products (with multiple files)
export const addProductToCategory = asyncHandler(async (req, res) => {
  const catId = req.params.id;
  const category = await Category.findById(catId);
  if (!category) return res.status(404).json({ message: "Category not found" });

  // Get data from form-data
  const {
    title,
    description = "",
    oldPrice = 0,
    currentPrice = 0,
    countInStock = 0,
  } = req.body;

  console.log("Received product data:", req.body);
  console.log("Received files:", req.files);

  if (!title) return res.status(400).json({ message: "Product title required" });

  // Handle uploaded files
  const images = [];
  if (req.files && req.files.length > 0) {
    req.files.forEach(file => {
      const fileExtension = file.originalname.split('.').pop().toLowerCase();
      const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
      const mediaType = videoExtensions.includes(fileExtension) ? "video" : "image";
      
      images.push({
        url: file.path,
        type: mediaType
      });
    });
  }

  const product = await Product.create({
    category: category._id,
    title,
    description,
    oldPrice: Number(oldPrice),
    currentPrice: Number(currentPrice),
    countInStock: Number(countInStock),
    images,
  });

  res.status(201).json(product);
});

// PUT /api/categories/:catId/products/:prodId (unchanged)
export const updateProduct = asyncHandler(async (req, res) => {
  const { catId, prodId } = req.params;
  const product = await Product.findOne({ _id: prodId, category: catId });
  if (!product) return res.status(404).json({ message: "Product not found" });

  const up = req.body;
  ["title","description","oldPrice","currentPrice","countInStock","images"].forEach(k => {
    if (up[k] !== undefined) product[k] = up[k];
  });

  await product.save();
  res.json(product);
});

// DELETE /api/categories/:catId/products/:prodId (unchanged)
export const deleteProduct = asyncHandler(async (req, res) => {
  const { catId, prodId } = req.params;
  const product = await Product.findOne({ _id: prodId, category: catId });
  if (!product) return res.status(404).json({ message: "Product not found" });
  await product.deleteOne();
  res.json({ message: "Product removed" });
});