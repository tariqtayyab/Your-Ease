import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";
import { apiCache } from "../utils/apiCache"; 

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const CategoriesSection = ({ products = [], onAddToCart }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const hasFetched = useRef(false);

  // 🚀 OPTIMIZED: Throttled resize handler
  useEffect(() => {
    let resizeTimeout;
    
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 100); // Throttle to 100ms
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, []);

  // 🚀 OPTIMIZED: Fetch categories
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function fetchCategories() {
      const cacheKey = 'categories';
      
      const cachedData = apiCache.get(cacheKey);
      if (cachedData) {
        setCategories(cachedData);
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(`${API_BASE}/api/categories`);
        const categoriesData = data || [];
        setCategories(categoriesData);
        apiCache.set(cacheKey, categoriesData);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // 🚀 OPTIMIZED: Memoized product categorization
  const categoriesWithProducts = useMemo(() => {
    return categories.reduce((acc, category) => {
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
  }, [categories, products]);

  // 🚀 OPTIMIZED: Memoized sorted categories
  const sortedCategories = useMemo(() => {
    const categoriesArray = Object.values(categoriesWithProducts);
    
    return categoriesArray.sort((a, b) => {
      if (a.isTrending && !b.isTrending) return -1;
      if (!a.isTrending && b.isTrending) return 1;
      if (a.position !== b.position) return a.position - b.position;
      return a.name.localeCompare(b.name);
    }).map(category => ({
      ...category,
      products: [...category.products].sort((a, b) => {
        if (a.position !== b.position) return a.position - b.position;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      })
    }));
  }, [categoriesWithProducts]);

  // 🚀 OPTIMIZED: Memoized product display logic
  const getProductsToDisplay = useCallback((category) => {
    if (category.isTrending) {
      return windowWidth < 768 
        ? category.products.slice(0, 6)
        : category.products.slice(0, 12);
    } else {
      return windowWidth < 768 
        ? category.products.slice(0, 4)
        : category.products.slice(0, 8);
    }
  }, [windowWidth]);

  // 🚀 OPTIMIZED: Skeleton loader component
  const SkeletonLoader = useMemo(() => (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="space-y-16">
          {[...Array(2)].map((_, categoryIndex) => (
            <div key={categoryIndex} className="category-section bg-white rounded-3xl shadow-lg px-3 py-6 md:p-8 border border-gray-100 animate-pulse">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
                <div className="text-center sm:text-left">
                  <div className="h-8 md:h-10 bg-gray-300 rounded-lg w-48 md:w-64 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                </div>
                <div className="h-12 bg-gray-300 rounded-xl w-32"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                {[...Array(4)].map((_, productIndex) => (
                  <div key={productIndex} className="animate-pulse">
                    <div className="bg-gray-300 rounded-2xl h-48 md:h-56 mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  ), []);

  if (loading) {
    return SkeletonLoader;
  }

  if (sortedCategories.length === 0) {
    return SkeletonLoader;
  }

  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="space-y-16">
          {sortedCategories.map((category) => {
            const productsToDisplay = getProductsToDisplay(category);

            return (
              <div key={category.id} className="category-section bg-white rounded-3xl shadow-lg px-3 py-6 md:p-8 border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
                  <div className="text-center sm:text-left">
                    <h3 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-[#2c9ba3] to-[#34b4bd] bg-clip-text text-transparent mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {category.products.length} products available
                    </p>
                  </div>
                  
                  <Link
                    to={`/category/${category.id}`}
                    state={{ categoryName: category.name }}
                    className="bg-gradient-to-r from-[#2c9ba3] to-[#34b4bd] hover:from-[#25838b] hover:to-[#2c9ba3] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <span>View All</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                  {productsToDisplay.map((product, index) => (
                    <ProductCard 
                      key={product._id || product.id || index} 
                      product={product} 
                      onAddToCart={onAddToCart}
                      index={index} 
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;