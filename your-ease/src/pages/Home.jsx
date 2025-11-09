import React, { useState, useEffect } from "react";
import BannerSlider from "../components/BannerSlider";
import HotSellingSection from "../components/HotSellingSection";
import CategoriesSection from "../components/CategoriesSection";

const Home = ({ products }) => {
  const [productsLoaded, setProductsLoaded] = useState(false);

  // 🚀 CRITICAL FIX: Wait for products to be available
  useEffect(() => {
    if (products && products.length > 0) {
      setProductsLoaded(true);
    }
  }, [products]);

  return (
    <div className="min-h-screen">
      <BannerSlider />
      
      {/* 🚀 Only render sections when products are loaded */}
      {productsLoaded ? (
        <>
          <HotSellingSection products={products} />
          <CategoriesSection products={products} />
        </>
      ) : (
        // 🚀 Show loading state while products are loading
      <div>


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

       <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {[...Array(2)].map((_, categoryIndex) => (
              <div key={categoryIndex} className="category-section bg-white rounded-3xl shadow-lg px-3 py-6 md:p-8 border border-gray-100 animate-pulse">
                {/* Category Header Skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
                  <div className="text-center sm:text-left">
                    <div className="h-8 md:h-10 bg-gray-300 rounded-lg w-48 md:w-64 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                  </div>
                  <div className="h-12 bg-gray-300 rounded-xl w-32"></div>
                </div>

                {/* Products Grid Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                  {[...Array(6)].map((_, productIndex) => (
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
      </div>
      )}
    </div>
  );
};

export default Home;