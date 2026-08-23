"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface DonutSlice {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  className?: string;
  /** Contenido centrado dentro del anillo (total, etiqueta, etc.). */
  children?: React.ReactNode;
  onSliceHover?: (id: string | null) => void;
  activeId?: string | null;
}

/**
 * Anillo por categoría dibujado a mano en SVG.
 * Cada porción es un arco con `stroke-dasharray`; al montar pasa de longitud 0
 * a su longitud real, así el gráfico "se dibuja" sin librerías de animación.
 */
export function DonutChart({
  slices,
  size = 180,
  thickness = 18,
  className,
  children,
  onSliceHover,
  activeId,
}: DonutChartProps) {
  const [drawn, setDrawn] = React.useState(false);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let offset = 0;

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Distribución por categoría"
        className="-rotate-90"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--hairline)"
          strokeWidth={thickness}
        />

        {total > 0
          ? slices.map((slice, index) => {
              const share = slice.value / total;
              const length = share * circumference;
              const dashOffset = -offset;
              offset += length;

              const dimmed = activeId != null && activeId !== slice.id;

              return (
                <circle
                  key={slice.id}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={
                    activeId === slice.id ? thickness + 4 : thickness
                  }
                  strokeLinecap="butt"
                  strokeDasharray={`${drawn ? length : 0} ${circumference}`}
                  strokeDashoffset={dashOffset}
                  opacity={dimmed ? 0.3 : 1}
                  onMouseEnter={() => onSliceHover?.(slice.id)}
                  onMouseLeave={() => onSliceHover?.(null)}
                  style={{
                    transition:
                      "stroke-dasharray 900ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease, stroke-width 200ms ease",
                    transitionDelay: `${index * 90}ms`,
                    cursor: onSliceHover ? "pointer" : undefined,
                  }}
                >
                  <title>{slice.label}</title>
                </circle>
              );
            })
          : null}
      </svg>

      {children ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {children}
        </div>
      ) : null}
    </div>
  );
}
