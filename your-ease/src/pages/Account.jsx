// src/pages/Account.jsx
import React, { useState, useEffect } from "react";
import { 
  loginUser, 
  registerUser, 
  updateUserProfile,
  getUserDashboard,
  getUserOrders,
  getWishlist,
  getAddresses,
  addToWishlist,
  removeFromWishlist,
  addAddress,
  deleteAddress,
  setDefaultAddress
} from "../api";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  Settings, 
  LogOut, 
  Edit3,
  Shield,
  Bell,
  Star,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Eye,
  Home,
  Building,
  Navigation,
  BarChart3,
  Image,
  List,
  RefreshCw,
  Calendar,
  Tag
} from "lucide-react";

// Import the proper OrderManagement component
import OrderManagement from "../components/OrderManagement";

// Import your admin components
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import BannerAdmin from "../pages/admin/BannerAdmin";
import CategoriesAdmin from "../pages/admin/CategoriesAdmin";
import SalesAdmin from "../pages/admin/SalesAdmin";

// Loading Spinner Component
const LoadingSpinner = ({ size = "medium" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-8 h-8"
  };
  
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-teal-600 ${sizeClasses[size]}`}></div>
  );
};

// Address Form Component
const AddressForm = ({ 
  showAddressForm, 
  setShowAddressForm, 
  addressForm, 
  handleAddressFormChange, 
  handleAddAddress, 
  addressLoading 
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Add New Address</h3>
        <button
          onClick={() => setShowAddressForm(false)}
          className="text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>
      </div>
      
      <form onSubmit={handleAddAddress} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            name="fullName"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
            value={addressForm.fullName}
            onChange={handleAddressFormChange}
            placeholder="Enter full name"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
              value={addressForm.phone}
              onChange={handleAddressFormChange}
              placeholder="+92 XXX XXXXXXX"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
              value={addressForm.email}
              onChange={handleAddressFormChange}
              placeholder="your@email.com"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
          <textarea
            name="address"
            required
            rows="3"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
            value={addressForm.address}
            onChange={handleAddressFormChange}
            placeholder="House #, Street, Area, Landmark"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              type="text"
              name="city"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
              value={addressForm.city}
              onChange={handleAddressFormChange}
              placeholder="Enter city"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <input
              type="text"
              name="state"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
              value={addressForm.state}
              onChange={handleAddressFormChange}
              placeholder="Enter state"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <input
            type="text"
            name="country"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors bg-gray-50"
            value={addressForm.country}
            onChange={handleAddressFormChange}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
          <div className="flex gap-4">
            {['home', 'work', 'other'].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value={type}
                  checked={addressForm.type === type}
                  onChange={handleAddressFormChange}
                  className="text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <span className="text-sm capitalize text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="defaultAddress"
            name="isDefault"
            checked={addressForm.isDefault}
            onChange={handleAddressFormChange}
            className="text-teal-600 focus:ring-teal-500 cursor-pointer"
          />
          <label htmlFor="defaultAddress" className="text-sm text-gray-700 cursor-pointer">
            Set as default address
          </label>
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={addressLoading}
            className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {addressLoading && <LoadingSpinner size="small" />}
            {addressLoading ? "Adding..." : "Add Address"}
          </button>
          <button
            type="button"
            onClick={() => setShowAddressForm(false)}
            className="px-6 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
);

const Account = () => {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    birthday: "",
    gender: ""
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "Pakistan",
    type: "home",
    isDefault: false
  });
  const [addressLoading, setAddressLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState({
    dashboard: false,
    orders: false,
    wishlist: false,
    addresses: false
  });

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setProfileData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        birthday: userData.birthday || "",
        gender: userData.gender || ""
      });
    }
  }, []);

  // Load data based on active tab
  useEffect(() => {
    if (user && activeTab) {
      switch (activeTab) {
        case "dashboard":
          loadDashboardData();
          break;
        case "orders":
          if (!user.isAdmin) loadOrders();
          break;
        case "wishlist":
          if (!user.isAdmin) loadWishlist();
          break;
        case "addresses":
          loadAddresses();
          break;
        default:
          break;
      }
    }
  }, [activeTab, user]);

  const setLoadingState = (tab, isLoading) => {
    setDataLoading(prev => ({
      ...prev,
      [tab]: isLoading
    }));
  };

  const loadDashboardData = async () => {
    setLoadingState('dashboard', true);
    try {
      const data = await getUserDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoadingState('dashboard', false);
    }
  };

  const loadOrders = async () => {
    setLoadingState('orders', true);
    try {
      const data = await getUserOrders();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoadingState('orders', false);
    }
  };

  const loadWishlist = async () => {
    setLoadingState('wishlist', true);
    try {
      const data = await getWishlist();
      setWishlist(data.items || []);
    } catch (error) {
      console.error("Error loading wishlist:", error);
    } finally {
      setLoadingState('wishlist', false);
    }
  };

  const loadAddresses = async () => {
    setLoadingState('addresses', true);
    try {
      const data = await getAddresses();
      setAddresses(data.addresses || data || []);
    } catch (error) {
      console.error("Error loading addresses:", error);
      setAddresses([]);
    } finally {
      setLoadingState('addresses', false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let data;
      if (isLogin) {
        data = await loginUser(form.email, form.password);
      } else {
        data = await registerUser(form.name, form.email, form.password);
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userInfo", JSON.stringify(data));
        console.log(data.token);
        
        setUser(data);
        setProfileData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          birthday: data.birthday || "",
          gender: data.gender || ""
        });
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setUser(null);
    setDashboardData(null);
    setOrders([]);
    setWishlist([]);
    setAddresses([]);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updatedUser = await updateUserProfile(profileData);
      setUser(updatedUser);
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (error) {
      alert(error.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWishlist = async (productId) => {
    try {
      await addToWishlist(productId);
      loadWishlist();
    } catch (error) {
      alert(error.message || "Error adding to wishlist");
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeFromWishlist(productId);
      loadWishlist();
    } catch (error) {
      alert(error.message || "Error removing from wishlist");
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressLoading(true);
    
    try {
      const addressData = {
        fullName: addressForm.fullName,
        phone: addressForm.phone,
        email: addressForm.email,
        address: addressForm.address,
        city: addressForm.city,
        state: addressForm.state,
        country: addressForm.country,
        type: addressForm.type,
        isDefault: addressForm.isDefault
      };
      
      await addAddress(addressData);
      setShowAddressForm(false);
      setAddressForm({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        country: "Pakistan",
        type: "home",
        isDefault: false
      });
      loadAddresses();
      alert("Address added successfully!");
    } catch (error) {
      console.error("Address error details:", error);
      alert(error.message || "Error adding address. Please check the console for details.");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    
    try {
      await deleteAddress(addressId);
      loadAddresses();
      alert("Address deleted successfully!");
    } catch (error) {
      alert(error.message || "Error deleting address");
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await setDefaultAddress(addressId);
      loadAddresses();
      alert("Default address updated!");
    } catch (error) {
      alert(error.message || "Error setting default address");
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

  const getAddressIcon = (type) => {
    switch (type) {
      case 'home': return <Home className="w-4 h-4" />;
      case 'work': return <Building className="w-4 h-4" />;
      default: return <Navigation className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return `Rs ${parseFloat(price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileDataChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const userItems = [
      { id: "dashboard", label: "Dashboard", icon: User },
      { id: "orders", label: "My Orders", icon: ShoppingBag },
      { id: "wishlist", label: "Wishlist", icon: Heart },
      { id: "addresses", label: "Addresses", icon: MapPin },
      { id: "settings", label: "Account Settings", icon: Settings },
      { id: "sales", label: "Sales Management", icon: Tag },
    ];

    const adminItems = [
      { id: "dashboard", label: "Analytics", icon: BarChart3 },
  { id: "orders", label: "Order Management", icon: ShoppingBag },
  { id: "sales", label: "Sales Management", icon: Tag }, // NEW: Added sales management
  { id: "banners", label: "Banner Management", icon: Image },
  { id: "categories", label: "Category Management", icon: List },
  { id: "settings", label: "Account Settings", icon: Settings },
    ];

    return user?.isAdmin ? adminItems : userItems;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-gray-600 mt-2">
                  {isLogin ? "Sign in to your account" : "Join us today"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                      value={form.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    value={form.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    value={form.password}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl font-semibold transition-colors shadow-lg flex items-center justify-center gap-2 ${
                    loading
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  {loading && <LoadingSpinner size="small" />}
                  {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
                </button>
              </form>

              <p className="mt-6 text-center text-gray-600">
                {isLogin ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      onClick={() => setIsLogin(false)}
                      className="text-teal-600 font-semibold hover:text-teal-700"
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => setIsLogin(true)}
                      className="text-teal-600 font-semibold hover:text-teal-700"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Profile Dashboard
  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-24">
      {showAddressForm && (
        <AddressForm 
          showAddressForm={showAddressForm}
          setShowAddressForm={setShowAddressForm}
          addressForm={addressForm}
          handleAddressFormChange={handleAddressFormChange}
          handleAddAddress={handleAddAddress}
          addressLoading={addressLoading}
        />
      )}
      
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-teal-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {user.name}!
                    {user.isAdmin && <span className="ml-2 text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Admin</span>}
                  </h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors text-sm font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-8">
                <nav className="space-y-2">
                  {getNavigationItems().map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        activeTab === item.id
                          ? "bg-teal-50 text-teal-600 font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {/* Dashboard Tab - Different for Admin vs User */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  {user.isAdmin ? (
                    // Admin Analytics Dashboard
                    <AnalyticsDashboard />
                  ) : (
                    // User Dashboard
                    <>
                      {dataLoading.dashboard ? (
                        <div className="bg-white rounded-2xl shadow-sm p-12 flex items-center justify-center">
                          <div className="text-center">
                            <LoadingSpinner size="large" />
                            <p className="mt-3 text-gray-600">Loading dashboard...</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                              <ShoppingBag className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-gray-900">
                                {dashboardData?.stats?.totalOrders || 0}
                              </div>
                              <div className="text-sm text-gray-600">Total Orders</div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                              <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-gray-900">
                                {dashboardData?.stats?.wishlistCount || 0}
                              </div>
                              <div className="text-sm text-gray-600">Wishlist Items</div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-gray-900">
                                {dashboardData?.stats?.loyaltyPoints || 0}
                              </div>
                              <div className="text-sm text-gray-600">Loyalty Points</div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                              <Package className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-gray-900">
                                {dashboardData?.stats?.pendingOrders || 0}
                              </div>
                              <div className="text-sm text-gray-600">Processing</div>
                            </div>
                          </div>

                          {/* Recent Orders */}
                            {/* Recent Orders */}
<div className="bg-white rounded-2xl shadow-sm p-6">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
      <p className="text-sm text-gray-600 mt-1">Your latest purchases</p>
    </div>
    <button 
      onClick={() => setActiveTab("orders")}
      className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold text-sm transition-colors group"
    >
      View All
      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
  
  <div className="space-y-3">
    {dataLoading.orders ? (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="medium" />
        <span className="ml-3 text-gray-600">Loading orders...</span>
      </div>
    ) : orders.length > 0 ? (
      orders.slice(0, 3).map((order) => (
        <div 
          key={order._id} 
          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-teal-50 transition-colors cursor-pointer group"
          onClick={() => setActiveTab("orders")}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center group-hover:border-teal-200 transition-colors">
              <ShoppingBag className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 group-hover:text-teal-900 transition-colors">
                {order.orderNumber || 'Order'}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-bold text-gray-900 text-lg mb-1">{formatPrice(order.totalPrice)}</div>
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)} group-hover:shadow-sm transition-shadow`}>
              {getStatusIcon(order.orderStatus)}
              <span className="capitalize">{order.orderStatus}</span>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <ShoppingBag className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm">No recent orders</p>
        <p className="text-gray-400 text-xs mt-1">Your orders will appear here</p>
      </div>
    )}
  </div>
</div>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Orders Tab - Different for Admin vs User */}
             
{activeTab === "orders" && (
  <div className="space-y-6">
    {user.isAdmin ? (
      <OrderManagement />
    ) : (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
          <span className="text-gray-600">{orders.length} orders</span>
        </div>
        
        {dataLoading.orders ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <LoadingSpinner size="large" />
              <p className="mt-3 text-gray-600">Loading your orders...</p>
            </div>
          </div>
        ) : orders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div key={order._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                {/* Order Header - Minimal */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                      {getStatusIcon(order.orderStatus)}
                      <span className="capitalize">{order.orderStatus}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">{formatPrice(order.totalPrice)}</p>
                    <p className="text-sm text-gray-500 capitalize">{order.paymentMethod}</p>
                  </div>
                </div>

                {/* Order Items - Clean & Clickable */}
                <div className="space-y-3">
                  {order.orderItems?.map((item, index) => (
                    <div 
                      key={index} 
                      onClick={() => navigate(`/product/${item.product}`)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <img 
                        src={item.image || '/placeholder.png'} 
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          e.target.src = "/placeholder.png";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>Qty: {item.qty}</span>
                          <span>•</span>
                          <span>{formatPrice(item.price)} each</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm">
                          {formatPrice(item.price * item.qty)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary - Minimal */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>{order.orderItems?.length || 0} items</span>
                    <span>Total: {formatPrice(order.totalPrice)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
            <button
              onClick={() => navigate('/')}
              className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    )}
  </div>
)}

              {/* Wishlist Tab - Only for Users */}
              {activeTab === "wishlist" && !user.isAdmin && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">My Wishlist</h2>
                    <span className="text-gray-600">{wishlist.length} items</span>
                  </div>
                  
                  {dataLoading.wishlist ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <LoadingSpinner size="large" />
                        <p className="mt-3 text-gray-600">Loading wishlist...</p>
                      </div>
                    </div>
                  ) : wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {wishlist.map((item) => (
                        <div key={item._id} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex gap-4">
                            <img 
                              src={item.product?.images?.[0]?.url || '/placeholder.png'} 
                              alt={item.product?.title}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                {item.product?.title}
                              </h3>
                              <p className="text-lg font-bold text-teal-600 mb-2">
                                {formatPrice(item.product?.currentPrice || 0)}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => navigate(`/product/${item.product?._id}`)}
                                  className="flex-1 bg-teal-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors"
                                >
                                  View Product
                                </button>
                                <button
                                  onClick={() => handleRemoveFromWishlist(item.product?._id)}
                                  className="p-2 text-red-600 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Wishlist is Empty</h3>
                      <p className="text-gray-600 mb-6">Save items you love for later</p>
                      <button
                        onClick={() => navigate('/')}
                        className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                      >
                        Start Shopping
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Addresses Tab - For both Admin and Users */}
              {activeTab === "addresses" && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
                    <button 
                      onClick={() => setShowAddressForm(true)}
                      className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Address
                    </button>
                  </div>
                  
                  {dataLoading.addresses ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <LoadingSpinner size="large" />
                        <p className="mt-3 text-gray-600">Loading addresses...</p>
                      </div>
                    </div>
                  ) : addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <div key={address._id} className="border border-gray-200 rounded-xl p-4 relative">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {getAddressIcon(address.type)}
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                address.type === 'home' ? 'bg-blue-100 text-blue-800' :
                                address.type === 'work' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {address.type}
                              </span>
                              {address.isDefault && (
                                <span className="inline-block px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {!address.isDefault && (
                                <button
                                  onClick={() => handleSetDefaultAddress(address._id)}
                                  className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                                >
                                  Set Default
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAddress(address._id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold text-gray-900">{address.fullName}</p>
                            <p className="text-gray-600">{address.email}</p>
                            <p className="text-gray-600">{address.phone}</p>
                            <p className="text-gray-600">{address.address}</p>
                            <p className="text-gray-600">{address.city}, {address.state}</p>
                            <p className="text-gray-600">{address.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Addresses</h3>
                      <p className="text-gray-600 mb-6">Add addresses for faster checkout</p>
                      <button 
                        onClick={() => setShowAddressForm(true)}
                        className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                      >
                        Add Your First Address
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Admin Tabs */}
              {activeTab === "banners" && user.isAdmin && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Banner Management</h2>
                  <BannerAdmin />
                </div>
              )}

              {activeTab === "categories" && user.isAdmin && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Category Management</h2>
                  <CategoriesAdmin />
                </div>
              )}

              {activeTab === "sales" && user.isAdmin && (
  <div className="bg-white rounded-2xl shadow-sm p-6">
    <h2 className="text-xl font-bold text-gray-900 mb-6">Sales Management</h2>
    <SalesAdmin />
  </div>
)}

              {/* Account Settings Tab - For both */}
              {activeTab === "settings" && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
                    <button
                      onClick={() => setEditMode(!editMode)}
                      disabled={loading}
                      className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold"
                    >
                      <Edit3 className="w-4 h-4" />
                      {editMode ? "Cancel" : "Edit Profile"}
                    </button>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                          value={profileData.name}
                          onChange={handleProfileDataChange}
                          disabled={!editMode || loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                          value={profileData.email}
                          onChange={handleProfileDataChange}
                          disabled={!editMode || loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                          value={profileData.phone}
                          onChange={handleProfileDataChange}
                          disabled={!editMode || loading}
                          placeholder="+92 XXX XXXXXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="birthday"
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                          value={profileData.birthday}
                          onChange={handleProfileDataChange}
                          disabled={!editMode || loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender
                        </label>
                        <select
                          name="gender"
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                          value={profileData.gender}
                          onChange={handleProfileDataChange}
                          disabled={!editMode || loading}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    {editMode && (
                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className={`px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 ${
                            loading
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-teal-600 text-white hover:bg-teal-700'
                          }`}
                        >
                          {loading && <LoadingSpinner size="small" />}
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditMode(false)}
                          disabled={loading}
                          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </form>

                  {/* Security Settings */}
                  <div className="border-t border-gray-200 mt-8 pt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
                    <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-gray-600" />
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">Change Password</div>
                          <div className="text-sm text-gray-600">Update your password regularly</div>
                        </div>
                      </div>
                      <Edit3 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Notification Settings */}
                  <div className="border-t border-gray-200 mt-6 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                    <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">Notification Preferences</div>
                          <div className="text-sm text-gray-600">Manage your email and push notifications</div>
                        </div>
                      </div>
                      <Edit3 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;