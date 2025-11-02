// src/App.jsx
import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BottomNav from "./components/BottomNav";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Account";
import AdminPanel from "./pages/AdminPanel"; 
import AdminRoute from "./components/AdminRoute";
import BannerAdmin from "./pages/admin/BannerAdmin";
import WhatsAppButton from './components/WhatsAppButton';
import ProductDetailPage from "./pages/ProductDetailPage";
import Search from "./pages/Search";
import SEOHead from "./components/SEOHead";
import { analytics } from "./utils/analytics";
import AdminAnalytics from "./pages/AdminAnalytics";
import GDPRConsent from './components/GDPRConsent';
import TrackOrder from "./pages/TrackOrder";
import Shipping from "./pages/Shipping";
import FAQ from "./pages/FAQ";
import Returns from "./pages/Returns";
import Support from "./pages/Support";
import Contact from "./pages/Contact";
import CategoryPage from "./pages/CategoryPage";
import AboutPage from "./pages/AboutPage";
import Policy from "./pages/PolicyPage";

// ScrollToTop component to reset scroll position on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const location = useLocation();

  const API_URL = import.meta.env.VITE_API_URL;

  window.analytics = analytics;

  // Disable browser's scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('yourEaseCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
      const storedUser = localStorage.getItem("userInfo");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('yourEaseCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
  // Set user ID for analytics if user is logged in
  if (user) {
    analytics.setUserId(user._id);
  }
}, [user]);

  // Track initial page view
  useEffect(() => {
    analytics.trackPageView('homepage');
  }, []);

  // Fetch products from your backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [API_URL]);

  // Add to cart function - IMPROVED: Better selectedOptions handling
  const handleAddToCart = (product) => {
    // Track add to cart event
    analytics.trackAddToCart(product, product.quantity || 1);
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => {
        // Check if it's the same product with the same options
        if (item._id === product._id || item.id === product.id) {
          // If both have selectedOptions, compare them
          if (item.selectedOptions && product.selectedOptions) {
            return JSON.stringify(item.selectedOptions) === JSON.stringify(product.selectedOptions);
          }
          // If neither has selectedOptions, it's the same item
          return !item.selectedOptions && !product.selectedOptions;
        }
        return false;
      });
      
      if (existingItem) {
        return prevCart.map(item =>
          (item._id === product._id || item.id === product.id) &&
          JSON.stringify(item.selectedOptions) === JSON.stringify(product.selectedOptions)
            ? { 
                ...item, 
                quantity: item.quantity + (product.quantity || 1) 
              }
            : item
        );
      } else {
        const cartItem = {
          id: product._id || product.id,
          _id: product._id,
          title: product.title,
          price: product.currentPrice || product.price,
          image: product.images?.[0]?.url || product.images?.[0] || '/placeholder.png',
          quantity: product.quantity || 1,
          countInStock: product.countInStock,
          // IMPROVED: Ensure selectedOptions is always an object, not null
          selectedOptions: product.selectedOptions || {}
        };
        return [...prevCart, cartItem];
      }
    });
  };

  // Update quantity in cart
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => 
      prevCart.map(item =>
        (item.id === productId || item._id === productId)
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    const product = cart.find(item => item.id === productId || item._id === productId);
    if (product) {
      analytics.trackRemoveFromCart(product, product.quantity);
    }
    
    setCart(prevCart => 
      prevCart.filter(item => item.id !== productId && item._id !== productId)
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Calculate total items
  const calculateTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <>
      <SEOHead 
        title="Your Ease Store - Premium Products"
        description="Discover amazing products at great prices. Fast shipping and excellent customer service."
      />
      
      <Navbar cartCount={calculateTotalItems()} />
      <WhatsAppButton />
      {/* <GDPRConsent /> */}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home products={products} onAddToCart={handleAddToCart} />} /> 
        <Route path="/admin"element={<AdminRoute><AdminPanel /></AdminRoute>}/>        
        <Route path="/admin/analytics/*"element={<AdminRoute><AdminAnalytics /></AdminRoute>}/>
        <Route path="/product/:id" element={<ProductDetailPage products={products} onAddToCart={handleAddToCart} cart={cart} />} />
        <Route path="/category/:categoryId" element={<CategoryPage onAddToCart={handleAddToCart} />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/support" element={<Support/>} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/policy" element={<Policy/>} />
        <Route path="/search" element={<Search onAddToCart={handleAddToCart} />} />
        <Route path="/admin/banner" element={<BannerAdmin />} /> 
        <Route path="/cart" element={<Cart cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart}calculateTotal={calculateTotal}/>} />
        <Route path="/checkout" element={<Checkout cart={cart} calculateTotal={calculateTotal}clearCart={clearCart}/>}/>
        <Route path="/profile" element={<Profile />} /></Routes>

      <BottomNav />
      <Footer />
      
    </>
  );
}

export default App;