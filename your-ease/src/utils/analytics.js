import { GA4 } from './ga4';

// Production-ready analytics tracking utility
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// GDPR-compliant consent management
let analyticsConsent = localStorage.getItem('analyticsConsent') === 'true';
let ga4Consent = localStorage.getItem('ga4Consent') === 'true';

// Enhanced duplicate prevention in analytics.js
const getTrackedEvents = () => {
  try {
    const stored = sessionStorage.getItem('analytics_tracked_events');
    if (stored) {
      const events = JSON.parse(stored);
      const currentTime = Date.now();
      // Keep events from last 1 hour only
      const recentEvents = events.filter(event => 
        currentTime - event.timestamp < 60 * 60 * 1000 // 1 hour
      );
      return new Set(recentEvents.map(e => e.id));
    }
    return new Set();
  } catch (error) {
    return new Set();
  }
};

const saveTrackedEvent = (eventId) => {
  try {
    const stored = sessionStorage.getItem('analytics_tracked_events');
    let events = stored ? JSON.parse(stored) : [];
    
    events.push({
      id: eventId,
      timestamp: Date.now()
    });
    
    // Keep only last 100 events
    if (events.length > 100) {
      events = events.slice(-100);
    }
    
    sessionStorage.setItem('analytics_tracked_events', JSON.stringify(events));
  } catch (error) {
    console.warn('Could not save tracked event');
  }
};

let trackedEvents = getTrackedEvents();

// Generate event ID with user-specific tracking
const generateEventId = (eventType, data = {}) => {
  const userId = 'anonymous'; // You can get from localStorage if user is logged in
  
  // For page views: track once per page per user per hour
  if (eventType === 'page_view') {
    const path = window.location.pathname;
    const hour = Math.floor(Date.now() / 1000 / 3600); // Current hour
    return `page_view_${path}_${userId}_${hour}`;
  }
  
  // For product views: track once per product per user per hour
  if (eventType === 'product_view' && data.productId) {
    const hour = Math.floor(Date.now() / 1000 / 3600);
    return `product_view_${data.productId}_${userId}_${hour}`;
  }
  
  // For other events: track once per event type per user per hour
  const hour = Math.floor(Date.now() / 1000 / 3600);
  return `${eventType}_${userId}_${hour}`;
};

export const setAnalyticsConsent = (consent, ga4Enabled = false) => {
  analyticsConsent = consent;
  ga4Consent = ga4Enabled;
  
  localStorage.setItem('analyticsConsent', consent.toString());
  localStorage.setItem('ga4Consent', ga4Enabled.toString());

  if (ga4Enabled && import.meta.env.VITE_GA_MEASUREMENT_ID) {
    GA4.init(import.meta.env.VITE_GA_MEASUREMENT_ID);
  }
};

export const getConsentStatus = () => ({
  analytics: analyticsConsent,
  ga4: ga4Consent
});

// Enhanced tracking with balanced duplicate prevention
const trackEvent = async (eventType, data = {}) => {
  // Don't track if no consent for analytics
  if (!analyticsConsent && !ga4Consent) {
    return;
  }

  // Generate event ID
  const eventId = generateEventId(eventType, data);
  
  // Check if we already tracked this event recently (only for same minute)
  if (trackedEvents.has(eventId)) {
    console.log(`🔄 Skipping duplicate event (recently tracked): ${eventType}`);
    return;
  }

  // Mark as tracked
  trackedEvents.add(eventId);
  saveTrackedEvent(eventId);

  const eventData = {
    eventType,
    pageUrl: window.location.href,
    timestamp: new Date().toISOString(),
    ...data
  };

  console.log(`📊 Sending analytics event: ${eventType}`, eventData);

  // Track in your database if consent given
  if (analyticsConsent) {
    try {
      const response = await fetch(`${API_URL}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log(`✅ Event tracked successfully: ${eventType}`);
      
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  // Track in GA4 if consent given
  if (ga4Consent) {
    try {
      switch (eventType) {
        case 'page_view':
          GA4.trackPageView(data.pageName || document.title, window.location.href);
          break;
        case 'product_view':
          if (data.product) {
            GA4.trackViewItem(data.product);
          }
          break;
        case 'add_to_cart':
          if (data.product) {
            GA4.trackAddToCart(data.product, data.quantity || 1);
          }
          break;
        case 'purchase':
          if (data.order) {
            GA4.trackPurchase(data.order);
          }
          break;
        default:
          GA4.trackEvent(eventType, data);
      }
    } catch (error) {
      console.error('GA4 tracking error:', error);
    }
  }

  // Development logging
  if (import.meta.env.DEV) {
    console.log(`📊 Analytics: ${eventType}`, eventData);
  }
};

// Enhanced analytics object
export const analytics = {
  // Consent management
  setConsent: setAnalyticsConsent,
  getConsent: getConsentStatus,

  // User management
  setUserId: (userId) => {
    if (ga4Consent && userId) {
      GA4.setUserId(userId);
    }
  },
  
  clearUserId: () => {
    if (ga4Consent) {
      GA4.clearUserId();
    }
  },

  // Core tracking function
  trackEvent: trackEvent,

  // Page views - track every 30 seconds max
  trackPageView: (pageName, additionalData = {}) => {
    trackEvent('page_view', { 
      pageName: pageName || document.title, 
      ...additionalData 
    });
  },

  // Product events - track every 1 minute max per product
  trackProductView: (product) => {
    if (!product || !product._id) {
      console.warn('Invalid product data for tracking');
      return;
    }
    
    trackEvent('product_view', {
      productId: product._id,
      productTitle: product.title,
      productPrice: product.currentPrice || product.price,
      productCategory: product.category,
      product
    });
  },

  trackAddToCart: (product, quantity = 1) => {
    if (!product || !product._id) {
      console.warn('Invalid product data for add to cart tracking');
      return;
    }
    
    trackEvent('add_to_cart', {
      productId: product._id,
      productTitle: product.title,
      productPrice: product.currentPrice || product.price,
      quantity,
      totalPrice: (product.currentPrice || product.price) * quantity,
      product
    });
  },

  trackRemoveFromCart: (product, quantity = 1) => {
    if (!product || !product._id) {
      console.warn('Invalid product data for remove from cart tracking');
      return;
    }
    
    trackEvent('remove_from_cart', {
      productId: product._id,
      productTitle: product.title,
      quantity,
      totalPrice: (product.currentPrice || product.price) * quantity,
      product
    });
  },

  // Checkout events
  trackBeginCheckout: (cart) => {
    if (!cart || !Array.isArray(cart)) {
      console.warn('Invalid cart data for checkout tracking');
      return;
    }
    
    const totalValue = cart.reduce((sum, item) => sum + ((item.price || item.currentPrice) * (item.quantity || 1)), 0);
    
    trackEvent('begin_checkout', {
      totalValue,
      items: cart.map(item => ({
        productId: item._id || item.id,
        productTitle: item.title,
        price: item.price || item.currentPrice,
        quantity: item.quantity || 1
      }))
    });
  },

  trackPurchase: (order) => {
    if (!order || !order._id) {
      console.warn('Invalid order data for purchase tracking');
      return;
    }
    
    trackEvent('purchase', {
      orderId: order._id,
      totalValue: order.totalAmount || order.totalValue,
      items: (order.items || []).map(item => ({
        productId: item.productId || item._id,
        productTitle: item.title,
        price: item.price,
        quantity: item.quantity || 1
      }))
    });
  },

  // Search events
  trackSearch: (searchQuery, resultsCount = 0) => {
    if (!searchQuery) {
      console.warn('Invalid search query for tracking');
      return;
    }
    
    trackEvent('search', {
      searchQuery: searchQuery.toString(),
      resultsCount: parseInt(resultsCount) || 0
    });
  },

  // Consent events
  trackConsentAccepted: (type) => {
    trackEvent('cookie_consent_accepted', { type });
  },

  trackConsentUpdated: (consentSettings) => {
    trackEvent('cookie_consent_updated', consentSettings);
  },

  // Manual cleanup if needed
  clearTrackedEvents: () => {
    trackedEvents.clear();
    sessionStorage.removeItem('analytics_tracked_events');
    console.log('🧹 Cleared tracked events cache');
  },

  // Debug method
  getTrackedEvents: () => {
    return [...trackedEvents];
  }
};

// Also export trackEvent as standalone function
export { trackEvent };
export default analytics;