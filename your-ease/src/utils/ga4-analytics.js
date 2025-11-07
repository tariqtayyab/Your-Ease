// Enhanced GA4 E-commerce Tracking - Production Ready
class GA4Analytics {
  constructor() {
    this.measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    this.initialized = false;
    this.initPromise = null;
  }

  async ensureInitialized() {
    if (this.initialized) return true;
    
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.initGA4();
    return this.initPromise;
  }

  async initGA4() {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.log('GA4: Not in browser environment');
      return false;
    }

    if (!this.measurementId) {
      console.warn('GA4: Measurement ID not found');
      return false;
    }

    // Check if already initialized by another script
    if (window.gtag && window.dataLayer) {
      this.initialized = true;
      console.log('GA4: Already initialized by another script');
      return true;
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      
      script.onload = () => {
        try {
          window.dataLayer = window.dataLayer || [];
          window.gtag = function gtag() {
            window.dataLayer.push(arguments);
          };

          window.gtag('js', new Date());
          window.gtag('config', this.measurementId, {
            page_title: document.title,
            page_location: window.location.href,
            send_page_view: false
          });

          this.initialized = true;
          console.log('GA4: Initialized successfully');
          
          // Track initial page view
          this.trackPageView('Initial Page Load');
          resolve(true);
        } catch (error) {
          console.error('GA4: Error during initialization:', error);
          resolve(false);
        }
      };

      script.onerror = () => {
        console.error('GA4: Failed to load script');
        resolve(false);
      };

      // ✅ FIXED: Append to body instead of head to prevent render blocking
      document.body.appendChild(script);
    });
  }

  async trackPageView(pageTitle, customParams = {}) {
    await this.ensureInitialized();
    if (!this.initialized) return;
    
    window.gtag('event', 'page_view', {
      page_title: pageTitle || document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      ...customParams
    });
  }

  async trackEvent(eventName, parameters = {}) {
    await this.ensureInitialized();
    if (!this.initialized) return;
    
    window.gtag('event', eventName, parameters);
  }

  async trackProductView(product) {
    if (!product) return;
    await this.ensureInitialized();
    if (!this.initialized) return;
    
    const eventData = {
      currency: 'PKR',
      value: product.currentPrice || product.price,
      items: [{
        item_id: product._id || product.id,
        item_name: product.title,
        item_category: product.category,
        item_brand: product.brand || 'YourEase',
        price: product.currentPrice || product.price,
        quantity: 1
      }]
    };

    if (product.oldPrice && product.oldPrice > (product.currentPrice || product.price)) {
      const discount = product.oldPrice - (product.currentPrice || product.price);
      eventData.items[0].discount = discount;
    }

    this.trackEvent('view_item', eventData);
  }

  async trackAddToCart(product, quantity = 1, selectedOptions = {}) {
    if (!product) return;
    await this.ensureInitialized();
    if (!this.initialized) return;

    const eventData = {
      currency: 'PKR',
      value: (product.currentPrice || product.price) * quantity,
      items: [{
        item_id: product._id || product.id,
        item_name: product.title,
        item_category: product.category,
        item_variant: Object.values(selectedOptions).join(', ') || 'default',
        price: product.currentPrice || product.price,
        quantity: quantity
      }]
    };

    this.trackEvent('add_to_cart', eventData);
  }

  async trackRemoveFromCart(product, quantity = 1) {
    if (!product) return;
    await this.ensureInitialized();
    if (!this.initialized) return;

    const eventData = {
      currency: 'PKR',
      value: (product.currentPrice || product.price) * quantity,
      items: [{
        item_id: product._id || product.id,
        item_name: product.title,
        item_category: product.category,
        price: product.currentPrice || product.price,
        quantity: quantity
      }]
    };

    this.trackEvent('remove_from_cart', eventData);
  }

  async trackBeginCheckout(cartItems) {
    await this.ensureInitialized();
    if (!this.initialized || !cartItems.length) return;

    const totalValue = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const eventData = {
      currency: 'PKR',
      value: totalValue,
      items: cartItems.map(item => ({
        item_id: item._id || item.id,
        item_name: item.title,
        item_category: item.category,
        item_variant: item.selectedOptions ? Object.values(item.selectedOptions).join(', ') : 'default',
        price: item.price,
        quantity: item.quantity
      }))
    };

    this.trackEvent('begin_checkout', eventData);
  }

  async trackPurchase(order) {
    if (!order) return;
    await this.ensureInitialized();
    if (!this.initialized) return;

    const eventData = {
      transaction_id: order._id || order.orderNumber,
      currency: 'PKR',
      value: order.totalAmount || order.totalPrice,
      tax: order.taxAmount || 0,
      shipping: order.shippingCost || 0,
      coupon: order.couponCode || '',
      payment_method: order.paymentMethod || 'unknown',
      items: (order.items || order.orderItems || []).map(item => ({
        item_id: item.productId || item._id,
        item_name: item.title || item.name,
        item_category: item.category,
        item_variant: item.selectedOptions ? Object.values(item.selectedOptions).join(', ') : 'default',
        price: item.price,
        quantity: item.quantity || item.qty
      }))
    };

    this.trackEvent('purchase', eventData);
  }

  async trackWishlist(product, action = 'add') {
    if (!product) return;
    await this.ensureInitialized();
    if (!this.initialized) return;

    const eventData = {
      currency: 'PKR',
      value: product.currentPrice || product.price,
      items: [{
        item_id: product._id || product.id,
        item_name: product.title,
        item_category: product.category,
        price: product.currentPrice || product.price
      }]
    };

    this.trackEvent(`${action}_to_wishlist`, eventData);
  }

  async trackShare(product, method = 'direct') {
    if (!product) return;
    await this.ensureInitialized();
    if (!this.initialized) return;
    
    this.trackEvent('share', {
      method: method,
      content_type: 'product',
      item_id: product._id || product.id
    });
  }
}

// Create singleton instance
const ga4 = new GA4Analytics();

// Export individual methods for easy use
export const {
  trackPageView,
  trackEvent,
  trackProductView,
  trackAddToCart,
  trackRemoveFromCart,
  trackBeginCheckout,
  trackPurchase,
  trackWishlist,
  trackShare
} = ga4;

export default ga4;