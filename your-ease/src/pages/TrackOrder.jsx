import React, { useState } from 'react';
import { Search, Package, Clock, Truck, CheckCircle, XCircle, Mail } from 'lucide-react';
import { getGuestOrder } from '../api';

const TrackOrder = () => {
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      // Assuming your API can now accept just email
      const orderData = await getGuestOrder(email);
      setOrder(orderData);
    } catch (err) {
      setError(err.message || 'Failed to find order. Please check your email address.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'confirmed':
      case 'processing':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "Rs --";
    return `Rs ${parseFloat(price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-teal-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Track Your Order
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enter your email address to track all your orders in one place.
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  We'll show all orders associated with this email address.
                </p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Searching Orders...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Track My Orders
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="w-5 h-5" />
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Details - Single Order View */}
          {order && !Array.isArray(order) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)} flex items-center gap-2`}>
                  {getStatusIcon(order.orderStatus)}
                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </span>
              </div>

              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Number:</span>
                      <span className="font-medium">{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium">{formatPrice(order.totalPrice)}</span>
                    </div>
                    {order.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tracking Number:</span>
                        <span className="font-medium">{order.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.email}</p>
                    <p>{order.shippingAddress.phone}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = "/placeholder.png";
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                        <p className="text-gray-600 text-sm">Qty: {item.qty}</p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.price * item.qty)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Timeline */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Order Status Timeline</h3>
                <div className="space-y-4">
                  {[
                    { status: 'pending', label: 'Order Placed', description: 'Your order has been received' },
                    { status: 'confirmed', label: 'Order Confirmed', description: 'Your order has been confirmed' },
                    // { status: 'processing', label: 'Processing', description: 'Your order is being prepared' },
                    { status: 'shipped', label: 'Shipped', description: 'Your order is on the way' },
                    { status: 'delivered', label: 'Delivered', description: 'Your order has been delivered' }
                  ].map((step, index) => {
                    const isCompleted = 
                      order.orderStatus === 'cancelled' ? false :
                      step.status === 'pending' ? true :
                      ['confirmed', 'processing', 'shipped', 'delivered'].indexOf(order.orderStatus) >= 
                      ['confirmed', 'processing', 'shipped', 'delivered'].indexOf(step.status);
                    
                    const isCurrent = order.orderStatus === step.status && order.orderStatus !== 'cancelled';
                    
                    return (
                      <div key={step.status} className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-500' : 
                          isCurrent ? 'bg-teal-500' : 'bg-gray-300'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <div className={`w-3 h-3 rounded-full ${
                              isCurrent ? 'bg-white' : 'bg-gray-500'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {step.label}
                          </p>
                          <p className="text-sm text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}

                  {order.orderStatus === 'cancelled' && (
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500">
                        <XCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Order Cancelled</p>
                        <p className="text-sm text-gray-600">This order has been cancelled</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Multiple Orders View */}
          {Array.isArray(order) && order.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Orders</h2>
              {order.map((singleOrder) => (
                <div key={singleOrder._id} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Order #{singleOrder.orderNumber}</h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(singleOrder.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(singleOrder.orderStatus)} flex items-center gap-2`}>
                      {getStatusIcon(singleOrder.orderStatus)}
                      {singleOrder.orderStatus.charAt(0).toUpperCase() + singleOrder.orderStatus.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-semibold text-gray-900">{formatPrice(singleOrder.totalPrice)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Items</p>
                      <p className="font-semibold text-gray-900">{singleOrder.orderItems.length} items</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setOrder(singleOrder)}
                      className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    {singleOrder.trackingNumber && (
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                        Track Package
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Orders Found */}
          {Array.isArray(order) && order.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any orders associated with <strong>{email}</strong>
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• Make sure you entered the correct email address</p>
                <p>• Check your spelling</p>
                <p>• If you just placed an order, it may take a few minutes to appear</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;