// src/components/BottomNav.jsx
// import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaShoppingCart, FaUser, FaSearch, FaCreditCard } from "react-icons/fa";
import { useCart } from "../context/CartContext";

/**
 * Bottom mobile nav matching Your Ease theme (teal #2c9ba3)
 * - Mobile only (md:hidden)
 * - Dynamic cart badge from CartContext
 * - Ready to paste
 */
export default function BottomNav() {
  const { cartCount } = useCart();

  const activeClass = "flex flex-col items-center justify-center text-xs text-white bg-[#2c9ba3] p-2 rounded-lg scale-105";
  const inactiveClass = "flex flex-col items-center justify-center text-xs text-[#2c9ba3] p-1";

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md flex justify-around items-center py-2 md:hidden z-50 rounded-t-xl">
      <NavLink to="/" className={({ isActive }) => (isActive ? activeClass : inactiveClass)} aria-label="Home">
        <FaHome size={20} />
        <span className="mt-1">Home</span>
      </NavLink>

      <NavLink to="/search" className={({ isActive }) => (isActive ? activeClass : inactiveClass)} aria-label="Search">
  <FaSearch size={20} />
  <span className="mt-1">Search</span>
</NavLink>

      <NavLink to="/cart" className={({ isActive }) => (isActive ? activeClass + " relative" : inactiveClass + " relative")} aria-label="Cart">
        <FaShoppingCart size={20} />
        <span className="mt-1">Cart</span>

        {cartCount > 0 && (
          <span className="absolute -top-2 -right-3 bg-[#2c9ba3] text-white text-[10px] rounded-full px-2 py-[1px] font-semibold shadow">
            {cartCount}
          </span>
        )}
      </NavLink>

      <NavLink to="/checkout" className={({ isActive }) => (isActive ? activeClass : inactiveClass)} aria-label="Checkout">
        <FaCreditCard size={20} />
        <span className="mt-1">Checkout</span>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => (isActive ? activeClass : inactiveClass)} aria-label="Profile">
        <FaUser size={20} />
        <span className="mt-1">Profile</span>
      </NavLink>
    </nav>
  );
}
