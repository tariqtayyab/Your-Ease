import React, { useState } from 'react';
import { Star, X, Send, Upload, Image, Video, Trash2, LogIn } from 'lucide-react';
import { createReview } from '../../api';
import { useNavigate } from 'react-router-dom';

const ReviewForm = ({ productId, onSubmit, onCancel, user }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    userName: '',
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Initialize form with user's name when component mounts
  React.useEffect(() => {
    if (user?.name && !formData.userName) {
      setFormData(prev => ({
        ...prev,
        userName: user.name
      }));
    }
  }, [user?.name]); // Only run when user.name changes

  // Check if user is logged in
  if (!user) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-teal-200">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Login Required</h3>
          <p className="text-gray-600 mb-6">
            Please log in to submit a review and share your experience.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/profile')}
              className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
            >
              Login Now
            </button>
            <button
              onClick={onCancel}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!formData.userName.trim()) {
      alert('Please enter your name');
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData = {
        ...formData,
        media: mediaFiles,
        userName: formData.userName.trim() // Ensure we send the name
      };
      
      const newReview = await createReview(productId, reviewData);
      onSubmit(newReview);
      
      // Reset form
      setFormData({
        rating: 0,
        comment: '',
        userName: user.name || '', // Pre-fill with user's name if available
      });
      setMediaFiles([]);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Error submitting review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Check file count
    if (mediaFiles.length + files.length > 5) {
      alert('Maximum 5 files allowed');
      return;
    }

    // Check file types and sizes
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isValidType = isImage || isVideo;
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB

      if (!isValidType) {
        alert(`${file.name} is not a valid image or video file`);
        return false;
      }
      if (!isValidSize) {
        alert(`${file.name} is too large. Maximum size is 50MB`);
        return false;
      }
      return true;
    });

    setMediaFiles(prev => [...prev, ...validFiles]);
    e.target.value = ''; // Reset file input
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-teal-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Your Rating *
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, rating: star })}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || formData.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-3 text-sm text-gray-600">
              {formData.rating > 0 ? `${formData.rating} star${formData.rating > 1 ? 's' : ''}` : 'Select rating'}
            </span>
          </div>
        </div>

        {/* Name - Now fully controllable */}
        <div>
          <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
            Your Name *
          </label>
          <input
            type="text"
            id="userName"
            name="userName"
            value={formData.userName} // Now only uses formData.userName
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Enter your name"
          />
          {user.name && formData.userName === user.name && (
            <p className="text-sm text-gray-500 mt-1">
              Using your account name. You can change it if you want.
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            required
            rows="4"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            placeholder="Share your experience with this product..."
          />
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Add Photos/Videos (Optional)
          </label>
          
          {/* File Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-teal-400 transition-colors">
            <input
              type="file"
              id="media-upload"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label
              htmlFor="media-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <div>
                <span className="text-teal-600 font-medium">Click to upload</span>
                <span className="text-gray-500 text-sm block">
                  Images or videos (Max 5 files, 50MB each)
                </span>
              </div>
            </label>
          </div>

          {/* Media Preview */}
          {mediaFiles.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mediaFiles.map((file, index) => (
                <div key={index} className="relative group">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Video className="w-8 h-8 text-gray-400" />
                      <span className="text-xs text-gray-500 absolute bottom-1 left-1 bg-black bg-opacity-70 text-white px-1 rounded">
                        Video
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;