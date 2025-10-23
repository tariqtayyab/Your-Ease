import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

// Create order from cart
export const createOrder = asyncHandler(async (req, res) => {
  const user = req.user;
  const { shippingAddress, paymentMethod } = req.body;

  // get cart
  const cart = await Cart.findOne({ user: user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  const itemsPrice = cart.items.reduce((acc, i) => acc + i.price * i.qty, 0);
  const shippingPrice = itemsPrice > 5000 ? 0 : 200; // Free shipping over Rs 5000
  const taxPrice = Math.round(itemsPrice * 0.1);
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const order = new Order({
    user: user._id,
    orderItems: cart.items.map((i) => ({
      product: i.product._id,
      name: i.product.title,
      image: i.product.images?.[0]?.url || '/placeholder.png',
      price: i.price,
      qty: i.qty,
    })),
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    orderStatus: "pending"
  });

  const created = await order.save();
  
  // Clear cart after successful order
  await Cart.findOneAndDelete({ user: user._id });

  res.status(201).json(created);
});

// Get orders for user
export const getUserOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await Order.countDocuments({ user: req.user._id });

  res.json({
    orders,
    page,
    pages: Math.ceil(total / limit),
    total
  });
});

// Get specific order details
export const getOrderDetails = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("orderItems.product");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Check if order belongs to user or user is admin
  if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error("Not authorized to view this order");
  }

  res.json(order);
});

// Cancel order
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Check if order belongs to user
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to cancel this order");
  }

  // Only allow cancellation for pending/confirmed orders
  if (!["pending", "confirmed"].includes(order.orderStatus)) {
    res.status(400);
    throw new Error("Order cannot be cancelled at this stage");
  }

  order.orderStatus = "cancelled";
  const updatedOrder = await order.save();

  res.json(updatedOrder);
});

// Admin: get all orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await Order.countDocuments();

  res.json({
    orders,
    page,
    pages: Math.ceil(total / limit),
    total
  });
});

// Admin: update order status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { orderStatus, trackingNumber } = req.body;
  
  const order = await Order.findById(id);
  if (!order) { 
    res.status(404); 
    throw new Error("Order not found"); 
  }

  if (orderStatus) order.orderStatus = orderStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  
  // Auto update isDelivered and paid status based on order status
  if (orderStatus === "delivered") {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  const updated = await order.save();
  res.json(updated);
});