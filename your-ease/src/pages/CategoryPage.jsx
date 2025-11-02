import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const CategoryPage = ({ onAddToCart }) => {
  const { categoryId } = useParams();
  const location = useLocation();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("position");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Get category name from location state or fetch it
  const categoryName = location.state?.categoryName;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        console.log("🔄 Fetching data for category ID:", categoryId);
        
        // Fetch all categories and products
        const [categoriesResponse, productsResponse] = await Promise.all([
          axios.get(`${API_BASE}/api/categories`),
          axios.get(`${API_BASE}/api/products`)
        ]);

        console.log("📦 All categories:", categoriesResponse.data);
        console.log("📦 All products:", productsResponse.data);
        
        setAllCategories(categoriesResponse.data || []);
        
        // Find the current category from all categories
        const currentCategory = categoriesResponse.data.find(cat => cat._id === categoryId);
        console.log("🎯 Current category found:", currentCategory);
        setCategory(currentCategory || { name: categoryName || "Category" });

        // Filter products for this category
        const categoryProducts = productsResponse.data.filter(product => {
          const productCategoryId = typeof product.category === 'object' 
            ? product.category._id 
            : product.category;
          
          console.log(`🔍 Product: ${product.title}, Category: ${productCategoryId}, Looking for: ${categoryId}`);
          
          return productCategoryId === categoryId;
        });
        
        console.log("✅ Filtered category products:", categoryProducts);
        
        setProducts(categoryProducts);
        setFilteredProducts(categoryProducts);

        // Set initial price range based on actual products
        if (categoryProducts.length > 0) {
          const maxPrice = getMaxPrice(categoryProducts);
          setPriceRange([0, maxPrice]);
        }
        
      } catch (error) {
        console.error("❌ Failed to fetch data:", error);
        // Fallback: use category name from state
        setCategory({ name: categoryName || "Category" });
      } finally {
        setLoading(false);
      }
    }

    if (categoryId) {
      fetchData();
    }
  }, [categoryId, categoryName]);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply price filter
    filtered = filtered.filter(product =>
      product.currentPrice >= priceRange[0] && product.currentPrice <= priceRange[1]
    );

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.currentPrice - b.currentPrice;
        case "price-high":
          return b.currentPrice - a.currentPrice;
        case "name":
          return a.title?.localeCompare(b.title);
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "position":
        default:
          return (a.position || 0) - (b.position || 0);
      }
    });

    setFilteredProducts(filtered);
  }, [products, sortBy, priceRange, searchTerm]);

  // Proper getMaxPrice function for PKR
  const getMaxPrice = (productsArray = products) => {
    if (!productsArray || productsArray.length === 0) return 50000;
    
    const maxPrice = Math.max(...productsArray.map(p => {
      const price = parseFloat(p.currentPrice) || 0;
      return isNaN(price) ? 0 : price;
    }));
    
    // Return at least 1000 PKR, or round up to nearest 5000
    return Math.max(1000, Math.ceil(maxPrice / 5000) * 5000);
  };

  // Format price in Pakistani Rupees
  const formatPrice = (price) => {
    return `Rs. ${price.toLocaleString('en-PK')}`;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, getMaxPrice()]);
    setSortBy("position");
    setShowFilters(false);
  };

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 md:py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center space-x-2 text-sm mb-6 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-16"></div>
            <div className="h-4 bg-gray-300 rounded w-4"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>

          {/* Header Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6 text-center animate-pulse">
            <div className="h-8 md:h-12 bg-gray-300 rounded-lg w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
          </div>

          {/* Filters Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-10 bg-gray-300 rounded-xl"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-300 rounded-xl"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-300 rounded w-28 mb-2"></div>
                <div className="h-10 bg-gray-300 rounded-xl"></div>
              </div>
            </div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-8">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 rounded-2xl h-48 md:h-56 mb-3"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentMaxPrice = getMaxPrice();

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4 md:mb-8">
          <Link to="/" className="hover:text-[#2c9ba3] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{category?.name}</span>
        </nav>

        {/* Header - Compact on mobile */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8 mb-4 md:mb-8 text-center">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#2c9ba3] to-[#34b4bd] bg-clip-text text-transparent md:pb-2 mb-1">
            {category?.name}
          </h1>
          <p className="text-gray-600 text-sm md:text-lg">
            {filteredProducts.length === products.length 
              ? `Explore our collection of ${products.length} products`
              : `Showing ${filteredProducts.length} of ${products.length} products`
            }
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-white rounded-2xl shadow-lg p-4 flex items-center justify-between font-semibold text-gray-700"
          >
            <span>Filters & Sort</span>
            <svg 
              className={`w-5 h-5 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Filters and Search */}
        <div className={`bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2c9ba3] focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2c9ba3] focus:border-transparent"
              >
                <option value="position">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Price Range - Updated for PKR */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={currentMaxPrice} 
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || currentMaxPrice])} 
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || priceRange[1] < currentMaxPrice || sortBy !== "position") && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-gray-600">Active filters:</span>
                {searchTerm && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    Search: "{searchTerm}"
                  </span>
                )}
                {priceRange[1] < currentMaxPrice && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    Price: up to {formatPrice(priceRange[1])}
                  </span>
                )}
                {sortBy !== "position" && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                    Sorted: {sortBy.replace('-', ' ')}
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors self-start sm:self-auto"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <svg className="w-8 h-8 md:w-12 md:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
              <p className="text-gray-500 mb-4 md:mb-6 text-sm md:text-base">
                {products.length === 0 
                  ? "No products available in this category yet."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={clearFilters}
                  className="bg-[#2c9ba3] text-white px-4 py-2 md:px-6 md:py-3 rounded-xl font-semibold hover:bg-[#25838b] transition-colors"
                >
                  Clear Filters
                </button>
                <Link
                  to="/"
                  className="inline-block bg-gray-200 text-gray-700 px-4 py-2 md:px-6 md:py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors text-center"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center pt-6 border-t border-gray-200">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#2c9ba3] hover:text-[#25838b] font-semibold transition-colors text-sm md:text-base"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;