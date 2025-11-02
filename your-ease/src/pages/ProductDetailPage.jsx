// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ChevronLeft, Share2, Heart, Truck, Shield, RotateCcw, Play, Image, ShoppingCart, Check, Copy, CheckCircle, MessageCircle, Zap, LogIn, Package, DollarSign, CreditCard, HandCoins, ShoppingBag } from "lucide-react";
import { addToWishlist, removeFromWishlist, getWishlist } from "../api";
import ProductReviews from '../components/reviews/ProductReviews';
import ReviewImporter from '../components/ReviewImporter';
import { getProductReviews } from '../api';
import { analytics } from '../utils/analytics';

const ProductDetailPage = ({ products = [], onAddToCart, cart = [], user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  // Use useRef to track if we've already tracked this product view
  const hasTrackedView = useRef(false);
  const currentProductId = useRef(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [mediaType, setMediaType] = useState("images");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCartSuccess, setShowCartSuccess] = useState(false);
  const [showWishlistSuccess, setShowWishlistSuccess] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [videoThumbnails, setVideoThumbnails] = useState({});
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [userD, setUserD] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  // NEW: State for selected options
  const [selectedOptions, setSelectedOptions] = useState({});

  // Consolidated useEffect for product loading and tracking
  useEffect(() => {
    const foundProduct = products.find(p => p._id === id || p.id === id);
    
    if (foundProduct) {
      setProduct(foundProduct);
      
      // Initialize selected options when product loads
      if (foundProduct.options && foundProduct.options.length > 0) {
        const initialOptions = {};
        foundProduct.options.forEach(option => {
          if (option.values && option.values.length > 0) {
            initialOptions[option.name] = option.values[0];
          }
        });
        setSelectedOptions(initialOptions);
      }
      
      // TRACK PRODUCT VIEW - Only track once per product session
      // Reset tracking if product ID changes
      if (currentProductId.current !== id) {
        hasTrackedView.current = false;
        currentProductId.current = id;
      }
      
      if (!hasTrackedView.current && foundProduct._id) {
        console.log('📊 Tracking product view for:', foundProduct.title);
        analytics.trackProductView(foundProduct);
        hasTrackedView.current = true;
        
        // Also store in sessionStorage to prevent tracking on page refresh
        sessionStorage.setItem(`tracked_${foundProduct._id}`, 'true');
      }
      
      // Check wishlist status only if user is logged in
      if (user) {
        checkWishlistStatus(foundProduct._id);
      }
    }
    
    setLoading(false);
  }, [id, products, user]);

  // Load user data
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUserD(userData);
    }
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (!cart.length && parsedCart.length) {
        // You might want to update parent component's cart state here
      }
    }
  }, []);

  // Fetch reviews and calculate rating
  useEffect(() => {
    const fetchReviewsAndCalculateRating = async () => {
      try {
        const reviews = await getProductReviews(product._id);
        setReviewCount(reviews.length);
        
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          const avgRating = totalRating / reviews.length;
          setAverageRating(avgRating);
        } else {
          setAverageRating(0);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    if (product) {
      fetchReviewsAndCalculateRating();
    }
  }, [product]);

  // Generate video thumbnails
  useEffect(() => {
    if (product?.images) {
      const videoImages = product.images.filter(item => item.type === 'video');
      videoImages.forEach((media, index) => {
        if (!videoThumbnails[media.url]) {
          generateVideoThumbnail(media.url, index);
        }
      });
    }
  }, [product?.images]);

  // NEW: Function to handle option selection
  const handleOptionSelect = (optionName, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: value
    }));
  };

  // Function to generate video thumbnail
  const generateVideoThumbnail = (videoUrl, index) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      video.currentTime = 0.1;
      video.muted = true;
      
      video.addEventListener('loadeddata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const thumbnailUrl = canvas.toDataURL('image/jpeg');
        setVideoThumbnails(prev => ({
          ...prev,
          [videoUrl]: thumbnailUrl
        }));
        resolve(thumbnailUrl);
      });
      
      video.addEventListener('error', () => {
        resolve(null);
      });
    });
  };

  // Check if product is in wishlist
  const checkWishlistStatus = async (productId) => {
    try {
      const wishlistData = await getWishlist();
      const isInWishlist = wishlistData.items?.some(item => 
        item.product?._id === productId || item.product === productId
      );
      setIsInWishlist(isInWishlist);
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  // Helper function to get image URL
  const getImageUrl = (imageObj) => {
    if (!imageObj) return "/placeholder.png";
    
    if (typeof imageObj === 'string') {
      return imageObj.startsWith('http') ? imageObj : `${BASE_URL}${imageObj}`;
    }
    
    if (imageObj.url) {
      return imageObj.url.startsWith('http') ? imageObj.url : `${BASE_URL}${imageObj.url}`;
    }
    
    return "/placeholder.png";
  };

  // Save cart to localStorage
  const saveCartToLocalStorage = (cartItems) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  };

  // Check if product is already in cart
  const isProductInCart = () => {
    if (!product) return false;

    const inParentCart = cart.some(item => 
      item.id === product._id || item._id === product._id
    );
    
    if (inParentCart) return true;

    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        return parsedCart.some(item => 
          item.id === product._id || item._id === product._id
        );
      }
    } catch (error) {
      console.error("Error reading cart from localStorage:", error);
    }
    
    return false;
  };

  const handleAddToCart = () => {
    if (!product || product.countInStock === 0) return;

    const rawImage = product.images?.[0] || product.image;
    const processedImage = getImageUrl(rawImage);

    const cartItem = {
      id: product._id,
      _id: product._id,
      title: product.title,
      price: product.currentPrice || product.price,
      oldPrice: product.oldPrice,
      image: processedImage,
      quantity: quantity,
      countInStock: product.countInStock,
      category: product.category,
      // NEW: Include selected options in cart item
      selectedOptions: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined
    };

    let updatedCart = [];

    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        updatedCart = JSON.parse(savedCart);
        
        const existingItemIndex = updatedCart.findIndex(item => 
          item.id === product._id || item._id === product._id
        );

        if (existingItemIndex > -1) {
          updatedCart[existingItemIndex].quantity += quantity;
        } else {
          updatedCart.push(cartItem);
        }
      } else {
        updatedCart = [cartItem];
      }

      saveCartToLocalStorage(updatedCart);

      if (onAddToCart) {
        onAddToCart(cartItem);
      }

      setShowCartSuccess(true);
      setTimeout(() => {
        setShowCartSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error adding product to cart. Please try again.");
    }
  };

  // Handle Buy Now - Add to cart and redirect to checkout
  const handleBuyNow = () => {
    if (!product || product.countInStock === 0) return;

    handleAddToCart(); // Add to cart first
    
    // Redirect to checkout after a short delay
    setTimeout(() => {
      navigate('/checkout');
    }, 500);
  };

  // Handle WhatsApp Order
  const handleWhatsAppOrder = () => {
    if (!product) return;

    const productName = encodeURIComponent(product.title);
    const productPrice = formatPrice(product.currentPrice || product.price);
    const quantityText = quantity > 1 ? `Quantity: ${quantity}` : '';
    const totalPrice = formatPrice((product.currentPrice || product.price) * quantity);
    
    // NEW: Include selected options in WhatsApp message
    let optionsText = '';
    if (Object.keys(selectedOptions).length > 0) {
      optionsText = '\n\nSelected Options:\n';
      Object.entries(selectedOptions).forEach(([optionName, value]) => {
        optionsText += `• ${optionName}: ${value}\n`;
      });
    }
    
    const message = `Hello! I would like to order this product:\n\n📦 *${product.title}*\n💰 Price: ${productPrice}\n${quantityText}\n${quantity > 1 ? `💵 Total: ${totalPrice}\n` : ''}${optionsText}\nPlease confirm availability and proceed with my order.`;
    
    const phoneNumber = "923258211422"; // Replace with your business WhatsApp number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleViewCart = () => {
    navigate('/cart');
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    
    // Check if user is logged in
    if (!userD) {
      setShowLoginPrompt(true);
      return;
    }
    
    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await removeFromWishlist(product._id);
        setIsInWishlist(false);
      } else {
        await addToWishlist(product._id);
        setIsInWishlist(true);
        setShowWishlistSuccess(true);
        setTimeout(() => {
          setShowWishlistSuccess(false);
        }, 3000);
      }
    } catch (error) {
      alert(error.message || "Error updating wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleViewWishlist = () => {
    navigate('/profile?tab=wishlist');
  };

  // Share functionality
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out ${product.title} - ${formatPrice(product.currentPrice || product.price)}`;

    try {
      if (navigator.share) {
        // Use Web Share API if available (mobile devices)
        await navigator.share({
          title: product.title,
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback: show share options modal
        setShowShareOptions(true);
      }
    } catch (error) {
      // User canceled the share or Web Share API not supported
      console.log('Share canceled or not supported');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setShowShareOptions(false);
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setShowShareOptions(false);
      }, 2000);
    }
  };

  const shareOnSocialMedia = (platform) => {
    const shareUrl = window.location.href;
    const shareText = `Check out ${product.title} - ${formatPrice(product.currentPrice || product.price)}`;
    
    let url = '';
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareOptions(false);
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "Rs --";
    return `Rs ${parseFloat(price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const getMediaUrl = (mediaObj) => {
    if (!mediaObj) return "/placeholder.png";
    
    if (typeof mediaObj === 'string') {
      return mediaObj.startsWith('http') ? mediaObj : `${BASE_URL}${mediaObj}`;
    }
    
    if (mediaObj.url) {
      return mediaObj.url.startsWith('http') ? mediaObj.url : `${BASE_URL}${mediaObj.url}`;
    }
    
    return "/placeholder.png";
  };

  if (loading || !product) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center space-x-2 text-sm mb-8 animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-16"></div>
          <div className="h-4 bg-gray-300 rounded w-4"></div>
          <div className="h-4 bg-gray-300 rounded w-24"></div>
          <div className="h-4 bg-gray-300 rounded w-4"></div>
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery Skeleton */}
          <div className="space-y-4">
            {/* Main Image Skeleton */}
            <div className="aspect-square bg-gray-300 rounded-xl animate-pulse"></div>
            
            {/* Thumbnails Skeleton */}
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="aspect-square bg-gray-300 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-6">
            {/* Title Skeleton */}
            <div className="space-y-2">
              <div className="h-8 bg-gray-300 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
            </div>

            {/* Price Skeleton */}
            <div className="space-y-2">
              <div className="h-8 bg-gray-300 rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
            </div>

            {/* Rating Skeleton */}
            <div className="flex items-center space-x-2">
              <div className="h-5 bg-gray-300 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
            </div>

            {/* Description Skeleton */}
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-4/6 animate-pulse"></div>
            </div>

            {/* Add to Cart Section Skeleton */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div className="h-10 bg-gray-300 rounded-lg animate-pulse"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 bg-gray-300 rounded-lg animate-pulse"></div>
                <div className="h-12 bg-gray-300 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Features Skeleton */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="h-6 w-6 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Section Skeleton */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          {/* Tab Headers Skeleton */}
          <div className="flex space-x-8 mb-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-8 bg-gray-300 rounded w-24 animate-pulse"></div>
            ))}
          </div>
          
          {/* Tab Content Skeleton */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-11/12 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-10/12 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-9/12 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

  // if (!product) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
  //       <div className="text-center max-w-sm w-full">
  //         <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
  //         <button 
  //           onClick={() => navigate(-1)}
  //           className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors w-full sm:w-auto"
  //         >
  //           Go Back
  //         </button>
  //       </div>
  //     </div>
  //     // setLoading(true)
  //   );
  // }

  // Separate images and videos
  const images = product.images?.filter(item => item.type === 'image').map(img => getMediaUrl(img)) || [];
  const videos = product.images?.filter(item => item.type === 'video').map(vid => getMediaUrl(vid)) || [];

  const getCurrentMedia = () => {
    if (mediaType === "images") {
      return images[selectedImage];
    } else {
      return videos[selectedVideo];
    }
  };

  const handleMediaTypeChange = (type) => {
    setMediaType(type);
    if (type === "images") {
      setSelectedImage(0);
    } else {
      setSelectedVideo(0);
    }
  };

  const handleThumbnailClick = (index) => {
    if (mediaType === "images") {
      setSelectedImage(index);
    } else {
      setSelectedVideo(index);
    }
  };

  const productInCart = isProductInCart();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
          >
            <ChevronLeft className="w-6 h-6 sm:w-5 sm:h-5 mr-2" />
            
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-3 ">
        {/* Success Messages */}
        {showCartSuccess && (
          <div className="fixed top-4 right-3 sm:right-4 z-50 animate-in slide-in-from-right duration-300 max-w-xs sm:max-w-sm">
            <div className="bg-green-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-lg flex items-center gap-3">
              <Check className="w-5 h-5 sm:w-6 sm:h-6" />
              <div>
                <p className="font-semibold text-sm sm:text-base">Added to Cart!</p>
                <p className="text-xs sm:text-sm opacity-90">Product successfully added to your cart</p>
              </div>
            </div>
          </div>
        )}

        {showWishlistSuccess && (
          <div className="fixed top-4 right-3 sm:right-4 z-50 animate-in slide-in-from-right duration-300 max-w-xs sm:max-w-sm">
            <div className="bg-pink-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-lg flex items-center gap-3">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              <div>
                <p className="font-semibold text-sm sm:text-base">Added to Wishlist!</p>
                <p className="text-xs sm:text-sm opacity-90">Product saved to your wishlist</p>
              </div>
            </div>
          </div>
        )}

        {/* Share Options Modal */}
        {showShareOptions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Share Product</h3>
                <button 
                  onClick={() => setShowShareOptions(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              {copySuccess ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-green-600 font-medium">Link copied to clipboard!</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button 
                      onClick={() => shareOnSocialMedia('whatsapp')}
                      className="flex items-center justify-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <span className="text-lg">📱</span>
                      <span className="font-medium">WhatsApp</span>
                    </button>
                    
                    <button 
                      onClick={() => shareOnSocialMedia('facebook')}
                      className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <span className="text-lg">📘</span>
                      <span className="font-medium">Facebook</span>
                    </button>
                    
                    <button 
                      onClick={() => shareOnSocialMedia('twitter')}
                      className="flex items-center justify-center gap-2 p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <span className="text-lg">🐦</span>
                      <span className="font-medium">Twitter</span>
                    </button>
                    
                    <button 
                      onClick={() => shareOnSocialMedia('telegram')}
                      className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <span className="text-lg">📨</span>
                      <span className="font-medium">Telegram</span>
                    </button>
                  </div>
                  
                  <button 
                    onClick={copyToClipboard}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="font-medium">Copy Link</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Login Prompt Modal */}
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-in zoom-in duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Login Required</h3>
                <p className="text-gray-600 mb-6">
                  Please login to add items to your wishlist and access all features.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowLoginPrompt(false);
                      navigate('/profile');
                    }}
                    className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8">
            {/* Image Gallery */}
          <div className="space-y-3 sm:space-y-4">
  {/* Media Type Tabs */}
  <div className="flex justify-end">
    <div className="bg-gray-100 rounded-lg p-1 flex text-xs sm:text-sm">
      <button
        onClick={() => handleMediaTypeChange("images")}
        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-md transition-all duration-200 ${
          mediaType === "images" 
            ? "bg-white text-teal-600 shadow-sm" 
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <Image className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="font-medium">Images</span>
        <span className="bg-gray-200 text-gray-700 text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full">
          {images.length}
        </span>
      </button>
      
      {videos.length > 0 && (
        <button
          onClick={() => handleMediaTypeChange("videos")}
          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-md transition-all duration-200 ${
            mediaType === "videos" 
              ? "bg-white text-teal-600 shadow-sm" 
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Play className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="font-medium">Videos</span>
          <span className="bg-gray-200 text-gray-700 text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full">
            {videos.length}
          </span>
        </button>
      )}
    </div>
  </div>

  {/* Main Media Display */}
  <div className="aspect-square bg-white rounded-lg sm:rounded-xl overflow-hidden relative">
    {mediaType === "images" ? (
      images.length > 0 ? (
        <img 
          src={getCurrentMedia()} 
          alt={product.title}
          className="w-full h-full object-contain bg-white"
          onError={(e) => {
            e.target.src = "/placeholder.png";
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <Image className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No images available</p>
          </div>
        </div>
      )
    ) : (
      videos.length > 0 ? (
        <div className="w-full h-full flex items-center justify-center bg-black rounded-lg sm:rounded-xl">
          <video 
            src={getCurrentMedia()}
            controls
            className="w-full h-full object-contain"
            poster={videoThumbnails[getCurrentMedia()] || images[0]}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black rounded-lg sm:rounded-xl">
          <div className="text-white text-center p-4 sm:p-8">
            <Play className="w-8 h-8 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 opacity-50" />
            <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No Videos Available</p>
            <p className="text-gray-400 text-xs sm:text-sm">Switch to images tab</p>
          </div>
        </div>
      )
    )}
  </div>
  
  {/* Thumbnail Navigation */}
  {(mediaType === "images" ? images : videos).length > 0 && (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {(mediaType === "images" ? images : videos).map((item, index) => (
        <button
          key={index}
          onClick={() => handleThumbnailClick(index)}
          className={`aspect-square bg-white rounded-lg overflow-hidden border-2 relative group ${
            (mediaType === "images" ? selectedImage === index : selectedVideo === index) 
              ? 'border-teal-600' 
              : 'border-transparent hover:border-gray-300'
          }`}
        >
          {mediaType === "images" ? (
            <img 
              src={item} 
              alt={`${product.title} view ${index + 1}`}
              className="w-full h-full object-contain bg-white"
              onError={(e) => {
                e.target.src = "/placeholder.png";
              }}
            />
          ) : (
            <div className="w-full h-full bg-black flex items-center justify-center relative">
              {videoThumbnails[item] ? (
                <img 
                  src={videoThumbnails[item]} 
                  alt={`Video thumbnail ${index + 1}`}
                  className="w-full h-full object-contain opacity-70"
                />
              ) : null}
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-white text-xs font-medium absolute bottom-1 left-1 bg-black bg-opacity-70 px-1 rounded text-[10px] sm:text-xs">
                Video
              </span>
            </div>
          )}
        </button>
      ))}
    </div>
  )}

  {/* Show message if no media available */}
  {images.length === 0 && videos.length === 0 && (
    <div className="aspect-square bg-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center">
      <div className="text-center text-gray-500">
        <Image className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No media available</p>
      </div>
    </div>
  )}
</div>

            {/* Product Info */}
            <div className="space-y-4 sm:space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                  {product.title}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex items-center">
  {[...Array(5)].map((_, i) => {
    const rating = product.rating || 0;
    const fullStars = Math.floor(rating);
    const hasPartialStar = rating % 1 !== 0 && i === fullStars;
    const partialPercentage = hasPartialStar ? (rating % 1) * 100 : 0;
    
    return (
      <div key={i} className="relative">
        {/* Gray background star */}
        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
        
        {/* Colored overlay */}
        <div 
          className="absolute top-0 left-0 overflow-hidden"
          style={{ 
            width: i < fullStars ? '100%' : (hasPartialStar ? `${partialPercentage}%` : '0%')
          }}
        >
          <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
        </div>
      </div>
    );
  })}
  <span className="ml-2 text-xs sm:text-sm text-gray-600">
    ({product.rating?.toFixed(1) || '0.0'}) • {product.numReviews || 0} reviews
  </span>
</div>
                  <span className={`text-xs sm:text-sm font-medium ${
                    product.countInStock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-1 sm:space-y-2">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-teal-600">
                  {formatPrice(product.currentPrice || product.price)}
                </div>
                {product.oldPrice && product.oldPrice > (product.currentPrice || product.price) && (
                  <div className="text-base sm:text-lg text-gray-500 line-through">
                    {formatPrice(product.oldPrice)}
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                {product.shortDescription}
              </p>

              {/* NEW: Product Options Section */}
              {product.options && product.options.length > 0 && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 text-base">Available Options:</h3>
                  <div className="space-y-4">
                    {product.options.map((option, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-medium text-gray-700 text-sm">
                            {option.name}
                            {option.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </label>
                          {selectedOptions[option.name] && (
                            <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full">
                              Selected: {selectedOptions[option.name]}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {option.values.map((value, valueIndex) => (
                            <button
                              key={valueIndex}
                              onClick={() => handleOptionSelect(option.name, value)}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                                selectedOptions[option.name] === value
                                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm transform scale-105'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                              }`}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Features */}
              {product.features && product.features.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Key Features:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm sm:text-base">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <span className="font-medium text-gray-900 text-sm sm:text-base">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg self-start">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    disabled={product.countInStock === 0}
                  >
                    -
                  </button>
                  <span className="px-3 sm:px-4 py-2 border-l border-r border-gray-300 min-w-[40px] sm:min-w-[60px] text-center font-medium text-sm sm:text-base">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    disabled={product.countInStock === 0 || quantity >= product.countInStock}
                  >
                    +
                  </button>
                </div>
                {product.countInStock > 0 && (
                  <span className="text-xs sm:text-sm text-gray-600">
                    {product.countInStock} available
                  </span>
                )}
              </div>

              {/* Primary Action Buttons - WhatsApp Order & Buy Now */}
             <div className="space-y-4">

  {/* Buy Now & Add to Cart Combined in One Line */}
  <div className="flex gap-3">
    {/* Buy Now Button - Primary */}
    <button 
      onClick={handleBuyNow}
      disabled={product.countInStock === 0}
      className={`flex-1 py-4 px-4 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-3 text-sm sm:text-base ${
        product.countInStock === 0
          ? 'bg-gray-400 text-white cursor-not-allowed'
          : 'bg-teal-600 text-white hover:bg-teal-700 transform hover:scale-105 active:scale-95'
      }`}
    >
      <Zap className="w-5 h-5 flex-shrink-0" />
      <span className="truncate">Buy Now</span>
    </button>

    {/* Add to Cart Button - Secondary */}
    <button 
      onClick={handleAddToCart}
      disabled={product.countInStock === 0 || productInCart}
      className={`flex-1 py-4 px-4 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-3 text-sm sm:text-base ${
        product.countInStock === 0 || productInCart
          ? 'bg-gray-400 text-white cursor-not-allowed'
          : 'bg-white text-teal-600 border-2 border-teal-600 hover:bg-teal-50 transform hover:scale-105 active:scale-95'
      }`}
    >
      {productInCart ? (
        <Check className="w-5 h-5 flex-shrink-0" />
      ) : (
        <ShoppingCart className="w-5 h-5 flex-shrink-0" />
      )}
      <span className="truncate">
        {productInCart ? 'In Cart' : 'Add to Cart'}
      </span>
    </button>
  </div>

  {/* Secondary Action Buttons */}
  <div className="flex gap-3">
    {/* Wishlist Button */}
    <button 
      onClick={handleWishlistToggle}
      disabled={wishlistLoading || product.countInStock === 0}
      className={`flex-1 p-4 border rounded-xl transition-all flex items-center justify-center gap-3 ${
        isInWishlist
          ? 'bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100'
          : userD
          ? 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
          : 'border-gray-300 text-gray-400 cursor-not-allowed'
      } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''} ${
        user && !isInWishlist ? 'hover:scale-105' : ''
      }`}
      title={!user ? "Login to use wishlist" : isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart 
        className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} 
      />
      <span className="hidden sm:inline text-sm font-medium">
        {isInWishlist ? 'Saved' : 'Wishlist'}
      </span>
    </button>

    {/* Share Button */}
    <button 
      onClick={handleShare}
      className="flex-1 p-4 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-3 hover:scale-105"
    >
      <Share2 className="w-5 h-5 text-gray-600" />
      <span className="hidden sm:inline text-sm font-medium text-gray-600">Share</span>
    </button>

    

    {/* View Cart Button (when product is in cart) */}
    {productInCart && (
      <button 
        onClick={handleViewCart}
        className="flex-1 p-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-3 hover:scale-105"
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="hidden sm:inline text-sm font-medium">View Cart</span>
      </button>
    )}
  </div>

  <button 
    onClick={handleWhatsAppOrder}
    disabled={product.countInStock === 0}
    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-3 text-base sm:text-lg ${
      product.countInStock === 0
        ? 'bg-gray-400 text-white cursor-not-allowed'
        : 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105 active:scale-95'
    }`}
  >
    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
    Order on WhatsApp
  </button>

</div>

              {/* Success Messages */}
              {showCartSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 flex items-center gap-3 animate-in fade-in duration-300">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800 text-sm sm:text-base">Added to Cart Successfully!</p>
                    <button 
                      onClick={handleViewCart}
                      className="text-green-700 hover:text-green-800 text-xs sm:text-sm font-medium underline"
                    >
                      View Cart
                    </button>
                  </div>
                </div>
              )}

              {showWishlistSuccess && (
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-3 sm:p-4 flex items-center gap-3 animate-in fade-in duration-300">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 fill-current" />
                  <div>
                    <p className="font-medium text-pink-800 text-sm sm:text-base">Added to Wishlist!</p>
                    <button 
                      onClick={handleViewWishlist}
                      className="text-pink-700 hover:text-pink-800 text-xs sm:text-sm font-medium underline"
                    >
                      View Wishlist
                    </button>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="text-center">
                  <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 mx-auto mb-1 sm:mb-2" />
                  <div className="text-xs sm:text-sm font-medium text-gray-900">Free Shipping</div>
                  <div className="text-[10px] sm:text-xs text-gray-600">All Over Pakistan</div>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 mx-auto mb-1 sm:mb-2" />
                  <div className="text-xs sm:text-sm font-medium text-gray-900">14-Days Return</div>
                  <div className="text-[10px] sm:text-xs text-gray-600">Money Back</div>
                </div>
                <div className="text-center">
  <Package className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 mx-auto mb-1 sm:mb-2" />
  <div className="text-xs sm:text-sm font-medium text-gray-900">Cash on Delivery</div>
  <div className="text-[10px] sm:text-xs text-gray-600">Available</div>
</div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="border-t border-gray-200">
            <div className="flex border-b border-gray-200">
              {["description", "specifications", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 sm:py-4 font-medium text-center capitalize transition-colors text-sm sm:text-base ${
                    activeTab === tab
                      ? "text-teal-600 border-b-2 border-teal-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              {activeTab === "description" && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {product.fullDescription || product.description || "No description available."}
                  </p>
                </div>
              )}

             {activeTab === "specifications" && (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    {product.specifications && Object.keys(product.specifications).length > 0 ? (
      <div className="divide-y divide-gray-100">
        {Object.entries(product.specifications).map(([key, value], index) => (
          <div key={index} className="flex flex-col sm:flex-row py-4 px-6 hover:bg-gray-50 transition-colors group">
            <div className="w-full sm:w-2/5 lg:w-1/3 mb-2 sm:mb-0">
              <span className="font-semibold text-gray-800 text-sm sm:text-base capitalize flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
            <div className="w-full sm:w-3/5 lg:w-2/3">
              <span className="text-gray-700 text-sm sm:text-base leading-relaxed font-medium">
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-12">
        <div className="text-gray-300 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500 text-base">No specifications available for this product.</p>
        <p className="text-gray-400 text-sm mt-1">Check back later for detailed specifications.</p>
      </div>
    )}
  </div>
)}

              {activeTab === "reviews" && (
                <div>
                  {/* Add Review Importer for Admin Users */}
                  {userD?.isAdmin && (
                    <div className="mb-6">
                      <ReviewImporter productId={product._id} userD={userD}/>
                    </div>
                  )}
                  
                  <ProductReviews 
                    productId={product._id}
                    onAddReview={(newReview) => {
                      console.log('New review added:', newReview);
                    }}
                    user={userD}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;