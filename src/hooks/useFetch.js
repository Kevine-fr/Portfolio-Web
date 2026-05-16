import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '../lib/api';

/**
 * Generic fetch hook with graceful fallback.
 * @param {string} endpoint - e.g. "/projects"
 * @param {any} fallback - data returned if the API call fails
 * @returns {{ data, loading, error, refetch }}
 */
export function useFetch(endpoint, fallback) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet(endpoint);
      setData(result);
    } catch (err) {
      // Silent fail to fallback — portfolio reste consultable
      console.warn(`[useFetch] ${endpoint} failed:`, err?.message || err);
      setError(err);
      if (fallback !== undefined) setData(fallback);
    } finally {
      setLoading(false);
    }
  }, [endpoint, fallback]);

  useEffect(() => { refetch(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [endpoint]);

  return { data, loading, error, refetch };
}
