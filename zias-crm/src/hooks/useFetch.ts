//src/hooks/useFetch.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { getApiError } from '../services/crmService';

export function useFetch<T>(fetchFn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fnRef = useRef(fetchFn);
  fnRef.current = fetchFn;

  // Stable reference. Only the first load sets `loading`, so refreshes don't blank the screen.
  const refetch = useCallback(async () => {
    try {
      const result = await fnRef.current();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}