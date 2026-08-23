"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  /** 0-100. Valores mayores se recortan visualmente pero marcan exceso. */
  value: number;
  className?: string;
  barClassName?: string;
  color?: string;
  /** Marca opcional (ej: % del mes transcurrido) para comparar ritmo. */
  marker?: number;
  markerLabel?: string;
  delay?: number;
  size?: "sm" | "default" | "lg";
}

const heights = {
  sm: "h-1",
  default: "h-1.5",
  lg: "h-2.5",
} as const;

/**
 * Barra de progreso animada: crece con una transición al montar y cada vez que
 * cambia el valor (el `useEffect` difiere el ancho un frame para que el
 * navegador tenga un estado inicial que animar).
 */
export function ProgressBar({
  value,
  className,
  barClassName,
  color,
  marker,
  markerLabel,
  delay = 0,
  size = "default",
}: ProgressBarProps) {
  const [width, setWidth] = React.useState(0);
  const clamped = Math.min(Math.max(value, 0), 100);

  React.useEffect(() => {
    const timeout = setTimeout(() => setWidth(clamped), delay);
    return () => clearTimeout(timeout);
  }, [clamped, delay]);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-hairline",
        heights[size],
        className,
      )}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none",
          !color && "brand-gradient",
          barClassName,
        )}
        style={{ width: `${width}%`, backgroundColor: color }}
      />
      {marker !== undefined && marker > 0 && marker < 100 ? (
        <span
          title={markerLabel}
          className="absolute top-0 bottom-0 w-px bg-foreground/45"
          style={{ left: `${marker}%` }}
        />
      ) : null}
    </div>
  );
}
