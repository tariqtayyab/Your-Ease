import asyncHandler from "express-async-handler";
import Address from "../models/Address.js";

// @desc    Get user's addresses
// @route   GET /api/addresses
// @access  Private
export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
  res.json(addresses);
});

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
export const addAddress = asyncHandler(async (req, res) => {
  const {
    type,
    fullName,
    email,
    phone,
    address,
    city,
    state,
    postalCode,
    country,
    isDefault,
    landmark
  } = req.body;

  const newAddress = new Address({
    user: req.user._id,
    type,
    fullName,
    email,
    phone,
    address,
    city,
    state,
    postalCode,
    country: country || "Pakistan",
    isDefault: isDefault || false,
    landmark
  });

  const savedAddress = await newAddress.save();
  res.status(201).json(savedAddress);
});

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
export const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  // Check if address belongs to user
  if (address.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to update this address");
  }

  const updatedAddress = await Address.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json(updatedAddress);
});

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
export const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  // Check if address belongs to user
  if (address.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to delete this address");
  }

  await Address.findByIdAndDelete(req.params.id);
  res.json({ message: "Address removed successfully" });
});

// @desc    Set default address
// @route   PATCH /api/addresses/:id/default
// @access  Private
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  // Check if address belongs to user
  if (address.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to update this address");
  }

  // This will trigger the pre-save middleware to update other addresses
  address.isDefault = true;
  await address.save();

  res.json(address);
});