// TEST VERSION 1 - No Images (Plain Backgrounds)
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, onAddToCart, index = 0 }) => {
  const navigate = useNavigate();
  
  const safeProduct = {
    id: product?._id || product?.id || Math.random().toString(36).substr(2, 9),
    title: product?.title || "Product Name",
    price: product?.currentPrice || 0,
    oldPrice: product?.oldPrice || 0,
  };

  const handleCardClick = () => {
    if (safeProduct.id) {
      navigate(`/product/${safeProduct.id}`);
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(price)) return "Rs --";
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numericPrice) ? "Rs --" : `Rs ${numericPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  return (
    <article 
      className="product-card bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full cursor-pointer"
      onClick={handleCardClick}
    >
      {/* TEST: Fixed color background instead of image */}
      <div className="w-full aspect-square bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center relative">
        <div className="text-center">
          <div className="text-gray-600 text-sm">Product Image</div>
          <div className="text-gray-400 text-xs">280 × 280</div>
        </div>
        
        {/* Free Delivery Badge */}
        <div className="absolute bottom-2 left-1">
          <div className="w-28 h-6 bg-green-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">Free Delivery</span>
          </div>
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
        
        <div className="flex items-center mt-auto text-xs text-gray-600 min-h-[16px]">
          No reviews yet
        </div>
      </div>
    </article>
  );
};

export default ProductCard;