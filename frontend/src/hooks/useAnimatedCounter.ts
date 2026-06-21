import { useEffect, useRef, useState } from 'react';

// Counts up/down from the previous value to `target` instead of snapping,
// so KPI cards feel alive when dashboard data refreshes in the background.
export function useAnimatedCounter(target: number, durationMs = 700): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || target === fromRef.current) {
      fromRef.current = target;
      setValue(target);
      return;
    }

    const from = fromRef.current;
    const delta = target - from;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + delta * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, durationMs]);

  return value;
}
