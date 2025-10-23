// src/components/CategoriesSection.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";

const API_BASE = "http://localhost:5000";

const CategoriesSection = ({ products = [], onAddToCart }) => {
  const [categories, setCategories] = useState([]);
  const [visibleRows, setVisibleRows] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch categories on component mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data } = await axios.get(`${API_BASE}/api/categories`);
        setCategories(data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // Group products by category ID and map to category data
  const categoriesWithProducts = categories.reduce((acc, category) => {
    // Find products that belong to this category
    const categoryProducts = products.filter(product => 
      product.category === category._id || 
      (typeof product.category === 'object' && product.category._id === category._id)
    );

    if (categoryProducts.length > 0) {
      acc[category._id] = {
        id: category._id,
        name: category.name,
        isTrending: category.isTrending || false,
        position: category.position || 0,
        products: categoryProducts
      };
    }
    
    return acc;
  }, {});

  // Convert to array and sort: trending first, then by position, then by name
  const sortedCategories = Object.values(categoriesWithProducts).sort((a, b) => {
    // Trending categories first
    if (a.isTrending && !b.isTrending) return -1;
    if (!a.isTrending && b.isTrending) return 1;
    
    // Then by position (lower number first)
    if (a.position !== b.position) return a.position - b.position;
    
    // Then by name
    return a.name.localeCompare(b.name);
  });

  // Initialize visible rows (3 rows by default)
  useEffect(() => {
    if (sortedCategories.length > 0 && Object.keys(visibleRows).length === 0) {
      const initialVisibleRows = {};
      sortedCategories.forEach(category => {
        initialVisibleRows[category.id] = 3; // Show 3 rows by default
      });
      setVisibleRows(initialVisibleRows);
    }
  }, [sortedCategories.length]);

  const loadMoreProducts = (categoryId) => {
    setVisibleRows(prev => ({
      ...prev,
      [categoryId]: (prev[categoryId] || 3) + 4 // Load 4 more rows
    }));
  };

  const getVisibleProducts = (category, categoryId) => {
    const rowsToShow = visibleRows[categoryId] || 3;
    const productsPerRow = 6; // 6 products per row on desktop
    return category.products.slice(0, rowsToShow * productsPerRow);
  };

  const hasMoreProducts = (category, categoryId) => {
    const rowsToShow = visibleRows[categoryId] || 3;
    const productsPerRow = 6;
    return category.products.length > rowsToShow * productsPerRow;
  };

  if (loading) {
    return (
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#2c9ba3] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading categories...</p>
          </div>
        </div>
      </section>
    );
  }

  if (sortedCategories.length === 0) {
    return (
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Categories Available</h3>
            <p className="text-gray-500">Products will appear here once they are organized into categories.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}

        {/* Categories */}
        <div className="space-y-16">
          {sortedCategories.map((category) => {
            const visibleProducts = getVisibleProducts(category, category.id);
            const showMoreButton = hasMoreProducts(category, category.id);

            return (
              <div key={category.id} className="category-section bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-gray-100">
                {/* Category Header - Enhanced */}
                <div className="text-center mb-10 relative">
                  {/* Decorative elements */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#2c9ba3] to-transparent transform -translate-y-1/2"></div>
                  
                  <div className="relative inline-block bg-white px-6 py-3 rounded-2xl shadow-md">
                    <h3 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-[#2c9ba3] to-[#34b4bd] bg-clip-text text-transparent mb-2">
                      {category.name}
                    </h3>
                    
                    {/* Category badges */}
                    {/* <div className="flex justify-center items-center gap-3 mt-3">
                      {category.isTrending && (
                        <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-sm font-semibold rounded-full shadow-md">
                          🔥 Trending Category
                        </span>
                      )}
                      <span className="inline-flex items-center px-3 py-1 bg-[#2c9ba3] text-white text-xs font-medium rounded-full">
                        {category.products?.length || 0} Products
                      </span>
                    </div> */}
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                  {visibleProducts.map((product, index) => (
                    <ProductCard 
                      key={product._id || index} 
                      product={product} 
                      onAddToCart={onAddToCart}
                    />
                  ))}
                </div>

                {/* Load More Button - Enhanced */}
                {showMoreButton && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => loadMoreProducts(category.id)}
                      className="bg-gradient-to-r from-[#2c9ba3] to-[#34b4bd] hover:from-[#25838b] hover:to-[#2c9ba3] text-white font-semibold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <span className="flex items-center justify-center gap-2">
                        📦 Load More Products 
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;