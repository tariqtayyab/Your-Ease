// src/api/reviewApi.js - UPDATED
import { API_BASE, getAuthConfig } from './index';

// Get reviews for a product (with pagination support)
export const getProductReviews = async (productId, page = 1, limit = 5) => {
  const res = await fetch(`${API_BASE}/products/${productId}/reviews?page=${page}&limit=${limit}`, getAuthConfig());
  const data = await res.json();
  
  // Handle both formats
  if (Array.isArray(data)) {
    return data; // Old format - array of reviews
  } else {
    return data.reviews || []; // New format - object with pagination
  }
};

// Get review statistics using the existing endpoint
export const getProductReviewStats = async (productId) => {
  try {
    // Use the main reviews endpoint but with limit=1 to get minimal data
    const res = await fetch(`${API_BASE}/products/${productId}/reviews?limit=1`, getAuthConfig());
    const data = await res.json();
    
    // If it's the new paginated format
    if (data.pagination) {
      return {
        totalReviews: data.pagination.totalReviews || 0,
        averageRating: await getAverageRatingFromAllReviews(productId),
        ratingDistribution: await getRatingDistribution(productId)
      };
    } 
    // If it's the old array format
    else if (Array.isArray(data)) {
      const reviews = data;
      return calculateReviewStats(reviews);
    }
    // Fallback
    else {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }
};

// Helper function to calculate stats from reviews array
const calculateReviewStats = (reviews) => {
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0;

  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingDistribution[review.rating]++;
    }
  });

  return {
    totalReviews,
    averageRating,
    ratingDistribution
  };
};

// Fallback function to get average rating (if needed)
const getAverageRatingFromAllReviews = async (productId) => {
  try {
    const res = await fetch(`${API_BASE}/products/${productId}/reviews?limit=1000`, getAuthConfig());
    const data = await res.json();
    const reviews = Array.isArray(data) ? data : (data.reviews || []);
    
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  } catch (error) {
    return 0;
  }
};

// Fallback function to get rating distribution (if needed)
const getRatingDistribution = async (productId) => {
  try {
    const res = await fetch(`${API_BASE}/products/${productId}/reviews?limit=1000`, getAuthConfig());
    const data = await res.json();
    const reviews = Array.isArray(data) ? data : (data.reviews || []);
    
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating]++;
      }
    });
    
    return distribution;
  } catch (error) {
    return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  }
};

// Your existing functions remain the same
export const createReview = async (productId, reviewData) => {
  const formData = new FormData();
  
  formData.append('rating', reviewData.rating);
  formData.append('comment', reviewData.comment);
  formData.append('userName', reviewData.userName);
  
  if (reviewData.media && reviewData.media.length > 0) {
    reviewData.media.forEach((file) => {
      formData.append('media', file);
    });
  }

  const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
    method: "POST",
    headers: {
      ...getAuthConfig().headers
    },
    body: formData,
  });
  return res.json();
};

export const markReviewHelpful = async (reviewId) => {
  const res = await fetch(`${API_BASE}/reviews/${reviewId}/helpful`, {
    method: "PUT",
    headers: getAuthConfig().headers
  });
  return res.json();
};

export const deleteReview = async (reviewId) => {
  const res = await fetch(`${API_BASE}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: getAuthConfig().headers
  });
  return res.json();
};