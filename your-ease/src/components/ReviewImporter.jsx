// src/components/ReviewImporter.jsx
import { useState } from 'react';

export default function ReviewImporter({ productId, userD }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [jsonInput, setJsonInput] = useState('');

  // Use the userD prop passed from parent component
  const isAdmin = userD?.isAdmin;

  console.log('UserD in ReviewImporter:', userD); // Debug
  console.log('Is admin in ReviewImporter:', isAdmin); // Debug
  console.log('Product ID in ReviewImporter:', productId); // Debug

  const handleImport = async () => {
    if (!isAdmin) {
      alert('Only admin users can import reviews');
      return;
    }

    if (!jsonInput.trim()) {
      alert('Please paste JSON data');
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      // Parse the JSON input
      const reviewsData = JSON.parse(jsonInput);

      // Get auth token from userD prop
      const token = userD?.token;

      console.log('Making API call with token:', token ? 'Yes' : 'No');

      // Call your import API
      const response = await fetch(`${API_URL}/import/reviews/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ reviewsData })
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (response.ok) {
        setImportResult({
          success: true,
          message: result.message,
          imported: result.imported,
          totalImages: result.totalImages,
          errors: result.errors
        });
        
        // Clear input on success
        setJsonInput('');
        
        // Refresh page after 2 seconds to show new reviews
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
      } else {
        setImportResult({
          success: false,
          message: result.error || 'Import failed',
          error: result.message
        });
      }

    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        message: 'Invalid JSON format',
        error: error.message
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClear = () => {
    setJsonInput('');
    setImportResult(null);
  };
  
  const updateProductRatingsAfterImport = async (productId) => {
  try {
    const reviews = await Review.find({ product: productId });
    const product = await Product.findById(productId);
    
    if (!product) return;

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((acc, item) => acc + item.rating, 0) / totalReviews 
      : 0;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingDistribution[review.rating]++;
      }
    });

    product.rating = parseFloat(averageRating.toFixed(1));
    product.numReviews = totalReviews;
    product.ratingDistribution = ratingDistribution;
    
    await product.save();
    console.log(`✅ Updated product ${productId} with ${totalReviews} imported reviews`);
  } catch (error) {
    console.error('Error updating product ratings after import:', error);
  }
};

  // Don't show anything if user is not admin
  if (!isAdmin) {
    console.log('Not showing ReviewImporter - user is not admin');
    return null;
  }

  console.log('Showing ReviewImporter component');

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">📥 Import Daraz Reviews</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paste your scraped JSON data:
        </label>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder={`Paste your JSON here...\nExample:\n{\n  "product": { ... },\n  "reviews": [ ... ]\n}`}
          rows={12}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          disabled={isImporting}
        />
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={handleImport}
          disabled={isImporting || !jsonInput.trim()}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isImporting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Importing...
            </span>
          ) : (
            '🚀 Import Reviews'
          )}
        </button>
        
        <button
          onClick={handleClear}
          disabled={isImporting}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Clear
        </button>
      </div>

      {/* Results Display */}
      {importResult && (
        <div className={`p-4 rounded-lg border ${
          importResult.success 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {importResult.success ? (
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h4 className={`font-medium ${importResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {importResult.message}
              </h4>
              
              {importResult.success && (
                <div className="mt-2 text-sm">
                  <p>✅ <strong>{importResult.imported}</strong> reviews imported successfully</p>
                  {importResult.totalImages > 0 && (
                    <p>🖼️ <strong>{importResult.totalImages}</strong> images uploaded to Cloudinary</p>
                  )}
                  {importResult.errors > 0 && (
                    <p>⚠️ <strong>{importResult.errors}</strong> reviews skipped (duplicates)</p>
                  )}
                  <p className="mt-2 text-green-600">Page will refresh to show new reviews...</p>
                </div>
              )}
              
              {!importResult.success && importResult.error && (
                <p className="mt-1 text-sm">{importResult.error}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      {/* <div className="mt-4 text-sm text-gray-600">
        <p><strong>How to use:</strong></p>
        <ol className="list-decimal list-inside space-y-1 mt-1">
          <li>Run your Daraz scraper to get JSON output</li>
          <li>Copy the entire JSON content</li>
          <li>Paste it in the textarea above</li>
          <li>Click "Import Reviews"</li>
          <li>Images will be automatically uploaded to your Cloudinary</li>
        </ol>
      </div> */}
    </div>
  );
}