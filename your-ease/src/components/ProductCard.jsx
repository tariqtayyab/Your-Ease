// src/components/ProductCard.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, onAddToCart }) => {
  const [imgSrc, setImgSrc] = useState(
    product?.images?.[0] || "/placeholder.png"
  );
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
  };

  const handleCardClick = () => {
    if (safeProduct.id) {
      navigate(`/product/${safeProduct.id}`);
    }
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation(); // Prevent card click when clicking add to cart
    onAddToCart?.(safeProduct);
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
    rating: product?.rating,
    reviews: product?.reviews || []
  };

  // Get proper image URL
  const getImageUrl = (imageObj) => {
    if (!imageObj) return "/placeholder.png";
    
    if (typeof imageObj === 'string') {
      return imageObj.startsWith('http') ? imageObj : `http://localhost:5000${imageObj}`;
    }
    
    if (imageObj.url) {
      return imageObj.url.startsWith('http') ? imageObj.url : `http://localhost:5000${imageObj.url}`;
    }
    
    return "/placeholder.png";
  };

  const imageUrl = getImageUrl(safeProduct.images[0]);

  return (
    <article 
      className="product-card bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full cursor-pointer"
      aria-label={`Product: ${safeProduct.title}`}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div 
        ref={imgRef}
        className="w-full h-40 bg-gray-50 flex items-center justify-center overflow-hidden relative"
      >
        {isInView ? (
          <>
            <img 
              src={imageUrl} 
              alt={safeProduct.title} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
              onError={handleImageError}
            />
            {safeProduct.isHotSelling && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                🔥 Hot
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
        
        {/* Product Description */}
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed flex-1">
          {safeProduct.description}
        </p>
        
        {/* Rating */}
        {safeProduct.rating && (
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-3 h-3 ${i < Math.floor(safeProduct.rating) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">({safeProduct.rating})</span>
          </div>
        )}
        
        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between mt-auto">
          <div className="price-container">
            <div className="text-teal-600 font-bold text-base">
              {formatPrice(safeProduct.price)}
            </div>
            {safeProduct.oldPrice > 0 && safeProduct.oldPrice > safeProduct.price && (
              <div className="text-xs line-through text-gray-400">
                {formatPrice(safeProduct.oldPrice)}
              </div>
            )}
          </div>
          
          <button 
            onClick={handleAddToCartClick}
            className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium min-w-[80px]"
            aria-label={`Add ${safeProduct.title} to cart`}
            disabled={safeProduct.stock === 0}
          >
            {safeProduct.stock === 0 ? "Out of Stock" : "Add"}
          </button>
        </div>
        
        {/* Stock Information */}
        {safeProduct.stock !== undefined && (
          <div className="mt-2 text-xs text-gray-500">
            {safeProduct.stock > 0 
              ? `In stock: ${safeProduct.stock}` 
              : <span className="text-red-500 font-medium">Out of stock</span>
            }
          </div>
        )}
      </div>
    </article>
  );
};

export default ProductCard;