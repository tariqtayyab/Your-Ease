// src/pages/admin/CategoriesAdmin.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [catName, setCatName] = useState("");
  const [catTrending, setCatTrending] = useState(false);
  const [catPosition, setCatPosition] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [draggedProduct, setDraggedProduct] = useState(null);
  const [draggedCategory, setDraggedCategory] = useState(null);
  const [draggedPreview, setDraggedPreview] = useState(null);
  const [autoScroll, setAutoScroll] = useState(false);
  const scrollContainerRef = useRef(null);
  const categoriesContainerRef = useRef(null);
  const previewsContainerRef = useRef(null);

  const [productForm, setProductForm] = useState({
    title: "",
    shortDescription: "",
    description: "",
    specifications: "",
    oldPrice: "",
    currentPrice: "",
    countInStock: "",
    isHotSelling: false,
    options: [],
  });
  const [productFiles, setProductFiles] = useState([]);
  const [productPreviews, setProductPreviews] = useState([]);
  const [existingProductImages, setExistingProductImages] = useState([]);

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line
  }, []);

  // Auto-scroll functionality during drag
  useEffect(() => {
    let scrollInterval;
    if (autoScroll && scrollContainerRef.current) {
      scrollInterval = setInterval(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop += autoScroll;
        }
      }, 16);
    }
    return () => clearInterval(scrollInterval);
  }, [autoScroll]);

  async function loadCategories() {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/api/categories`);
      setCategories(data || []);
    } catch (err) {
      console.error("Failed to load categories", err.response?.data || err);
      alert("Failed to load categories (see console)");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCategory(e) {
    e.preventDefault();
    if (!catName.trim()) return alert("Category name is required");
    try {
      const formData = new FormData();
      formData.append("name", catName.trim());
      formData.append("isTrending", catTrending);
      formData.append("position", catPosition || "0");

      await axios.post(`${API_BASE}/api/categories`, formData, { 
        headers: { 
          ...headers, 
          "Content-Type": "multipart/form-data" 
        } 
      });
      
      setCatName("");
      setCatTrending(false);
      setCatPosition("");
      await loadCategories();
    } catch (err) {
      console.error("Create category failed:", err.response?.data || err);
      alert("Failed to create category");
    }
  }

  async function handleDeleteCategory(id) {
    if (!confirm("Delete this category?")) return;
    try {
      await axios.delete(`${API_BASE}/api/categories/${id}`, { headers });
      await loadCategories();
      if (selectedCategory?._id === id) setSelectedCategory(null);
    } catch (err) {
      console.error("Delete category failed:", err.response?.data || err);
      alert("Delete failed");
    }
  }

  async function handleEditCategory(id, updatedData) {
    try {
      const formData = new FormData();
      formData.append("name", updatedData.name);
      formData.append("isTrending", updatedData.isTrending);
      formData.append("position", updatedData.position);

      const { data } = await axios.put(`${API_BASE}/api/categories/${id}`, formData, { 
        headers: { 
          ...headers, 
          "Content-Type": "multipart/form-data" 
        } 
      });
      
      setEditingCategoryId(null);
      await loadCategories();
      if (selectedCategory && selectedCategory._id === id) setSelectedCategory(data);
    } catch (err) {
      console.error("Edit category failed:", err.response?.data || err);
      alert("Edit failed");
    }
  }

  // Enhanced HTML5 Drag and Drop handlers for products with auto-scroll
  const handleDragStart = (e, product) => {
    setDraggedProduct(product);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", product._id);
    e.currentTarget.style.opacity = "0.6";
    e.currentTarget.style.transform = "rotate(2deg)";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    // Auto-scroll logic
    const container = scrollContainerRef.current;
    if (container) {
      const { top, bottom } = container.getBoundingClientRect();
      const { clientY } = e;
      const scrollThreshold = 100;
      
      if (clientY < top + scrollThreshold) {
        setAutoScroll(-10); // Scroll up
      } else if (clientY > bottom - scrollThreshold) {
        setAutoScroll(10); // Scroll down
      } else {
        setAutoScroll(false);
      }
    }
    
    e.currentTarget.style.backgroundColor = "#f0f9ff";
    e.currentTarget.style.borderColor = "#2c9ba3";
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.backgroundColor = "";
    e.currentTarget.style.borderColor = "";
    setAutoScroll(false);
  };

  const handleDrop = async (e, targetProduct) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = "";
    e.currentTarget.style.borderColor = "";
    setAutoScroll(false);
    
    if (!draggedProduct || draggedProduct._id === targetProduct._id) return;

    const products = [...selectedCategory.products];
    const draggedIndex = products.findIndex(p => p._id === draggedProduct._id);
    const targetIndex = products.findIndex(p => p._id === targetProduct._id);

    // Remove dragged product and insert at target position
    const [removed] = products.splice(draggedIndex, 1);
    products.splice(targetIndex, 0, removed);

    // Update positions based on new order (0-indexed)
    const updates = products.map((product, index) => ({
      productId: product._id,
      position: index
    }));

    setReordering(true);
    try {
      // Update backend
      await axios.put(`${API_BASE}/api/products`, { updates }, { headers });
      
      // Update frontend
      const updatedProducts = products.map((product, index) => ({
        ...product,
        position: index
      }));

      setSelectedCategory(prev => ({
        ...prev,
        products: updatedProducts
      }));

      setCategories(prev => prev.map(cat => 
        cat._id === selectedCategory._id 
          ? { ...cat, products: updatedProducts }
          : cat
      ));

      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      notification.textContent = 'Product order updated successfully!';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      
    } catch (err) {
      console.error("Failed to update product positions:", err);
      alert("Failed to update product order");
    } finally {
      setReordering(false);
      setDraggedProduct(null);
    }
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    e.currentTarget.style.transform = "";
    setDraggedProduct(null);
    setAutoScroll(false);
  };

  // NEW: Drag and Drop handlers for categories
  const handleCategoryDragStart = (e, category) => {
    setDraggedCategory(category);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", category._id);
    e.currentTarget.style.opacity = "0.6";
    e.currentTarget.style.transform = "rotate(2deg)";
  };

  const handleCategoryDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    e.currentTarget.style.backgroundColor = "#f0f9ff";
    e.currentTarget.style.borderColor = "#2c9ba3";
  };

  const handleCategoryDragLeave = (e) => {
    e.currentTarget.style.backgroundColor = "";
    e.currentTarget.style.borderColor = "";
  };

  const handleCategoryDrop = async (e, targetCategory) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = "";
    e.currentTarget.style.borderColor = "";
    
    if (!draggedCategory || draggedCategory._id === targetCategory._id) return;

    const updatedCategories = [...categories];
    const draggedIndex = updatedCategories.findIndex(c => c._id === draggedCategory._id);
    const targetIndex = updatedCategories.findIndex(c => c._id === targetCategory._id);

    // Remove dragged category and insert at target position
    const [removed] = updatedCategories.splice(draggedIndex, 1);
    updatedCategories.splice(targetIndex, 0, removed);

    // Update positions based on new order (0-indexed)
    const updates = updatedCategories.map((category, index) => ({
      categoryId: category._id,
      position: index
    }));

    setReordering(true);
    try {
      // Try alternative approach - update each category individually
      for (let i = 0; i < updatedCategories.length; i++) {
        const category = updatedCategories[i];
        const formData = new FormData();
        formData.append("name", category.name);
        formData.append("isTrending", category.isTrending);
        formData.append("position", i.toString());
        
        await axios.put(`${API_BASE}/api/categories/${category._id}`, formData, { 
          headers: { 
            ...headers, 
            "Content-Type": "multipart/form-data" 
          } 
        });
      }
      
      // Update frontend
      const finalCategories = updatedCategories.map((category, index) => ({
        ...category,
        position: index
      }));

      setCategories(finalCategories);

      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      notification.textContent = 'Category order updated successfully!';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      
    } catch (err) {
      console.error("Failed to update category positions:", err);
      
      // Fallback: Update frontend optimistically even if backend fails
      const finalCategories = updatedCategories.map((category, index) => ({
        ...category,
        position: index
      }));

      setCategories(finalCategories);
      
      alert("Category order updated locally. There was an issue saving to server.");
    } finally {
      setReordering(false);
      setDraggedCategory(null);
    }
  };

  const handleCategoryDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    e.currentTarget.style.transform = "";
    setDraggedCategory(null);
  };

  // NEW: Drag and Drop handlers for product previews
  const handlePreviewDragStart = (e, index) => {
    setDraggedPreview(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", index.toString());
    e.currentTarget.style.opacity = "0.6";
    e.currentTarget.style.transform = "scale(0.95)";
  };

  const handlePreviewDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handlePreviewDragLeave = (e) => {
    // Optional: Add visual feedback if needed
  };

  const handlePreviewDrop = (e, targetIndex) => {
    e.preventDefault();
    
    if (draggedPreview === null || draggedPreview === targetIndex) return;

    const newPreviews = [...productPreviews];
    const [movedItem] = newPreviews.splice(draggedPreview, 1);
    newPreviews.splice(targetIndex, 0, movedItem);
    
    setProductPreviews(newPreviews);
    setDraggedPreview(null);
    
    // Reset styles
    document.querySelectorAll('.preview-item').forEach(item => {
      item.style.opacity = "1";
      item.style.transform = "";
    });
  };

  const handlePreviewDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    e.currentTarget.style.transform = "";
    setDraggedPreview(null);
  };

  async function updateProductPosition(productId, newPosition) {
    try {
      await axios.put(`${API_BASE}/api/products`, {
        updates: [{ productId, position: newPosition }]
      }, { headers });

      const updatedProducts = (selectedCategory.products || [])
        .map(p => p._id === productId ? { ...p, position: newPosition } : p)
        .sort((a, b) => a.position - b.position);

      setSelectedCategory(prev => ({
        ...prev,
        products: updatedProducts
      }));

      setCategories(prev => prev.map(cat => 
        cat._id === selectedCategory._id 
          ? { ...cat, products: updatedProducts }
          : cat
      ));
    } catch (err) {
      console.error("Failed to update product position:", err);
      alert("Failed to update product position");
    }
  }

  function normalizeMediaUrl(mediaItem) {
    if (!mediaItem) return "/placeholder.png";
    
    if (typeof mediaItem === 'string') {
      const s = String(mediaItem).trim();
      
      if (s.startsWith("blob:")) {
        return s;
      }
      
      if (s.startsWith("http://") || s.startsWith("https://")) {
        return s;
      }
      
      if (s.startsWith("//")) {
        return `https:${s}`;
      }
      
      if (s.startsWith("/uploads/")) {
        return `${API_BASE}${s}`;
      }
      
      if (s.startsWith("uploads/")) {
        return `${API_BASE}/${s}`;
      }
      
      if (s.includes('cloudinary.com') || s.includes('res.cloudinary.com')) {
        return s.startsWith('http') ? s : `https://${s}`;
      }
      
      return `${API_BASE}/uploads/${s}`;
    }
    
    if (mediaItem.url) {
      const s = String(mediaItem.url).trim();
      
      if (s.startsWith("blob:")) {
        return s;
      }
      
      if (s.startsWith("http://") || s.startsWith("https://")) {
        return s;
      }
      
      if (s.startsWith("//")) {
        return `https:${s}`;
      }
      
      if (s.startsWith("/uploads/")) {
        return `${API_BASE}${s}`;
      }
      
      if (s.startsWith("uploads/")) {
        return `${API_BASE}/${s}`;
      }
      
      if (s.includes('cloudinary.com') || s.includes('res.cloudinary.com')) {
        return s.startsWith('http') ? s : `https://${s}`;
      }
      
      return `${API_BASE}/uploads/${s}`;
    }
    
    return "/placeholder.png";
  }

  function getMediaType(mediaItem) {
    if (!mediaItem) return "image";
    
    if (typeof mediaItem === 'object' && mediaItem.type) {
      return mediaItem.type;
    }
    
    let urlToCheck = '';
    if (typeof mediaItem === 'string') {
      urlToCheck = mediaItem;
    } else if (mediaItem.url) {
      urlToCheck = mediaItem.url;
    }
    
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.wmv', '.flv', '.3gp', '.m4v'];
    const isVideo = videoExtensions.some(ext => 
      urlToCheck.toLowerCase().includes(ext) || 
      urlToCheck.toLowerCase().includes('video')
    );
    
    return isVideo ? "video" : "image";
  }

  function handleProductFilesChange(e) {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    const newPreviews = files.map((file) => {
      const isVideo = file.type?.startsWith('video/') || 
                     file.name?.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm|wmv|flv|3gp|m4v)$/);
      
      return {
        url: URL.createObjectURL(file),
        type: isVideo ? "video" : "image",
        file: file,
        isNew: true,
        isRemoved: false
      };
    });
    
    setProductFiles(prevFiles => [...prevFiles, ...files]);
    setProductPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  }

  function removeProductPreview(index) {
    const previewToRemove = productPreviews[index];
    
    if (previewToRemove.isNew) {
      setProductPreviews(prev => prev.filter((_, i) => i !== index));
      setProductFiles(prev => {
        let newFileIndex = 0;
        for (let i = 0; i < index; i++) {
          if (productPreviews[i].isNew) newFileIndex++;
        }
        return prev.filter((_, i) => i !== newFileIndex);
      });
    } else {
      setProductPreviews(prev => 
        prev.map((preview, i) => 
          i === index ? { ...preview, isRemoved: !preview.isRemoved } : preview
        )
      );
    }
  }

  // NEW: Functions to handle product options
  const addProductOption = () => {
    setProductForm(prev => ({
      ...prev,
      options: [...prev.options, { name: "", values: [""], required: false }]
    }));
  };

  const removeProductOption = (index) => {
    setProductForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateProductOption = (index, field, value) => {
    setProductForm(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  const addOptionValue = (optionIndex) => {
    setProductForm(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === optionIndex 
          ? { ...option, values: [...option.values, ""] }
          : option
      )
    }));
  };

  const removeOptionValue = (optionIndex, valueIndex) => {
    setProductForm(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === optionIndex 
          ? { 
              ...option, 
              values: option.values.filter((_, vi) => vi !== valueIndex) 
            }
          : option
      )
    }));
  };

  const updateOptionValue = (optionIndex, valueIndex, newValue) => {
    setProductForm(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === optionIndex 
          ? { 
              ...option, 
              values: option.values.map((val, vi) => 
                vi === valueIndex ? newValue : val
              )
            }
          : option
      )
    }));
  };

  async function handleAddOrUpdateProduct(e) {
    e.preventDefault();
    if (!selectedCategory) return alert("Select a category first");
    if (!productForm.title?.trim()) return alert("Product title required");
    
    if (uploading) return;
    setUploading(true);

    try {
      const formData = new FormData();
      
      // Parse specifications from string to object
      let parsedSpecifications = {};
      if (productForm.specifications) {
        const lines = String(productForm.specifications).split('\n');
        lines.forEach(line => {
          const colonIndex = line.indexOf(':');
          if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            if (key && value) {
              parsedSpecifications[key] = value;
            }
          }
        });
      }

      // Filter out empty options and clean option values
      const cleanedOptions = productForm.options
        .filter(option => option.name.trim() !== "")
        .map(option => ({
          ...option,
          values: option.values.filter(val => val.trim() !== ""),
          name: option.name.trim()
        }))
        .filter(option => option.values.length > 0);

      let result;
      if (editingProduct) {
        const remainingExistingImages = productPreviews
          .filter(preview => !preview.isNew && !preview.isRemoved)
          .map(preview => ({
            url: preview.url,
            type: preview.type
          }));

        const newImagesPreviews = productPreviews
          .filter(preview => preview.isNew && !preview.isRemoved);

        formData.append("title", productForm.title);
        formData.append("shortDescription", productForm.shortDescription);
        formData.append("description", productForm.description);
        formData.append("specifications", JSON.stringify(parsedSpecifications));
        formData.append("oldPrice", productForm.oldPrice);
        formData.append("currentPrice", productForm.currentPrice);
        formData.append("countInStock", productForm.countInStock);
        formData.append("isHotSelling", productForm.isHotSelling);
        formData.append("category", selectedCategory._id);
        formData.append("options", JSON.stringify(cleanedOptions));
        
        formData.append("images", JSON.stringify(remainingExistingImages));

        newImagesPreviews.forEach(preview => {
          formData.append("images", preview.file);
        });

        result = await axios.put(`${API_BASE}/api/products/${editingProduct._id}`, formData, { 
          headers: { 
            ...headers,
            "Content-Type": "multipart/form-data"
          } 
        });
      } else {
        formData.append("title", productForm.title);
        formData.append("shortDescription", productForm.shortDescription);
        formData.append("description", productForm.description);
        formData.append("specifications", JSON.stringify(parsedSpecifications));
        formData.append("oldPrice", productForm.oldPrice);
        formData.append("currentPrice", productForm.currentPrice);
        formData.append("countInStock", productForm.countInStock);
        formData.append("isHotSelling", productForm.isHotSelling);
        formData.append("position", "0"); // Always add at top
        formData.append("category", selectedCategory._id);
        formData.append("options", JSON.stringify(cleanedOptions));
        
        productFiles.forEach((file) => {
          formData.append("images", file);
        });

        result = await axios.post(`${API_BASE}/api/products`, formData, {
          headers: { 
            ...headers, 
            "Content-Type": "multipart/form-data" 
          }
        });
      }

      setProductForm({ 
        title: "", 
        shortDescription: "",
        description: "", 
        specifications: "",
        oldPrice: "", 
        currentPrice: "", 
        countInStock: "",
        isHotSelling: false,
        options: [],
      });
      setProductFiles([]);
      setProductPreviews([]);
      setExistingProductImages([]);
      setEditingProduct(null);

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

      await loadCategories();
      const refreshedCategories = (await axios.get(`${API_BASE}/api/categories`)).data;
      const refreshedCategory = refreshedCategories.find((c) => c._id === selectedCategory._id);
      setSelectedCategory(refreshedCategory);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      notification.textContent = editingProduct ? "Product updated successfully!" : "Product added successfully!";
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      
    } catch (err) {
      console.error("Add/Edit product failed:", err.response?.data || err);
      alert("Operation failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteProduct(productId) {
    if (!confirm("Delete this product? This will also remove all associated images/videos from Cloudinary.")) return;
    
    try {
      await axios.delete(`${API_BASE}/api/products/${productId}`, { headers });
      
      const refreshed = (await axios.get(`${API_BASE}/api/categories`)).data.find(
        (c) => c._id === selectedCategory._id
      );
      setSelectedCategory(refreshed);
      await loadCategories();
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      notification.textContent = 'Product deleted successfully!';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      
    } catch (err) {
      console.error("Delete product failed:", err);
      alert("Delete failed");
    }
  }

  function handleEditProduct(product) {
    setEditingProduct(product);
    
    // Convert specifications from object to string for the form
    let specificationsString = "";
    if (product.specifications && typeof product.specifications === 'object') {
      specificationsString = Object.entries(product.specifications)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    } else {
      specificationsString = product.specifications || "";
    }
    
    setProductForm({
      title: product.title,
      shortDescription: product.shortDescription || "",
      description: product.description,
      specifications: specificationsString,
      oldPrice: product.oldPrice,
      currentPrice: product.currentPrice,
      countInStock: product.countInStock,
      isHotSelling: product.isHotSelling || false,
      options: product.options || [],
    });
    
    const existingImages = product.images?.map(img => {
      if (typeof img === 'object' && img.url) {
        const isVideo = img.type === 'video' || 
                       img.url.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm|wmv|flv|3gp|m4v)$/);
        
        return {
          url: img.url,
          type: isVideo ? 'video' : 'image',
          isNew: false,
          isRemoved: false
        };
      } else {
        const url = typeof img === 'string' ? img : img?.url;
        const isVideo = url?.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm|wmv|flv|3gp|m4v)$/);
        
        return {
          url: url,
          type: isVideo ? 'video' : 'image',
          isNew: false,
          isRemoved: false
        };
      }
    }) || [];
    
    setExistingProductImages(existingImages);
    setProductPreviews(existingImages);
    setProductFiles([]);
  }

  function renderMediaPreview(mediaItem, className = "w-20 h-20 object-cover rounded-xl border-2 border-gray-200") {
    const mediaType = getMediaType(mediaItem);
    const mediaUrl = normalizeMediaUrl(mediaItem);

    if (mediaType === "video") {
      return (
        <video 
          src={mediaUrl} 
          className={className}
          controls
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      );
    } else {
      return (
        <img
          src={mediaUrl}
          className={className}
          alt="Preview"
          onError={(e) => {
            e.target.src = "/placeholder.png";
          }}
        />
      );
    }
  }

  function getProductCount(categoryId) {
    const category = categories.find(c => c._id === categoryId);
    return category?.products?.length || 0;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Category Management</h1>
          <p className="text-gray-600 text-lg">Organize your products and categories efficiently</p>
        </div>

        {/* Add Category Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Category</h3>
          <form onSubmit={handleCreateCategory} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter category name"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                required
              />
            </div>
            
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Position</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Order (0,1,2...)"
                value={catPosition}
                onChange={(e) => setCatPosition(e.target.value)}
                min="0"
              />
            </div>

            <div className="lg:col-span-1 flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
              <input 
                type="checkbox" 
                id="trending"
                checked={catTrending} 
                onChange={(e) => setCatTrending(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="trending" className="text-sm font-medium text-gray-700">
                Mark as Trending
              </label>
            </div>

            <div className="lg:col-span-1">
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
              >
                + Add Category
              </button>
            </div>
          </form>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Categories Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 sm:p-6 h-full min-h-[600px] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  Categories
                  <span className="text-sm text-gray-400 font-normal">
                    ({categories.length})
                  </span>
                </h3>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {categories.length}
                </span>
              </div>

              {/* Drag Instruction */}
              {categories.length > 1 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                    </svg>
                    Drag categories to reorder
                  </div>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="flex justify-center items-center flex-1">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {/* No Categories */}
              {!loading && categories.length === 0 && (
                <div className="text-center flex-1 flex flex-col justify-center py-10 text-gray-500">
                  <div className="text-5xl mb-4">📁</div>
                  <p className="text-gray-700 font-medium mb-1">No categories yet</p>
                  <p className="text-sm text-gray-500">
                    Create your first category above
                  </p>
                </div>
              )}

              {/* Categories List */}
              <div 
                ref={categoriesContainerRef}
                className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-1"
              >
                {categories
                  .sort((a, b) => (a.position || 0) - (b.position || 0))
                  .map((c, index) => (
                  <div
                    key={c._id}
                    draggable
                    onDragStart={(e) => handleCategoryDragStart(e, c)}
                    onDragOver={handleCategoryDragOver}
                    onDragLeave={handleCategoryDragLeave}
                    onDrop={(e) => handleCategoryDrop(e, c)}
                    onDragEnd={handleCategoryDragEnd}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-move group ${
                      selectedCategory?._id === c._id
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedCategory(c)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Drag Handle */}
                        <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16"/>
                          </svg>
                        </div>

                        <div className="flex-shrink-0 w-7 h-7 bg-blue-100 border border-blue-200 rounded-lg flex items-center justify-center">
                          <span className="text-blue-700 font-semibold text-xs">
                            {index + 1}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-900 text-sm truncate block">
                            {c.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getProductCount(c._id)} products
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCategoryId(c._id);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 
                              2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(c._id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 
                              0116.138 21H7.862a2 2 0 01-1.995-1.858L5 
                              7m5 4v6m4-6v6m1-10V4a1 
                              1 0 00-1-1h-4a1 1 0 
                              00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {editingCategoryId === c._id && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <CategoryEditForm
                          category={c}
                          onSave={(data) => handleEditCategory(c._id, data)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-3">
            {selectedCategory ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Category Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4 mb-4 lg:mb-0">
                      {selectedCategory.image && (
                        <div className="flex-shrink-0">
                          {renderMediaPreview(selectedCategory.image, "w-16 h-16 object-cover rounded-lg border-2 border-white")}
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl lg:text-3xl font-bold">{selectedCategory.name}</h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedCategory.isTrending && (
                            <span className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                              🔥 Trending Category
                            </span>
                          )}
                          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                            {getProductCount(selectedCategory._id)} products
                          </span>
                          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                            Position: {selectedCategory.position || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedCategory(null);
                        setEditingProduct(null);
                        setProductForm({ 
                          title: "", 
                          shortDescription: "",
                          description: "", 
                          specifications: "",
                          oldPrice: "", 
                          currentPrice: "", 
                          countInStock: "", 
                          isHotSelling: false,
                          options: [],
                        });
                        setProductFiles([]);
                        setProductPreviews([]);
                        setExistingProductImages([]);
                      }}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Add/Edit Product Form */}
                  <div className="mb-8">
                    <h4 className="text-xl font-semibold text-gray-900 mb-6">
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </h4>
                    <form onSubmit={handleAddOrUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <input 
                          placeholder="Product Name *" 
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          value={productForm.title} 
                          onChange={(e) => setProductForm({ ...productForm, title: e.target.value })} 
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <textarea 
                          placeholder="Short Description (max 150 characters) - Shown in product cards"
                          rows="2"
                          maxLength="150"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          value={productForm.shortDescription} 
                          onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })} 
                        />
                        <div className="text-xs text-gray-500 text-right mt-1">
                          {productForm.shortDescription.length}/150 characters
                        </div>
                      </div>
                      
                      <div className="md:col-span-1">
                        <input 
                          placeholder="Old Price (Rs)" 
                          type="number"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={productForm.oldPrice} 
                          onChange={(e) => setProductForm({ ...productForm, oldPrice: e.target.value })} 
                        />
                      </div>
                      
                      <div className="md:col-span-1">
                        <input 
                          placeholder="Current Price (Rs) *" 
                          type="number"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          value={productForm.currentPrice} 
                          onChange={(e) => setProductForm({ ...productForm, currentPrice: e.target.value })} 
                        />
                      </div>
                      
                      <div className="md:col-span-1">
                        <input 
                          placeholder="Stock Quantity *" 
                          type="number"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          value={productForm.countInStock} 
                          onChange={(e) => setProductForm({ ...productForm, countInStock: e.target.value })} 
                        />
                      </div>

                      <div className="md:col-span-1 flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                        <input 
                          type="checkbox" 
                          id="hotSelling"
                          checked={productForm.isHotSelling} 
                          onChange={(e) => setProductForm({ ...productForm, isHotSelling: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="hotSelling" className="text-sm font-medium text-gray-700">
                          Mark as Hot Selling
                        </label>
                      </div>
                      
                      <div className="md:col-span-2">
                        <textarea 
                          placeholder="Full Product Description" 
                          rows="4"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={productForm.description} 
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} 
                        />
                      </div>

                      {/* UPDATED: Specifications Field */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Specifications (Key: Value pairs)
                        </label>
                        <textarea 
                          placeholder="Enter specifications as key: value pairs, one per line. Example:
Model: A9 Pro 2 (5th Generation)
Bluetooth Version: 5.3 / 5.4
Driver: 11mm Dynamic Speaker
Battery Life: Up to 32 hours" 
                          rows="6"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                          value={productForm.specifications} 
                          onChange={(e) => setProductForm({ ...productForm, specifications: e.target.value })} 
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Enter each specification as "Key: Value" on separate lines. Empty lines will be ignored.
                        </div>
                      </div>

                      {/* Product Options Section */}
                      <div className="md:col-span-2">
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                              Product Options (Optional)
                            </label>
                            <button
                              type="button"
                              onClick={addProductOption}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              + Add Option
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mb-4">
                            Add options like Size, Color, Material, etc. Customers can select these when ordering.
                          </p>

                          {productForm.options.length === 0 ? (
                            <div className="text-center py-4 text-gray-400 text-sm">
                              No options added yet. Click "Add Option" to create options like Size, Color, etc.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {productForm.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="border border-gray-300 rounded-lg p-4 bg-white">
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className="flex-1">
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Option Name (e.g., Size, Color)
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="e.g., Size, Color, Material"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={option.name}
                                        onChange={(e) => updateProductOption(optionIndex, 'name', e.target.value)}
                                      />
                                    </div>
                                    <div className="flex items-center gap-2 mt-6">
                                      <input
                                        type="checkbox"
                                        id={`required-${optionIndex}`}
                                        checked={option.required}
                                        onChange={(e) => updateProductOption(optionIndex, 'required', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                      />
                                      <label htmlFor={`required-${optionIndex}`} className="text-xs font-medium text-gray-700 whitespace-nowrap">
                                        Required
                                      </label>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeProductOption(optionIndex)}
                                      className="mt-6 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                                    >
                                      Remove
                                    </button>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <label className="block text-xs font-medium text-gray-700">
                                        Option Values (comma separated or add individually)
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() => addOptionValue(optionIndex)}
                                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                      >
                                        + Add Value
                                      </button>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      {option.values.map((value, valueIndex) => (
                                        <div key={valueIndex} className="flex items-center gap-2">
                                          <input
                                            type="text"
                                            placeholder={`Value ${valueIndex + 1}`}
                                            className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={value}
                                            onChange={(e) => updateOptionValue(optionIndex, valueIndex, e.target.value)}
                                          />
                                          {option.values.length > 1 && (
                                            <button
                                              type="button"
                                              onClick={() => removeOptionValue(optionIndex, valueIndex)}
                                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                                            >
                                              Remove
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Images/Videos {editingProduct && "(Add new ones or reorder existing)"}
                        </label>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*,video/*" 
                          onChange={handleProductFilesChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                        />
                        
                        {productPreviews.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-3">
                              Drag to reorder • Click {editingProduct ? "to remove/undo" : "❌ to remove"} • 
                              <span className="text-red-500 ml-1">Red overlay = will be removed</span>
                            </p>
                            <div 
                              ref={previewsContainerRef}
                              className="flex flex-wrap gap-3"
                            >
                              {productPreviews.map((preview, index) => (
                                <div 
                                  key={index}
                                  draggable
                                  onDragStart={(e) => handlePreviewDragStart(e, index)}
                                  onDragOver={handlePreviewDragOver}
                                  onDragLeave={handlePreviewDragLeave}
                                  onDrop={(e) => handlePreviewDrop(e, index)}
                                  onDragEnd={handlePreviewDragEnd}
                                  className={`preview-item relative group transition-all duration-200 ${
                                    preview.isRemoved ? 'opacity-60' : ''
                                  }`}
                                >
                                  {preview.isRemoved && (
                                    <div className="absolute inset-0 bg-red-500 bg-opacity-40 rounded-lg flex items-center justify-center z-10">
                                      <span className="text-white font-bold text-sm">REMOVED</span>
                                    </div>
                                  )}
                                  
                                  <div className="w-20 h-20 rounded-lg border-2 border-gray-200 flex items-center justify-center bg-gray-100 cursor-move hover:border-blue-500 transition-colors">
                                    {renderMediaPreview(preview, `w-full h-full object-cover rounded-lg ${preview.isRemoved ? 'border-red-400' : 'border-gray-200'} transition-colors`)}
                                    
                                    {/* Drag Handle */}
                                    <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                      {editingProduct ? (preview.isNew ? 'NEW' : 'EXISTING') : 'DRAG'}
                                    </div>
                                  </div>
                                  
                                  <button
                                    type="button"
                                    onClick={() => removeProductPreview(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-20"
                                    title={preview.isRemoved ? "Undo remove" : "Remove"}
                                  >
                                    {preview.isRemoved ? '↶' : '❌'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-2 flex gap-3">
                        <button 
                          type="submit" 
                          disabled={uploading}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md disabled:transform-none"
                        >
                          {uploading ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Uploading...
                            </span>
                          ) : editingProduct ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Save Changes
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Add Product
                            </span>
                          )}
                        </button>
                        {editingProduct && (
                          <button 
                            type="button"
                            onClick={() => {
                              setEditingProduct(null);
                              setProductForm({ 
                                title: "", 
                                shortDescription: "",
                                description: "", 
                                specifications: "",
                                oldPrice: "", 
                                currentPrice: "", 
                                countInStock: "", 
                                isHotSelling: false,
                                options: [],
                              });
                              setProductFiles([]);
                              setProductPreviews([]);
                              setExistingProductImages([]);
                            }}
                            className="px-6 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Products List */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                      <div className="flex items-center gap-3 mb-4 sm:mb-0">
                        <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                        <h4 className="text-2xl font-bold text-gray-900">
                          Products ({selectedCategory.products?.length || 0})
                        </h4>
                      </div>
                      
                      {selectedCategory.products?.length > 0 && (
                        <div className="flex items-center gap-4">
                          {reordering && (
                            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              Saving order...
                            </div>
                          )}
                          <div className="text-sm text-gray-600 bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                            <span className="flex items-center gap-2 font-medium">
                              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                              </svg>
                              Drag products to reorder
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {!selectedCategory.products?.length ? (
                      <div className="text-center py-16 text-gray-500 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-300">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                          </svg>
                        </div>
                        <p className="text-xl font-semibold text-gray-700 mb-2">No products yet</p>
                        <p className="text-gray-500">Add your first product to get started</p>
                      </div>
                    ) : (
                      <div 
                        ref={scrollContainerRef}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-h-[800px] overflow-y-auto pr-2"
                        style={{ scrollBehavior: 'smooth' }}
                      >
                        {selectedCategory.products
                          .sort((a, b) => (a.position || 0) - (b.position || 0))
                          .map((p, index) => (
                          <div
                            key={p._id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, p)}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, p)}
                            onDragEnd={handleDragEnd}
                            className="bg-white rounded-2xl border-2 border-gray-200 p-5 transition-all duration-300 hover:border-blue-300 hover:shadow-xl cursor-move group"
                          >
                            <div className="flex flex-col h-full">
                              {/* Product Image - Only first image */}
                              <div className="mb-4 relative">
                                <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 group-hover:border-blue-300 transition-colors duration-200">
                                  {p.images && p.images.length > 0 ? (
                                    renderMediaPreview(p.images[0], "w-full h-full object-cover")
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Position Badge */}
                                <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
                                  #{index + 1}
                                </div>
                                
                                {/* Hot Selling Badge */}
                                {p.isHotSelling && (
                                  <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                    HOT
                                  </div>
                                )}
                                
                                {/* Options Badge - Show if product has options */}
                                {p.options && p.options.length > 0 && (
                                  <div className="absolute bottom-3 left-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                    {p.options.length} OPTION{p.options.length > 1 ? 'S' : ''}
                                  </div>
                                )}
                                
                                {/* Specifications Badge - Show if product has specifications */}
                                {p.specifications && Object.keys(p.specifications).length > 0 && (
                                  <div className="absolute bottom-3 right-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                    SPECS
                                  </div>
                                )}
                                
                                {/* Drag Handle */}
                                <div className="absolute bottom-3 right-3 bg-black/80 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16"/>
                                  </svg>
                                </div>
                              </div>

                              {/* Product Details - Simplified */}
                              <div className="flex-1">
                                <h5 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2 leading-tight">
                                  {p.title}
                                </h5>
                                
                                {/* Price Section */}
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-blue-600 text-xl">
                                      Rs {p.currentPrice}
                                    </span>
                                    {p.oldPrice && p.oldPrice > p.currentPrice && (
                                      <span className="line-through text-gray-400 text-sm">
                                        Rs {p.oldPrice}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Position Display */}
                                  <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200">
                                    Pos: {p.position || 0}
                                  </div>
                                </div>

                                {/* Display Options Summary */}
                                {p.options && p.options.length > 0 && (
                                  <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="text-xs font-medium text-blue-800 mb-1">Options:</div>
                                    <div className="space-y-1">
                                      {p.options.slice(0, 2).map((option, idx) => (
                                        <div key={idx} className="text-xs text-blue-600">
                                          • {option.name}: {option.values.slice(0, 3).join(', ')}
                                          {option.values.length > 3 && '...'}
                                        </div>
                                      ))}
                                      {p.options.length > 2 && (
                                        <div className="text-xs text-blue-500">
                                          +{p.options.length - 2} more options
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Display Specifications Summary */}
                                {p.specifications && Object.keys(p.specifications).length > 0 && (
                                  <div className="mb-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                                    <div className="text-xs font-medium text-purple-800 mb-1">Specifications:</div>
                                    <div className="space-y-1">
                                      {Object.entries(p.specifications).slice(0, 2).map(([key, value], idx) => (
                                        <div key={idx} className="text-xs text-purple-600">
                                          • {key}: {value}
                                        </div>
                                      ))}
                                      {Object.keys(p.specifications).length > 2 && (
                                        <div className="text-xs text-purple-500">
                                          +{Object.keys(p.specifications).length - 2} more specs
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                  <div className="text-xs text-gray-500">
                                    Drag to reorder
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEditProduct(p)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110 border border-blue-200"
                                      title="Edit"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(p._id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 border border-red-200"
                                      title="Delete"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Select a Category</h3>
                <p className="text-gray-600">Choose a category from the list to view and manage its products</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

function CategoryEditForm({ category, onSave }) {
  const [name, setName] = useState(category.name);
  const [isTrending, setIsTrending] = useState(!!category.isTrending);
  const [position, setPosition] = useState(category.position || "");

  const handleSave = () => {
    onSave({ name, isTrending, position: position || "0" });
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="space-y-3">
        <input 
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Category name"
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <input 
            type="number"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Display order"
            min="0"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input 
              type="checkbox" 
              checked={isTrending} 
              onChange={(e) => setIsTrending(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            Trending Category
          </label>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}