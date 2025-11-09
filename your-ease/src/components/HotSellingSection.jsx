import React, { useRef, useState, useEffect, useCallback } from "react";
import ProductCard from "./ProductCard";

const HotSellingSection = ({ products = [], onAddToCart }) => {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoSlideRef = useRef(null);
  
  // Filter only hot selling products
  const hotSellingProducts = Array.isArray(products) 
    ? products.filter(product => product?.isHotSelling === true)
    : [];

  // 🚀 FIXED: Optimized scroll state update with debouncing
  const updateScrollState = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    
    // Calculate active index
    const container = scrollContainerRef.current;
    const scrollPosition = container.scrollLeft + container.clientWidth / 2;
    
    const productElements = container.querySelectorAll('.product-item');
    let closestIndex = 0;
    let minDistance = Infinity;
    
    productElements.forEach((element, index) => {
      const elementCenter = element.offsetLeft + element.offsetWidth / 2;
      const distance = Math.abs(elementCenter - scrollPosition);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });
    
    setActiveIndex(closestIndex);
  }, []);

  // 🚀 FIXED: Debounced scroll handler
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      requestAnimationFrame(updateScrollState);
    }
  }, [updateScrollState]);

  // 🚀 FIXED: Optimized auto-slide with cleanup
  useEffect(() => {
    if (hotSellingProducts.length > 1 && window.innerWidth < 1024) {
      // Clear any existing interval
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
      
      autoSlideRef.current = setInterval(() => {
        setActiveIndex((prev) => {
          const nextIndex = (prev + 1) % hotSellingProducts.length;
          scrollToIndex(nextIndex);
          return nextIndex;
        });
      }, 4000);
      
      return () => {
        if (autoSlideRef.current) {
          clearInterval(autoSlideRef.current);
        }
      };
    }
  }, [hotSellingProducts.length]);

  // 🚀 FIXED: Single resize listener with cleanup
  useEffect(() => {
    const handleResize = () => {
      updateScrollState();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateScrollState]);

  // 🚀 FIXED: Memoized scroll functions
  const scrollToIndex = useCallback((index) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const productElements = container.querySelectorAll('.product-item');
    const targetElement = productElements[index];
    
    if (targetElement) {
      const containerWidth = container.clientWidth;
      const elementWidth = targetElement.offsetWidth;
      const elementLeft = targetElement.offsetLeft;
      
      const scrollPosition = elementLeft - (containerWidth / 2) + (elementWidth / 2);
      
      container.scrollTo({ 
        left: scrollPosition, 
        behavior: 'smooth' 
      });
    }
  }, []);

  const scrollLeft = useCallback(() => {
    if (activeIndex > 0) {
      scrollToIndex(activeIndex - 1);
    }
  }, [activeIndex, scrollToIndex]);

  const scrollRight = useCallback(() => {
    if (activeIndex < hotSellingProducts.length - 1) {
      scrollToIndex(activeIndex + 1);
    }
  }, [activeIndex, hotSellingProducts.length, scrollToIndex]);

  // 🚀 FIXED: Throttled scroll end handler
  const handleScrollEnd = useCallback(() => {
    if (scrollContainerRef.current) {
      requestAnimationFrame(updateScrollState);
    }
  }, [updateScrollState]);

  // 🚀 CRITICAL FIX: Show loading state when products are empty
  if (!products || products.length === 0) {
    return (
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 pt-10 pb-6 md:py-16">
        <div className="container mx-auto px-4">
          {/* Header Skeleton */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex flex-col items-center">
              <div className="h-8 md:h-12 bg-gray-300 rounded-lg w-64 md:w-96 mx-auto mb-3 md:mb-4 animate-pulse"></div>
              <div className="h-4 md:h-5 bg-gray-300 rounded w-48 md:w-80 mx-auto mb-4 animate-pulse"></div>
              <div className="w-16 h-1 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Product Cards Skeleton */}
          <div className="relative">
            {/* Desktop Grid Skeleton */}
            <div className="hidden lg:grid lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 rounded-2xl h-64 md:h-80 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>

            {/* Mobile Horizontal Scroll Skeleton */}
            <div className="flex gap-6 md:gap-8 w-max lg:hidden px-8 md:px-12 items-center h-full">
              {[...Array(1)].map((_, index) => (
                <div 
                  key={index}
                  className="flex-shrink-0"
                  style={{ width: '280px' }}
                >
                  <div className="bg-gray-300 rounded-2xl h-64 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If no hot selling products, don't render the section
  if (hotSellingProducts.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 pt-10 pb-6 md:py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex flex-col items-center">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              <span className="bg-gradient-to-r from-[#2c9ba3] to-[#34b4bd] bg-clip-text text-transparent">
                Hot Selling Products
              </span>
            </h2>
            
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-4">
              Discover our most popular items loved by customers
            </p>
            
            <div className="w-16 h-1 bg-gradient-to-r from-[#2c9ba3] to-[#34b4bd] rounded-full"></div>
          </div>
        </div>

        <div className="relative">
          {/* Desktop Navigation Arrows */}
          {showLeftArrow && (
            <button 
              className="hidden lg:flex absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 z-20 bg-white rounded-2xl shadow-lg p-3 hover:bg-gray-50 hover:shadow-xl transition-all duration-300 border border-gray-200 hover:scale-105"
              onClick={scrollLeft}
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5 text-[#2c9ba3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {/* Product Cards Container with Scroll Snapping */}
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide scroll-smooth py-6 lg:py-4 snap-x snap-mandatory"
            onScroll={handleScroll}
            onTouchEnd={handleScrollEnd}
            onScrollEnd={handleScrollEnd}
          >
            {/* Desktop: Show products in a proper grid when enough space */}
            <div className="hidden lg:grid lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {hotSellingProducts.map((product, index) => (
                <div key={product?._id || product?.id || index} className="transform hover:scale-105 transition-transform duration-300">
                  <ProductCard 
                    product={product} 
                    onAddToCart={onAddToCart}
                    index={index}
                  />
                </div>
              ))}
            </div>

            {/* Mobile & Tablet: Horizontal scroll with centered scaling and snap alignment */}
            <div className="flex gap-6 md:gap-8 w-max lg:hidden px-8 md:px-12 items-center h-full">
              {hotSellingProducts.map((product, index) => (
                <div 
                  key={product?._id || product?.id || index} 
                  className={`
                    product-item flex-shrink-0 transition-all duration-500 ease-out snap-center
                    relative
                  `}
                  style={{
                    width: '280px',
                    height: '420px',
                    scrollSnapAlign: 'center'
                  }}
                  onClick={() => scrollToIndex(index)}
                >
                  {/* 🚀 FIXED: Scaling container */}
                  <div className={`
                    absolute inset-0 transition-all duration-500 ease-out
                    ${index === activeIndex 
                      ? 'scale-110 transform-gpu z-10' 
                      : 'scale-95 opacity-85 transform-gpu'
                    }
                  `}>
                    <div className={`
                      bg-white rounded-2xl overflow-hidden border-2 w-full h-full
                      ${index === activeIndex 
                        ? 'border-[#2c9ba3] shadow-xl' 
                        : 'border-gray-100 shadow-md'
                      }
                    `}>
                      <ProductCard 
                        product={product} 
                        onAddToCart={onAddToCart}
                        index={index}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Desktop Right Arrow */}
          {showRightArrow && (
            <button 
              className="hidden lg:flex absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-6 z-20 bg-white rounded-2xl shadow-lg p-3 hover:bg-gray-50 hover:shadow-xl transition-all duration-300 border border-gray-200 hover:scale-105"
              onClick={scrollRight}
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5 text-[#2c9ba3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Mobile Dots Indicator */}
          <div className="lg:hidden flex justify-center mt-6 space-x-2">
            {hotSellingProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${index === activeIndex 
                    ? 'bg-[#2c9ba3] w-6' 
                    : 'bg-gray-300 hover:bg-gray-400'
                  }
                `}
                aria-label={`Go to product ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* View All Products Link */}
        {hotSellingProducts.length > 8 && (
          <div className="text-center mt-8 md:mt-12">
            <button className="bg-gradient-to-r from-[#2c9ba3] to-[#34b4bd] hover:from-[#25838b] hover:to-[#2c9ba3] text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto">
              <span>View All Hot Products</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default HotSellingSection;