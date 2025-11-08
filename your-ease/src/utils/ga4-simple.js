// src/utils/ga4-simple.js
import ga4 from './ga4-analytics.js';

// Re-export all methods
export const trackPageView = (...args) => ga4.trackPageView(...args);
export const trackEvent = (...args) => ga4.trackEvent(...args);
export const trackProductView = (...args) => ga4.trackProductView(...args);
export const trackAddToCart = (...args) => ga4.trackAddToCart(...args);
export const trackRemoveFromCart = (...args) => ga4.trackRemoveFromCart(...args);
export const trackBeginCheckout = (...args) => ga4.trackBeginCheckout(...args);
export const trackPurchase = (...args) => ga4.trackPurchase(...args);
export const trackWishlist = (...args) => ga4.trackWishlist(...args);
export const trackShare = (...args) => ga4.trackShare(...args);

export default ga4;