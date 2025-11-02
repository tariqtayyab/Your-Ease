import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: [
  'page_view', 'product_view', 'add_to_cart', 'remove_from_cart', 
  'begin_checkout', 'purchase', 'search',
  'cookie_consent_accepted', 'cookie_consent_updated',
  'test_simple', 'custom_event', 'test_complete'  // Add this
]
  },
  pageUrl: String,
  productId: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Product'
  },
  userId: String,
  sessionId: String,
  userAgent: String,
  ipAddress: String,
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
analyticsEventSchema.index({ eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ productId: 1, timestamp: -1 });
analyticsEventSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model("AnalyticsEvent", analyticsEventSchema);