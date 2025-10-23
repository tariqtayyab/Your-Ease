// import { useRef } from "react";
// import ProductCard from "../components/ProductCard";
// import { ChevronLeft, ChevronRight } from "lucide-react";

// // 🧾 Product Data (Realistic, working placeholders)
// const products = [
//   {
//     id: 1,
//     name: "Premium White T-Shirt",
//     price: 1499,
//     description: "Soft cotton t-shirt for a premium look.",
//     image: "https://picsum.photos/400?random=1",
//   },
//   {
//     id: 2,
//     name: "Classic Blue Jeans",
//     price: 2499,
//     description: "Comfortable slim-fit blue jeans.",
//     image: "https://picsum.photos/400?random=2",
//   },
//   {
//     id: 3,
//     name: "Stylish Sneakers",
//     price: 2999,
//     description: "Trendy sneakers for everyday wear.",
//     image: "https://picsum.photos/400?random=3",
//   },
//   {
//     id: 4,
//     name: "Leather Wallet",
//     price: 1199,
//     description: "Genuine leather wallet with multiple slots.",
//     image: "https://picsum.photos/400?random=4",
//   },
//   {
//     id: 5,
//     name: "Smart Watch",
//     price: 4999,
//     description: "Track your fitness and stay connected.",
//     image: "https://picsum.photos/400?random=5",
//   },
//   {
//     id: 6,
//     name: "Sunglasses",
//     price: 1799,
//     description: "UV-protected polarized sunglasses.",
//     image: "https://picsum.photos/400?random=6",
//   },
//   {
//     id: 7,
//     name: "Hoodie",
//     price: 2599,
//     description: "Cozy winter hoodie with modern design.",
//     image: "https://picsum.photos/400?random=7",
//   },
//   {
//     id: 8,
//     name: "Denim Jacket",
//     price: 3499,
//     description: "Classic denim jacket for casual wear.",
//     image: "https://picsum.photos/400?random=8",
//   },
// ];

// // 📂 Categories
// const categories = ["Men Collection", "Women Collection", "Accessories", "Footwear"];

// // 🎞 Banners
// const banners = [
//   "https://picsum.photos/1200/400?random=11",
//   "https://picsum.photos/1200/400?random=12",
//   "https://picsum.photos/1200/400?random=13",
// ];

// export default function Home() {
//   const hotSellingRef = useRef(null);

//   const scrollLeft = () => {
//     hotSellingRef.current.scrollBy({ left: -400, behavior: "smooth" });
//   };

//   const scrollRight = () => {
//     hotSellingRef.current.scrollBy({ left: 400, behavior: "smooth" });
//   };

//   return (
//     <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-12">
//       {/* 🌟 Banner Section */}
//       <div className="relative w-full overflow-hidden rounded-2xl shadow-md h-[180px] sm:h-[280px] md:h-[350px]">
//         <div className="flex animate-slide h-full">
//           {banners.map((src, i) => (
//             <img
//               key={i}
//               src={src}
//               alt={`Banner ${i + 1}`}
//               className="w-full flex-shrink-0 object-cover h-full rounded-2xl"
//             />
//           ))}
//         </div>
//       </div>

//       {/* 🔥 Hot Selling Section */}
//       <section className="relative">
//         <h2 className="text-2xl font-bold text-center text-[#e48c71] mb-4 tracking-wide">
//           HOT SELLING
//         </h2>

//         <div
//           ref={hotSellingRef}
//           className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
//         >
//           {products.map((p) => (
//             <div
//               key={p.id}
//               className="min-w-[220px] sm:min-w-[250px] md:min-w-[270px] flex-shrink-0"
//             >
//               <ProductCard product={p} />
//             </div>
//           ))}
//         </div>

//         {/* Slide Buttons */}
//         <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-2 sm:px-4">
//           <button
//             onClick={scrollLeft}
//             className="bg-white/80 hover:bg-[#e48c71] hover:text-white rounded-full p-2 shadow"
//           >
//             <ChevronLeft size={18} />
//           </button>
//           <button
//             onClick={scrollRight}
//             className="bg-white/80 hover:bg-[#e48c71] hover:text-white rounded-full p-2 shadow"
//           >
//             <ChevronRight size={18} />
//           </button>
//         </div>
//       </section>

//       {/* ⚡ On Trending Section */}
//       <section>
//         <h2 className="text-2xl font-bold text-center text-[#e48c71] mb-6 tracking-wide">
//           ON TRENDING
//         </h2>

//         <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
//           {products.slice(0, 6).map((p) => (
//             <ProductCard key={p.id} product={p} />
//           ))}
//         </div>

//         <div className="text-center mt-5">
//           <button className="px-6 py-2 border border-[#e48c71] text-[#e48c71] rounded-md hover:bg-[#e48c71] hover:text-white transition text-sm font-medium">
//             More
//           </button>
//         </div>
//       </section>

//       {/* 🛍 Other Categories */}
//       {categories.map((cat, index) => (
//         <div key={index} className="mb-10">
//           <h2 className="text-2xl font-semibold text-center text-[#e48c71] mb-6 tracking-wide">
//             {cat}
//           </h2>
//           <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
//             {products.slice(0, 4).map((p) => (
//               <ProductCard key={p.id} product={p} />
//             ))}
//           </div>
//           <div className="text-center mt-4">
//             <button className="px-6 py-2 border border-[#e48c71] text-[#e48c71] rounded-md hover:bg-[#e48c71] hover:text-white transition text-sm font-medium">
//               More
//             </button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }


// inside src/pages/Home.jsx

import React from "react";
import BannerSlider from "../components/BannerSlider";
import axios from "axios";
import HotSellingSection from "../components/HotSellingSection";
import CategoriesSection from "../components/CategoriesSection";
import { useEffect, useState } from "react";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await axios.get("http://localhost:5000/api/products");
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Keep BannerSlider visible during loading */}
        <BannerSlider />
        <div className="flex-1 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-[#2c9ba3] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <BannerSlider />
      <HotSellingSection products={products} />
      <CategoriesSection products={products} />
    </div>
  );
};

export default Home;
