// src/components/ProductReviews.jsx - OPTIMIZED
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReviewsSummary from './ReviewsSummary';
import ReviewForm from './ReviewForm';
import ReviewItem from './ReviewItem';
import LoadingSpinner from '../LoadingSpinner';
import EndOfResults from '../EndOfResults';
import { getProductReviews, deleteReview, getProductReviewStats } from '../../api';

const ProductReviews = ({ productId, onAddReview, user }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [reviews, setReviews] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const observerRef = useRef();
  const loadingRef = useRef();

  const LIMIT = 5;

  // Function to remove duplicate reviews
  const removeDuplicateReviews = (reviewsArray) => {
    const seen = new Set();
    return reviewsArray.filter(review => {
      if (seen.has(review._id)) {
        console.warn('Removing duplicate review:', review._id);
        return false;
      }
      seen.add(review._id);
      return true;
    });
  };

  // Handle delete review function
  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      setReviews(prev => prev.filter(review => review._id !== reviewId));
      // Refresh stats after deletion
      fetchStats();
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  };

  // Fetch stats - optimized
  const fetchStats = useCallback(async () => {
    if (!productId) return;
    
    try {
      setStatsLoading(true);
      const reviewStats = await getProductReviewStats(productId);
      setStats(reviewStats);
    } catch (error) {
      console.error('Error fetching review stats:', error);
      // Fallback to calculating from local reviews
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

      setStats({
        totalReviews,
        averageRating,
        ratingDistribution
      });
    } finally {
      setStatsLoading(false);
    }
  }, [productId, reviews]);

  // Fetch initial reviews and stats
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setInitialLoading(true);
        
        // Fetch reviews and stats in parallel
        const [reviewsResponse] = await Promise.all([
          getProductReviews(productId, 1, LIMIT),
          fetchStats() // Fetch stats in parallel
        ]);
        
        const reviewsData = reviewsResponse.reviews || reviewsResponse;
        const uniqueReviews = removeDuplicateReviews(reviewsData);
        setReviews(uniqueReviews);
        setHasMore(reviewsResponse.pagination?.hasMore ?? (uniqueReviews.length === LIMIT));
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    if (productId) {
      fetchInitialData();
    }
  }, [productId]);

  // Load more reviews function
  const loadMoreReviews = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await getProductReviews(productId, nextPage, LIMIT);
      const newReviews = response.reviews || response;
      const uniqueNewReviews = removeDuplicateReviews(newReviews);
      const combinedReviews = removeDuplicateReviews([...reviews, ...uniqueNewReviews]);
      
      setReviews(combinedReviews);
      setPage(nextPage);
      setHasMore(response.pagination?.hasMore ?? (uniqueNewReviews.length === LIMIT));
    } catch (error) {
      console.error('Error loading more reviews:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [productId, page, loadingMore, hasMore, reviews]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreReviews();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [loadMoreReviews, hasMore, loadingMore]);

  // Sort reviews and ensure no duplicates
  const sortedReviews = removeDuplicateReviews([...reviews]).sort((a, b) => {
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
      // Refresh both reviews and stats after adding a new review
      const [reviewsResponse] = await Promise.all([
        getProductReviews(productId, 1, LIMIT),
        fetchStats()
      ]);
      
      const reviewsData = reviewsResponse.reviews || reviewsResponse;
      const uniqueReviews = removeDuplicateReviews(reviewsData);
      
      setReviews(uniqueReviews);
      setPage(1);
      setHasMore(reviewsResponse.pagination?.hasMore ?? (uniqueReviews.length === LIMIT));
      setShowReviewForm(false);
      
      if (onAddReview) {
        onAddReview(reviewData);
      }
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Reviews Summary - Only show skeleton on initial load */}
      <ReviewsSummary 
        productId={productId}
        reviews={reviews} 
        onAddReviewClick={() => setShowReviewForm(true)}
        stats={stats}
        loading={initialLoading || statsLoading}
      />
      
      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm 
          productId={productId}
          onSubmit={handleAddReview}
          onCancel={() => setShowReviewForm(false)}
          user={user}
        />
      )}

      {/* Reviews Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Sort Options */}
        {sortedReviews.length > 0 && (
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
          <>
            {sortedReviews.map((review) => (
              <ReviewItem 
                key={`${review._id}-${review.createdAt}`}
                review={review} 
                currentUser={user}
                onDeleteReview={handleDeleteReview}
              />
            ))}
            
            {/* Loading spinner for infinite scroll */}
            {loadingMore && <LoadingSpinner />}
            
            {/* End of results message */}
            {!hasMore && reviews.length > 0 && <EndOfResults />}
            
            {/* Observer target for infinite scroll */}
            {hasMore && !loadingMore && (
              <div ref={loadingRef} className="h-4" />
            )}
          </>
        ) : (
          !initialLoading && (
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
          )
        )}
      </div>

      {/* Initial loading state */}
      {initialLoading && reviews.length === 0 && <LoadingSpinner />}
    </div>
  );
};

export default ProductReviews;