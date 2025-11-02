import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import { sendNewOrderNotification } from "../services/emailService.js";

// Create order from cart OR from direct items (supports guest orders)
export const createOrder = asyncHandler(async (req, res) => {
  const user = req.user; // This might be undefined for guest orders
  const { 
    shippingAddress, 
    paymentMethod, 
    items, 
    itemsPrice, 
    shippingPrice, 
    taxPrice, 
    totalPrice,
    isGuest = false 
  } = req.body;

  let orderItems = [];
  let calculatedPrices = {};

  // Generate sequential order number
  const lastOrder = await Order.findOne().sort({ createdAt: -1 });
  let orderNumber;
  
  if (lastOrder && lastOrder.orderNumber) {
    const lastNumber = parseInt(lastOrder.orderNumber.replace('#', '')) || 1000;
    orderNumber = `#${lastNumber + 1}`;
  } else if (lastOrder) {
    const orderCount = await Order.countDocuments();
    orderNumber = `#${1000 + orderCount + 1}`;
  } else {
    orderNumber = '#1001';
  }

  // If items are provided directly in the request (from localStorage cart - guest orders)
  if (items && items.length > 0) {
    orderItems = items.map(item => ({
      product: item.id || item._id,
      name: item.title || item.name,
      image: item.processedImage || item.image || '/placeholder.png',
      price: item.price || item.currentPrice || item.originalPrice || 0,
      qty: item.quantity || 1,
      // FIXED: Handle selectedOptions properly - check multiple possible field names
      selectedOptions: item.selectedOptions || item.options || item.variants || {}
    }));

    calculatedPrices.itemsPrice = itemsPrice || orderItems.reduce((acc, i) => acc + (i.price * i.qty), 0);
    calculatedPrices.shippingPrice = 0; // FREE shipping
    calculatedPrices.taxPrice = 0; // Tax included in prices
    calculatedPrices.totalPrice = totalPrice || calculatedPrices.itemsPrice;
  } 
  // Otherwise, get cart from database (logged in users)
  else if (user) {
    const cart = await Cart.findOne({ user: user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      res.status(400);
      throw new Error("Cart is empty");
    }

    orderItems = cart.items.map((i) => ({
      product: i.product._id,
      name: i.product.title,
      image: i.product.images?.[0]?.url || '/placeholder.png',
      price: i.price,
      qty: i.qty,
      // FIXED: Include selectedOptions from cart items for logged-in users
      selectedOptions: i.selectedOptions || i.options || {}
    }));

    calculatedPrices.itemsPrice = cart.items.reduce((acc, i) => acc + i.price * i.qty, 0);
    calculatedPrices.shippingPrice = 0;
    calculatedPrices.taxPrice = 0;
    calculatedPrices.totalPrice = calculatedPrices.itemsPrice;

    // Clear cart after successful order (only for logged in users)
    await Cart.findOneAndDelete({ user: user._id });
  } else {
    res.status(400);
    throw new Error("No items provided for order");
  }

  // Prepare order data
  const orderData = {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice: calculatedPrices.itemsPrice,
    shippingPrice: calculatedPrices.shippingPrice,
    taxPrice: calculatedPrices.taxPrice,
    totalPrice: calculatedPrices.totalPrice,
    orderStatus: "pending",
    orderNumber: orderNumber,
    isGuest: isGuest
  };

  // Add user reference if logged in
  if (user) {
    orderData.user = user._id;
  }

  // Add guest information if guest order
  if (isGuest) {
    orderData.guestEmail = shippingAddress.email;
    orderData.guestName = shippingAddress.fullName;
  }

  const order = new Order(orderData);
  const createdOrder = await order.save();
  
  // Send email notification
  try {
    await sendNewOrderNotification(createdOrder);
    console.log('📧 Order notification email sent successfully');
  } catch (emailError) {
    console.error('❌ Failed to send order notification email:', emailError);
  }

  res.status(201).json(createdOrder);
});

// Get orders for user (supports guest orders by email)
export const getUserOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = {};
  
  // If user is logged in, get their orders
  if (req.user) {
    query.user = req.user._id;
  } 
  // If guest user, get orders by email (requires email parameter)
  else if (req.query.email) {
    query.isGuest = true;
    query.guestEmail = req.query.email;
  } else {
    res.status(400);
    throw new Error("Email required for guest order lookup");
  }

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await Order.countDocuments(query);

  res.json({
    orders,
    page,
    pages: Math.ceil(total / limit),
    total
  });
});

// Get specific order details (supports guest access) - FIXED: Populate product details properly
export const getOrderDetails = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate({
      path: "orderItems.product",
      select: "title images price" // Only select necessary fields
    });

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Check authorization
  const isOwner = order.user && order.user._id.toString() === req.user?._id?.toString();
  const isGuestOwner = order.isGuest && req.query.email === order.guestEmail;
  const isAdmin = req.user?.isAdmin;

  if (!isOwner && !isGuestOwner && !isAdmin) {
    res.status(401);
    throw new Error("Not authorized to view this order");
  }

  // FIXED: Ensure selectedOptions exists for all order items to prevent frontend errors
  const orderWithSafeSelectedOptions = {
    ...order.toObject(),
    orderItems: order.orderItems.map(item => ({
      ...item,
      selectedOptions: item.selectedOptions || {}
    }))
  };

  res.json(orderWithSafeSelectedOptions);
});

// Guest order lookup by email and order number - FIXED: Add selectedOptions safety
export const getGuestOrder = asyncHandler(async (req, res) => {
  const { email, orderNumber } = req.query;

  if (!email) {
    res.status(400);
    throw new Error("Email and order number are required");
  }

  const order = await Order.findOne({
    isGuest: true,
    guestEmail: email,
    // orderNumber: orderNumber
  })
  .populate("orderItems.product");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // FIXED: Ensure selectedOptions exists for all order items
  const orderWithSafeSelectedOptions = {
    ...order.toObject(),
    orderItems: order.orderItems.map(item => ({
      ...item,
      selectedOptions: item.selectedOptions || {}
    }))
  };

  res.json(orderWithSafeSelectedOptions);
});

// Cancel order (supports guest orders)
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Check authorization
  const isOwner = order.user && order.user.toString() === req.user?._id?.toString();
  const isGuestOwner = order.isGuest && req.body.email === order.guestEmail;

  if (!isOwner && !isGuestOwner) {
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

// Admin: get all orders - FIXED: Add selectedOptions safety
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

  // FIXED: Ensure selectedOptions exists for all orders
  const ordersWithSafeSelectedOptions = orders.map(order => ({
    ...order.toObject(),
    orderItems: order.orderItems.map(item => ({
      ...item,
      selectedOptions: item.selectedOptions || {}
    }))
  }));

  res.json({
    orders: ordersWithSafeSelectedOptions,
    page,
    pages: Math.ceil(total / limit),
    total
  });
});

// Get filtered orders for admin - FIXED: Add selectedOptions safety
export const getFilteredOrders = asyncHandler(async (req, res) => {
  const {
    status,
    search,
    page = 1,
    limit = 10
  } = req.query;

  let query = {};
  
  if (status && status !== 'all') {
    query.orderStatus = status;
  }
  
  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { _id: { $regex: search, $options: 'i' } },
      { 'user.name': { $regex: search, $options: 'i' } },
      { 'user.email': { $regex: search, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
      { guestEmail: { $regex: search, $options: 'i' } },
      { guestName: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Order.countDocuments(query);

  // FIXED: Ensure selectedOptions exists for all orders
  const ordersWithSafeSelectedOptions = orders.map(order => ({
    ...order.toObject(),
    orderItems: order.orderItems.map(item => ({
      ...item,
      selectedOptions: item.selectedOptions || {}
    }))
  }));

  res.json({
    orders: ordersWithSafeSelectedOptions,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit)
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
  
  if (orderStatus === "delivered") {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  const updated = await order.save();
  res.json(updated);
});