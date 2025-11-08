
// import React from "react";
import BannerSlider from "../components/BannerSlider";
import axios from "axios";
import HotSellingSection from "../components/HotSellingSection";
import CategoriesSection from "../components/CategoriesSection";
import { useEffect, useState } from "react";

const Home = () => {
  const [products, setProducts] = useState([]);
  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await axios.get(`${API_BASE}/products`);
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen">
      <BannerSlider />
      <HotSellingSection products={products} />
      <CategoriesSection products={products} />
    </div>
  );
};

export default Home;