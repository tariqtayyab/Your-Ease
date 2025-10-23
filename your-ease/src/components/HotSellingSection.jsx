// src/components/HotSellingSection.jsx
import React, { useRef, useState, useEffect } from "react";
import ProductCard from "./ProductCard";

const HotSellingSection = ({ products = [], onAddToCart }) => {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  // Filter only hot selling products
  const hotSellingProducts = Array.isArray(products) 
    ? products.filter(product => product?.isHotSelling === true)
    : [];
  
  // Check scroll position to show/hide arrows
  const updateArrowVisibility = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };
  
  useEffect(() => {
    updateArrowVisibility();
    
    // Add resize listener
    window.addEventListener('resize', updateArrowVisibility);
    return () => window.removeEventListener('resize', updateArrowVisibility);
  }, [hotSellingProducts]);
  
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // If no hot selling products, don't render the section
  if (hotSellingProducts.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-16 md:py-20 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Enhanced Header - Matches Your Theme */}
        <div className="text-center mb-12">
          <div className="inline-flex flex-col items-center">
            {/* Main Title with Your Theme Colors */}
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-[#2c9ba3] to-[#34b4bd] bg-clip-text text-transparent">
                Hot Selling Products
              </span>
            </h2>
            
            {/* Enhanced Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium mb-6">
              Discover our curated collection of best-selling items that customers love
            </p>
            
            {/* Decorative Line with Your Theme Color */}
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#2c9ba3] to-[#34b4bd] rounded-full mt-2 shadow-sm"></div>
          </div>
        </div>

        <div className="relative">
          {/* Enhanced Desktop Navigation Arrows */}
          {showLeftArrow && (
            <button 
              className="hidden md:flex absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8 z-10 bg-white rounded-2xl shadow-xl p-4 hover:bg-blue-50 hover:shadow-2xl transition-all duration-300 border border-blue-100 hover:scale-105"
              onClick={scrollLeft}
              aria-label="Scroll left"
            >
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {/* Product Cards Container */}
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide scroll-smooth"
            onScroll={updateArrowVisibility}
          >
            <div className="flex gap-8 md:gap-10 w-max px-4">
              {hotSellingProducts.map((product, index) => (
                <div key={product?._id || product?.id || index} className="w-64 md:w-72 flex-shrink-0 transform hover:scale-105 transition-transform duration-300">
                  <ProductCard 
                    product={product} 
                    onAddToCart={onAddToCart}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Enhanced Desktop Right Arrow */}
          {showRightArrow && (
            <button 
              className="hidden md:flex absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-8 z-10 bg-white rounded-2xl shadow-xl p-4 hover:bg-blue-50 hover:shadow-2xl transition-all duration-300 border border-blue-100 hover:scale-105"
              onClick={scrollRight}
              aria-label="Scroll right"
            >
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Enhanced Mobile Navigation Buttons */}
          <div className="md:hidden flex justify-between absolute top-1/2 -translate-y-1/2 w-full px-6 pointer-events-none">
            <button
              onClick={scrollLeft}
              className="bg-white/90 hover:bg-blue-50 rounded-2xl p-3 shadow-lg transition-all duration-200 pointer-events-auto border border-blue-100 hover:scale-105"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={scrollRight}
              className="bg-white/90 hover:bg-blue-50 rounded-2xl p-3 shadow-lg transition-all duration-200 pointer-events-auto border border-blue-100 hover:scale-105"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotSellingSection;