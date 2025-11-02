// backend/routes/contactRoutes.js
import express from 'express';
import { submitContactForm, getContactInfo } from '../controllers/contactController.js';

const router = express.Router();

// POST /api/contact - Submit contact form
router.post('/contact', submitContactForm);

// GET /api/contact/info - Get contact information
router.get('/contact/info', getContactInfo);

// Health check
router.get('/contact/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Contact service is running',
    timestamp: new Date().toISOString(),
    service: 'YourEase Contact API'
  });
});

export default router;