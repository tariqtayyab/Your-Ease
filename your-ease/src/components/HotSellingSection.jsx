// TEMPORARY TEST - Replace your HotSellingSection with this
import React from "react";

const HotSellingSection = ({ products = [] }) => {
  const hotSellingProducts = Array.isArray(products) 
    ? products.filter(product => product?.isHotSelling === true)
    : [];

  if (hotSellingProducts.length === 0) return null;

  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 pt-10 pb-6 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
            Hot Selling Products (TEST)
          </h2>
        </div>

        {/* Simple static grid with no images */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {hotSellingProducts.map((product, index) => (
            <div 
              key={product?._id || index}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
              style={{ height: '200px' }} // Fixed height
            >
              <div className="h-32 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                <span className="text-gray-500">Product {index + 1}</span>
              </div>
              <h3 className="font-semibold text-sm line-clamp-2">
                {product?.title || "Product Name"}
              </h3>
              <div className="text-[#1e7a7a] font-bold mt-1">
                Rs {product?.currentPrice || "0"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotSellingSection;