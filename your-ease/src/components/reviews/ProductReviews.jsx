import React, { useState, useEffect } from 'react';
import ReviewsSummary from './ReviewsSummary';
import ReviewForm from './ReviewForm';
import ReviewItem from './ReviewItem';
import { getProductReviews } from '../../api';

const ProductReviews = ({ productId, onAddReview }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsData = await getProductReviews(productId);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  const handleAddReview = async (reviewData) => {
    try {
      // Refresh reviews after adding a new one
      const reviewsData = await getProductReviews(productId);
      setReviews(reviewsData);
      setShowReviewForm(false);
      
      if (onAddReview) {
        onAddReview(reviewData);
      }
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <ReviewsSummary 
        reviews={reviews} 
        onAddReviewClick={() => setShowReviewForm(true)}
      />
      
      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm 
          productId={productId}
          onSubmit={handleAddReview}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      {/* Reviews Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-xl font-bold text-gray-900">
          Customer Reviews ({reviews.length})
        </h3>
        
        {/* Sort Options */}
        {reviews.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.length > 0 ? (
          sortedReviews.map((review) => (
            <ReviewItem key={review._id} review={review} /> 
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h4>
              <p className="text-gray-600 mb-6">
                Be the first to share your thoughts about this product!
              </p>
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors shadow-lg"
              >
                Write the First Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;