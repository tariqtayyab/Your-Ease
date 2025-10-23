import asyncHandler from "express-async-handler";
import Payment from "../models/Payment.js";

// @desc    Get user's payment methods
// @route   GET /api/payments
// @access  Private
export const getPaymentMethods = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ 
    user: req.user._id,
    isActive: true 
  }).sort({ isDefault: -1, createdAt: -1 });
  
  res.json(payments);
});

// @desc    Add new payment method
// @route   POST /api/payments
// @access  Private
export const addPaymentMethod = asyncHandler(async (req, res) => {
  const {
    methodType,
    card,
    bank,
    wallet,
    isDefault
  } = req.body;

  // Validate based on method type
  if (methodType === "card" && (!card?.last4 || !card?.brand)) {
    res.status(400);
    throw new Error("Card details are required for card payments");
  }

  if (methodType === "bank" && (!bank?.bankName || !bank?.accountNumber)) {
    res.status(400);
    throw new Error("Bank details are required for bank transfers");
  }

  if (methodType === "wallet" && !wallet) {
    res.status(400);
    throw new Error("Wallet type is required for wallet payments");
  }

  const newPayment = new Payment({
    user: req.user._id,
    methodType,
    card: methodType === "card" ? card : undefined,
    bank: methodType === "bank" ? bank : undefined,
    wallet: methodType === "wallet" ? wallet : "",
    isDefault: isDefault || false
  });

  const savedPayment = await newPayment.save();
  res.status(201).json(savedPayment);
});

// @desc    Update payment method
// @route   PUT /api/payments/:id
// @access  Private
export const updatePaymentMethod = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    res.status(404);
    throw new Error("Payment method not found");
  }

  // Check if payment method belongs to user
  if (payment.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to update this payment method");
  }

  const updatedPayment = await Payment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json(updatedPayment);
});

// @desc    Delete payment method
// @route   DELETE /api/payments/:id
// @access  Private
export const deletePaymentMethod = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    res.status(404);
    throw new Error("Payment method not found");
  }

  // Check if payment method belongs to user
  if (payment.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to delete this payment method");
  }

  // Soft delete by setting isActive to false
  payment.isActive = false;
  await payment.save();

  res.json({ message: "Payment method removed successfully" });
});

// @desc    Set default payment method
// @route   PATCH /api/payments/:id/default
// @access  Private
export const setDefaultPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    res.status(404);
    throw new Error("Payment method not found");
  }

  // Check if payment method belongs to user
  if (payment.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to update this payment method");
  }

  // This will trigger the pre-save middleware to update other payment methods
  payment.isDefault = true;
  await payment.save();

  res.json(payment);
});