import { useCallback, useEffect, useRef, useState } from 'react';
import { apiGet } from '../lib/api';

/**
 * In-memory cache shared by every component: the home page used to fetch
 * /about twice (Hero + About) and every page navigation re-fetched the same
 * endpoints. Entries are reused for `ttl` ms, then refreshed in the
 * background (stale-while-revalidate). In-flight requests are deduplicated.
 */
const cache = new Map(); // endpoint → { data?, time?, promise? }
const DEFAULT_TTL = 60_000;

export function clearFetchCache() {
  cache.clear();
}

/** Cached data for an endpoint (or undefined), without triggering a request. */
export function peekCache(endpoint) {
  return cache.get(endpoint)?.data;
}

function load(endpoint) {
  const entry = cache.get(endpoint) ?? {};
  if (entry.promise) return entry.promise;
  const promise = apiGet(endpoint)
    .then((data) => {
      cache.set(endpoint, { data, time: Date.now() });
      return data;
    })
    .catch((err) => {
      const { promise: _p, ...rest } = cache.get(endpoint) ?? {};
      if ('data' in rest) cache.set(endpoint, rest);
      else cache.delete(endpoint);
      throw err;
    });
  cache.set(endpoint, { ...entry, promise });
  return promise;
}

/**
 * Generic fetch hook with graceful fallback.
 * @param {string|null} endpoint - e.g. "/projects" (null = do nothing)
 * @param {any} fallback - data returned if the API call fails
 * @param {{ ttl?: number }} [options]
 * @returns {{ data, loading, error, refetch }}
 */
export function useFetch(endpoint, fallback, { ttl = DEFAULT_TTL } = {}) {
  const [state, setState] = useState(() => {
    const cached = endpoint ? peekCache(endpoint) : undefined;
    return { data: cached ?? null, loading: !!endpoint && cached === undefined, error: null };
  });
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;
  const activeRef = useRef(true);

  const run = useCallback(
    (force) => {
      if (!endpoint) return Promise.resolve();
      const entry = cache.get(endpoint);
      const fresh = entry && 'data' in entry && Date.now() - entry.time < ttl;
      if (fresh && !force) return Promise.resolve(entry.data);
      if (force && entry && !entry.promise) cache.set(endpoint, { ...entry, time: 0 });
      return load(endpoint).then(
        (data) => {
          if (activeRef.current) setState({ data, loading: false, error: null });
          return data;
        },
        (err) => {
          // Silent fail to fallback — the portfolio stays browsable
          console.warn(`[useFetch] ${endpoint} failed:`, err?.message || err);
          if (activeRef.current) {
            setState((s) => ({
              data: s.data ?? (fallbackRef.current !== undefined ? fallbackRef.current : null),
              loading: false,
              error: err,
            }));
          }
        },
      );
    },
    [endpoint, ttl],
  );

  useEffect(() => {
    activeRef.current = true;
    const cached = endpoint ? peekCache(endpoint) : undefined;
    // Reset when the endpoint changes (e.g. navigating between two projects)
    setState({ data: cached ?? null, loading: !!endpoint && cached === undefined, error: null });
    run(false);
    return () => {
      activeRef.current = false;
    };
  }, [endpoint, run]);

  const refetch = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    return run(true);
  }, [run]);

  return { ...state, refetch };
}
