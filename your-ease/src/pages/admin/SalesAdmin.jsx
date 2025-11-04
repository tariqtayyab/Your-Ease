// src/pages/admin/SalesAdmin.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Tag, 
  Package, 
  Search,
  Filter,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getSales, createSale, updateSale, deleteSale } from '../../api';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'https://your-ease.onrender.com/api';

const SalesAdmin = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    productSelection: 'selected',
    products: []
  });

  // Fetch sales and products
  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const data = await getSales();
      if (data.sales) {
        setSales(data.sales);
      } else if (Array.isArray(data)) {
        setSales(data);
      }
    } catch (error) {
      alert('Error loading sales: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products?limit=1000`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response structures
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else if (data.data && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      alert('Error loading products: ' + error.message);
      setProducts([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.productSelection === 'selected' && formData.products.length === 0) {
      alert('Please select at least one product');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      alert('End date must be after start date');
      return;
    }

    try {
      setLoading(true);
      let result;

      if (editingSale) {
        result = await updateSale(editingSale._id, formData);
      } else {
        result = await createSale(formData);
      }

      if (result.message) {
        alert(result.message);
        resetForm();
        fetchSales();
      } else {
        throw new Error('No response message from server');
      }
    } catch (error) {
      alert('Error saving sale: ' + (error.message || 'Please check console for details'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setFormData({
      title: sale.title,
      startDate: sale.startDate ? new Date(sale.startDate).toISOString().split('T')[0] : '',
      endDate: sale.endDate ? new Date(sale.endDate).toISOString().split('T')[0] : '',
      productSelection: sale.productSelection || 'selected',
      products: sale.products ? sale.products.map(p => p._id || p) : []
    });
    setShowForm(true);
  };

  const handleDelete = async (saleId) => {
    if (!confirm('Are you sure you want to delete this sale? This will remove sale associations from products.')) {
      return;
    }

    try {
      setLoading(true);
      const result = await deleteSale(saleId);
      
      if (result.message) {
        alert(result.message);
        fetchSales();
      } else {
        throw new Error('No response message from server');
      }
    } catch (error) {
      alert('Error deleting sale: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      startDate: '',
      endDate: '',
      productSelection: 'selected',
      products: []
    });
    setEditingSale(null);
    setShowForm(false);
  };

  const toggleProductSelection = (productId) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.includes(productId)
        ? prev.products.filter(id => id !== productId)
        : [...prev.products, productId]
    }));
  };

  const selectAllProducts = () => {
    setFormData(prev => ({
      ...prev,
      productSelection: 'all',
      products: []
    }));
  };

  const selectSpecificProducts = () => {
    setFormData(prev => ({
      ...prev,
      productSelection: 'selected',
      products: []
    }));
  };

  // Helper functions
  const getSaleStatus = (sale) => {
    if (!sale.isActive) return 'inactive';
    
    const now = new Date();
    const startDate = new Date(sale.startDate);
    const endDate = new Date(sale.endDate);

    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'expired';
    return 'active';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'upcoming': return <Clock className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  // Filter sales based on search and status
  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || getSaleStatus(sale) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
              <p className="text-gray-600 mt-2">Create and manage sales campaigns for your products</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
              disabled={products.length === 0}
            >
              <Plus className="w-5 h-5" />
              Create New Sale
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{sales.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Tag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sales</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {sales.filter(s => getSaleStatus(s) === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {sales.filter(s => getSaleStatus(s) === 'upcoming').length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {sales.filter(s => getSaleStatus(s) === 'expired').length}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <XCircle className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search sales by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
            <div className="sm:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="expired">Expired</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingSale ? 'Edit Sale' : 'Create New Sale'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="e.g., Winter Sale, Black Friday"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Product Selection
                  </label>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={selectAllProducts}
                        className={`flex-1 py-3 px-4 border rounded-lg text-center transition-colors ${
                          formData.productSelection === 'all'
                            ? 'bg-teal-50 border-teal-600 text-teal-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Package className="w-5 h-5 mx-auto mb-2" />
                        All Products
                      </button>
                      <button
                        type="button"
                        onClick={selectSpecificProducts}
                        className={`flex-1 py-3 px-4 border rounded-lg text-center transition-colors ${
                          formData.productSelection === 'selected'
                            ? 'bg-teal-50 border-teal-600 text-teal-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Tag className="w-5 h-5 mx-auto mb-2" />
                        Selected Products
                      </button>
                    </div>

                    {formData.productSelection === 'selected' && (
                      <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                        <h4 className="font-medium text-gray-700 mb-3">Select Products:</h4>
                        {products.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p>No products available</p>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-2">
                              {products.map(product => (
                                <label key={product._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                                  <input
                                    type="checkbox"
                                    checked={formData.products.includes(product._id)}
                                    onChange={() => toggleProductSelection(product._id)}
                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                  />
                                  <img 
                                    src={product.images?.[0]?.url || product.image || '/placeholder.png'} 
                                    alt={product.title}
                                    className="w-8 h-8 object-cover rounded"
                                    onError={(e) => {
                                      e.target.src = '/placeholder.png';
                                    }}
                                  />
                                  <span className="flex-1 text-sm">{product.title}</span>
                                  <span className="text-sm text-gray-500">Rs {product.currentPrice}</span>
                                </label>
                              ))}
                            </div>
                            <div className="mt-3 text-sm text-gray-600">
                              Selected: {formData.products.length} products
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (formData.productSelection === 'selected' && products.length === 0)}
                    className={`flex-1 py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      loading || (formData.productSelection === 'selected' && products.length === 0)
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {editingSale ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingSale ? 'Update Sale' : 'Create Sale'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sales List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading sales...</p>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="p-8 text-center">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No sales found</p>
              {sales.length === 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-3 text-teal-600 hover:text-teal-700 font-medium"
                  disabled={products.length === 0}
                >
                  Create your first sale
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sale
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSales.map((sale) => {
                    const status = getSaleStatus(sale);
                    return (
                      <tr key={sale._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{sale.title}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {sale.startDate ? new Date(sale.startDate).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            to {sale.endDate ? new Date(sale.endDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {sale.productSelection === 'all' ? 'All Products' : `${sale.products?.length || 0} Products`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                            {getStatusIcon(status)}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(sale)}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-2"
                              title="Edit sale"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(sale._id)}
                              className="text-red-600 hover:text-red-800 transition-colors p-2"
                              title="Delete sale"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesAdmin;