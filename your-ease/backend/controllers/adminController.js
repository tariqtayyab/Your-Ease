// adminController.js - provides banner/category/product admin endpoints
import asyncHandler from "express-async-handler";
import Banner from "../models/Banner.js";
import Category from "../models/Category.js";
import Product from "../models/productModel.js";

/* BANNERS */
// export const getBanners = asyncHandler(async (req, res) => {
//   const banners = await Banner.find({}).sort({ order: 1, createdAt: -1 });
//   res.json(banners);
// });

// export const addBanner = asyncHandler(async (req, res) => {
//   const { title, description, image, order } = req.body;
//   if (!image) return res.status(400).json({ message: "Image required" });
//   const b = await Banner.create({ title, description, image, order: order || 0 });
//   res.status(201).json(b);
// });

// export const addBanner = asyncHandler(async (req, res) => {
//   try {
//     // Check if file exists
//     if (!req.file) {
//       res.status(400);
//       throw new Error('No image file uploaded');
//     }

//     // Save file path (or store in DB)
//     const imagePath = `/uploads/${req.file.filename}`;

//     const banner = await Banner.create({
//       image: imagePath,
//     });

//     res.status(201).json({
//       message: 'Banner added successfully',
//       banner,
//     });
//   } catch (error) {
//     console.error('❌ Error adding banner:', error.message);
//     res.status(500).json({ message: error.message });
//   }
// });

// export const updateBanner = asyncHandler(async (req, res) => {
//   const banner = await Banner.findById(req.params.id);
//   if (!banner) return res.status(404).json({ message: "Banner not found" });
//   ["title","description","image","order"].forEach(k => {
//     if (req.body[k] !== undefined) banner[k] = req.body[k];
//   });
//   await banner.save();
//   res.json(banner);
// });

// export const deleteBanner = asyncHandler(async (req, res) => {
//   const banner = await Banner.findById(req.params.id);
//   if (!banner) return res.status(404).json({ message: "Banner not found" });
//   await banner.deleteOne();
//   res.json({ message: "Banner removed" });
// });

/* CATEGORIES */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.json(categories);
});

export const addCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: "Name required" });
  const exists = await Category.findOne({ name });
  if (exists) return res.status(400).json({ message: "Category exists" });
  const c = await Category.create({ name, description });
  res.status(201).json(c);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const c = await Category.findById(req.params.id);
  if (!c) return res.status(404).json({ message: "Category not found" });
  if (req.body.name !== undefined) c.name = req.body.name;
  if (req.body.description !== undefined) c.description = req.body.description;
  await c.save();
  res.json(c);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const c = await Category.findById(req.params.id);
  if (!c) return res.status(404).json({ message: "Category not found" });
  // optional: delete products in that category:
  await Product.deleteMany({ category: c._id });
  await c.deleteOne();
  res.json({ message: "Category deleted" });
});

/* PRODUCTS */
export const getProducts = asyncHandler(async (req, res) => {
  const { categoryId, hot } = req.query;
  const filter = {};
  if (categoryId) filter.category = categoryId;
  if (hot === "true") filter.isHotSelling = true;
  const products = await Product.find(filter).populate("category");
  res.json(products);
});

export const addProduct = asyncHandler(async (req, res) => {
  const {
    name, title, description, categoryId, priceBefore, priceAfter, image, countInStock, isHotSelling
  } = req.body;
  if (!name || !categoryId) return res.status(400).json({ message: "Name and category required" });
  const product = await Product.create({
    name,
    title,
    description,
    category: categoryId,
    priceBefore: priceBefore || 0,
    priceAfter: priceAfter || 0,
    image,
    countInStock: countInStock || 0,
    isHotSelling: !!isHotSelling
  });
  res.status(201).json(await product.populate("category").execPopulate());
});

export const updateProduct = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Product not found" });
  const keys = ["name","title","description","category","priceBefore","priceAfter","image","countInStock","isHotSelling"];
  keys.forEach(k => { if (req.body[k] !== undefined) p[k] = req.body[k]; });
  await p.save();
  res.json(await p.populate("category").execPopulate());
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Product not found" });
  await p.deleteOne();
  res.json({ message: "Product removed" });
});
