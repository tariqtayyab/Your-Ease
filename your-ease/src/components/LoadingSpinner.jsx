import React from 'react';

const LoadingSpinner = () => (
  <div className="flex justify-center py-6">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
  </div>
);

export default LoadingSpinner;