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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c9ba3] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;