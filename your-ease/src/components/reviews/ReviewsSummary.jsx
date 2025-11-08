// src/components/ReviewsSummary.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
// import { getProductReviewStats } from '../../api';

const ReviewsSummary = ({ productId, reviews = [], stats, onAddReviewClick, loading = false }) => {
  const showSkeleton = loading && reviews.length === 0;

  if (showSkeleton) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 animate-pulse">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Overall Rating Skeleton */}
          <div className="text-center lg:text-left">
            <div className="h-12 bg-gray-300 rounded w-20 mx-auto lg:mx-0 mb-2"></div>
            <div className="flex items-center justify-center lg:justify-start gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-5 h-5 bg-gray-300 rounded"></div>
              ))}
            </div>
            <div className="h-4 bg-gray-300 rounded w-32 mx-auto lg:mx-0"></div>
          </div>

          {/* Rating Distribution Skeleton */}
          <div className="flex-1 max-w-md">
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                  <div className="flex-1 h-2 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-8"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Review Button Skeleton */}
          <div className="text-center lg:text-right">
            <div className="h-12 bg-gray-300 rounded w-32 mx-auto lg:mx-0"></div>
          </div>
        </div>
      </div>
    );
  }

  // If we have reviews but stats are still loading, show a minimal version
  if (!stats && reviews.length > 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Simple summary when stats are loading but we have reviews */}
          <div className="text-center lg:text-left">
            <div className="text-2xl font-bold text-teal-600 mb-2">
              {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
            </div>
            <p className="text-gray-600 text-sm">Loading detailed stats...</p>
          </div>
          
          {/* Add Review Button */}
          <div className="text-center lg:text-right">
            <button
              onClick={onAddReviewClick}
              className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors shadow-lg"
            >
              Write a Review
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no stats and no reviews (edge case)
  if (!stats) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="text-center">
          <p className="text-gray-600">No review data available</p>
          <button
            onClick={onAddReviewClick}
            className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors shadow-lg mt-4"
          >
            Write a Review
          </button>
        </div>
      </div>
    );
  }

  const { totalReviews, averageRating, ratingDistribution } = stats;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Overall Rating */}
        <div className="text-center lg:text-left">
          <div className="text-5xl font-bold text-teal-600 mb-2">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center lg:justify-start gap-1 mb-2">
            {[...Array(5)].map((_, i) => {
              const fullStars = Math.floor(averageRating);
              const hasPartialStar = averageRating % 1 !== 0 && i === fullStars;
              const partialPercentage = hasPartialStar ? (averageRating % 1) * 100 : 0;
              
              return (
                <div key={i} className="relative">
                  {/* Gray background star */}
                  <Star className="w-5 h-5 text-gray-300" />
                  
                  {/* Colored overlay */}
                  <div 
                    className="absolute top-0 left-0 overflow-hidden"
                    style={{ 
                      width: i < fullStars ? '100%' : (hasPartialStar ? `${partialPercentage}%` : '0%')
                    }}
                  >
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-gray-600 text-sm">
            Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 max-w-md">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingDistribution[stars] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              
              return (
                <div key={stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium text-gray-900 w-3">{stars}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Review Button */}
        <div className="text-center lg:text-right">
          <button
            onClick={onAddReviewClick}
            className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors shadow-lg"
          >
            Write a Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsSummary;