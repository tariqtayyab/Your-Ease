import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { BarChart3, Users, ShoppingCart, Eye, TrendingUp } from 'lucide-react';

const AdminAnalytics = () => {
  const location = useLocation();
  const [quickStats, setQuickStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchQuickStats();
  }, []);

  const fetchQuickStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/analytics/dashboard?period=7d`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuickStats(data.summary);
      }
    } catch (error) {
      console.error('Error fetching quick stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    {
      path: '/admin/analytics',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Overall analytics overview'
    },
  ];

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">
            Track your store performance and customer behavior
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Page Views Card */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Page Views
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {formatNumber(quickStats?.totalPageViews)}
                  </dd>
                  <dt className="text-xs text-gray-400 mt-1">
                    Last 7 days
                  </dt>
                </dl>
              </div>
            </div>
          </div>

          {/* Product Views Card */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Product Views
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {formatNumber(quickStats?.totalProductViews)}
                  </dd>
                  <dt className="text-xs text-gray-400 mt-1">
                    Unique viewers
                  </dt>
                </dl>
              </div>
            </div>
          </div>

          {/* Add to Cart Card */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Add to Cart
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {formatNumber(quickStats?.totalAddToCart)}
                  </dd>
                  <dt className="text-xs text-gray-400 mt-1">
                    Cart interactions
                  </dt>
                </dl>
              </div>
            </div>
          </div>

          {/* Conversion Rate Card */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Conversion Rate
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {quickStats?.conversionRate || 0}%
                  </dd>
                  <dt className="text-xs text-gray-400 mt-1">
                    Views to purchases
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <Routes>
            <Route path="/" element={<AnalyticsDashboard />} />
          </Routes>
        </div>

        {/* Debug Info - Remove in production */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Info</h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <div>Quick Stats Data: {JSON.stringify(quickStats)}</div>
              <div>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
              <button 
                onClick={fetchQuickStats}
                className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded text-xs"
              >
                Refresh Stats
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;