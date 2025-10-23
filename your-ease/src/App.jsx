// src/App.jsx
import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BottomNav from "./components/BottomNav";
import { Routes, Route } from "react-router-dom";
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

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('yourEaseCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('yourEaseCart', JSON.stringify(cart));
  }, [cart]);

  // Fetch products from your backend
  useEffect(() => {
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

  // Add to cart function
  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === product._id || item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          (item._id === product._id || item.id === product.id)
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
          countInStock: product.countInStock
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
      <Navbar cartCount={calculateTotalItems()} />
      <WhatsAppButton />
      <Routes>
        <Route path="/" element={<Home products={products} onAddToCart={handleAddToCart} />} />
        
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        /> 
        
        <Route 
          path="/product/:id" 
          element={<ProductDetailPage products={products} onAddToCart={handleAddToCart} cart={cart} />} 
        />
        <Route path="/search" element={<Search onAddToCart={handleAddToCart} />} />
        <Route path="/admin/banner" element={<BannerAdmin />} /> 
        <Route path="/cart" element={
          <Cart 
            cart={cart} 
            updateQuantity={updateQuantity} 
            removeFromCart={removeFromCart}
            calculateTotal={calculateTotal}
          />} 
        />
        <Route path="/checkout" element={
          <Checkout 
            cart={cart} 
            calculateTotal={calculateTotal}
            clearCart={clearCart}
          />} 
        />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <Footer />
      <BottomNav />
    </>
  );
}

export default App;