// src/components/ProductCard.jsx - FINAL FIXED CLS VERSION
import { useNavigate } from "react-router-dom";
import OptimizedImage from './OptimizedImage';
import { Star } from "lucide-react";

const ProductCard = ({ product, onAddToCart, index = 0 }) => {
  const URL_BASE = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  
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

  const getImageUrl = (imageObj) => {
    if (!imageObj) return "/placeholder.png";
    
    if (typeof imageObj === 'string') {
      return imageObj.startsWith('http') ? imageObj : `${URL_BASE}${imageObj}`;
    } else if (imageObj.url) {
      return imageObj.url.startsWith('http') ? imageObj.url : `${URL_BASE}${imageObj.url}`;
    }
    
    return "/placeholder.png";
  };

  const imageUrl = getImageUrl(safeProduct.images[0]);

  return (
    <article 
      className="product-card bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-full cursor-pointer"
      aria-label={`Product: ${safeProduct.title}`}
      onClick={handleCardClick}
      style={{ 
        minHeight: '420px', // 🚀 Force consistent height
        contain: 'layout style paint' // 🚀 Browser optimization to prevent layout shifts
      }}
    >
      {/* Image Container with Explicit Dimensions */}
      <div 
        className="w-full bg-gray-50 flex items-center justify-center overflow-hidden relative"
        style={{
          height: '280px', // 🚀 Fixed height
          minHeight: '280px'
        }}
      >
        <OptimizedImage 
          src={imageUrl}
          alt={safeProduct.title}
          width={280}
          height={280}
          lazy={index >= 3}
          priority={index < 2}
          containerClassName="w-full h-full flex items-center justify-center"
        />
        
        {/* Free Delivery Badge */}
        <div className="absolute bottom-2 left-1 z-10">
          <img 
            src="/assets/Asset 1@2x.png" 
            alt="Free Delivery" 
            className="w-28 h-6 drop-shadow-lg"
            width="112"
            height="24"
            loading="eager"
            style={{ width: '112px', height: '24px' }} // 🚀 Fixed dimensions
          />
        </div>
      </div>
      
      {/* Content Container with Fixed Heights */}
      <div 
        className="p-3 flex flex-col flex-1"
        style={{ minHeight: '140px' }} // 🚀 Fixed content height
      >
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 leading-tight min-h-[40px] flex items-start">
          {safeProduct.title}
        </h3>
        
        <div className="price-container mb-2 min-h-[24px] flex items-center">
          <div className="text-[#1e7a7a] font-bold text-base">
            {formatPrice(safeProduct.price)}
            {safeProduct.oldPrice > safeProduct.price && (
              <span className="text-gray-600 text-xs ml-2 line-through">
                {formatPrice(safeProduct.oldPrice)}
              </span>
            )}
          </div>
        </div>
        
        {safeProduct.numReviews > 0 ? (
          <div className="flex items-center mt-auto min-h-[20px]">
            <span className="text-sm text-gray-700 font-medium">
              {safeProduct.rating.toFixed(1)}
            </span>
            <div className="flex text-yellow-400 mx-1">
              {[...Array(5)].map((_, i) => {
                const rating = safeProduct.rating || 0;
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
            <span className="text-xs text-gray-700">({safeProduct.numReviews})</span>
          </div>
        ) : (
          <div className="flex items-center mt-auto text-xs text-gray-600 min-h-[20px]">
            No reviews yet
          </div>
        )}
      </div>
    </article>
  );
};

export default ProductCard;