// src/components/ProductCard.jsx - PERFORMANCE OPTIMIZED (SAME UI)
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Truck } from "lucide-react";

const ProductCard = ({ product, onAddToCart, index = 0 }) => {
  const URL_BASE = import.meta.env.VITE_API_BASE_URL;
  const [imgSrc, setImgSrc] = useState(
    product?.images?.[0] || "/placeholder.png"
  );
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);
  const navigate = useNavigate();
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const handleImageError = () => {
    setImgSrc("/placeholder.png");
    setImageLoaded(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleCardClick = () => {
    if (safeProduct.id) {
      navigate(`/product/${safeProduct.id}`);
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(price)) {
      return "Rs --";
    }
    
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numericPrice)) {
      return "Rs --";
    }
    
    return `Rs ${numericPrice.toLocaleString('en-IN', {
      maximumFractionDigits: 0
    })}`;
  };

  // Safe product data with fallbacks
  const safeProduct = {
    id: product?._id || product?.id || Math.random().toString(36).substr(2, 9),
    title: product?.title || "Product Name",
    description: product?.shortDescription || product?.description || "Product Description",
    price: product?.currentPrice || 0,
    oldPrice: product?.oldPrice || 0,
    images: product?.images || [],
    stock: product?.countInStock,
    isHotSelling: product?.isHotSelling || false,
    category: product?.category,
    brand: product?.brand,
    rating: product?.rating || 0,
    numReviews: product?.numReviews || 0,
    freeDelivery: product?.freeDelivery !== undefined ? product.freeDelivery : true
  };

  // Get proper image URL
  const getImageUrl = (imageObj) => {
    if (!imageObj) return "/placeholder.png";
    
    if (typeof imageObj === 'string') {
      return imageObj.startsWith('http') ? imageObj : `${URL_BASE}${imageObj}`;
    }
    
    if (imageObj.url) {
      return imageObj.url.startsWith('http') ? imageObj.url : `${URL_BASE}${imageObj.url}`;
    }
    
    return "/placeholder.png";
  };

  const imageUrl = getImageUrl(safeProduct.images[0]);

  // 🚀 PERFORMANCE OPTIMIZATION: Priority loading for first 3 images
  const loadingPriority = index < 3 ? "eager" : "lazy";

  return (
    <article 
      className="product-card bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full cursor-pointer"
      aria-label={`Product: ${safeProduct.title}`}
      onClick={handleCardClick}
    >
      {/* Professional Image Container with Fixed Aspect Ratio */}
      <div 
        ref={imgRef}
        className="w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden relative"
      >
        {isInView ? (
          <>
            {/* Loading Skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 1.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zM0 10a10 10 0 1110 10A10 10 0 010 10z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M10 5a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            
            {/* 🚀 MAIN OPTIMIZATION: Image with dimensions and priority loading */}
            <img 
              src={imageUrl} 
              alt={safeProduct.title} 
              width={300}  // ✅ Added explicit width
              height={300} // ✅ Added explicit height
              className={`w-full h-full object-contain transition-transform duration-500 hover:scale-105 bg-white ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading={loadingPriority} // ✅ First 3 eager, others lazy
              fetchpriority={index < 2 ? "high" : "auto"} // ✅ Boost LCP for first 2
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            
            {/* Free Delivery Badge */}
            {safeProduct.freeDelivery && (
              <div className="absolute bottom-2 left-2">
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                  <div className="flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    <span className="text-xs font-semibold whitespace-nowrap">Free Delivery</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 1.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zM0 10a10 10 0 1110 10A10 10 0 010 10z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M10 5a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Content Container */}
      <div className="p-3 flex flex-col flex-1">
        {/* Product Title */}
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 leading-tight">
          {safeProduct.title}
        </h3>
        
        {/* Price */}
        <div className="price-container mb-2">
          <div className="text-teal-600 font-bold text-base">
            {formatPrice(safeProduct.price)}
            {safeProduct.oldPrice > safeProduct.price && (
              <span className="text-gray-400 text-xs ml-2 line-through">
                {formatPrice(safeProduct.oldPrice)}
              </span>
            )}
          </div>
        </div>
        
        {/* Rating */}
        {safeProduct.numReviews > 0 ? (
          <div className="flex items-center mt-auto">
            <span className="text-sm text-gray-700 font-medium">
              {safeProduct.rating.toFixed(1)}
            </span>
            <div className="flex text-yellow-400 mx-1">
               {[...Array(5)].map((_, i) => {
                  const rating = product.rating || 0;
                  const fullStars = Math.floor(rating);
                  const hasPartialStar = rating % 1 !== 0 && i === fullStars;
                  const partialPercentage = hasPartialStar ? (rating % 1) * 100 : 0;
                  
                  return (
                    <div key={i} className="relative">
                      <Star className="w-3 h-3 sm:w-3 sm:h-3 text-gray-300" />
                      <div 
                        className="absolute top-0 left-0 overflow-hidden"
                        style={{ 
                          width: i < fullStars ? '100%' : (hasPartialStar ? `${partialPercentage}%` : '0%')
                        }}
                      >
                        <Star className="w-3 h-3 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
                      </div>
                    </div>
                  );
                })}
            </div>
            <span className="text-xs text-gray-500">({safeProduct.numReviews})</span>
          </div>
        ) : (
          <div className="flex items-center mt-auto text-xs text-gray-500">
            No reviews yet
          </div>
        )}
      </div>
    </article>
  );
};

export default ProductCard;