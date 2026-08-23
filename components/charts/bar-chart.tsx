"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface BarDatum {
  id: string;
  label: string;
  value: number;
  /** Barra tenue y punteada: todavía no ocurrió, es proyección. */
  projected?: boolean;
  highlight?: boolean;
}

interface BarChartProps {
  data: BarDatum[];
  /** Cómo se rotula el valor en el tooltip nativo. */
  formatValue: (value: number) => string;
  height?: number;
  className?: string;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  /** Muestra el label debajo de cada barra. */
  showLabels?: boolean;
}

/**
 * Barras verticales animadas. La altura arranca en 0 y crece con una
 * transición escalonada, sin dependencias de gráficos.
 */
export function BarChart({
  data,
  formatValue,
  height = 160,
  className,
  onSelect,
  selectedId,
  showLabels = true,
}: BarChartProps) {
  const [grown, setGrown] = React.useState(false);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const max = Math.max(...data.map((datum) => datum.value), 0);

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="flex w-full items-end gap-1" style={{ height }}>
        {data.map((datum, index) => {
          const ratio = max > 0 ? datum.value / max : 0;
          const isSelected = selectedId === datum.id;
          const barHeight = grown
            ? Math.max(ratio * 100, datum.value > 0 ? 2 : 0.8)
            : 0;

          const Wrapper = onSelect ? "button" : "div";

          return (
            <Wrapper
              key={datum.id}
              {...(onSelect
                ? { type: "button" as const, onClick: () => onSelect(datum.id) }
                : {})}
              title={`${datum.label}: ${formatValue(datum.value)}`}
              className={cn(
                "group flex h-full flex-1 flex-col justify-end rounded-t-md",
                onSelect && "cursor-pointer",
              )}
            >
              <span
                className={cn(
                  "w-full rounded-t-md transition-all duration-700 ease-out motion-reduce:transition-none",
                  datum.value === 0 && "bg-hairline",
                  datum.projected
                    ? "bg-brand/25 outline-1 outline-brand/40 outline-dashed"
                    : isSelected || datum.highlight
                      ? "brand-gradient shadow-[0_0_18px_-4px_rgba(232,93,36,0.8)]"
                      : "bg-brand/70 group-hover:bg-brand",
                )}
                style={{
                  height: `${barHeight}%`,
                  transitionDelay: `${Math.min(index * 45, 500)}ms`,
                }}
              />
            </Wrapper>
          );
        })}
      </div>

      {showLabels ? (
        <div className="flex w-full gap-1">
          {data.map((datum) => (
            <span
              key={datum.id}
              className={cn(
                "flex-1 truncate text-center text-[10px] transition-colors",
                selectedId === datum.id || datum.highlight
                  ? "font-medium text-brand"
                  : "text-muted-foreground",
              )}
            >
              {datum.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
