/// src/components/OptimizedImage.jsx - FIXED WITH RESPONSIVE SIZES
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
  const [imageUrl, setImageUrl] = useState('');
  const [optimizedSize, setOptimizedSize] = useState(width);

  // 🚀 FIXED: Generate responsive image sizes based on screen width
  useEffect(() => {
    const calculateOptimalSize = () => {
      const screenWidth = window.innerWidth;
      
      // Match image size to actual display size
      if (screenWidth < 768) { // Mobile
        return 300; // Matches the ~296px display size on mobile
      } else if (screenWidth < 1024) { // Tablet
        return 350; // Slightly larger for tablets
      } else { // Desktop
        return width; // Keep original for desktop
      }
    };

    setOptimizedSize(calculateOptimalSize());

    // Update on resize
    const handleResize = () => {
      setOptimizedSize(calculateOptimalSize());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width]);

  // 🚀 FIXED: Generate optimized URL with responsive sizing
  useEffect(() => {
    if (!src) {
      setImageUrl('/placeholder.png');
      return;
    }
    
    let finalUrl = src;
    
    // Only optimize Cloudinary URLs
    if (typeof src === 'string' && src.includes('res.cloudinary.com') && src.includes('/upload/')) {
      // 🚀 RESPONSIVE sizing - request exactly what we need
      const transformations = `w_${optimizedSize},h_${optimizedSize},c_fill,q_auto,f_webp`;
      finalUrl = src.replace('/upload/', `/upload/${transformations}/`);
      
      console.log(`🖼️ Loading image at ${optimizedSize}x${optimizedSize}px for ${window.innerWidth}px screen`);
    }
    
    setImageUrl(finalUrl);
  }, [src, optimizedSize]); // 🚀 Added optimizedSize dependency

  const handleImageLoad = () => {
    setLoaded(true);
  };

  const handleImageError = () => {
    console.error('❌ Image failed to load:', imageUrl);
    setError(true);
    setImageUrl('/placeholder.png');
    setLoaded(true);
  };

  const showSkeleton = imageUrl && imageUrl !== '/placeholder.png' && !loaded && !error;

  return (
    <div className={`relative ${className}`}>
      {/* Loading skeleton */}
      {showSkeleton && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded flex items-center justify-center z-10">
          <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 1.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zM0 10a10 10 0 1110 10A10 10 0 010 10z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      {/* 🚀 Image with responsive sizing */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={alt}
          width={optimizedSize} // 🚀 Use responsive width
          height={optimizedSize} // 🚀 Use responsive height
          loading={lazy && !priority ? "lazy" : "eager"}
          fetchPriority={priority ? "high" : "auto"}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          decoding="async"
        />
      )}
      
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