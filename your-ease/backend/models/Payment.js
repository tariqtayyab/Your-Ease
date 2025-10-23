import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  methodType: {
    type: String,
    enum: ["card", "bank", "wallet"],
    required: true
  },
  card: {
    last4: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number,
    nameOnCard: String
  },
  bank: {
    bankName: String,
    accountNumber: String,
    accountHolder: String
  },
  wallet: {
    type: String,
    enum: ["jazzcash", "easypaisa", "sadapay", "nayapay", ""],
    default: ""
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Compound index
paymentSchema.index({ user: 1, isDefault: -1 });

// Middleware to ensure only one default payment method
paymentSchema.pre('save', async function(next) {
  if (this.isDefault && this.isActive) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

export default mongoose.model("Payment", paymentSchema);