import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["home", "work", "other"],
    default: "home"
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
//   postalCode: {
//     type: String,
//     required: true
//   },
  country: {
    type: String,
    default: "Pakistan"
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  landmark: {
    type: String,
    default: ""
  }
}, { timestamps: true });

// Compound index for user addresses
addressSchema.index({ user: 1, isDefault: -1 });

// Middleware to ensure only one default address per user
addressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

export default mongoose.model("Address", addressSchema);