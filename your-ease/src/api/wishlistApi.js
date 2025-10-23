import { API_BASE, getAuthConfig } from './index';

// Get wishlist
export const getWishlist = async () => {
  const res = await fetch(`${API_BASE}/wishlist`, getAuthConfig());
  return res.json();
};

// Add to wishlist
export const addToWishlist = async (productId) => {
  const res = await fetch(`${API_BASE}/wishlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthConfig().headers
    },
    body: JSON.stringify({ productId }),
  });
  return res.json();
};

// Remove from wishlist
export const removeFromWishlist = async (productId) => {
  const res = await fetch(`${API_BASE}/wishlist/${productId}`, {
    method: "DELETE",
    headers: getAuthConfig().headers
  });
  return res.json();
};

// Clear wishlist
export const clearWishlist = async () => {
  const res = await fetch(`${API_BASE}/wishlist`, {
    method: "DELETE",
    headers: getAuthConfig().headers
  });
  return res.json();
};