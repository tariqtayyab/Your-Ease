import React, { useState } from "react";
import { FaImage, FaFire, FaThList, FaBars, FaTimes } from "react-icons/fa";
import BannerAdmin from "../pages/admin/BannerAdmin";
import HotSellingAdmin from "../pages/admin/HotSellingAdmin";
import CategoriesAdmin from "../pages/admin/CategoriesAdmin";

const AdminRoute = () => {
  const [activeTab, setActiveTab] = useState("banners");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar (Desktop + Mobile) */}
      <aside
        className={`fixed md:static top-0 left-0 h-full bg-white shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 z-50 w-64`}
      >
        <h2 className="text-2xl font-bold text-center py-5 border-b">Admin Panel</h2>
        <nav className="flex-1">
          <ul>
            <li
              onClick={() => {
                setActiveTab("banners");
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 px-6 py-3 cursor-pointer hover:bg-gray-200 ${
                activeTab === "banners" ? "bg-gray-200 font-semibold" : ""
              }`}
            >
              <FaImage /> Banners
            </li>
            <li
              onClick={() => {
                setActiveTab("hot");
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 px-6 py-3 cursor-pointer hover:bg-gray-200 ${
                activeTab === "hot" ? "bg-gray-200 font-semibold" : ""
              }`}
            >
              <FaFire /> Hot Selling
            </li>
            <li
              onClick={() => {
                setActiveTab("categories");
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 px-6 py-3 cursor-pointer hover:bg-gray-200 ${
                activeTab === "categories" ? "bg-gray-200 font-semibold" : ""
              }`}
            >
              <FaThList /> Categories
            </li>
          </ul>
        </nav>

        {/* Close button on mobile */}
        <button
          className="absolute top-4 right-4 md:hidden text-gray-600"
          onClick={() => setSidebarOpen(false)}
        >
          <FaTimes size={20} />
        </button>
      </aside>

      {/* Overlay (for mobile sidebar) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full">
        {/* Mobile toggle button */}
        <button
          className="md:hidden mb-4 text-gray-700"
          onClick={() => setSidebarOpen(true)}
        >
          <FaBars size={24} />
        </button>

        {activeTab === "banners" && <BannerAdmin />}
        {activeTab === "hot" && <HotSellingAdmin />}
        {activeTab === "categories" && <CategoriesAdmin />}
      </main>
    </div>
  );
};

export default AdminRoute;
