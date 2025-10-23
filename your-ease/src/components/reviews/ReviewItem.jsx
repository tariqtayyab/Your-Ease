import React, { useState, useRef, useEffect } from 'react';
import { Star, Play, X, ZoomIn } from 'lucide-react';

const ReviewItem = ({ review }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [videoThumbnails, setVideoThumbnails] = useState({});

  // Debug: Check what's in the review object
  console.log('Review data:', review);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle both imported and manual review dates
  const getDisplayDate = () => {
    if (review.reviewDate) {
      return review.reviewDate;
    }
    return formatDate(review.createdAt);
  };

  // Handle user name display
  const getDisplayName = () => {
    console.log('User field:', review.user, 'Type:', typeof review.user);
    
    // If user is a string and doesn't look like ObjectId (imported reviews)
    if (typeof review.user === 'string' && !review.user.match(/^[0-9a-fA-F]{24}$/)) {
      return review.user; // "Mohammad A.", "AB M.", etc.
    }
    
    // If user is an object with name property (populated manual reviews)
    if (review.user && typeof review.user === 'object' && review.user.name) {
      return review.user.name;
    }
    
    // Fallback
    return 'Anonymous';
  };

  // Get user initial for avatar
  const getUserInitial = () => {
    const displayName = getDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  const openMediaViewer = (media, index) => {
    setSelectedMedia({ ...media, index });
    setMediaViewerOpen(true);
  };

  const closeMediaViewer = () => {
    setMediaViewerOpen(false);
    setSelectedMedia(null);
  };

  const navigateMedia = (direction) => {
    if (!selectedMedia || !review.media) return;
    
    const currentIndex = selectedMedia.index;
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % review.media.length;
    } else {
      newIndex = (currentIndex - 1 + review.media.length) % review.media.length;
    }
    
    setSelectedMedia({ ...review.media[newIndex], index: newIndex });
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
        resolve(thumbnailUrl);
      });
      
      video.addEventListener('error', () => {
        resolve(null);
      });
    });
  };

  // Load video thumbnails
  useEffect(() => {
    if (review.media) {
      review.media.forEach((media, index) => {
        if (media.type === 'video' && !videoThumbnails[media.url]) {
          generateVideoThumbnail(media.url, index)
            .then(thumbnailUrl => {
              if (thumbnailUrl) {
                setVideoThumbnails(prev => ({
                  ...prev,
                  [media.url]: thumbnailUrl
                }));
              }
            })
            .catch(error => {
              console.error('Error generating thumbnail:', error);
            });
        }
      });
    }
  }, [review.media, videoThumbnails]);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 hover:border-teal-200 transition-colors">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="font-semibold text-teal-600 text-sm">
              {getUserInitial()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="font-semibold text-gray-900 text-sm">
                {getDisplayName()}
              </div>
              {review.verified && (
                <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Verified
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {getDisplayDate()}
              </span>
            </div>
          </div>
        </div>

        {/* Review Content */}
        <div className="mb-3">
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
            {review.comment}
          </p>
        </div>

        {/* Media Display */}
        {review.media && review.media.length > 0 && (
          <div className="mb-2">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {review.media.map((media, index) => (
                <div 
                  key={`${review._id}-media-${index}`} 
                  className="relative group flex-shrink-0 cursor-pointer"
                  style={{ width: '80px', height: '80px' }}
                  onClick={() => openMediaViewer(media, index)}
                >
                  {media.type === 'image' ? (
                    <div className="relative w-full h-full">
                      <img
                        src={media.url}
                        alt={`Review media ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                        <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-black rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity relative overflow-hidden">
                      {videoThumbnails[media.url] ? (
                        <>
                          <img
                            src={videoThumbnails[media.url]}
                            alt={`Video thumbnail ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                            <Play className="w-5 h-5 text-white fill-current" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Play className="w-5 h-5 text-white fill-current mx-auto mb-1" />
                            <span className="text-[10px] text-white bg-black bg-opacity-70 px-1 py-0.5 rounded">
                              Loading...
                            </span>
                          </div>
                        </div>
                      )}
                      <span className="absolute bottom-1 left-1 text-[10px] text-white bg-black bg-opacity-70 px-1 py-0.5 rounded">
                        Video
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Media Viewer Modal */}
      {mediaViewerOpen && selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full w-full">
            <button
              onClick={closeMediaViewer}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>

            {review.media && review.media.length > 1 && (
              <>
                <button
                  onClick={() => navigateMedia('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigateMedia('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {review.media && review.media.length > 1 && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                {selectedMedia.index + 1} / {review.media.length}
              </div>
            )}

            <div className="flex items-center justify-center h-full">
              {selectedMedia.type === 'image' ? (
                <img
                  src={selectedMedia.url}
                  alt="Review media"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : (
                <video
                  src={selectedMedia.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full object-contain rounded-lg"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
              <div className="text-sm opacity-80">
                {selectedMedia.type === 'image' ? 'Image' : 'Video'} by {getDisplayName()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewItem;