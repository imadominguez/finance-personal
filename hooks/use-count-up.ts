"use client";

import * as React from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

function getMotionPreference(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** En el servidor asumimos "sin animación": es lo seguro para hidratar. */
function getServerMotionPreference(): boolean {
  return true;
}

export function usePrefersReducedMotion(): boolean {
  return React.useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionPreference,
    getServerMotionPreference,
  );
}

/**
 * Anima un número desde su valor anterior hasta el nuevo.
 * Si el usuario pidió menos movimiento (o `duration` es 0) devuelve el valor
 * final sin animar, sin tocar estado.
 */
export function useCountUp(value: number, duration = 700): number {
  const prefersReducedMotion = usePrefersReducedMotion();
  const skip = prefersReducedMotion || duration <= 0;

  const [display, setDisplay] = React.useState(value);
  const fromRef = React.useRef(value);

  React.useEffect(() => {
    if (skip) {
      fromRef.current = value;
      return;
    }

    const from = fromRef.current;
    const delta = value - from;
    if (delta === 0) return;

    const start = performance.now();
    let frame = requestAnimationFrame(tick);

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo: arranca rápido y frena suave, se lee bien en montos grandes.
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(from + delta * eased);

      if (progress < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = value;
    }

    return () => {
      cancelAnimationFrame(frame);
      fromRef.current = value;
    };
  }, [value, duration, skip]);

  return skip ? value : display;
}
