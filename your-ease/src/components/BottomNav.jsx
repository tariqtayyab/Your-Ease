// src/components/BottomNav.jsx
import { NavLink } from "react-router-dom";
import { FaHome, FaShoppingCart, FaUser, FaSearch, FaCreditCard } from "react-icons/fa";
import { useCart } from "../context/CartContext";

export default function BottomNav() {
  const { cartCount } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md flex justify-around items-center py-2 md:hidden z-50 rounded-t-xl">
      {[
        { to: "/", icon: FaHome, label: "Home" },
        { to: "/search", icon: FaSearch, label: "Search" },
        { to: "/cart", icon: FaShoppingCart, label: "Cart", hasBadge: true },
        { to: "/checkout", icon: FaCreditCard, label: "Checkout" },
        { to: "/profile", icon: FaUser, label: "Profile" }
      ].map(({ to, icon: Icon, label, hasBadge }) => (
        <NavLink 
          key={to}
          to={to} 
          className={({ isActive }) => 
            `flex flex-col items-center justify-center text-xs p-1 ${
              isActive 
                ? "text-white bg-[#2c9ba3] p-2 rounded-lg scale-105" 
                : "text-[#2c9ba3]"
            } ${hasBadge ? "relative" : ""}`
          } 
          aria-label={label}
        >
          {({ isActive }) => (
            <>
              <Icon size={20} />
              <span className={`mt-1 ${isActive ? 'text-white' : 'text-gray-700'}`}>
                {label}
              </span>
              
              {hasBadge && cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-[#2c9ba3] text-white text-[10px] rounded-full px-2 py-[1px] font-semibold shadow">
                  {cartCount}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}