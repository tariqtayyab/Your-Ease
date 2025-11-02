// src/pages/Cart.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";

const Cart = ({ cart, updateQuantity, removeFromCart, calculateTotal }) => {
  const navigate = useNavigate();
  const [localCart, setLocalCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processedCart, setProcessedCart] = useState([]);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  // Helper function to get image URL
  const getImageUrl = (imageObj) => {
    if (!imageObj) return "/placeholder.png";
    
    if (typeof imageObj === 'string') {
      return imageObj.startsWith('http') ? imageObj : `${BASE_URL}${imageObj}`;
    }
    
    if (imageObj.url) {
      return imageObj.url.startsWith('http') ? imageObj.url : `${BASE_URL}${imageObj.url}`;
    }
    
    return "/placeholder.png";
  };

  // Process image URLs for consistent display
  const processCartItems = (items) => {
    if (!items || items.length === 0) return [];
    
    return items.map(item => ({
      ...item,
      processedImage: getImageUrl(item.image)
    }));
  };

  // Load cart from localStorage on component mount
  useEffect(() => {
    const loadCartFromLocalStorage = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setLocalCart(parsedCart);
        } else {
          setLocalCart([]);
        }
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        setLocalCart([]);
      } finally {
        setIsLoading(false);
      }
    };

    // FIX: Changed from loadCartFromStorage to loadCartFromLocalStorage
    loadCartFromLocalStorage();
  }, []);

  // ✅ FIX: Always use localCart for processing and display
  useEffect(() => {
    const processed = processCartItems(localCart);
    setProcessedCart(processed);
  }, [localCart]);

  // ✅ FIX: Use only localCart for all operations
  const displayCart = localCart;

  // Local storage update functions
  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }

    try {
      const updatedCart = localCart.map(item => 
        (item.id === itemId || item._id === itemId) 
          ? { ...item, quantity: newQuantity }
          : item
      );

      // Update localStorage and state
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      setLocalCart(updatedCart);

      // Call parent function if it exists
      if (updateQuantity) {
        updateQuantity(itemId, newQuantity);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleRemoveFromCart = (itemId) => {
    try {
      const updatedCart = localCart.filter(item => 
        item.id !== itemId && item._id !== itemId
      );

      // Update localStorage and state
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      setLocalCart(updatedCart);

      // Call parent function if it exists
      if (removeFromCart) {
        removeFromCart(itemId);
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const handleCalculateTotal = () => {
    return localCart.reduce((total, item) => {
      const price = item.price || item.currentPrice || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "Rs --";
    return `Rs ${parseFloat(price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const getTotalItems = () => {
    return localCart.reduce((total, item) => total + item.quantity, 0);
  };

  // NEW: Function to display selected options
  const renderSelectedOptions = (selectedOptions) => {
    if (!selectedOptions || Object.keys(selectedOptions).length === 0) {
      return null;
    }

    return (
      <div className="mt-2 space-y-1">
        {Object.entries(selectedOptions).map(([optionName, value]) => (
          <div key={optionName} className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-700 capitalize">{optionName}:</span>
            <span className="bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
              {value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Show loading state while cart is being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 pb-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (localCart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            </div>

            {/* Empty Cart */}
            <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center">
              <ShoppingBag className="w-20 h-20 sm:w-24 sm:h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-sm sm:text-base">
                Looks like you haven't added any items to your cart yet. Start shopping to discover amazing products!
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-teal-600 text-white px-6 py-3 sm:px-8 sm:py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors text-sm sm:text-base"
              >
                Start Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-24">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
            </div>
            <span className="text-gray-600 text-sm sm:text-base">
              {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {processedCart.map((item) => (
                <div key={item.id || item._id} className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0 self-center sm:self-auto">
                      <img 
                        src={item.processedImage} 
                        alt={item.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl"
                        onError={(e) => {
                          e.target.src = "/placeholder.png";
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      
                      {/* NEW: Display Selected Options */}
                      {renderSelectedOptions(item.selectedOptions)}
                      
                      <p className="text-xl sm:text-2xl font-bold text-teal-600 mb-3 sm:mb-4">
                        {formatPrice(item.price || item.currentPrice)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-center border border-gray-300 rounded-lg self-start">
                          <button 
                            onClick={() => handleUpdateQuantity(item.id || item._id, item.quantity - 1)}
                            className="p-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 sm:px-4 py-2 border-l border-r border-gray-300 min-w-[40px] sm:min-w-[50px] text-center font-medium">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => handleUpdateQuantity(item.id || item._id, item.quantity + 1)}
                            className="p-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                            disabled={item.quantity >= (item.countInStock || 999)}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveFromCart(item.id || item._id)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors self-start"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Remove</span>
                        </button>
                      </div>

                      {/* Stock Info */}
                      {item.countInStock && (
                        <p className="text-sm text-gray-500 mt-2">
                          {item.quantity >= item.countInStock ? (
                            <span className="text-red-500">Only {item.countInStock} available</span>
                          ) : (
                            `${item.countInStock} available`
                          )}
                        </p>
                      )}

                      {/* Item Total - Mobile */}
                      <div className="sm:hidden flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                        <span className="text-gray-600 text-sm">Total:</span>
                        <p className="text-lg font-bold text-gray-900">
                          {formatPrice((item.price || item.currentPrice) * item.quantity)}
                        </p>
                      </div>
                    </div>

                    {/* Item Total - Desktop */}
                    <div className="hidden sm:flex sm:flex-col sm:items-end sm:justify-between">
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice((item.price || item.currentPrice) * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:sticky lg:top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>

                {/* Summary Details */}
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span className="text-sm sm:text-base">Subtotal ({getTotalItems()} items)</span>
                    <span className="text-sm sm:text-base">{formatPrice(handleCalculateTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="text-sm sm:text-base">Shipping</span>
                    <span className="text-green-600 text-sm sm:text-base">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="text-sm sm:text-base">Tax</span>
                    <span className="text-sm sm:text-base">Included</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 sm:pt-4">
                    <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>{formatPrice(handleCalculateTotal())}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-teal-600 text-white py-3 sm:py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors shadow-lg mb-3 sm:mb-4 text-sm sm:text-base"
                >
                  Proceed to Checkout
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={() => navigate('/')}
                  className="w-full border border-gray-300 text-gray-700 py-2 sm:py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Continue Shopping
                </button>

                {/* Cart Persistence Info */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 text-center">
                    Your cart is automatically saved and will persist between visits
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;