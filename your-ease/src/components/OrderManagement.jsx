import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Eye, 
  Edit3, 
  Truck, 
  Package, 
  CheckCircle, 
  XCircle,
  Clock,
  RefreshCw,
  Download,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Loader,
  ShoppingBag,
  Tag,
  List // NEW: Import List icon for options
} from 'lucide-react';
import { getOrderDetails, getFilteredOrders, updateOrderStatus } from '../api';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(null);
console.log(orders);

  console.log('Orders from backend:', orders);

  // Fetch all orders - FIXED: Use real order numbers from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getFilteredOrders({ status: statusFilter, search: searchTerm });
        // FIXED: Use the actual orderNumber from backend, don't generate fake ones
        setOrders(data.orders || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        // Fallback sample data with proper order numbers
        const sampleWithNumbers = sampleOrders.map((order, index) => ({
          ...order,
          orderNumber: `#${1000 + index + 1}` // Only for sample data
        }));
        setOrders(sampleWithNumbers);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter, searchTerm]);

  // Fetch detailed order data when view is clicked
  const handleViewOrderDetails = async (orderId) => {
    setOrderDetailsLoading(orderId);
    try {
      const orderDetails = await getOrderDetails(orderId);
      console.log('Order details:', orderDetails);
      
      // Update the order in state with detailed data
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, ...orderDetails, orderItems: orderDetails.orderItems || [] }
            : order
        )
      );
      
      setSelectedOrder({ ...orderDetails });
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('Failed to load order details');
    } finally {
      setOrderDetailsLoading(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-purple-100 text-purple-800 border-purple-200',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      confirmed: <CheckCircle className="w-4 h-4" />,
      processing: <RefreshCw className="w-4 h-4" />,
      shipped: <Truck className="w-4 h-4" />,
      delivered: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />
    };
    return icons[status];
  };

  // FIXED: Get buyer name - use shipping address fullName instead of user name
  const getBuyerName = (order) => {
    return order.shippingAddress?.fullName || order.user?.name || 'N/A';
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

  const filteredOrders = orders.filter(order => {
    const buyerName = getBuyerName(order);
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { orderStatus: newStatus });
      
      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, orderStatus: newStatus } : order
      ));
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
      }
      
      setShowStatusModal(false);
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "Rs 0";
    return `Rs ${parseFloat(price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // FIXED: Get display order number - use real one or fallback
  const getDisplayOrderNumber = (order) => {
    return order.orderNumber || `#${order._id?.slice(-6).toUpperCase()}` || 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600">Manage and track customer orders</p>
      </div>

      {/* Filters and Search - Mobile Optimized */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order number, buyer name, email..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              className="flex-1 border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="flex items-center gap-2 bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Orders List - Professional Mobile Design */}
      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Order Header - Compact Mobile Design */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="font-bold text-gray-900 text-lg truncate">
                      {getDisplayOrderNumber(order)}
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                      {getStatusIcon(order.orderStatus)}
                      <span className="hidden xs:inline">{order.orderStatus}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  
                  {/* FIXED: Show buyer name (shipping address name) instead of account name */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="truncate">{getBuyerName(order)}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-gray-900 text-lg mb-1">
                    {formatPrice(order.totalPrice)}
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleViewOrderDetails(order._id)}
                  disabled={orderDetailsLoading === order._id}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg font-medium hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {orderDetailsLoading === order._id ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  Details
                </button>
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowStatusModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2 px-3 rounded-lg font-medium hover:bg-green-100 transition-colors text-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  Status
                </button>
              </div>
            </div>

            {/* Expandable Content - Mobile Optimized */}
            {(expandedOrder === order._id) && (
              <div className="border-t border-gray-200 bg-gray-50">
                {/* Order Items Section */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag className="w-4 h-4 text-gray-600" />
                    <h4 className="font-semibold text-gray-900">Order Items</h4>
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                      {order.orderItems?.length || 0}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {order.orderItems && order.orderItems.length > 0 ? (
                      order.orderItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                          <img 
                            src={item.image || '/placeholder.png'} 
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => {
                              e.target.src = "/placeholder.png";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                              {item.name || 'Unnamed Product'}
                            </h5>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Tag className="w-3 h-3" />
                              <span>Qty: {item.qty || 1}</span>
                              <span>•</span>
                              <span>{formatPrice(item.price)} each</span>
                            </div>
                            {/* NEW: Display Selected Options */}
                            {renderSelectedOptions(item.selectedOptions)}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 text-sm">
                              {formatPrice((item.price || 0) * (item.qty || 1))}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500 bg-white rounded-lg border border-gray-200">
                        <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No items found</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer & Shipping Info */}
                <div className="p-4 border-b border-gray-200">
                  <div className="grid grid-cols-1 gap-4">
                    {/* Customer Details */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-gray-600" />
                        <h4 className="font-semibold text-gray-900">Customer</h4>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{getBuyerName(order)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 truncate">{order.user?.email || 'N/A'}</span>
                        </div>
                        {order.shippingAddress?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{order.shippingAddress.phone}</span>
                          </div>
                        )}
                        {/* FIXED: Show second phone number if available */}
                        {order.shippingAddress?.phone2 && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Alt: {order.shippingAddress.phone2}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <h4 className="font-semibold text-gray-900">Shipping</h4>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-1">
                        <p className="text-sm font-medium text-gray-900">{order.shippingAddress?.fullName || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{order.shippingAddress?.address || 'N/A'}</p>
                        <p className="text-sm text-gray-600">
                          {order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.country || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary - FIXED: Show correct price breakdown */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4 text-gray-600" />
                    <h4 className="font-semibold text-gray-900">Order Summary</h4>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatPrice(order.itemsPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">Included</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-semibold text-teal-600">{formatPrice(order.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment</span>
                      <span className="font-medium capitalize">{order.paymentMethod || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <StatusUpdateModal
          order={selectedOrder}
          onUpdate={handleUpdateOrderStatus}
          onClose={() => setShowStatusModal(false)}
        />
      )}
    </div>
  );
};

// Order Details Modal Component - FIXED: Use real order numbers
const OrderDetailsModal = ({ order, onClose }) => {
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "Rs 0";
    return `Rs ${parseFloat(price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  // FIXED: Get display order number
  const getDisplayOrderNumber = (order) => {
    return order.orderNumber || `#${order._id?.slice(-6).toUpperCase()}` || 'N/A';
  };

  // FIXED: Get buyer name - use shipping address fullName instead of user name
  const getBuyerName = (order) => {
    return order.shippingAddress?.fullName || order.user?.name || 'N/A';
  };

  // NEW: Function to display selected options in modal
  const renderSelectedOptions = (selectedOptions) => {
    if (!selectedOptions || Object.keys(selectedOptions).length === 0) {
      return null;
    }

    return (
      <div className="mt-2 space-y-1">
        {Object.entries(selectedOptions).map(([optionName, value]) => (
          <div key={optionName} className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-700 capitalize">{optionName}:</span>
            <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200">
              {value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Order Details - {getDisplayOrderNumber(order)}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Information
              </h3>
              <div className="space-y-2">
                <p className="text-gray-900 font-medium">{getBuyerName(order)}</p>
                <p className="text-gray-600">{order.user?.email || 'N/A'}</p>
                {order.shippingAddress?.phone && (
                  <p className="text-gray-600">{order.shippingAddress.phone}</p>
                )}
                {/* FIXED: Show second phone number if available */}
                {order.shippingAddress?.phone2 && (
                  <p className="text-gray-600">Alt: {order.shippingAddress.phone2}</p>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Shipping Address
              </h3>
              <div className="space-y-1">
                <p className="text-gray-900 font-medium">{order.shippingAddress?.fullName || 'N/A'}</p>
                <p className="text-gray-600">{order.shippingAddress?.address || 'N/A'}</p>
                <p className="text-gray-600">
                  {order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.country || 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Order Information
              </h3>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <strong>Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-gray-600">
                  <strong>Status:</strong> <span className="capitalize">{order.orderStatus || 'N/A'}</span>
                </p>
                <p className="text-gray-600">
                  <strong>Payment:</strong> <span className="capitalize">{order.paymentMethod || 'N/A'}</span>
                </p>
                {order.trackingNumber && (
                  <p className="text-gray-600">
                    <strong>Tracking:</strong> {order.trackingNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.orderItems && order.orderItems.length > 0 ? (
                order.orderItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <img 
                      src={item._doc.image || '/placeholder.png'} 
                      alt={item._doc.name}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.target.src = "/placeholder.png";
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item._doc.name || 'Unnamed Product'}</h4>
                      <p className="text-gray-600">Quantity: {item._doc.qty || 1}</p>
                      {/* NEW: Display Selected Options in Modal */}
                      {renderSelectedOptions(item.selectedOptions)}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice((item._doc.price || 0) * (item._doc.qty || 1))}
                      </p>
                      <p className="text-gray-600 text-sm">{formatPrice(item._doc.price)} each</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No order items found
                </div>
              )}
            </div>
          </div>

          {/* Order Totals - FIXED: Show correct price breakdown */}
          <div className="border-t border-gray-200 pt-4">
            <div className="max-w-md ml-auto space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">{formatPrice(order.itemsPrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tax:</span>
                <span className="font-semibold">Included</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-teal-600">
                  {formatPrice(order.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Status Update Modal Component - FIXED: Use real order numbers
const StatusUpdateModal = ({ order, onUpdate, onClose }) => {
  const [selectedStatus, setSelectedStatus] = useState(order.orderStatus);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');

  const statusOptions = [
    { value: 'pending', label: 'Pending', description: 'Order received, waiting for confirmation' },
    { value: 'confirmed', label: 'Confirmed', description: 'Order confirmed and being processed' },
    { value: 'processing', label: 'Processing', description: 'Order is being prepared for shipment' },
    { value: 'shipped', label: 'Shipped', description: 'Order has been shipped to customer' },
    { value: 'delivered', label: 'Delivered', description: 'Order has been delivered' },
    { value: 'cancelled', label: 'Cancelled', description: 'Order has been cancelled' }
  ];

  // FIXED: Get display order number
  const getDisplayOrderNumber = (order) => {
    return order.orderNumber || `#${order._id?.slice(-6).toUpperCase()}` || 'N/A';
  };

  // FIXED: Get buyer name - use shipping address fullName instead of user name
  const getBuyerName = (order) => {
    return order.shippingAddress?.fullName || order.user?.name || 'N/A';
  };

  const handleUpdate = () => {
    const updateData = { orderStatus: selectedStatus };
    if (selectedStatus === 'shipped' && trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    onUpdate(order._id, selectedStatus);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Update Order Status
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Order {getDisplayOrderNumber(order)} - {getBuyerName(order)}
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Status
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {selectedStatus === 'shipped' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Current Status:</strong> {order.orderStatus}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              {statusOptions.find(opt => opt.value === selectedStatus)?.description}
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleUpdate}
            className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
          >
            Update Status
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Sample data for demonstration - UPDATED: Added sample options
const sampleOrders = [
  {
    _id: 'order_1',
    user: {
      name: 'John Doe',
      email: 'john@example.com'
    },
    createdAt: new Date().toISOString(),
    totalPrice: 4500,
    orderStatus: 'pending',
    shippingAddress: {
      fullName: 'Ahmed Khan', // Different from account name
      address: '123 Main Street, Gulshan-e-Iqbal',
      city: 'Karachi',
      country: 'Pakistan',
      phone: '0300 1234567',
      phone2: '0300 7654321' // Second phone number
    },
    paymentMethod: 'cod',
    orderItems: [
      {
        name: 'Wireless Bluetooth Headphones',
        price: 4500,
        qty: 1,
        image: '/placeholder-headphones.jpg',
        // NEW: Sample selected options
        selectedOptions: {
          color: 'Black',
          size: 'Large'
        }
      },
      {
        name: 'Phone Case',
        price: 1500,
        qty: 2,
        image: '/placeholder-case.jpg',
        // NEW: Sample selected options
        selectedOptions: {
          color: 'Blue',
          material: 'Silicone'
        }
      }
    ],
    itemsPrice: 7500,
    shippingPrice: 0,
    taxPrice: 0
  }
];

export default OrderManagement;