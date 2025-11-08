// src/components/ProductCard.jsx - FIXED VERSION
import { useNavigate } from "react-router-dom";
import OptimizedImage from './OptimizedImage';
import freeDeliveryIcon from "./images/Asset 1@2x.png";

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

  // 🚀 SIMPLIFIED: Get image URL without transformations
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
        {/* 🚀 SIMPLIFIED: Let OptimizedImage handle all loading states */}
        <OptimizedImage 
          src={imageUrl}
          alt={safeProduct.title}
          width={400}
          height={400}
          lazy={index >= 3} // Lazy load after first 3 images
          priority={index < 2} // High priority for first 2 images
          className="transition-transform duration-500 hover:scale-105 bg-white"
        />
        
        {/* 🚀 FIXED: Free Delivery Badge with reserved space */}
        <div className="absolute bottom-2 left-1">
          <img 
            src={freeDeliveryIcon} 
            alt="Free Delivery" 
            className="w-28 h-6 drop-shadow-lg"
            loading="eager"
          />
        </div>
      </div>
      
      {/* 🚀 FIXED: Content Container with min-heights to prevent layout shifts */}
     {/* Content Container */}
<div className="p-3 flex flex-col flex-1 min-h-[100px]">
  {/* Product Title */}
  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 leading-tight min-h-[32px]">
    {safeProduct.title}
  </h3>
  
  {/* Price */}
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
  
  {/* Rating */}
  {safeProduct.numReviews > 0 ? (
    <div className="flex items-center mt-auto min-h-[16px]">
      {/* rating content */}
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