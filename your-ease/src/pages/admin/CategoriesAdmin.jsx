// src/pages/admin/CategoriesAdmin.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000";

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

  const [productForm, setProductForm] = useState({
    title: "",
    shortDescription: "",
    description: "",
    oldPrice: "",
    currentPrice: "",
    countInStock: "",
    isHotSelling: false,
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

  async function loadCategories() {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/api/categories`);
      console.log("Loaded categories (raw):", data);
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

  function movePreview(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= productPreviews.length) return;
    
    const newPreviews = [...productPreviews];
    const [movedItem] = newPreviews.splice(fromIndex, 1);
    newPreviews.splice(toIndex, 0, movedItem);
    
    setProductPreviews(newPreviews);
  }

  async function handleAddOrUpdateProduct(e) {
    e.preventDefault();
    if (!selectedCategory) return alert("Select a category first");
    if (!productForm.title?.trim()) return alert("Product title required");
    
    if (uploading) return;
    setUploading(true);

    try {
      const formData = new FormData();
      
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
        formData.append("oldPrice", productForm.oldPrice);
        formData.append("currentPrice", productForm.currentPrice);
        formData.append("countInStock", productForm.countInStock);
        formData.append("isHotSelling", productForm.isHotSelling);
        formData.append("category", selectedCategory._id);
        
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
        formData.append("oldPrice", productForm.oldPrice);
        formData.append("currentPrice", productForm.currentPrice);
        formData.append("countInStock", productForm.countInStock);
        formData.append("isHotSelling", productForm.isHotSelling);
        formData.append("category", selectedCategory._id);
        
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
        oldPrice: "", 
        currentPrice: "", 
        countInStock: "",
        isHotSelling: false
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
      
      alert(editingProduct ? "Product updated successfully!" : "Product added successfully!");
      
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
      
      alert("Product deleted successfully!");
    } catch (err) {
      console.error("Delete product failed:", err);
      alert("Delete failed");
    }
  }

  function handleEditProduct(product) {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      shortDescription: product.shortDescription || "",
      description: product.description,
      oldPrice: product.oldPrice,
      currentPrice: product.currentPrice,
      countInStock: product.countInStock,
      isHotSelling: product.isHotSelling || false,
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
    <div className="p-4 max-w-7xl mx-auto pb-24">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#2c9ba3] mb-2">Manage Categories</h2>
        <p className="text-gray-600">Create and manage product categories and items</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Category</h3>
        <form onSubmit={handleCreateCategory} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
            <input
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2c9ba3] focus:border-transparent transition-all"
              placeholder="Enter category name"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2c9ba3] focus:border-transparent transition-all"
              placeholder="Display order (1,2,3...)"
              value={catPosition}
              onChange={(e) => setCatPosition(e.target.value)}
              min="0"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              id="trending"
              checked={catTrending} 
              onChange={(e) => setCatTrending(e.target.checked)}
              className="w-4 h-4 text-[#2c9ba3] border-gray-300 rounded focus:ring-[#2c9ba3]"
            />
            <label htmlFor="trending" className="text-sm font-medium text-gray-700">
              Mark as Trending
            </label>
          </div>

          <button 
            type="submit" 
            className="bg-[#2c9ba3] hover:bg-[#25838b] text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            Add Category
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-2 h-2 bg-[#2c9ba3] rounded-full mr-2"></span>
              Categories ({categories.length})
            </h3>
            
            {loading && (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-[#2c9ba3] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {!loading && categories.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📁</div>
                <p>No categories yet</p>
                <p className="text-sm">Create your first category above</p>
              </div>
            )}

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {categories.map((c) => (
                <div
                  key={c._id}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedCategory?._id === c._id 
                      ? 'border-[#2c9ba3] bg-blue-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    {c.image && (
                      <div className="flex-shrink-0">
                        {renderMediaPreview(c.image, "w-12 h-12 object-cover rounded-lg border border-gray-200")}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 truncate">{c.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {c.isTrending && (
                          <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                            🔥 Trending
                          </span>
                        )}
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {getProductCount(c._id)} products
                        </span>
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          Pos: {c.position || 0}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => setSelectedCategory(c)}
                        className="p-2 text-gray-600 hover:text-[#2c9ba3] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Open"
                      >
                        📂
                      </button>
                      <button
                        onClick={() => setEditingCategoryId(c._id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(c._id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {editingCategoryId === c._id && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
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

        <div className="xl:col-span-3">
          {selectedCategory ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#2c9ba3] to-[#34b4bd] p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    {selectedCategory.image && (
                      <div className="flex-shrink-0">
                        {renderMediaPreview(selectedCategory.image, "w-16 h-16 object-cover rounded-lg border-2 border-white")}
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-bold">{selectedCategory.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
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
                        oldPrice: "", 
                        currentPrice: "", 
                        countInStock: "", 
                        isHotSelling: false 
                      });
                      setProductFiles([]);
                      setProductPreviews([]);
                      setExistingProductImages([]);
                    }}
                    className="mt-3 sm:mt-0 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">
                    {editingProduct ? "✏️ Edit Product" : "➕ Add New Product"}
                  </h4>
                  <form onSubmit={handleAddOrUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <input 
                        placeholder="Product Name" 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2c9ba3] focus:border-transparent"
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
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2c9ba3] focus:border-transparent resize-none"
                        value={productForm.shortDescription} 
                        onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })} 
                      />
                      <div className="text-xs text-gray-500 text-right mt-1">
                        {productForm.shortDescription.length}/150 characters
                      </div>
                    </div>
                    
                    <input 
                      placeholder="Old Price (Rs)" 
                      type="number"
                      className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2c9ba3] focus:border-transparent"
                      value={productForm.oldPrice} 
                      onChange={(e) => setProductForm({ ...productForm, oldPrice: e.target.value })} 
                    />
                    
                    <input 
                      placeholder="Current Price (Rs)" 
                      type="number"
                      className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2c9ba3] focus:border-transparent"
                      value={productForm.currentPrice} 
                      onChange={(e) => setProductForm({ ...productForm, currentPrice: e.target.value })} 
                    />
                    
                    <input 
                      placeholder="Stock Quantity" 
                      type="number"
                      className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2c9ba3] focus:border-transparent"
                      value={productForm.countInStock} 
                      onChange={(e) => setProductForm({ ...productForm, countInStock: e.target.value })} 
                    />

                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        id="hotSelling"
                        checked={productForm.isHotSelling} 
                        onChange={(e) => setProductForm({ ...productForm, isHotSelling: e.target.checked })}
                        className="w-4 h-4 text-[#2c9ba3] border-gray-300 rounded focus:ring-[#2c9ba3]"
                      />
                      <label htmlFor="hotSelling" className="text-sm font-medium text-gray-700">
                        🔥 Mark as Hot Selling
                      </label>
                    </div>
                    
                    <div className="md:col-span-2">
                      <textarea 
                        placeholder="Full Product Description" 
                        rows="4"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2c9ba3] focus:border-transparent"
                        value={productForm.description} 
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} 
                      />
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
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2c9ba3] file:text-white hover:file:bg-[#25838b]"
                      />
                      
                      {productPreviews.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-2">
                            Drag to reorder • Click {editingProduct ? "to remove/undo" : "❌ to remove"} • 
                            <span className="text-red-500 ml-1">Red overlay = will be removed</span>
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {productPreviews.map((preview, index) => (
                              <div key={index} className={`relative group ${preview.isRemoved ? 'opacity-60' : ''}`}>
                                {preview.isRemoved && (
                                  <div className="absolute inset-0 bg-red-500 bg-opacity-40 rounded-xl flex items-center justify-center z-10">
                                    <span className="text-white font-bold text-sm">REMOVED</span>
                                  </div>
                                )}
                                
                                <div className="w-24 h-24 rounded-xl border-2 border-gray-200 flex items-center justify-center bg-gray-100">
                                  {renderMediaPreview(preview, `w-full h-full object-cover rounded-xl ${preview.isRemoved ? 'border-red-400' : 'border-gray-200 hover:border-[#2c9ba3]'} transition-colors`)}
                                </div>
                                
                                <button
                                  type="button"
                                  onClick={() => removeProductPreview(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-20"
                                  title={preview.isRemoved ? "Undo remove" : "Remove"}
                                >
                                  {preview.isRemoved ? '↶' : '❌'}
                                </button>
                                <div className="absolute bottom-1 left-1 flex gap-1">
                                  {index > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => movePreview(index, index - 1)}
                                      className="bg-black/70 text-white rounded w-5 h-5 flex items-center justify-center text-xs hover:bg-black/90"
                                    >
                                      ↑
                                    </button>
                                  )}
                                  {index < productPreviews.length - 1 && (
                                    <button
                                      type="button"
                                      onClick={() => movePreview(index, index + 1)}
                                      className="bg-black/70 text-white rounded w-5 h-5 flex items-center justify-center text-xs hover:bg-black/90"
                                    >
                                      ↓
                                    </button>
                                  )}
                                </div>
                                {editingProduct && (
                                  <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                                    {preview.isNew ? 'NEW' : 'EXISTING'}
                                  </div>
                                )}
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
                        className="flex-1 bg-[#2c9ba3] hover:bg-[#25838b] disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg disabled:transform-none"
                      >
                        {uploading ? "⏳ Uploading..." : (editingProduct ? "💾 Save Changes" : "➕ Add Product")}
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
                              oldPrice: "", 
                              currentPrice: "", 
                              countInStock: "", 
                              isHotSelling: false 
                            });
                            setProductFiles([]);
                            setProductPreviews([]);
                            setExistingProductImages([]);
                          }}
                          className="px-6 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-[#2c9ba3] rounded-full mr-2"></span>
                    Products ({selectedCategory.products?.length || 0})
                  </h4>
                  
                  {!selectedCategory.products?.length ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl">
                      <div className="text-4xl mb-3">📦</div>
                      <p className="text-lg">No products yet</p>
                      <p className="text-sm">Add your first product above</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {selectedCategory.products.map((p) => (
                        <div key={p._id} className="border-2 border-gray-200 rounded-2xl p-4 hover:border-[#2c9ba3] transition-all duration-200 bg-white group hover:shadow-lg">
                          <div className="flex flex-col">
                            <div className="mb-4">
                              <div className="flex gap-2 overflow-x-auto pb-2">
                                {p.images?.map((img, index) => (
                                  <div key={index} className="flex-shrink-0">
                                    {renderMediaPreview(img, "w-20 h-20 object-cover rounded-xl border-2 border-gray-200 group-hover:border-[#2c9ba3] transition-colors")}
                                  </div>
                                ))}
                                {(!p.images || p.images.length === 0) && (
                                  <div className="w-20 h-20 bg-gray-100 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-400">
                                    📷
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2 flex items-center gap-2">
                                {p.title}
                                {p.isHotSelling && (
                                  <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                    🔥 Hot Selling
                                  </span>
                                )}
                              </div>
                              {p.shortDescription && (
                                <div className="text-sm text-gray-600 line-clamp-2 mb-2 bg-blue-50 p-2 rounded-lg border border-blue-100">
                                  {p.shortDescription}
                                </div>
                              )}
                              <div className="text-sm text-gray-600 line-clamp-3 mb-3 min-h-[3rem]">{p.description}</div>
                              
                              <div className="flex items-center justify-between mt-auto">
                                <div className="flex flex-col">
                                  <span className="font-bold text-[#2c9ba3] text-xl">Rs {p.currentPrice}</span>
                                  {p.oldPrice && p.oldPrice > p.currentPrice && (
                                    <span className="line-through text-gray-400 text-sm">Rs {p.oldPrice}</span>
                                  )}
                                </div>
                                
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditProduct(p)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                                    title="Edit"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p._id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                                    title="Delete"
                                  >
                                    🗑️
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
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Select a Category</h3>
              <p className="text-gray-500">Choose a category from the list to view and manage its products</p>
            </div>
          )}
        </div>
      </div>
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
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="space-y-3">
        <input 
          className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#2c9ba3] focus:border-transparent" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Category name"
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
          <input 
            type="number"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#2c9ba3] focus:border-transparent"
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
              className="w-4 h-4 text-[#2c9ba3] border-gray-300 rounded focus:ring-[#2c9ba3]"
            />
            Trending
          </label>
          <button
            onClick={handleSave}
            className="bg-[#2c9ba3] hover:bg-[#25838b] text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            💾 Save
          </button>
        </div>
      </div>
    </div>
  );
}