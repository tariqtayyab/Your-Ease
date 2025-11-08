import { useState, useEffect } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  width = 400, 
  height = 400, 
  className = "", 
  lazy = true,
  priority = false 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');

  // Generate optimized Cloudinary URLs
  const getOptimizedUrls = () => {
    if (!src || error) return { low: '/placeholder.png', high: '/placeholder.png' };
    
    if (typeof src === 'string' && src.includes('res.cloudinary.com') && src.includes('/upload/')) {
      // Low quality placeholder (blurry, fast loading)
      const lowQualityTransformations = `w_${width},h_${height},c_fill,q_20,blur_100,f_auto`;
      const lowQualityUrl = src.replace('/upload/', `/upload/${lowQualityTransformations}/`);
      
      // High quality final image
      const highQualityTransformations = `w_${width},h_${height},c_fill,q_auto,f_auto`;
      const highQualityUrl = src.replace('/upload/', `/upload/${highQualityTransformations}/`);
      
      return { low: lowQualityUrl, high: highQualityUrl };
    }
    
    return { low: src, high: src };
  };

  const urls = getOptimizedUrls();

  useEffect(() => {
    // Start with low quality image
    setCurrentSrc(urls.low);
    
    // Preload high quality image
    const img = new Image();
    img.src = urls.high;
    img.onload = () => {
      // Switch to high quality when loaded
      setCurrentSrc(urls.high);
      setLoaded(true);
    };
    img.onerror = () => {
      setError(true);
    };
  }, [src]);

  const handleImageLoad = () => {
    // This handles the low quality image load
    if (currentSrc === urls.low) {
      // Low quality loaded, high quality will load via the Image() above
      return;
    }
    setLoaded(true);
  };

  const handleImageError = () => {
    setError(true);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Loading skeleton - only show if neither image has loaded */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 1.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zM0 10a10 10 0 1110 10A10 10 0 010 10z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      {/* Main image */}
      <img
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading={lazy && !priority ? "lazy" : "eager"}
        fetchpriority={priority ? "high" : "auto"}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`w-full h-full object-contain transition-opacity duration-500 ${
          loaded && currentSrc === urls.high ? 'opacity-100' : 'opacity-70 blur-sm'
        } ${className}`}
      />
      
      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded">
          <div className="text-center">
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-500">Image not available</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;