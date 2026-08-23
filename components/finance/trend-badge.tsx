"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

interface TrendBadgeProps {
  /** Variación porcentual; `null` cuando no hay base de comparación. */
  changePct: number | null;
  /** En gastos, subir es malo. En ingresos, subir es bueno. */
  inverted?: boolean;
  label?: string;
  className?: string;
}

/** Chip de variación contra el período anterior. */
export function TrendBadge({
  changePct,
  inverted = false,
  label,
  className,
}: TrendBadgeProps) {
  if (changePct === null) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-hairline bg-surface-raised px-2 py-0.5 text-xs whitespace-nowrap text-muted-foreground",
          className,
        )}
      >
        <Minus className="size-3" />
        Sin comparación
      </span>
    );
  }

  const rounded = Math.round(changePct);
  const isUp = rounded > 0;
  const isFlat = rounded === 0;
  const isGood = isFlat ? true : inverted ? !isUp : isUp;

  const Icon = isFlat ? Minus : isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap tabular transition-colors",
        isFlat
          ? "border-hairline bg-surface-raised text-muted-foreground"
          : isGood
            ? "border-success/30 bg-success/10 text-success"
            : "border-destructive/30 bg-destructive/10 text-destructive",
        className,
      )}
    >
      <Icon className="size-3" />
      {isFlat ? "Igual" : `${isUp ? "+" : ""}${rounded}%`}
      {label ? <span className="text-muted-foreground">{label}</span> : null}
    </span>
  );
}
