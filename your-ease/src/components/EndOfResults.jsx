// src/components/EndOfResults.jsx
import React from 'react';

const EndOfResults = () => (
  <div className="text-center py-6">
    <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 inline-block">
      <p className="text-teal-800 font-medium">All reviews loaded</p>
      <p className="text-teal-600 text-sm mt-1">You've reached the end of reviews</p>
    </div>
  </div>
);

export default EndOfResults;