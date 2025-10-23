// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ChevronLeft, Share2, Heart, Truck, Shield, RotateCcw, Play, Image, ShoppingCart, Check } from "lucide-react";
import { addToWishlist, removeFromWishlist, getWishlist } from "../api";
import ProductReviews from '../components/reviews/ProductReviews';
import ReviewImporter from '../components/ReviewImporter'; // Add this import
import { getProductReviews } from '../api';

const ProductDetailPage = ({ products = [], onAddToCart, cart = [], user }) => { // Make sure user prop is received
  const { id } = useParams();
  const navigate = useNavigate();
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

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (!cart.length && parsedCart.length) {
        // You might want to update parent component's cart state here
        // or handle it through a callback
      }
    }
  }, []);

  useEffect(() => {
  const fetchReviewsAndCalculateRating = async () => {
    try {
      const reviews = await getProductReviews(product._id);
      setReviewCount(reviews.length);
      
      // Calculate average rating from reviews
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

useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUserD(userData);
      
    }
  }, []);

  useEffect(() => {
    const foundProduct = products.find(p => p._id === id || p.id === id);
    setProduct(foundProduct);
    setLoading(false);
    
    // Check if product is in wishlist
    if (foundProduct) {
      checkWishlistStatus(foundProduct._id);
    }
  }, [id, products]);

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
      return imageObj.startsWith('http') ? imageObj : `http://localhost:5000${imageObj}`;
    }
    
    if (imageObj.url) {
      return imageObj.url.startsWith('http') ? imageObj.url : `http://localhost:5000${imageObj.url}`;
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
      category: product.category
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

  const handleViewCart = () => {
    navigate('/cart');
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    
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

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "Rs --";
    return `Rs ${parseFloat(price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const getMediaUrl = (mediaObj) => {
    if (!mediaObj) return "/placeholder.png";
    
    if (typeof mediaObj === 'string') {
      return mediaObj.startsWith('http') ? mediaObj : `http://localhost:5000${mediaObj}`;
    }
    
    if (mediaObj.url) {
      return mediaObj.url.startsWith('http') ? mediaObj.url : `http://localhost:5000${mediaObj.url}`;
    }
    
    return "/placeholder.png";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <button 
            onClick={() => navigate(-1)}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors w-full sm:w-auto"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
console.log(userD.isAdmin);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Back to Products
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
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
              <div className="aspect-square bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden relative">
                {mediaType === "images" ? (
                  images.length > 0 ? (
                    <img 
                      src={getCurrentMedia()} 
                      alt={product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder.png";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
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
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 relative group ${
                        (mediaType === "images" ? selectedImage === index : selectedVideo === index) 
                          ? 'border-teal-600' 
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      {mediaType === "images" ? (
                        <img 
                          src={item} 
                          alt={`${product.title} view ${index + 1}`}
                          className="w-full h-full object-cover"
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
                              className="w-full h-full object-cover opacity-70"
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
  {[...Array(5)].map((_, i) => (
    <Star 
      key={i}
      className={`w-4 h-4 sm:w-5 sm:h-5 ${
        i < Math.floor(averageRating) 
          ? 'fill-yellow-400 text-yellow-400' 
          : 'text-gray-300'
      }`}
    />
  ))}
  <span className="ml-2 text-xs sm:text-sm text-gray-600">
    ({averageRating.toFixed(1)}) • {reviewCount} reviews
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
                {product.shortDescription || product.description}
              </p>

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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {productInCart ? (
                  <button 
                    onClick={handleViewCart}
                    className="flex-1 bg-green-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                  >
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    View in Cart
                  </button>
                ) : (
                  <button 
                    onClick={handleAddToCart}
                    disabled={product.countInStock === 0}
                    className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold transition-colors shadow-lg flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base ${
                      product.countInStock === 0
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                )}
                
                <div className="flex gap-2 sm:gap-3">
                  <button 
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    className={`p-3 sm:p-4 border rounded-xl transition-colors flex items-center justify-center flex-1 sm:flex-none ${
                      isInWishlist
                        ? 'bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Heart 
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${isInWishlist ? 'fill-current' : ''}`} 
                    />
                  </button>

                  <button className="p-3 sm:p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center flex-1 sm:flex-none">
                    <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                  </button>
                </div>
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
                  <div className="text-[10px] sm:text-xs text-gray-600">Over Rs 5000</div>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 mx-auto mb-1 sm:mb-2" />
                  <div className="text-xs sm:text-sm font-medium text-gray-900">30-Day Return</div>
                  <div className="text-[10px] sm:text-xs text-gray-600">Money Back</div>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 mx-auto mb-1 sm:mb-2" />
                  <div className="text-xs sm:text-sm font-medium text-gray-900">2 Year Warranty</div>
                  <div className="text-[10px] sm:text-xs text-gray-600">Guarantee</div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {product.specifications ? (
                    Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex border-b border-gray-100 py-2 sm:py-3">
                        <span className="font-medium text-gray-900 capitalize min-w-[120px] sm:min-w-[200px] text-xs sm:text-sm">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-gray-700 text-xs sm:text-sm">{value}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-sm sm:text-base">No specifications available.</p>
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