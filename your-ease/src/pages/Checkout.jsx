import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle, User } from "lucide-react";
import { getAddresses, createOrder } from "../api";
import { trackBeginCheckout, trackPurchase } from '../utils/ga4-simple.js'; // Import GA4 functions

const Checkout = ({ cart, calculateTotal, clearCart }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    phone2: '', // New optional phone field
    address: '',
    city: '',
    country: 'Pakistan',
    paymentMethod: 'cod' // Default to COD only
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [localCart, setLocalCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processedCart, setProcessedCart] = useState([]);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [user, setUser] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userInfo = localStorage.getItem("userInfo");
    
    if (token && userInfo) {
      setUser(JSON.parse(userInfo));
      setIsGuest(false);
    } else {
      setIsGuest(true);
    }
  }, []);

  // Track begin_checkout when component loads with items
  useEffect(() => {
    if (processedCart.length > 0) {
      const cartItemsForGA4 = processedCart.map(item => ({
        id: item.id || item._id,
        title: item.title,
        price: item.price || item.currentPrice || item.originalPrice || 0,
        quantity: item.quantity || 1,
        category: item.category || 'General',
        selectedOptions: item.selectedOptions || {}
      }));
      
      trackBeginCheckout(cartItemsForGA4);
    }
  }, [processedCart]);

  // Helper function to get image URL
  const getImageUrl = (imageObj) => {
    if (!imageObj) return "/placeholder.png";
    
    if (typeof imageObj === 'string') {
      return imageObj.startsWith('http') ? imageObj : `${API_BASE}${imageObj}`;
    }
    
    if (imageObj.url) {
      return imageObj.url.startsWith('http') ? imageObj.url : `${API_BASE}${imageObj.url}`;
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

  // Calculate subtotal
  const subtotal = processedCart.reduce((total, item) => {
    const price = item.price || item.currentPrice || item.originalPrice || 0;
    const quantity = item.quantity || 1;
    return total + (price * quantity);
  }, 0);

  // Use parent cart if available, otherwise use localStorage cart
  const displayCart = (cart && cart.length > 0) ? cart : localCart;

  useEffect(() => {
    // Load user addresses from API (only if logged in)
    const loadUserAddresses = async () => {
      if (!user) {
        setLoadingAddresses(false);
        return;
      }

      try {
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
            phone2: defaultAddress.phone2 || '', // Include phone2
            address: defaultAddress.address || '',
            city: defaultAddress.city || '',
            country: defaultAddress.country || 'Pakistan',
            paymentMethod: 'cod'
          });
        }
      } catch (error) {
        console.error("Error loading addresses:", error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadUserAddresses();
  }, [user]);

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

  // Format phone number as user types (0300 0000000 format)
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    let formattedValue = value;
    
    if (value.length > 4) {
      formattedValue = value.slice(0, 4) + ' ' + value.slice(4, 11);
    }
    
    setFormData({
      ...formData,
      [e.target.name]: formattedValue
    });
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address._id);
    setFormData({
      fullName: address.fullName || '',
      email: address.email || '',
      phone: address.phone || '',
      phone2: address.phone2 || '',
      address: address.address || '',
      city: address.city || '',
      country: address.country || 'Pakistan',
      paymentMethod: 'cod'
    });
  };

  // NEW: Function to display selected options
  const renderSelectedOptions = (selectedOptions) => {
    if (!selectedOptions || Object.keys(selectedOptions).length === 0) {
      return null;
    }

    return (
      <div className="mt-1 space-y-1">
        {Object.entries(selectedOptions).map(([optionName, value]) => (
          <div key={optionName} className="flex items-center gap-1 text-xs text-gray-600">
            <span className="font-medium text-gray-700 capitalize">{optionName}:</span>
            <span className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
              {value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Handle guest order creation
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Prepare cart items for the order
      const orderItems = processedCart.map(item => ({
        id: item.id || item._id,
        title: item.title,
        price: item.price || item.currentPrice || item.originalPrice || 0,
        quantity: item.quantity || 1,
        image: item.processedImage || item.image,
        name: item.title,
        category: item.category || 'General',
        // NEW: Include selected options in order items
        selectedOptions: item.selectedOptions || null
      }));

      // Calculate prices
      const itemsPrice = subtotal;
      const shippingPrice = 0;
      const taxPrice = 0;
      const totalPrice = itemsPrice;

      // Prepare order data
      const orderData = {
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          phone: formData.phone,
          phone2: formData.phone2 // Include optional phone2
        },
        paymentMethod: formData.paymentMethod,
        items: orderItems,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        isGuest: !user
      };

      console.log('Sending order data:', orderData);

      // Create order via API
      const newOrder = await createOrder(orderData);
      
      // TRACK PURCHASE IN GA4
      try {
        const purchaseData = {
          _id: newOrder._id,
          orderNumber: newOrder.orderNumber,
          totalAmount: newOrder.totalAmount || totalPrice,
          totalPrice: newOrder.totalPrice || totalPrice,
          taxAmount: newOrder.taxAmount || taxPrice,
          shippingCost: newOrder.shippingCost || shippingPrice,
          paymentMethod: newOrder.paymentMethod || formData.paymentMethod,
          items: newOrder.items || orderItems,
          orderItems: newOrder.orderItems || orderItems
        };
        
        trackPurchase(purchaseData);
        console.log('GA4: Purchase tracked successfully');
      } catch (gaError) {
        console.error('GA4: Error tracking purchase:', gaError);
        // Don't block the order flow if GA4 tracking fails
      }
      
      // Set success state
      setCreatedOrder(newOrder);
      setOrderSuccess(true);
      
      // Clear cart from localStorage
      localStorage.removeItem('cart');
      setLocalCart([]);
      
      // Call parent function if it exists
      if (clearCart) {
        clearCart();
      }
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state while cart is being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Order Success Screen
  if (orderSuccess && createdOrder) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Order Placed Successfully!
              </h1>
              
              <p className="text-gray-600 mb-2">
                Thank you for your purchase. Your order has been confirmed.
              </p>

              {/* Guest-specific instructions */}
              {isGuest && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Order Information
                  </h3>
                  <p className="text-yellow-700 text-sm">
                    <strong>Order Number:</strong> {createdOrder.orderNumber}<br/>
                    <strong>Email:</strong> {createdOrder.shippingAddress.email}<br/>
                    <br/>
                    You can track your order using your email and order number on the Track Order page.
                  </p>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                {user ? (
                  <button
                    onClick={() => navigate('/account?tab=orders')}
                    className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                  >
                    View My Orders
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/track-order')}
                    className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                  >
                    Track Your Order
                  </button>
                )}
                <button
                  onClick={() => navigate('/')}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
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
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          </div>

          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">

              {/* Saved Addresses (only for logged in users) */}
              {user && loadingAddresses ? (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    <span className="ml-3 text-gray-600">Loading addresses...</span>
                  </div>
                </div>
              ) : user && userAddresses.length > 0 ? (
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
                          {address.phone2 && (
                            <p className="text-gray-600 text-sm">Alt: {address.phone2}</p>
                          )}
                          <p className="text-gray-600 text-sm">{address.email}</p>
                          <p className="text-gray-600 text-sm">
                            {address.address}, {address.city}, {address.country}
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
                <div>
                  {user && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                      <p className="text-gray-600 text-sm mb-4">
                        No saved addresses found. Please fill in your shipping information below.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Shipping Information */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Information
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
                        onChange={handlePhoneChange}
                        required
                        maxLength="12"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="0300 0000000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alternative Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      name="phone2"
                      value={formData.phone2}
                      onChange={handlePhoneChange}
                      maxLength="12"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="0300 0000000"
                    />
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Payment Method - Only COD */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </h2>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 border border-teal-500 bg-teal-50 rounded-xl cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={true}
                      onChange={handleInputChange}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <Truck className="w-5 h-5 text-teal-600" />
                    <span className="font-medium">Cash on Delivery</span>
                  </label>
                  
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    💰 Pay with cash when your order is delivered. No online payment required.
                  </p>
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
                        {/* NEW: Display Selected Options */}
                        {renderSelectedOptions(item.selectedOptions)}
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatPrice((item.price || item.currentPrice || item.originalPrice || 0) * (item.quantity || 1))}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
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
                      <span>{formatPrice(subtotal)}</span>
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
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    `Place Order - ${formatPrice(subtotal)}`
                  )}
                </button>
                
                <p className="text-center text-sm text-gray-500 mt-3">
                  You'll pay when your order is delivered
                </p>

                {/* Guest notice */}
                {isGuest && (
                  <p className="text-center text-sm text-gray-500 mt-3">
                    You can also track your order using your email.
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;