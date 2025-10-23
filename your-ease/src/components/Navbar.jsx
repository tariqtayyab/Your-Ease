import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useState, useEffect, useRef } from "react";
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiClock, FiArrowLeft } from "react-icons/fi";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [products, setProducts] = useState([]);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close search when clicking outside (desktop only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    // Only add this for desktop
    if (window.innerWidth >= 768) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when search opens on mobile
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Load recent searches and products
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }

    // Fetch products for suggestions
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // FIXED: Load cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = localStorage.getItem('cart');
        if (cart) {
          const cartItems = JSON.parse(cart);
          const count = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
          setCartCount(count);
        } else {
          setCartCount(0);
        }
      } catch (error) {
        console.error("Error loading cart count:", error);
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);
    
    const interval = setInterval(updateCartCount, 2000);
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
      clearInterval(interval);
    };
  }, []);

  // Generate search suggestions
  useEffect(() => {
    if (searchInput.trim() && products.length > 0) {
      const query = searchInput.toLowerCase();
      const suggestions = products
        .filter(product => 
          product.title?.toLowerCase().includes(query) ||
          product.category?.name?.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query)
        )
        .slice(0, 4)
        .map(product => ({
          id: product._id,
          title: product.title,
          category: product.category?.name,
          image: product.images?.[0],
          price: product.currentPrice || product.price
        }));
      
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchInput, products]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      // Save to recent searches
      const updatedSearches = [
        searchInput.trim(),
        ...recentSearches.filter(s => s !== searchInput.trim())
      ].slice(0, 5);
      
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      
      // Navigate to search page
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
      setSearchOpen(false);
      setSearchInput("");
    }
  };

  // FIXED: Navigate to product detail page instead of search page
  const handleSuggestionClick = (suggestion) => {
    navigate(`/product/${suggestion.id}`);
    setSearchOpen(false);
    setSearchInput("");
  };

  const handleRecentSearchClick = (searchTerm) => {
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    setSearchOpen(false);
    setSearchInput("");
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      setIsOpen(false); // Close mobile menu if open
    }
  };

  const handleBackClick = () => {
    setSearchOpen(false);
    setSearchInput("");
  };

  const formatPrice = (price) => {
    if (!price) return '';
    return `Rs ${price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  return (
    <nav className="bg-white text-[#2c9ba3] shadow sticky top-0 z-50">
      {/* Main Navbar - Always Visible */}
      <div className="p-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link to="/">
              <img src={logo} alt="YourEase logo" className="w-28 md:w-32" />
            </Link>
          </div>

          {/* Center: desktop links */}
          <div className="hidden md:flex gap-8 font-medium">
            <Link to="/" className="hover:text-black">Home</Link>
            {userInfo && userInfo.role === "admin" && (
              <Link
                to="/admin"
                className="text-blue-600 font-semibold hover:text-blue-800"
              >
                Admin Panel
              </Link>
            )}
            <Link to="/shop" className="hover:text-black">Shop</Link>
            <Link to="/categories" className="hover:text-black">Categories</Link>
            <Link to="/deals" className="hover:text-black">Deals</Link>
            <Link to="/contact" className="hover:text-black">Contact</Link>
          </div>

          {/* Right: icons */}
          <div className="flex items-center gap-4">
            {/* Desktop search */}
            <div className="hidden md:block relative" ref={searchRef}>
              <button
                onClick={handleSearchToggle}
                aria-label="Search"
                className="p-1"
              >
                <FiSearch size={20} className="text-[#2c9ba3] hover:text-black" />
              </button>

              {/* Desktop Search Dropdown */}
              {searchOpen && (
                <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-2xl shadow-xl z-50">
                  <form onSubmit={handleSearchSubmit} className="p-4 border-b border-gray-100">
                    <div className="flex items-center bg-gray-50 rounded-xl px-3 py-2">
                      <FiSearch className="text-[#2c9ba3] mr-2" />
                      <input
                        ref={searchInputRef}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-500"
                        placeholder="Search products, categories..."
                        type="text"
                        autoFocus
                      />
                      {searchInput && (
                        <button
                          type="button"
                          onClick={() => setSearchInput("")}
                          className="p-1 hover:bg-gray-200 rounded-full"
                        >
                          <FiX className="text-gray-500 text-sm" />
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Desktop Suggestions */}
                  <div className="max-h-80 overflow-y-auto">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && !searchInput && (
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                            <FiClock className="text-[#2c9ba3]" />
                            Recent Searches
                          </h4>
                          <button
                            onClick={clearRecentSearches}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Clear all
                          </button>
                        </div>
                        <div className="space-y-1">
                          {recentSearches.map((search, index) => (
                            <button
                              key={index}
                              onClick={() => handleRecentSearchClick(search)}
                              className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2 text-sm"
                            >
                              <FiClock className="text-gray-400" />
                              <span className="text-gray-700">{search}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Product Suggestions */}
                    {searchSuggestions.length > 0 && (
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-700 text-sm mb-2">Products</h4>
                        <div className="space-y-2">
                          {searchSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.id}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                            >
                              <img 
                                src={suggestion.image?.url || suggestion.image || '/placeholder.png'} 
                                alt={suggestion.title}
                                className="w-10 h-10 rounded object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">{suggestion.title}</div>
                                <div className="text-xs text-gray-500 flex justify-between">
                                  <span>{suggestion.category}</span>
                                  {suggestion.price && (
                                    <span className="text-[#2c9ba3] font-semibold">{formatPrice(suggestion.price)}</span>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Results */}
                    {searchInput && searchSuggestions.length === 0 && (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No products found for "{searchInput}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile search icon */}
            <button
              onClick={handleSearchToggle}
              aria-label="Search"
              className="md:hidden p-1"
            >
              <FiSearch size={20} className="text-[#2c9ba3] hover:text-black" />
            </button>

            {/* cart */}
            <Link to="/cart" className="relative p-1" aria-label="Cart">
              <FiShoppingCart size={20} className="text-[#2c9ba3] hover:text-black" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#2c9ba3] text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* profile */}
            <Link to="/profile" aria-label="Account" className="p-1">
              <FiUser size={20} className="text-[#2c9ba3] hover:text-black" />
            </Link>

            {/* Login/Logout - desktop */}
            <div className="hidden md:flex items-center">
              {userInfo ? (
                <button
                  onClick={() => {
                    localStorage.removeItem("userInfo");
                    localStorage.removeItem("token");
                    localStorage.removeItem("cart");
                    window.location.reload();
                  }}
                  className="text-red-500 font-semibold hover:text-red-700 text-sm"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-semibold text-sm"
                >
                  Login
                </Link>
              )}
            </div>

            {/* mobile menu */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-1"
              aria-label="Menu"
            >
              {isOpen ? (
                <FiX size={24} className="text-[#2c9ba3]" />
              ) : (
                <FiMenu size={24} className="text-[#2c9ba3]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar - Appears below navbar when active */}
      {searchOpen && (
        <div className="md:hidden p-3 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            {/* Back button */}
            <button
              onClick={handleBackClick}
              className="flex-shrink-0 p-2 text-[#2c9ba3] hover:bg-gray-100 rounded-lg"
              aria-label="Back"
            >
              <FiArrowLeft size={20} />
            </button>

            {/* Search input */}
            <form onSubmit={handleSearchSubmit} className="flex-1">
              <div className="flex items-center bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
                <FiSearch className="text-[#2c9ba3] mr-2" />
                <input
                  ref={searchInputRef}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-500"
                  placeholder="Search products, categories..."
                  type="text"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="p-1 hover:bg-gray-200 rounded-full"
                  >
                    <FiX className="text-gray-500 text-sm" />
                  </button>
                )}
              </div>
            </form>

            {/* Search button */}
            <button
              onClick={handleSearchSubmit}
              className="flex-shrink-0 bg-[#2c9ba3] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#25838b] transition-colors"
            >
              Search
            </button>
          </div>

          {/* Mobile Search Suggestions */}
          {(searchSuggestions.length > 0 || (recentSearches.length > 0 && !searchInput)) && (
            <div className="mt-3 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
              {/* Recent Searches */}
              {recentSearches.length > 0 && !searchInput && (
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                      <FiClock className="text-[#2c9ba3]" />
                      Recent Searches
                    </h4>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearchClick(search)}
                        className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2 text-sm"
                      >
                        <FiClock className="text-gray-400" />
                        <span className="text-gray-700">{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Suggestions - FIXED: Now goes to product detail page */}
              {searchSuggestions.length > 0 && (
                <div className="p-3">
                  <h4 className="font-semibold text-gray-700 text-sm mb-2">Products</h4>
                  <div className="space-y-2">
                    {searchSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                      >
                        <img 
                          src={suggestion.image?.url || suggestion.image || '/placeholder.png'} 
                          alt={suggestion.title}
                          className="w-8 h-8 rounded object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{suggestion.title}</div>
                          <div className="text-xs text-gray-500 flex justify-between">
                            <span className="truncate">{suggestion.category}</span>
                            {suggestion.price && (
                              <span className="text-[#2c9ba3] font-semibold ml-2">{formatPrice(suggestion.price)}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile menu */}
      {isOpen && !searchOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="bg-white rounded-b-lg shadow-sm">
            <div className="flex flex-col py-2">
              <Link onClick={() => setIsOpen(false)} to="/" className="py-3 px-4 text-center hover:bg-gray-50">Home</Link>
              <Link onClick={() => setIsOpen(false)} to="/shop" className="py-3 px-4 text-center hover:bg-gray-50">Shop</Link>
              <Link onClick={() => setIsOpen(false)} to="/categories" className="py-3 px-4 text-center hover:bg-gray-50">Categories</Link>
              <Link onClick={() => setIsOpen(false)} to="/deals" className="py-3 px-4 text-center hover:bg-gray-50">Deals</Link>
              <Link onClick={() => setIsOpen(false)} to="/contact" className="py-3 px-4 text-center hover:bg-gray-50">Contact</Link>
              
              {/* Mobile Admin Panel */}
              {userInfo && userInfo.role === "admin" && (
                <Link 
                  onClick={() => setIsOpen(false)} 
                  to="/admin" 
                  className="py-3 px-4 text-center text-blue-600 font-semibold hover:bg-blue-50"
                >
                  Admin Panel
                </Link>
              )}
              
              {/* Mobile Login/Logout */}
              <div className="py-3 px-4 text-center border-t border-gray-100">
                {userInfo ? (
                  <button
                    onClick={() => {
                      localStorage.removeItem("userInfo");
                      localStorage.removeItem("token");
                      localStorage.removeItem("cart");
                      window.location.reload();
                    }}
                    className="text-red-500 font-semibold hover:text-red-700 w-full py-2"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    onClick={() => setIsOpen(false)}
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 font-semibold block w-full py-2"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}