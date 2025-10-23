// backend/controllers/cartController.js
import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";
import Product from "../models/productModel.js";

// Get current user's cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart) return res.json({ items: [] });
  res.json(cart);
});

// Add item to cart (or update qty)
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }
  const existIndex = cart.items.findIndex((i) => i.product.toString() === productId);
  if (existIndex >= 0) {
    cart.items[existIndex].qty = qty;
    cart.items[existIndex].price = product.price;
  } else {
    cart.items.push({
      product: product._id,
      name: product.name,
      image: (product.images && product.images[0]) || "",
      price: product.price,
      qty,
    });
  }
  await cart.save();
  res.json(cart);
});

// Remove item
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }
  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  await cart.save();
  res.json(cart);
});

// Clear cart
export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.json({ message: "Cart cleared" });
});
