import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.birthday = req.body.birthday || user.birthday;
    user.gender = req.body.gender || user.gender;
    user.profilePicture = req.body.profilePicture || user.profilePicture;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      birthday: updatedUser.birthday,
      gender: updatedUser.gender,
      profilePicture: updatedUser.profilePicture,
      isAdmin: updatedUser.isAdmin,
      token: req.headers.authorization.split(' ')[1], // Return same token
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
export const updateUserPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.preferences = {
      ...user.preferences,
      ...req.body
    };

    const updatedUser = await user.save();

    res.json({
      preferences: updatedUser.preferences
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard
// @access  Private
export const getUserDashboard = asyncHandler(async (req, res) => {
  const Order = (await import("../models/Order.js")).default;
  const Wishlist = (await import("../models/Wishlist.js")).default;

  const [orders, wishlist] = await Promise.all([
    Order.find({ user: req.user._id }),
    Wishlist.findOne({ user: req.user._id }).populate('items.product')
  ]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => 
    ["pending", "confirmed", "processing"].includes(order.orderStatus)
  ).length;
  const wishlistCount = wishlist ? wishlist.items.length : 0;
  const totalSpent = orders
    .filter(order => order.isPaid)
    .reduce((sum, order) => sum + order.totalPrice, 0);

  res.json({
    stats: {
      totalOrders,
      pendingOrders,
      wishlistCount,
      totalSpent,
      loyaltyPoints: req.user.loyaltyPoints || 0
    },
    recentOrders: orders.slice(0, 5).map(order => ({
      _id: order._id,
      totalPrice: order.totalPrice,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt
    })),
    wishlistItems: wishlist ? wishlist.items.slice(0, 5) : []
  });
});