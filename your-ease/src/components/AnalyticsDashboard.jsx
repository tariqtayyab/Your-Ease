import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [realTimeData, setRealTimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchAnalyticsData();
    if (activeTab === 'realtime') {
      fetchRealTimeData();
    }
  }, [period, activeTab]);

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/analytics/dashboard?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
    
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/analytics/realtime`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRealTimeData(data);
      }
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center text-gray-500 py-8">
        Failed to load analytics data
      </div>
    );
  }

  const { summary, popularProducts, dailyTraffic } = analyticsData;

  // Calculate additional metrics
  const totalEvents = (summary.totalPageViews || 0) + 
                     (summary.totalProductViews || 0) + 
                     (summary.totalAddToCart || 0) + 
                     (summary.totalPurchases || 0);

  const cartToPurchaseRate = summary.totalAddToCart > 0 
    ? ((summary.totalPurchases / summary.totalAddToCart) * 100).toFixed(2) 
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'realtime', 'products', 'traffic'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'realtime' && 'Real-Time'}
              {tab === 'products' && 'Products'}
              {tab === 'traffic' && 'Traffic'}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Enhanced Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Events</h3>
              <p className="text-3xl font-bold text-blue-600">{totalEvents.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">All tracked activities</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Page Views</h3>
              <p className="text-3xl font-bold text-green-600">{summary.totalPageViews.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Total page visits</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Product Views</h3>
              <p className="text-3xl font-bold text-orange-600">{summary.totalProductViews.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Product page visits</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Conversion Rate</h3>
              <p className="text-3xl font-bold text-purple-600">{summary.conversionRate}%</p>
              <p className="text-sm text-gray-500 mt-1">Views to purchases</p>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Add to Cart</h3>
              <p className="text-3xl font-bold text-indigo-600">{summary.totalAddToCart.toLocaleString()}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Purchases</h3>
              <p className="text-3xl font-bold text-red-600">{summary.totalPurchases?.toLocaleString() || 0}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Cart Conversion</h3>
              <p className="text-3xl font-bold text-teal-600">{cartToPurchaseRate}%</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Traffic Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Daily Traffic</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyTraffic}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Popular Products Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Popular Products</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={popularProducts.slice(0, 5)}
                    dataKey="views"
                    nameKey="title"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {popularProducts.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Real-Time Tab */}
      {activeTab === 'realtime' && realTimeData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Users</h3>
              <p className="text-3xl font-bold text-green-600">{realTimeData.activeUsers}</p>
              <p className="text-sm text-gray-500 mt-1">Last 1 hour</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Period</h3>
              <p className="text-3xl font-bold text-blue-600">{realTimeData.period}</p>
              <p className="text-sm text-gray-500 mt-1">Real-time window</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Events</h3>
              <p className="text-3xl font-bold text-purple-600">
                {realTimeData.stats?.reduce((sum, stat) => sum + stat.count, 0) || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">Last hour</p>
            </div>
          </div>

          {/* Real-Time Events */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Live Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {realTimeData.stats?.map((stat, index) => (
                <div key={stat._id} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">{stat.count}</div>
                  <div className="text-sm text-gray-600 capitalize">{stat._id.replace('_', ' ')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Popular Products Table */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Products by Views</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {popularProducts.map((product, index) => (
                    <tr key={product._id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={product.image || '/placeholder.png'}
                              alt={product.title}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {product.views.toLocaleString()} views
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(product.views / (popularProducts[0]?.views || 1)) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Traffic Tab */}
      {activeTab === 'traffic' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Traffic Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={dailyTraffic}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="views" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;