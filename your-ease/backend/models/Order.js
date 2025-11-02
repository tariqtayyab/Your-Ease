import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Changed to false for guest orders
      ref: "User",
    },
    isGuest: {
      type: Boolean,
      required: true,
      default: false,
    },
    guestEmail: {
      type: String,
      required: function() {
        return this.isGuest === true;
      },
    },
    guestName: {
      type: String,
      required: function() {
        return this.isGuest === true;
      },
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true },
        // ADD THIS: Selected options field
        selectedOptions: {
          type: Object,
          default: {}
        }
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      email: { type: String, required: true }, // Added email for guest orders
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      pincode: { type: String, required: false },
      phone: { type: String, required: true },
      phone2: { type: String, required: false }, // New optional phone field
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    orderStatus: {
      type: String,
      required: true,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    trackingNumber: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;