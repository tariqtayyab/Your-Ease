// src/components/ProductCard.jsx - OPTIMIZED VERSION
import { useNavigate } from "react-router-dom";
import OptimizedImage from './OptimizedImage';
import { Star, Truck } from "lucide-react";

const ProductCard = ({ product, index = 0 }) => {
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
      className="product-card bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full cursor-pointer"
      aria-label={`Product: ${safeProduct.title}`}
      onClick={handleCardClick}
    >
      {/* Professional Image Container with Fixed Aspect Ratio */}
      <div className="w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden relative">
        <OptimizedImage 
          src={imageUrl}
          alt={safeProduct.title}
          width={280}
          height={280}
          lazy={index >= 3}
          priority={index < 2}
          className="bg-white"
        />
        
     <div className="absolute bottom-2 left-1 z-10 w-32">
  <img 
    src="/assets/Asset 2.webp" 
    alt="Free Delivery"
    className="w-full h-auto"
    loading="lazy"
    onError={(e) => {
      // Fallback if WebP isn't supported
      e.target.src = '/assets/Asset 1@2x.png';
    }}
  />
</div>
      </div>
      
      {/* Content Container */}
      <div className="p-3 flex flex-col flex-1 min-h-[100px]">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 leading-tight min-h-[32px]">
          {safeProduct.title}
        </h3>
        
        <div className="price-container mb-2 min-h-[20px]">
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
          <div className="flex items-center mt-auto text-xs text-gray-600 min-h-[16px]">
            No reviews yet
          </div>
        )}
      </div>
    </article>
  );
};

export default ProductCard;