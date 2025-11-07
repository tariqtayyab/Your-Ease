// src/App.jsx
import React, { useState, useEffect, lazy, Suspense, useRef } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BottomNav from "./components/BottomNav";
import { Routes, Route, useLocation } from "react-router-dom";
// import AdminRoute from "./components/AdminRoute";
import WhatsAppButton from './components/WhatsAppButton';
import SEOHead from "./components/SEOHead";
import { trackPageView } from './utils/ga4-simple.js';
import { apiCache } from "./utils/apiCache";

// Lazy load all pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Profile = lazy(() => import("./pages/Account"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const BannerAdmin = lazy(() => import("./pages/admin/BannerAdmin"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const Search = lazy(() => import("./pages/Search"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const Shipping = lazy(() => import("./pages/Shipping"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Returns = lazy(() => import("./pages/Returns"));
const Support = lazy(() => import("./pages/Support"));
const Contact = lazy(() => import("./pages/Contact"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const Policy = lazy(() => import("./pages/PolicyPage"));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div>
   <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 max-w-7xl mx-auto space-y-12">
        <div className="relative w-full overflow-hidden rounded-2xl shadow-md h-[180px] sm:h-[280px] md:h-[350px] lg:h-[400px] xl:h-[450px] 2xl:h-[500px]">
          {/* Skeleton Loader */}
          <div className="w-full h-full bg-gray-300 animate-pulse rounded-2xl"></div>
        </div>
      </div>

      <section className="bg-gradient-to-br from-gray-50 to-blue-50 pt-10 pb-6 md:py-16">
        <div className="container mx-auto px-4">
          {/* Header Skeleton */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex flex-col items-center">
              <div className="h-8 md:h-12 bg-gray-300 rounded-lg w-64 md:w-96 mx-auto mb-3 md:mb-4 animate-pulse"></div>
              <div className="h-4 md:h-5 bg-gray-300 rounded w-48 md:w-80 mx-auto mb-4 animate-pulse"></div>
              <div className="w-16 h-1 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Product Cards Skeleton */}
          <div className="relative">
            {/* Desktop Grid Skeleton */}
            <div className="hidden lg:grid lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 rounded-2xl h-64 md:h-80 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>

            {/* Mobile Horizontal Scroll Skeleton */}
            <div className="flex gap-6 md:gap-8 w-max lg:hidden px-8 md:px-12 items-center h-full">
              {[...Array(1)].map((_, index) => (
                <div 
                  key={index}
                  className="flex-shrink-0"
                  style={{ width: '280px' }}
                >
                  <div className="bg-gray-300 rounded-2xl h-64 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

       <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {[...Array(2)].map((_, categoryIndex) => (
              <div key={categoryIndex} className="category-section bg-white rounded-3xl shadow-lg px-3 py-6 md:p-8 border border-gray-100 animate-pulse">
                {/* Category Header Skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
                  <div className="text-center sm:text-left">
                    <div className="h-8 md:h-10 bg-gray-300 rounded-lg w-48 md:w-64 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                  </div>
                  <div className="h-12 bg-gray-300 rounded-xl w-32"></div>
                </div>

                {/* Products Grid Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                  {[...Array(6)].map((_, productIndex) => (
                    <div key={productIndex} className="animate-pulse">
                      <div className="bg-gray-300 rounded-2xl h-48 md:h-56 mb-3"></div>
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>
);

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
   const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();
   const hasFetched = useRef(false); 

  //  useEffect(() => {
  //   // Track page view when route changes
  //   trackPageView(document.title);
  // }, [location.pathname]);

  const API_URL = import.meta.env.VITE_API_URL;

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
    if (hasFetched.current) return; // ✅ PREVENT MULTIPLE CALLS
    hasFetched.current = true;

    const fetchProducts = async () => {
      const cacheKey = 'products';
      console.log('🔄 App.jsx - Fetching products...');
      
      const cachedData = apiCache.get(cacheKey);
      
      if (cachedData) {
        console.log('✅ App.jsx - Using cached products');
        setProducts(cachedData);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('📡 App.jsx - Making API call for products');
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        setProducts(data);
        
        apiCache.set(cacheKey, data);
        console.log('✅ App.jsx - Products cached successfully');
      } catch (error) {
        console.error('❌ App.jsx - Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [API_URL]);

  // Add to cart function - IMPROVED: Better selectedOptions handling
  const handleAddToCart = (product) => {
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
      <ScrollToTop />
      
      <Routes>
        <Route path="/" element={
          <Suspense fallback={<PageLoader />}>
            <Home products={products} onAddToCart={handleAddToCart} />
          </Suspense>
        } /> 
        
        
        <Route path="/product/:id" element={
          <Suspense fallback={<PageLoader />}>
            <ProductDetailPage products={products} onAddToCart={handleAddToCart} cart={cart} />
          </Suspense>
        } />
        
        <Route path="/category/:categoryId" element={
          <Suspense fallback={<PageLoader />}>
            <CategoryPage onAddToCart={handleAddToCart} />
          </Suspense>
        } />
        
        <Route path="/track-order" element={
          <Suspense fallback={<PageLoader />}>
            <TrackOrder />
          </Suspense>
        } />
        
        <Route path="/shipping" element={
          <Suspense fallback={<PageLoader />}>
            <Shipping />
          </Suspense>
        } />
        
        <Route path="/faq" element={
          <Suspense fallback={<PageLoader />}>
            <FAQ />
          </Suspense>
        } />
        
        <Route path="/returns" element={
          <Suspense fallback={<PageLoader />}>
            <Returns />
          </Suspense>
        } />
        
        <Route path="/about" element={
          <Suspense fallback={<PageLoader />}>
            <AboutPage />
          </Suspense>
        } />
        
        <Route path="/support" element={
          <Suspense fallback={<PageLoader />}>
            <Support />
          </Suspense>
        } />
        
        <Route path="/contact" element={
          <Suspense fallback={<PageLoader />}>
            <Contact />
          </Suspense>
        } />
        
        <Route path="/policy" element={
          <Suspense fallback={<PageLoader />}>
            <Policy />
          </Suspense>
        } />
        
        <Route path="/search" element={
          <Suspense fallback={<PageLoader />}>
            <Search onAddToCart={handleAddToCart} />
          </Suspense>
        } />
        
        <Route path="/admin/banner" element={
          <Suspense fallback={<PageLoader />}>
            <BannerAdmin />
          </Suspense>
        } /> 
        
        <Route path="/cart" element={
          <Suspense fallback={<PageLoader />}>
            <Cart cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} calculateTotal={calculateTotal}/>
          </Suspense>
        } />
        
        <Route path="/checkout" element={
          <Suspense fallback={<PageLoader />}>
            <Checkout cart={cart} calculateTotal={calculateTotal} clearCart={clearCart}/>
          </Suspense>
        }/>
        
        <Route path="/profile" element={
          <Suspense fallback={<PageLoader />}>
            <Profile />
          </Suspense>
        } />
      </Routes>

      <BottomNav />
      <Footer />
    </>
  );
}

export default App;