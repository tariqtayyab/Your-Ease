import React, { useEffect, useState } from "react";
import axios from "axios";
// import { api } from "../api";

const BannerSlider = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);


const fetchBanners = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/banners");
      console.log(res.data);
      
      setBanners(res.data);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };


  // Auto slide every 4 seconds
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  useEffect(() => {
      fetchBanners();
    }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] bg-gray-100 rounded-xl">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] bg-gray-100 text-gray-500 rounded-xl">
        No Banners Available
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 max-w-7xl mx-auto space-y-12">
      <div className="relative w-full overflow-hidden rounded-2xl shadow-md h-[180px] sm:h-[280px] md:h-[350px] lg:h-[400px] xl:h-[450px] 2xl:h-[500px]">
        {/* Slider container */}
        <div
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {banners.map((b) => (
            <div
              key={b._id}
              className="w-full flex-shrink-0 relative"
            >
              
              <img
  src={b.image }
  alt="Banner"
  className="min-w-full min-h-full object-cover rounded-2xl"
/>
            </div>
          ))}
        </div>

        {/* Dots Indicator - Only show if multiple banners */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                  currentIndex === i
                    ? "bg-white scale-125"
                    : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerSlider;