import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { FiSearch, FiFilter, FiX, FiSliders } from "react-icons/fi";

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [inStockOnly, setInStockOnly] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL;

  const [categories, setCategories] = useState([]);

  // Get initial search query from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams.get('q') || '';
    setSearchQuery(query);
  }, [location]);

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_BASE}/products`),
          axios.get(`${API_BASE}/categories`)
        ]);
        
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and search logic - FIXED: Only show products when there's a search query
  const applyFiltersAndSearch = useMemo(() => {
    let result = [];

    // Only show products when there's a search query
    if (searchQuery.trim()) {
      result = products;
      const query = searchQuery.toLowerCase();
      
      result = result.filter(product => 
        product.title?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.name?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query)
      );

      // Category filter
      if (selectedCategories.length > 0) {
        result = result.filter(product => 
          selectedCategories.includes(product.category?._id) ||
          selectedCategories.includes(product.category)
        );
      }

      // Price range filter
      result = result.filter(product => {
        const price = product.currentPrice || product.price || 0;
        return price >= priceRange[0] && price <= priceRange[1];
      });

      // Stock filter
      if (inStockOnly) {
        result = result.filter(product => 
          (product.countInStock || 0) > 0
        );
      }

      // Sorting
      switch (sortBy) {
        case "price-low":
          result = [...result].sort((a, b) => 
            (a.currentPrice || a.price || 0) - (b.currentPrice || b.price || 0)
          );
          break;
        case "price-high":
          result = [...result].sort((a, b) => 
            (b.currentPrice || b.price || 0) - (a.currentPrice || a.price || 0)
          );
          break;
        case "name":
          result = [...result].sort((a, b) => 
            (a.title || "").localeCompare(b.title || "")
          );
          break;
        case "newest":
          result = [...result].sort((a, b) => 
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          );
          break;
        default: // relevance
          break;
      }
    }

    return result;
  }, [products, searchQuery, selectedCategories, priceRange, inStockOnly, sortBy]);

  useEffect(() => {
    setFilteredProducts(applyFiltersAndSearch);
  }, [applyFiltersAndSearch]);

  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle category selection
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 100000]);
    setSelectedCategories([]);
    setSortBy("relevance");
    setInStockOnly(false);
    navigate('/search');
  };

  // Get price range limits
  const priceLimits = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 100000 };
    
    const prices = products.map(p => p.currentPrice || p.price || 0).filter(p => p > 0);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [products]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchQuery || selectedCategories.length > 0 || priceRange[0] > priceLimits.min || priceRange[1] < priceLimits.max || inStockOnly;
  }, [searchQuery, selectedCategories, priceRange, priceLimits, inStockOnly]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-[#2c9ba3] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-8 pb-16">
      <div className="container mx-auto px-4">
        {/* Search Header */}
        <div className="mb-6 md:mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 lg:p-8 border border-gray-100">
            {/* Main Search Bar */}
            <div className="relative mb-4 md:mb-6">
              <form onSubmit={handleSearchSubmit}>
                <div className="flex items-center bg-gray-50 rounded-2xl px-3 md:px-4 py-2 md:py-3 shadow-inner border border-gray-200">
                  <FiSearch className="text-[#2c9ba3] text-lg md:text-xl mr-2 md:mr-3" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-500 text-base md:text-lg"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors ml-2"
                    >
                      <FiX className="text-gray-500 text-sm md:text-base" />
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
              {/* Results Count */}
              <div className="text-gray-700 text-sm md:text-base">
                {searchQuery ? (
                  <>
                    <span className="font-semibold text-[#2c9ba3]">
                      {filteredProducts.length}
                    </span>{" "}
                    products found for "<strong className="break-words">{searchQuery}</strong>"
                  </>
                ) : (
                  <span className="text-gray-500">Enter a search term to find products</span>
                )}
              </div>

              {/* Filter Buttons - Only show when there are results */}
              {filteredProducts.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-gray-300 rounded-xl md:rounded-2xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#2c9ba3] focus:border-transparent min-w-[140px]"
                  >
                    <option value="relevance">Sort by Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name A-Z</option>
                    <option value="newest">Newest First</option>
                  </select>

                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="md:hidden bg-[#2c9ba3] text-white px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-medium hover:bg-[#25838b] transition-colors"
                  >
                    <FiSliders className="text-sm" />
                    Filters
                  </button>

                  {/* Clear Filters - Improved mobile layout */}
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-red-500 hover:text-red-700 text-xs md:text-sm font-medium flex items-center gap-1 whitespace-nowrap"
                    >
                      <FiX className="text-xs md:text-base" />
                      <span className="hidden xs:inline">Clear All</span>
                      <span className="xs:hidden">Clear</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        {!searchQuery ? (
          // Empty state when no search query
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 lg:p-12 text-center border border-gray-100">
            <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mx-auto mb-4 md:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <FiSearch className="text-xl md:text-2xl lg:text-3xl text-gray-400" />
            </div>
            <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-700 mb-2">
              Start Searching
            </h3>
            <p className="text-gray-500 mb-4 md:mb-6 text-sm md:text-base max-w-md mx-auto">
              Enter a product name, category, or brand to find what you're looking for
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
              <span className="flex items-center gap-1">🔍 Search by product name</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">📁 Search by category</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">🏷️ Search by brand</span>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          // No results state
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 lg:p-12 text-center border border-gray-100">
            <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mx-auto mb-4 md:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <FiSearch className="text-xl md:text-2xl lg:text-3xl text-gray-400" />
            </div>
            <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-700 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 mb-4 md:mb-6 text-sm md:text-base max-w-md mx-auto">
              No products match "<strong className="break-words">{searchQuery}</strong>". Try different keywords or adjust your filters.
            </p>
            <button
              onClick={clearFilters}
              className="bg-[#2c9ba3] text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-medium hover:bg-[#25838b] transition-colors text-sm md:text-base"
            >
              Clear Search & Filters
            </button>
          </div>
        ) : (
          // Results with filters and products
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
            {/* Filters Sidebar - Only show when there are results */}
            {filteredProducts.length > 0 && (
              <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 flex-shrink-0`}>
                <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 sticky top-24 max-h-[80vh] overflow-y-auto">
                  {/* Filters Header */}
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FiFilter className="text-[#2c9ba3]" />
                      Filters
                    </h3>
                    <div className="flex items-center gap-2">
                      {/* Clear filters button inside filters panel */}
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-red-500 hover:text-red-700 text-xs md:text-sm font-medium flex items-center gap-1 lg:hidden"
                        >
                          <FiX className="text-xs" />
                          Clear
                        </button>
                      )}
                      <button
                        onClick={() => setShowFilters(false)}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                      >
                        <FiX className="text-lg md:text-xl" />
                      </button>
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div className="mb-4 md:mb-6">
                    <h4 className="font-medium text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Price Range</h4>
                    <div className="space-y-2 md:space-y-3">
                      <input
                        type="range"
                        min={priceLimits.min}
                        max={priceLimits.max}
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs md:text-sm text-gray-600">
                        <span>Rs {priceRange[0].toLocaleString()}</span>
                        <span>Rs {priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Categories Filter */}
                  <div className="mb-4 md:mb-6">
                    <h4 className="font-medium text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Categories</h4>
                    <div className="space-y-1 md:space-y-2 max-h-40 md:max-h-60 overflow-y-auto">
                      {categories.map(category => (
                        <label key={category._id} className="flex items-center gap-2 md:gap-3 cursor-pointer group py-1">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category._id)}
                            onChange={() => toggleCategory(category._id)}
                            className="rounded border-gray-300 text-[#2c9ba3] focus:ring-[#2c9ba3] w-4 h-4 md:w-5 md:h-5"
                          />
                          <span className="text-gray-700 group-hover:text-[#2c9ba3] transition-colors text-sm md:text-base">
                            {category.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Stock Filter */}
                  <div className="mb-4 md:mb-6">
                    <label className="flex items-center gap-2 md:gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={() => setInStockOnly(!inStockOnly)}
                        className="rounded border-gray-300 text-[#2c9ba3] focus:ring-[#2c9ba3] w-4 h-4 md:w-5 md:h-5"
                      />
                      <span className="text-gray-700 group-hover:text-[#2c9ba3] transition-colors text-sm md:text-base">
                        In Stock Only
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="flex-1">
              {/* Mobile Filter Toggle - Only show when there are results */}
              {filteredProducts.length > 0 && (
                <div className="lg:hidden mb-3 md:mb-4">
                  <button
                    onClick={() => setShowFilters(true)}
                    className="w-full bg-white border border-gray-300 rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-3 text-left flex items-center justify-between shadow-sm"
                  >
                    <span className="text-gray-700 text-sm md:text-base">Show Filters</span>
                    <FiFilter className="text-[#2c9ba3]" />
                  </button>
                </div>
              )}

              {/* Products Grid */}
              <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard 
                    key={product._id || index} 
                    product={product} 
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #2c9ba3;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #2c9ba3;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }

        @media (min-width: 480px) {
          .slider::-webkit-slider-thumb {
            height: 20px;
            width: 20px;
          }
          
          .slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Search;