//src/hooks/useFetch.ts

import { useState, useEffect, useCallback, useRef } from 'react';

export function useFetch<T>(fetchFn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fnRef = useRef(fetchFn);
  fnRef.current = fetchFn;

  // Stable across renders. Only the first load shows the loader.
  const refetch = useCallback(async () => {
    try {
      const result = await fnRef.current();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}