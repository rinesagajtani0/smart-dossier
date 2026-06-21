import { useEffect, useState } from 'react';

const DURATION_MS = 900;

// Animates 0 -> target on mount/target-change using requestAnimationFrame
// (no timers to drift, cancels cleanly on unmount). Purely a perceived-
// engagement flourish for the dashboard stat cards — the target itself is
// always real data, this only controls how it arrives on screen.
export function useCountUp(target: number): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    let frame: number;

    function tick(timestamp: number) {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(1, elapsed / DURATION_MS);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}
