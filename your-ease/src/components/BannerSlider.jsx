import React, { useEffect, useState } from "react";
import axios from "axios";

const BannerSlider = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const API_URL = import.meta.env.VITE_API_URL;

  // 🚀 OPTIMIZED: Get optimized banner URL
  const getOptimizedBannerUrl = (url) => {
    if (url && url.includes('res.cloudinary.com') && url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/w_1200,h_600,c_fill,q_auto,f_webp/');
    }
    return url;
  };

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${API_URL}/banners`);
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
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 max-w-7xl mx-auto space-y-12">
        <div className="relative w-full overflow-hidden rounded-2xl shadow-md h-[180px] sm:h-[280px] md:h-[350px] lg:h-[400px] xl:h-[450px] 2xl:h-[500px]">
          {/* Skeleton Loader */}
          <div className="w-full h-full bg-gray-300 animate-pulse rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
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
              className="w-full flex-shrink-0 relative bg-white flex items-center justify-center"
            >
              {/* 🚀 OPTIMIZED: Banner image with explicit dimensions */}
              <img
                src={getOptimizedBannerUrl(b.image)}
                alt="Banner"
                className="w-full h-full object-contain bg-white"
                width={1200}
                height={600}
                loading="eager"
                fetchpriority="high"
                style={{ width: '100%', height: '100%' }}
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