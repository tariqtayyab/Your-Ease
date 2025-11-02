// src/components/ProductReviews.jsx - UPDATED
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReviewsSummary from './ReviewsSummary';
import ReviewForm from './ReviewForm';
import ReviewItem from './ReviewItem';
import LoadingSpinner from '../LoadingSpinner';
import EndOfResults from '../EndOfResults';
import { getProductReviews, deleteReview,getProductReviewStats  } from '../../api';

const ProductReviews = ({ productId, onAddReview, user }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState(null);
  const observerRef = useRef();
  const loadingRef = useRef();

  const LIMIT = 5; // Load 5 reviews at a time

  // Handle delete review function
  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      // Remove the deleted review from state
      setReviews(prev => prev.filter(review => review._id !== reviewId));
      // You might also want to refetch review stats here
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error; // This will be caught in ReviewItem
    }
  };

  // Fetch initial reviews
  useEffect(() => {
    const fetchInitialReviews = async () => {
      try {
        setLoading(true);
        const response = await getProductReviews(productId, 1, LIMIT);
        setReviews(response.reviews || response);
        setHasMore(response.pagination?.hasMore ?? (response.length === LIMIT));
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialReviews();
  }, [productId]);

  useEffect(() => {
      const fetchStats = async () => {
        setLoading(true);
        try {
          if (productId) {
            const reviewStats = await getProductReviewStats(productId);
            setStats(reviewStats);
          } else {
            // Calculate from provided reviews array (fallback)
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
          }
        } catch (error) {
          console.error('Error fetching review stats:', error);
          // Set default stats on error
          setStats({
            totalReviews: 0,
            averageRating: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
          });
        } finally {
          setLoading(false);
        }
      };
  
      fetchStats();
    }, [productId, reviews]);

  // Load more reviews function
  const loadMoreReviews = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const nextPage = page + 1;
      const response = await getProductReviews(productId, nextPage, LIMIT);
      const newReviews = response.reviews || response;
      
      setReviews(prev => [...prev, ...newReviews]);
      setPage(nextPage);
      setHasMore(response.pagination?.hasMore ?? (newReviews.length === LIMIT));
    } catch (error) {
      console.error('Error loading more reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [productId, page, loading, hasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || loading) return;

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
  }, [loadMoreReviews, hasMore, loading]);

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
      const response = await getProductReviews(productId, 1, LIMIT);
      setReviews(response.reviews || response);
      setPage(1);
      setHasMore(response.pagination?.hasMore ?? (response.length === LIMIT));
      setShowReviewForm(false);
      
      if (onAddReview) {
        onAddReview(reviewData);
      }
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  // Skeleton loader for initial loading
  // if (loading && reviews.length === 0) {
  //   return (
  //     <div className="space-y-6 animate-pulse">
  //       {/* Reviews Summary Skeleton */}
  //       <div className="bg-white rounded-2xl shadow-sm p-6">
  //         <div className="flex flex-col md:flex-row gap-8">
  //           {/* Overall Rating Skeleton */}
  //           <div className="flex-1 space-y-4">
  //             <div className="h-8 bg-gray-300 rounded w-32"></div>
  //             <div className="h-6 bg-gray-300 rounded w-24"></div>
  //             <div className="h-4 bg-gray-300 rounded w-40"></div>
  //             <div className="h-12 bg-gray-300 rounded w-48"></div>
  //           </div>
            
  //           {/* Rating Breakdown Skeleton */}
  //           <div className="flex-1 space-y-3">
  //             {[...Array(5)].map((_, index) => (
  //               <div key={index} className="flex items-center gap-3">
  //                 <div className="h-4 bg-gray-300 rounded w-16"></div>
  //                 <div className="flex-1 h-2 bg-gray-300 rounded"></div>
  //                 <div className="h-4 bg-gray-300 rounded w-8"></div>
  //               </div>
  //             ))}
  //           </div>
  //         </div>
  //       </div>

  //       {/* Sort Options Skeleton */}
  //       <div className="flex items-center gap-3">
  //         <div className="h-4 bg-gray-300 rounded w-16"></div>
  //         <div className="h-10 bg-gray-300 rounded w-32"></div>
  //       </div>

  //       {/* Review Items Skeleton */}
  //       <div className="space-y-4">
  //         {[...Array(3)].map((_, index) => (
  //           <div key={index} className="bg-white rounded-2xl shadow-sm p-6">
  //             {/* Review Header Skeleton */}
  //             <div className="flex items-center gap-3 mb-4">
  //               <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
  //               <div className="space-y-2 flex-1">
  //                 <div className="h-4 bg-gray-300 rounded w-32"></div>
  //                 <div className="h-3 bg-gray-300 rounded w-24"></div>
  //               </div>
  //               <div className="h-6 bg-gray-300 rounded w-16"></div>
  //             </div>
              
  //             {/* Review Content Skeleton */}
  //             <div className="space-y-2">
  //               <div className="h-4 bg-gray-300 rounded"></div>
  //               <div className="h-4 bg-gray-300 rounded w-5/6"></div>
  //               <div className="h-4 bg-gray-300 rounded w-4/6"></div>
  //             </div>
              
  //             {/* Review Media Skeleton */}
  //             <div className="flex gap-2 mt-4">
  //               {[...Array(2)].map((_, mediaIndex) => (
  //                 <div key={mediaIndex} className="w-16 h-16 bg-gray-300 rounded-lg"></div>
  //               ))}
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <ReviewsSummary 
        productId={productId}
        reviews={reviews} 
        onAddReviewClick={() => setShowReviewForm(true)}
        stats={stats}
      />
      
      {/* Review Form - PASS user prop here */}
      {showReviewForm && (
        <ReviewForm 
          productId={productId}
          onSubmit={handleAddReview}
          onCancel={() => setShowReviewForm(false)}
          user={user} // ADD THIS LINE
        />
      )}

      {/* Reviews Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
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
          <>
            {sortedReviews.map((review) => (
              <ReviewItem 
                key={review._id} 
                review={review} 
                currentUser={user}
                onDeleteReview={handleDeleteReview} // ADD THIS LINE
              />
            ))}
            
            {/* Loading spinner for infinite scroll */}
            {loading && <LoadingSpinner />}
            
            {/* End of results message */}
            {!hasMore && reviews.length > 0 && <EndOfResults />}
            
            {/* Observer target for infinite scroll */}
            {hasMore && !loading && (
              <div ref={loadingRef} className="h-4" />
            )}
          </>
        ) : (
          !loading && (
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
      {loading && reviews.length === 0 && <LoadingSpinner />}
    </div>
  );
};

export default ProductReviews;