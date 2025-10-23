import { API_BASE, getAuthConfig } from './index';

// Get reviews for a product
export const getProductReviews = async (productId) => {
  const res = await fetch(`${API_BASE}/products/${productId}/reviews`, getAuthConfig());
  return res.json();
};

// Create a review
export const createReview = async (productId, reviewData) => {
  const formData = new FormData();
  
  // Append text fields
  formData.append('rating', reviewData.rating);
  formData.append('comment', reviewData.comment);
  formData.append('userName', reviewData.userName);
  
  // Append media files
  if (reviewData.media && reviewData.media.length > 0) {
    reviewData.media.forEach((file) => {
      formData.append('media', file);
    });
  }

  const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
    method: "POST",
    headers: {
      ...getAuthConfig().headers
      // Don't set Content-Type for FormData, let browser set it with boundary
    },
    body: formData,
  });
  return res.json();
};

// Mark review as helpful
export const markReviewHelpful = async (reviewId) => {
  const res = await fetch(`${API_BASE}/reviews/${reviewId}/helpful`, {
    method: "PUT",
    headers: getAuthConfig().headers
  });
  return res.json();
};

// Delete a review
export const deleteReview = async (reviewId) => {
  const res = await fetch(`${API_BASE}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: getAuthConfig().headers
  });
  return res.json();
};