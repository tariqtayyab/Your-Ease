const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const apiCache = {
  get: (key) => {
    const item = cache.get(key);
    if (item && Date.now() - item.timestamp < CACHE_DURATION) {
      return item.data;
    }
    return null;
  },
  
  set: (key, data) => {
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
  }
};