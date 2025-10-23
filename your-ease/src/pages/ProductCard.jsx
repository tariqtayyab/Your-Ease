// src/components/ProductCard.jsx
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition duration-200">
      <div className="w-full">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-36 sm:h-40 object-cover"
        />
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 truncate">
          {product.name}
        </h3>

        <p
          className="text-xs sm:text-sm text-gray-600 mt-1"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-2">
          <p className="text-[#2c9ba3] font-bold text-sm sm:text-base">Rs {product.price}</p>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => navigate("/checkout", { state: { product } })}
            className="flex-1 bg-gradient-to-r from-[#2c9ba3] to-[#38b2ac] text-white text-xs sm:text-sm py-2 rounded-md shadow-sm hover:opacity-95 transition"
            aria-label={`Buy ${product.name} now`}
          >
            Buy Now
          </button>

          <button
            onClick={() => addToCart(product)}
            className="flex-1 border border-[#2c9ba3] text-[#2c9ba3] bg-white text-xs sm:text-sm py-2 rounded-md hover:bg-[#2c9ba3] hover:text-white transition"
            aria-label={`Add ${product.name} to cart`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
