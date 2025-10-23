import asyncHandler from "express-async-handler";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/productModel.js";

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate("items.product");

  if (!wishlist) {
    // Return empty wishlist if none exists
    return res.json({ items: [] });
  }

  res.json(wishlist);
});

// @desc    Add item to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    // Create new wishlist if it doesn't exist
    wishlist = new Wishlist({
      user: req.user._id,
      items: [{ product: productId }]
    });
  } else {
    // Check if product already in wishlist
    const existingItem = wishlist.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      res.status(400);
      throw new Error("Product already in wishlist");
    }

    // Add new item
    wishlist.items.push({ product: productId });
  }

  await wishlist.save();
  
  // Populate the product details before sending response
  await wishlist.populate("items.product");

  res.status(201).json(wishlist);
});

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    res.status(404);
    throw new Error("Wishlist not found");
  }

  // Remove the item
  wishlist.items = wishlist.items.filter(
    item => item.product.toString() !== productId
  );

  await wishlist.save();
  
  // Populate remaining items
  await wishlist.populate("items.product");

  res.json(wishlist);
});

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private
export const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    res.status(404);
    throw new Error("Wishlist not found");
  }

  wishlist.items = [];
  await wishlist.save();

  res.json({ message: "Wishlist cleared successfully", items: [] });
});