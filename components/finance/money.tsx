"use client";

import * as React from "react";

import { useCountUp } from "@/hooks/use-count-up";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Settings } from "@/lib/types";

interface MoneyProps extends Omit<React.ComponentProps<"span">, "children"> {
  value: number;
  settings: Pick<Settings, "currency" | "locale">;
  signed?: boolean;
  decimals?: boolean;
  compact?: boolean;
  /** Anima el conteo hasta el valor. Se apaga solo con reduced-motion. */
  animate?: boolean;
  duration?: number;
}

/** Muestra un monto formateado, opcionalmente contando hasta el valor. */
export function Money({
  value,
  settings,
  signed,
  decimals,
  compact,
  animate = false,
  duration = 700,
  className,
  ...props
}: MoneyProps) {
  // duration 0 = sin animación, el hook devuelve el valor final directo.
  const shown = useCountUp(value, animate ? duration : 0);

  return (
    <span className={cn("tabular", className)} {...props}>
      {formatMoney(shown, settings, { signed, decimals, compact })}
    </span>
  );
}
