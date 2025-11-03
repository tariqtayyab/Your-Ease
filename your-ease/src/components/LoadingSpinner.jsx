import React from 'react';

const LoadingSpinner = () => (
 <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-32"></div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-3 h-3 bg-gray-300 rounded"></div>
                ))}
              </div>
              <div className="h-3 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        </div>

        {/* Review Content Skeleton */}
        <div className="mb-3 space-y-2">
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          <div className="h-4 bg-gray-300 rounded w-4/6"></div>
        </div>

        {/* Media Skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="w-20 h-20 bg-gray-300 rounded-lg flex-shrink-0"></div>
          ))}
        </div>
      </div>
);

export default LoadingSpinner;