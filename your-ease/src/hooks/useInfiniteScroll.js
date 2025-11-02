// src/hooks/useInfiniteScroll.js
import { useState, useEffect, useCallback } from 'react';

const useInfiniteScroll = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  const LIMIT = 5; // Load 5 reviews at a time

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const newData = await fetchFunction(page, LIMIT);
      
      if (newData.length === 0 || newData.length < LIMIT) {
        setHasMore(false);
      }
      
      setData(prev => page === 1 ? newData : [...prev, ...newData]);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchFunction]);

  // Reset when dependencies change
  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    loadMore();
  }, [...dependencies]);

  return { data, loading, hasMore, error, loadMore };
};

export default useInfiniteScroll;