import { useCallback, useEffect, useState } from 'react';

/**
 * Returns { ref, visible } — flips to true once the element enters viewport.
 * Uses a callback ref so the observer attaches even when the target element
 * is rendered conditionally AFTER the hook is first called (e.g. after data fetch).
 */
export function useReveal(threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  const [node, setNode] = useState(null);

  // Callback ref: React calls it whenever the element mounts/unmounts.
  const ref = useCallback((n) => setNode(n), []);

  useEffect(() => {
    if (!node) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    }, { threshold });
    obs.observe(node);
    return () => obs.disconnect();
  }, [node, threshold]);

  return { ref, visible };
}
