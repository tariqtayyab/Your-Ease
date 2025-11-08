// src/pages/Home.jsx - FIXED VERSION
import React from "react";
import BannerSlider from "../components/BannerSlider";
import HotSellingSection from "../components/HotSellingSection";
import CategoriesSection from "../components/CategoriesSection";

const Home = ({ products}) => {
  // 🚀 REMOVED: Duplicate API call - use products from props
  return (
    <div className="min-h-screen">
      <BannerSlider />
      <HotSellingSection products={products} />
      <CategoriesSection products={products} />
    </div>
  );
};

export default Home;