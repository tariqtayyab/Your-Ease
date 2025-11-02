import asyncHandler from "express-async-handler";
import AnalyticsEvent from "../models/AnalyticsEvent.js";
import mongoose from "mongoose";

// Track analytics event - REMOVED aggressive duplicate prevention
// In analyticsController.js - enhanced duplicate prevention
export const trackEvent = asyncHandler(async (req, res) => {
  try {
    const { eventType, pageUrl, productId, metadata } = req.body;
    const userId = req.user?._id || 'anonymous';

    console.log('📥 Received analytics event:', { eventType, productId, userId });

    // PREVENT DUPLICATES: Check if same user did same event in last 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const existingEvent = await AnalyticsEvent.findOne({
      eventType: eventType,
      userId: userId,
      pageUrl: pageUrl,
      productId: productId || { $exists: false },
      timestamp: { $gte: oneHourAgo }
    });

    // If same event from same user in last 1 hour, don't track again
    if (existingEvent) {
      return res.status(200).json({
        success: true,
        message: 'Event already tracked for this user recently',
        alreadyTracked: true,
        existingEventId: existingEvent._id
      });
    }

    // Only convert to ObjectId if valid
    let processedProductId = productId;
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      processedProductId = new mongoose.Types.ObjectId(productId);
    } else if (productId) {
      processedProductId = productId.toString();
    } else {
      processedProductId = undefined;
    }

    const analyticsEvent = await AnalyticsEvent.create({
      eventType,
      pageUrl,
      productId: processedProductId,
      userId: userId,
      sessionId: req.sessionID,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
      metadata
    });

    console.log('✅ Event saved to DB:', analyticsEvent._id);

    res.status(201).json({ 
      success: true, 
      event: analyticsEvent,
      alreadyTracked: false
    });

  } catch (error) {
    console.error('❌ Analytics tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track event',
      error: error.message
    });
  }
});

// In your analyticsController.js - fix the counting
export const getDashboardData = asyncHandler(async (req, res) => {
  const { period = '7d' } = req.query;
  
  // Calculate date range
  const now = new Date();
  let startDate = new Date();
  
  switch (period) {
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }

  // SIMPLE COUNTING - Remove complex aggregation for now
  const totalPageViews = await AnalyticsEvent.countDocuments({
    eventType: 'page_view',
    timestamp: { $gte: startDate }
  });

  const totalProductViews = await AnalyticsEvent.countDocuments({
    eventType: 'product_view', 
    timestamp: { $gte: startDate }
  });

  const totalAddToCart = await AnalyticsEvent.countDocuments({
    eventType: 'add_to_cart',
    timestamp: { $gte: startDate }
  });

  const totalPurchases = await AnalyticsEvent.countDocuments({
    eventType: 'purchase',
    timestamp: { $gte: startDate }
  });

  // Get popular products (simplified)
  const popularProducts = await AnalyticsEvent.aggregate([
    {
      $match: {
        eventType: 'product_view',
        timestamp: { $gte: startDate },
        productId: { $ne: null }
      }
    },
    {
      $group: {
        _id: '$productId',
        views: { $sum: 1 }
      }
    },
    {
      $sort: { views: -1 }
    },
    {
      $limit: 10
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $project: {
        _id: 1,
        views: 1,
        title: '$product.title',
        image: { $arrayElemAt: ['$product.images.url', 0] }
      }
    }
  ]);

  // Get daily traffic
  const dailyTraffic = await AnalyticsEvent.aggregate([
    {
      $match: {
        eventType: 'page_view',
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
        },
        views: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  res.json({
    success: true,
    period,
    summary: {
      totalPageViews,
      totalProductViews,
      totalAddToCart,
      totalPurchases,
      conversionRate: totalPageViews > 0 ? (totalPurchases / totalPageViews * 100).toFixed(2) : 0
    },
    popularProducts,
    dailyTraffic
  });
});

// Get product-specific analytics with unique user counts
export const getProductAnalytics = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { period = '30d' } = req.query;

  let startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));

  // Get unique user counts for each event type
  const productStats = await AnalyticsEvent.aggregate([
    {
      $match: {
        productId: new mongoose.Types.ObjectId(productId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          eventType: '$eventType',
          userId: '$userId'
        }
      }
    },
    {
      $group: {
        _id: '$_id.eventType',
        uniqueUsers: { $sum: 1 }
      }
    }
  ]);

  const views = productStats.find(stat => stat._id === 'product_view')?.uniqueUsers || 0;
  const addToCarts = productStats.find(stat => stat._id === 'add_to_cart')?.uniqueUsers || 0;
  const purchases = productStats.find(stat => stat._id === 'purchase')?.uniqueUsers || 0;

  res.json({
    success: true,
    productId,
    period,
    views,
    addToCarts,
    purchases,
    cartConversionRate: views > 0 ? ((addToCarts / views) * 100).toFixed(2) : 0,
    purchaseConversionRate: views > 0 ? ((purchases / views) * 100).toFixed(2) : 0
  });
});

// Get real-time data
export const getRealTimeData = asyncHandler(async (req, res) => {
  // Get real-time data for the last 1 hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const realTimeStats = await AnalyticsEvent.aggregate([
    {
      $match: {
        timestamp: { $gte: oneHourAgo }
      }
    },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 }
      }
    }
  ]);

  const activeUsers = await AnalyticsEvent.distinct('userId', {
    timestamp: { $gte: oneHourAgo },
    userId: { $ne: null }
  });

  res.json({
    success: true,
    period: '1h',
    stats: realTimeStats,
    activeUsers: activeUsers.length
  });
});

// Get user viewing history
export const getUserProductViews = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { period = '30d' } = req.query;

  let startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));

  const userViews = await AnalyticsEvent.find({
    userId: userId,
    eventType: 'product_view',
    timestamp: { $gte: startDate }
  }).populate('productId', 'title images').sort({ timestamp: -1 });

  res.json({
    success: true,
    views: userViews,
    totalViews: userViews.length
  });
});

export const getDataExport = asyncHandler(async (req, res) => {
  // Implementation for data export
  res.json({
    success: true,
    message: 'Data export functionality'
  });
});

export const getPrivacySettings = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    settings: {
      dataCollection: true,
      analyticsTracking: true,
      personalizedAds: false,
      dataRetentionPeriod: '365 days'
    }
  });
});