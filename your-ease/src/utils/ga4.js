// Google Analytics 4 Integration
export const GA4 = {
  // Initialize GA4
  init: (measurementId) => {
    if (!measurementId || typeof window === 'undefined') return;

    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href
    });

    console.log('GA4 initialized');
  },

  // Track page views
  trackPageView: (pageTitle, pageLocation, additionalParams = {}) => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_location: pageLocation,
        ...additionalParams
      });
    }
  },

  // Track e-commerce events
  trackViewItem: (product) => {
    if (window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'INR',
        value: product.currentPrice,
        items: [{
          item_id: product._id,
          item_name: product.title,
          item_category: product.category,
          price: product.currentPrice,
          quantity: 1
        }]
      });
    }
  },

  trackAddToCart: (product, quantity = 1) => {
    if (window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'INR',
        value: product.currentPrice * quantity,
        items: [{
          item_id: product._id,
          item_name: product.title,
          item_category: product.category,
          price: product.currentPrice,
          quantity: quantity
        }]
      });
    }
  },

  trackPurchase: (order) => {
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: order._id,
        currency: 'INR',
        value: order.totalAmount,
        tax: order.taxAmount,
        shipping: order.shippingCost,
        items: order.items?.map(item => ({
          item_id: item.productId,
          item_name: item.title,
          item_category: item.category,
          price: item.price,
          quantity: item.quantity
        })) || []
      });
    }
  },

  // Track custom events
  trackEvent: (eventName, parameters = {}) => {
    if (window.gtag) {
      window.gtag('event', eventName, parameters);
    }
  },

  // User ID tracking (when user logs in)
  setUserId: (userId) => {
    if (window.gtag) {
      window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
        user_id: userId
      });
    }
  },

  // Clear user ID (when user logs out)
  clearUserId: () => {
    if (window.gtag) {
      window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
        user_id: null
      });
    }
  }
};