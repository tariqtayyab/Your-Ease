// src/utils/apiCache.js

// ✅ GLOBAL cache - shared across entire app
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const apiCache = {
  get: (key) => {
    console.log('🔍 Checking cache for:', key);
    console.log('📊 Current cache size:', cache.size);
    console.log('📝 Cache keys:', Array.from(cache.keys()));
    
    const item = cache.get(key);
    if (item && Date.now() - item.timestamp < CACHE_DURATION) {
      console.log('🚀 CACHE HIT:', key);
      return item.data;
    }
    
    if (item) {
      console.log('⏰ CACHE EXPIRED:', key);
    } else {
      console.log('❌ CACHE MISS:', key);
    }
    
    return null;
  },
  
  set: (key, data) => {
    console.log('💾 CACHE SET:', key, data?.length || 'data');
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
  },
  
  clear: (key) => {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  },
  
  // Debug method
  debug: () => {
    console.log('🐛 CACHE DEBUG:', {
      size: cache.size,
      keys: Array.from(cache.keys()),
      entries: Array.from(cache.entries()).map(([key, value]) => ({
        key,
        timestamp: value.timestamp,
        dataLength: value.data?.length || 'no data'
      }))
    });
  }
};