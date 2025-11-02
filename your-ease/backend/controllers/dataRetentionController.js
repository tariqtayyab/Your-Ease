import asyncHandler from "express-async-handler";
import AnalyticsEvent from "../models/AnalyticsEvent.js";
import cron from 'node-cron';

// Data retention configuration
const RETENTION_POLICIES = {
  analytics: parseInt(process.env.ANALYTICS_RETENTION_DAYS) || 365, // 1 year default
  userData: 730, // 2 years
  backups: 30 // 30 days
};

// Automated data cleanup job
export const scheduleDataCleanup = () => {
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      await cleanupOldAnalyticsData();
      console.log('Data retention cleanup completed');
    } catch (error) {
      console.error('Data cleanup error:', error);
    }
  });
};

// Cleanup old analytics data
export const cleanupOldAnalyticsData = asyncHandler(async (req, res) => {
  const retentionDate = new Date();
  retentionDate.setDate(retentionDate.getDate() - RETENTION_POLICIES.analytics);

  const result = await AnalyticsEvent.deleteMany({
    timestamp: { $lt: retentionDate }
  });

  if (res) {
    res.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} old analytics records`,
      retentionPeriod: `${RETENTION_POLICIES.analytics} days`,
      cutoffDate: retentionDate
    });
  }

  return result;
});

// Data export functionality
export const exportUserData = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const userData = {
    profile: req.user,
    analytics: await AnalyticsEvent.find({ userId }).sort({ timestamp: -1 }),
    // Add other user data exports here (orders, addresses, etc.)
    exportDate: new Date(),
    exportId: generateExportId()
  };

  // Set headers for file download
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=user-data-${userData.exportId}.json`);
  
  res.json(userData);
});

// Data anonymization for GDPR right to be forgotten
export const anonymizeUserData = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Anonymize analytics data
  await AnalyticsEvent.updateMany(
    { userId },
    { 
      $set: { 
        userId: null,
        ipAddress: '0.0.0.0',
        userAgent: 'anonymized',
        email: 'anonymous@user.com',
        name: 'Anonymous User'
      }
    }
  );

  // Add other data anonymization here

  res.json({
    success: true,
    message: 'User data has been anonymized successfully'
  });
});

const generateExportId = () => {
  return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};