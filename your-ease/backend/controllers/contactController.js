// backend/controllers/contactController.js
import { sendContactFormEmail } from '../services/emailService.js';

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled: name, email, phone, subject, message'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Phone validation (basic Pakistani phone format)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number'
      });
    }

    console.log('📝 Processing contact form submission:', {
      name,
      email,
      phone,
      subject,
      messageLength: message.length
    });

    // Send email
    const result = await sendContactFormEmail({
      name,
      email,
      phone,
      subject,
      message
    });

    res.status(200).json({
      success: true,
      message: 'Message sent successfully! We will get back to you within 24 hours.',
      data: {
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Contact form submission error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later or contact us directly.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getContactInfo = (req, res) => {
  res.json({
    success: true,
    data: {
      supportEmail: process.env.EMAIL_USER,
      responseTime: 'Within 24 hours',
      availability: 'Mon-Sun, 9AM - 11PM PKT'
    }
  });
};