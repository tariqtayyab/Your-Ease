// backend/services/emailService.js
import nodemailer from 'nodemailer';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  pool: true,
  maxConnections: 1,
  rateDelta: 20000,
  rateLimit: 5,
});

// Verify transporter on startup
transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
    console.log('📧 From:', process.env.EMAIL_USER);
    console.log('📨 To:', process.env.ADMIN_EMAILS);
  }
});

export const sendNewOrderNotification = async (orderId) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials not configured');
    }

    console.log('📦 Fetching order data for email...', orderId);

    // ✅ FIX: Always fetch complete order data from database
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image price');

    if (!order) {
      throw new Error(`Order not found with ID: ${orderId}`);
    }

    console.log('✅ Order data fetched:', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      itemsCount: order.orderItems?.length,
      totalPrice: order.totalPrice,
      customerType: order.isGuest ? 'guest' : 'registered'
    });

    // ✅ FIX: Transform order items to ensure they have required data
    const transformedOrder = {
      ...order.toObject(),
      orderItems: order.orderItems.map(item => ({
        ...item,
        name: item.name || item.product?.name || 'Unnamed Product',
        price: item.price || item.product?.price || 0,
        qty: item.qty || 1
      }))
    };

    const htmlContent = generateOrderEmailHTML(transformedOrder);
    const textContent = generateOrderEmailText(transformedOrder);
    
    const mailOptions = {
      from: {
        name: process.env.SITE_NAME || 'Yourease',
        address: process.env.EMAIL_USER
      },
      to: process.env.ADMIN_EMAILS,
      replyTo: process.env.EMAIL_USER,
      subject: `🎉 New Order #${order.orderNumber} - ${process.env.SITE_NAME || 'Yourease'}`,
      text: textContent,
      html: htmlContent,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    console.log('📧 Attempting to send email...');
    console.log('From:', mailOptions.from);
    console.log('To:', mailOptions.to);
    console.log('Order Number:', order.orderNumber);
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
    
    return result;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    
    if (error.code === 'EENVELOPE') {
      console.log('💡 Tip: Check recipient email address format');
    } else if (error.code === 'EAUTH') {
      console.log('💡 Tip: Verify Gmail app password is correct');
    } else if (error.code === 'ECONNECTION') {
      console.log('💡 Tip: Check internet connection');
    }
    
    throw error;
  }
};

const generateOrderEmailText = (order) => {
  // ✅ FIX: Proper customer information extraction
  const customerName = order.isGuest 
    ? (order.guestName || order.shippingAddress?.fullName || 'Guest Customer')
    : (order.user?.name || order.shippingAddress?.fullName || 'Customer');
  
  const customerEmail = order.isGuest
    ? (order.guestEmail || order.shippingAddress?.email || 'No email provided')
    : (order.user?.email || order.shippingAddress?.email || 'No email provided');
    
  const customerPhone = order.shippingAddress?.phone || 'No phone provided';
  const customerType = order.isGuest ? 'Guest Customer' : 'Registered Customer';
  
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString();
  
  return `
NEW ORDER NOTIFICATION - ${process.env.SITE_NAME || 'Yourease'}

🎉 Congratulations! You have received a new order.

ORDER SUMMARY:
════════════════════════════════════════
Order ID: ${order._id || 'N/A'}
Order Number: #${order.orderNumber || 'N/A'}
Date: ${orderDate}
Customer Type: ${customerType}

CUSTOMER DETAILS:
────────────────
Name: ${customerName}
Email: ${customerEmail}
Phone: ${customerPhone}
Payment Method: ${order.paymentMethod || 'N/A'}

SHIPPING ADDRESS:
────────────────
${order.shippingAddress?.fullName || 'N/A'}
${order.shippingAddress?.address || 'N/A'}
${order.shippingAddress?.city || 'N/A'}, ${order.shippingAddress?.country || 'N/A'}
${order.shippingAddress?.pincode || 'N/A'}

ORDER ITEMS:
────────────────
${(order.orderItems || []).map(item => 
  `▸ ${item.qty || 1}x ${item.name || 'Unnamed Product'} - Rs ${item.price || 0}`
).join('\n')}

ORDER TOTAL:
────────────────
Subtotal: Rs ${order.itemsPrice || 0}
Shipping: Rs ${order.shippingPrice || 0}
Tax: Rs ${order.taxPrice || 0}
──────────────
Total: Rs ${order.totalPrice || 0}

Next Steps:
• Review order details in your admin panel
• Prepare items for shipping
• Update order status when processed

Thank you for using ${process.env.SITE_NAME || 'Yourease'}!
Manage orders: ${process.env.ADMIN_PANEL_URL || 'Your Admin Panel'}
  `.trim();
};

const generateOrderEmailHTML = (order) => {
  // ✅ FIX: Proper customer information extraction
  const customerName = order.isGuest 
    ? (order.guestName || order.shippingAddress?.fullName || 'Guest Customer')
    : (order.user?.name || order.shippingAddress?.fullName || 'Customer');
  
  const customerEmail = order.isGuest
    ? (order.guestEmail || order.shippingAddress?.email || 'No email provided')
    : (order.user?.email || order.shippingAddress?.email || 'No email provided');
    
  const customerPhone = order.shippingAddress?.phone || 'No phone provided';
  const customerType = order.isGuest ? 'Guest Customer' : 'Registered Customer';
  
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order Notification</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f8fafc;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .email-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .email-header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .email-header p {
      font-size: 16px;
      opacity: 0.9;
    }
    .badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      display: inline-block;
      margin-top: 12px;
    }
    .customer-type {
      background: ${order.isGuest ? '#f59e0b' : '#10b981'};
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 8px;
    }
    .email-content {
      padding: 40px 30px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .info-item {
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    .info-label {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 14px;
      font-weight: 500;
      color: #1e293b;
    }
    .order-items {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #f1f5f9;
    }
    .order-item:last-child {
      border-bottom: none;
    }
    .item-details {
      flex: 1;
    }
    .item-name {
      font-weight: 500;
      color: #1e293b;
      margin-bottom: 4px;
    }
    .item-meta {
      font-size: 12px;
      color: #64748b;
    }
    .item-price {
      font-weight: 600;
      color: #059669;
    }
    .order-totals {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }
    .total-row.final {
      border-top: 2px solid #dcfce7;
      margin-top: 12px;
      padding-top: 16px;
      font-size: 18px;
      font-weight: 700;
      color: #065f46;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.3);
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 8px -1px rgba(102, 126, 234, 0.4);
    }
    .footer {
      text-align: center;
      padding: 30px;
      background: #f8fafc;
      color: #64748b;
      font-size: 14px;
      border-top: 1px solid #e2e8f0;
    }
    @media (max-width: 600px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
      .email-content {
        padding: 24px 20px;
      }
      .email-header {
        padding: 30px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      <h1>🎉 New Order Received!</h1>
      <p>You have a new ${order.isGuest ? 'guest' : 'customer'} order waiting for processing</p>
      <div class="badge">
        Order #${order.orderNumber || 'N/A'}
        <span class="customer-type">${customerType}</span>
      </div>
    </div>

    <!-- Content -->
    <div class="email-content">
      <!-- Order Summary -->
      <div class="section">
        <h2 class="section-title">Order Summary</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Order Date</div>
            <div class="info-value">${orderDate}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Order Total</div>
            <div class="info-value" style="color: #059669; font-weight: 600;">Rs ${order.totalPrice || 0}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Payment Method</div>
            <div class="info-value">${order.paymentMethod || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Customer Type</div>
            <div class="info-value">${customerType}</div>
          </div>
        </div>
      </div>

      <!-- Customer Information -->
      <div class="section">
        <h2 class="section-title">Customer Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Customer Name</div>
            <div class="info-value">${customerName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email</div>
            <div class="info-value">${customerEmail}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Phone</div>
            <div class="info-value">${customerPhone}</div>
          </div>
          <div class="info-item" style="grid-column: 1 / -1;">
            <div class="info-label">Shipping Address</div>
            <div class="info-value">
              ${order.shippingAddress?.fullName || 'N/A'}<br>
              ${order.shippingAddress?.address || 'N/A'}<br>
              ${order.shippingAddress?.city || 'N/A'}, ${order.shippingAddress?.country || 'N/A'} ${order.shippingAddress?.pincode || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      <!-- Order Items -->
      <div class="section">
        <h2 class="section-title">Order Items (${(order.orderItems || []).length})</h2>
        <div class="order-items">
          ${(order.orderItems || []).map(item => `
            <div class="order-item">
              <div class="item-details">
                <div class="item-name">${item.name || 'Unnamed Product'}</div>
                <div class="item-meta">Quantity: ${item.qty || 1}</div>
              </div>
              <div class="item-price">Rs ${item.price || 0}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Order Totals -->
      <div class="order-totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>Rs ${order.itemsPrice || 0}</span>
        </div>
        <div class="total-row">
          <span>Shipping:</span>
          <span>Rs ${order.shippingPrice || 0}</span>
        </div>
        <div class="total-row">
          <span>Tax:</span>
          <span>Rs ${order.taxPrice || 0}</span>
        </div>
        <div class="total-row final">
          <span>Total Amount:</span>
          <span>Rs ${order.totalPrice || 0}</span>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.ADMIN_PANEL_URL || '#'}" class="cta-button">
          📋 View Order in Admin Panel
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>This email was automatically generated by ${process.env.SITE_NAME || 'Yourease'} Order Management System</p>
      <p style="margin-top: 8px; font-size: 12px; color: #94a3b8;">
        Please do not reply to this email. For support, contact your system administrator.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

// Add this function to your existing emailService.js

export const sendContactFormEmail = async (formData) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials not configured');
    }

    console.log('📧 Processing contact form submission...', {
      name: formData.name,
      email: formData.email,
      subject: formData.subject
    });

    const htmlContent = generateContactEmailHTML(formData);
    const textContent = generateContactEmailText(formData);
    
    const mailOptions = {
      from: {
        name: process.env.SITE_NAME || 'YourEase',
        address: process.env.EMAIL_USER
      },
      to: process.env.ADMIN_EMAILS,
      replyTo: formData.email, // So you can reply directly to the customer
      subject: `📬 Contact Form: ${formData.subject} - ${process.env.SITE_NAME || 'YourEase'}`,
      text: textContent,
      html: htmlContent,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    console.log('📧 Attempting to send contact form email...');
    console.log('From:', mailOptions.from);
    console.log('To:', mailOptions.to);
    console.log('Customer:', formData.name, `<${formData.email}>`);
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Contact form email sent successfully!');
    console.log('Message ID:', result.messageId);
    
    return result;
  } catch (error) {
    console.error('❌ Contact form email sending failed:', error.message);
    
    if (error.code === 'EENVELOPE') {
      console.log('💡 Tip: Check recipient email address format');
    } else if (error.code === 'EAUTH') {
      console.log('💡 Tip: Verify Gmail app password is correct');
    } else if (error.code === 'ECONNECTION') {
      console.log('💡 Tip: Check internet connection');
    }
    
    throw error;
  }
};

const generateContactEmailText = (formData) => {
  const { name, email, phone, subject, message } = formData;
  const timestamp = new Date().toLocaleString();
  
  return `
CONTACT FORM SUBMISSION - ${process.env.SITE_NAME || 'YourEase'}

📬 You have received a new contact form submission.

CONTACT DETAILS:
════════════════════════════════════════
Name: ${name}
Email: ${email}
Phone: ${phone}
Subject: ${subject}
Submitted: ${timestamp}

MESSAGE:
────────────────
${message}

ACTION REQUIRED:
────────────────
• Review the customer's inquiry
• Respond within 24 hours
• Update customer in your CRM if applicable

Customer Email: ${email}
Customer Phone: ${phone}
Reply-to: ${email}

This message was submitted via the ${process.env.SITE_NAME || 'YourEase'} contact form.
  `.trim();
};

const generateContactEmailHTML = (formData) => {
  const { name, email, phone, subject, message } = formData;
  const timestamp = new Date().toLocaleString();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Form Submission</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f8fafc;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .email-header {
      background: linear-gradient(135deg, #2c9ba3 0%, #248489 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .email-header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .email-header p {
      font-size: 16px;
      opacity: 0.9;
    }
    .badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      display: inline-block;
      margin-top: 12px;
    }
    .email-content {
      padding: 40px 30px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .info-item {
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #2c9ba3;
    }
    .info-label {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 14px;
      font-weight: 500;
      color: #1e293b;
    }
    .message-box {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin-top: 16px;
      white-space: pre-wrap;
      font-family: inherit;
      line-height: 1.6;
    }
    .cta-buttons {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      flex-wrap: wrap;
    }
    .cta-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #2c9ba3 0%, #248489 100%);
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px -1px rgba(44, 155, 163, 0.3);
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 8px -1px rgba(44, 155, 163, 0.4);
    }
    .cta-button.secondary {
      background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
      box-shadow: 0 4px 6px -1px rgba(107, 114, 128, 0.3);
    }
    .cta-button.phone {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
    }
    .footer {
      text-align: center;
      padding: 30px;
      background: #f8fafc;
      color: #64748b;
      font-size: 14px;
      border-top: 1px solid #e2e8f0;
    }
    .urgency-badge {
      background: #fef3c7;
      color: #92400e;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
    }
    @media (max-width: 600px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
      .email-content {
        padding: 24px 20px;
      }
      .email-header {
        padding: 30px 20px;
      }
      .cta-buttons {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      <h1>📬 New Contact Form Submission</h1>
      <p>A customer has reached out via your website contact form</p>
      <div class="badge">
        Submitted: ${timestamp}
      </div>
      ${isUrgentContact(subject) ? `
        <div class="urgency-badge">
          ⚠️ URGENT: Requires immediate attention
        </div>
      ` : ''}
    </div>

    <!-- Content -->
    <div class="email-content">
      <!-- Contact Details -->
      <div class="section">
        <h2 class="section-title">Contact Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Customer Name</div>
            <div class="info-value">${name}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email Address</div>
            <div class="info-value">
              <a href="mailto:${email}" style="color: #2c9ba3; text-decoration: none;">
                ${email}
              </a>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">Phone Number</div>
            <div class="info-value">
              <a href="tel:${phone}" style="color: #059669; text-decoration: none;">
                ${phone}
              </a>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">Subject</div>
            <div class="info-value">${subject}</div>
          </div>
        </div>
      </div>

      <!-- Message -->
      <div class="section">
        <h2 class="section-title">Customer Message</h2>
        <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
      </div>

      <!-- Action Buttons -->
      <div class="cta-buttons">
        <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}&body=Dear ${encodeURIComponent(name)}," class="cta-button">
          ✉️ Reply to Customer
        </a>
        <a href="tel:${phone}" class="cta-button phone">
          📞 Call Customer
        </a>
        <a href="${process.env.ADMIN_PANEL_URL || '#'}" class="cta-button secondary">
          📋 View in Admin Panel
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>This email was automatically generated by ${process.env.SITE_NAME || 'YourEase'} Contact Form System</p>
      <p style="margin-top: 8px; font-size: 12px; color: #94a3b8;">
        Customer submitted this message via the website contact form on ${timestamp}
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

// Helper function to detect urgent contact requests
const isUrgentContact = (subject) => {
  const urgentKeywords = ['urgent', 'emergency', 'asap', 'critical', 'help', 'broken', 'not working', 'issue', 'problem'];
  return urgentKeywords.some(keyword => 
    subject.toLowerCase().includes(keyword)
  );
};  