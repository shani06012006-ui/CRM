//src/hooks/useFetch.ts

import { useState, useEffect, useCallback } from 'react';

export function useFetch<T>(fetchFn: () => Promise<T>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const executeFetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    executeFetch();
  }, [executeFetch]);

  return { data, loading, error, refetch: executeFetch };
}