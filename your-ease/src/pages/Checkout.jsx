// src/pages/Checkout.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Truck, Shield } from "lucide-react";
import { getAddresses } from "../api";

const Checkout = ({ cart, calculateTotal, clearCart }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Pakistan',
    paymentMethod: 'card'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [localCart, setLocalCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processedCart, setProcessedCart] = useState([]);

  // Helper function to get image URL
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
          
          // Process the cart items immediately after loading
          const processed = processCartItems(parsedCart);
          setProcessedCart(processed);
        } else {
          setProcessedCart([]);
        }
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        setProcessedCart([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCartFromLocalStorage();
  }, []);

  // Update processedCart when localCart changes
  useEffect(() => {
    if (localCart.length > 0) {
      const processed = processCartItems(localCart);
      setProcessedCart(processed);
    }
  }, [localCart]);

  // Use parent cart if available, otherwise use localStorage cart
  const displayCart = (cart && cart.length > 0) ? cart : localCart;

  useEffect(() => {
    // Load user addresses from API
    const loadUserAddresses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          // Fetch addresses from API
          const addressesData = await getAddresses();
          const addresses = addressesData.addresses || addressesData || [];
          setUserAddresses(addresses);
          
          // Find default address
          const defaultAddress = addresses.find(addr => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddress(defaultAddress._id);
            setFormData({
              fullName: defaultAddress.fullName || '',
              email: defaultAddress.email || '',
              phone: defaultAddress.phone || '',
              address: defaultAddress.address || '',
              city: defaultAddress.city || '',
              state: defaultAddress.state || '',
              country: defaultAddress.country || 'Pakistan',
              paymentMethod: 'card'
            });
          }
        }
      } catch (error) {
        console.error("Error loading addresses:", error);
        // If API fails, try to get from localStorage as fallback
        try {
          const userInfo = localStorage.getItem("userInfo");
          if (userInfo) {
            const user = JSON.parse(userInfo);
            const addresses = user.addresses || [];
            setUserAddresses(addresses);
            
            const defaultAddress = addresses.find(addr => addr.isDefault);
            if (defaultAddress) {
              setSelectedAddress(defaultAddress._id);
              setFormData({
                fullName: defaultAddress.fullName || '',
                email: defaultAddress.email || '',
                phone: defaultAddress.phone || '',
                address: defaultAddress.address || '',
                city: defaultAddress.city || '',
                state: defaultAddress.state || '',
                country: defaultAddress.country || 'Pakistan',
                paymentMethod: 'card'
              });
            }
          }
        } catch (fallbackError) {
          console.error("Fallback address loading failed:", fallbackError);
        }
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadUserAddresses();
  }, []);

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "Rs --";
    return `Rs ${parseFloat(price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address._id);
    setFormData({
      fullName: address.fullName || '',
      email: address.email || '',
      phone: address.phone || '',
      address: address.address || '',
      city: address.city || '',
      state: address.state || '',
      country: address.country || 'Pakistan',
      paymentMethod: formData.paymentMethod
    });
  };

  // FIXED: Calculate total function
  const handleCalculateTotal = () => {
    // If parent function exists, use it
    if (calculateTotal) {
      return calculateTotal();
    }

    // Calculate total from display cart - FIXED LOGIC
    if (!displayCart || displayCart.length === 0) return 0;

    const total = displayCart.reduce((total, item) => {
      const price = item.price || item.currentPrice || item.originalPrice || 0;
      const quantity = item.quantity || 1;
      const itemTotal = parseFloat(price) * parseInt(quantity);
      return total + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);

    return isNaN(total) ? 0 : total;
  };

  // Calculate subtotal (same as total since shipping is free and tax included)
  const subtotal = handleCalculateTotal();
  const total = subtotal; // Since shipping is free and tax included

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate order processing
    setTimeout(() => {
      alert('Order placed successfully! Thank you for your purchase.');
      
      // Clear cart from localStorage
      localStorage.removeItem('cart');
      setLocalCart([]);
      
      // Call parent function if it exists
      if (clearCart) {
        clearCart();
      }
      
      navigate('/');
      setIsProcessing(false);
    }, 2000);
  };

  // Show loading state while cart is being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (displayCart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Items to Checkout</h1>
            <p className="text-gray-600 mb-8">Your cart is empty. Add some items before proceeding to checkout.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Cart
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          </div>

          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              {/* Saved Addresses */}
              {loadingAddresses ? (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    <span className="ml-3 text-gray-600">Loading addresses...</span>
                  </div>
                </div>
              ) : userAddresses.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Saved Addresses
                  </h2>
                  
                  <div className="space-y-3">
                    {userAddresses.map((address) => (
                      <label 
                        key={address._id}
                        className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                          selectedAddress === address._id
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="savedAddress"
                          checked={selectedAddress === address._id}
                          onChange={() => handleAddressSelect(address)}
                          className="text-teal-600 focus:ring-teal-500 mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900">{address.fullName}</span>
                            {address.isDefault && (
                              <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">{address.phone}</p>
                          <p className="text-gray-600 text-sm">{address.email}</p>
                          <p className="text-gray-600 text-sm">
                            {address.address}, {address.city}, {address.state}, {address.country}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => navigate('/account?tab=addresses')}
                      className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                    >
                      Manage addresses in your account
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Shipping Address
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    No saved addresses found. Please fill in your shipping information below.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/account?tab=addresses')}
                    className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                  >
                    Add addresses to your account for faster checkout
                  </button>
                </div>
              )}

              {/* Shipping Information */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  {userAddresses.length > 0 ? 'Shipping Information' : 'Enter Shipping Information'}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="+92 XXX XXXXXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                      placeholder="House #, Street, Area, Landmark"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Enter state"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </h2>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Credit/Debit Card</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <Truck className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Cash on Delivery</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Order Items */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {processedCart.map((item) => (
                    <div key={item.id || item._id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                      <img 
                        src={item.processedImage} 
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = "/placeholder.png";
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatPrice((item.price || item.currentPrice || item.originalPrice || 0) * (item.quantity || 1))}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown - FIXED: Now using calculated subtotal and total */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>Included</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Secure checkout</span>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-4 rounded-xl font-semibold transition-colors shadow-lg ${
                    isProcessing
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  {isProcessing ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;