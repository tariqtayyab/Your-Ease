import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import { sendNewOrderNotification } from "../services/emailService.js";

// In your orderController.js - Fix the trackPurchaseBackend function
const trackPurchaseBackend = async (order) => {
  try {
    const measurementId = process.env.VITE_GA_MEASUREMENT_ID;
    const apiSecret = process.env.GA4_API_SECRET;
    
    if (!measurementId || !apiSecret) {
      console.log('GA4: Missing measurement ID or API secret');
      return;
    }

    // Validate API Secret format
    if (apiSecret.length < 20) {
      console.error('GA4: Invalid API Secret format');
      return;
    }
    
    // Prepare items for GA4
    const ga4Items = (order.orderItems || []).map(item => ({
      item_id: item.product?._id?.toString() || item.product?.toString() || `product_${Math.random().toString(36).substr(2, 9)}`,
      item_name: item.name || 'Unknown Product',
      item_category: item.category || 'General',
      price: item.price || 0,
      quantity: item.qty || 1
    }));

    const eventData = {
      client_id: order.user ? `user_${order.user._id}` : `guest_${order._id}`,
      user_id: order.user ? order.user._id.toString() : undefined,
      events: [{
        name: 'purchase',
        params: {
          transaction_id: order._id.toString(),
          order_number: order.orderNumber,
          currency: 'PKR',
          value: order.totalPrice || 0,
          tax: order.taxPrice || 0,
          shipping: order.shippingPrice || 0,
          coupon: order.couponCode || '',
          payment_method: order.paymentMethod || 'cod',
          order_status: order.orderStatus,
          items: ga4Items
        }
      }]
    };

    console.log('GA4: Sending purchase event for order:', order.orderNumber);
    
    const response = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData)
    });

    if (!response.ok) {
      console.error('GA4: Failed to send event. Status:', response.status);
    } else {
      console.log('GA4: Purchase event sent successfully');
    }
    
  } catch (error) {
    console.error('GA4: Backend tracking failed:', error.message);
  }
};

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
      category: item.category || 'General',
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
      category: i.product.category || 'General',
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

  // Track initial order creation in GA4 (but not as purchase yet)
  try {
    await trackPurchaseBackend(createdOrder);
  } catch (gaError) {
    console.error('GA4: Error tracking order creation:', gaError);
  }

  res.status(201).json(createdOrder);
});

// Admin: update order status - UPDATED: Track purchase when order is delivered
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { orderStatus, trackingNumber } = req.body;
  
  const order = await Order.findById(id);
  if (!order) { 
    res.status(404); 
    throw new Error("Order not found"); 
  }

  const previousStatus = order.orderStatus;
  
  if (orderStatus) order.orderStatus = orderStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  
  if (orderStatus === "delivered") {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    
    // TRACK PURCHASE IN GA4 WHEN ORDER IS DELIVERED
    try {
      console.log('GA4: Order delivered, tracking purchase...');
      await trackPurchaseBackend(order);
    } catch (gaError) {
      console.error('GA4: Error tracking delivered order:', gaError);
    }
  }

  const updated = await order.save();
  
  // Also track if status changed from pending/confirmed to delivered
  if ((previousStatus === 'pending' || previousStatus === 'confirmed') && orderStatus === 'delivered') {
    try {
      console.log('GA4: Status changed to delivered, tracking purchase...');
      await trackPurchaseBackend(updated);
    } catch (gaError) {
      console.error('GA4: Error tracking status change to delivered:', gaError);
    }
  }

  res.json(updated);
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
      select: "title images price category" // Added category for GA4
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
      selectedOptions: item.selectedOptions || {},
      category: item.category || 'General'
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
      selectedOptions: item.selectedOptions || {},
      category: item.category || 'General'
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
      selectedOptions: item.selectedOptions || {},
      category: item.category || 'General'
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
      selectedOptions: item.selectedOptions || {},
      category: item.category || 'General'
    }))
  }));

  res.json({
    orders: ordersWithSafeSelectedOptions,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit)
  });
});

// Additional function to track delivered orders (for manual triggering if needed)
export const trackDeliveredOrders = asyncHandler(async (req, res) => {
  if (!req.user?.isAdmin) {
    res.status(401);
    throw new Error("Not authorized");
  }

  // Find all delivered orders that haven't been tracked yet
  const deliveredOrders = await Order.find({ 
    orderStatus: 'delivered',
    ga4Tracked: { $ne: true } // Add this field to your Order model if you want to track which orders have been sent to GA4
  }).populate('user', 'name email');

  let trackedCount = 0;
  let errors = [];

  for (const order of deliveredOrders) {
    try {
      await trackPurchaseBackend(order);
      
      // Mark as tracked (optional - add ga4Tracked field to your Order model)
      // order.ga4Tracked = true;
      // await order.save();
      
      trackedCount++;
      console.log(`GA4: Tracked delivered order: ${order.orderNumber}`);
    } catch (error) {
      errors.push({ order: order.orderNumber, error: error.message });
      console.error(`GA4: Failed to track order ${order.orderNumber}:`, error);
    }
  }

  res.json({
    message: `GA4 tracking completed`,
    tracked: trackedCount,
    errors: errors.length > 0 ? errors : undefined
  });
});