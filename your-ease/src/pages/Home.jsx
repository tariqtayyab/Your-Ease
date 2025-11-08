// src/pages/Home.jsx - FIXED VERSION
import React from "react";
import BannerSlider from "../components/BannerSlider";
import HotSellingSection from "../components/HotSellingSection";
import CategoriesSection from "../components/CategoriesSection";

const Home = ({ products, onAddToCart }) => {
  // 🚀 REMOVED: Duplicate API call - use products from props
  return (
    <div className="min-h-screen">
      <BannerSlider />
      <HotSellingSection products={products} onAddToCart={onAddToCart} />
      <CategoriesSection products={products} onAddToCart={onAddToCart} />
    </div>
  );
};

export default Home;