import { useEffect, useRef, useState } from 'react';

/**
 * Returns `hidden = true` when the user scrolls DOWN past a certain threshold,
 * and `hidden = false` when they scroll UP. Used to auto-retract sticky navs.
 *
 * @param {number} threshold      - pixels of scroll before triggering hide (default 80)
 * @param {number} deltaThreshold - minimum movement to register a direction change (default 8)
 *                                  (prevents jitter from tiny scroll wheel ticks)
 */
export function useScrollDirection(threshold = 80, deltaThreshold = 8) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY || 0;

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const delta = y - lastY.current;

        // Toujours visible en haut de page
        if (y < threshold) {
          setHidden(false);
        } else if (Math.abs(delta) >= deltaThreshold) {
          // Scroll vers le bas → masque, vers le haut → affiche
          setHidden(delta > 0);
        }

        lastY.current = y;
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold, deltaThreshold]);

  return hidden;
}
