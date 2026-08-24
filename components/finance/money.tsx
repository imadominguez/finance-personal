"use client";

import * as React from "react";

import { useCountUp } from "@/hooks/use-count-up";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MoneyFormat } from "@/lib/types";

interface MoneyProps extends Omit<React.ComponentProps<"span">, "children"> {
  value: number;
  /** Cómo dibujar el monto. Sale de `moneyFormat`, no de `state.settings`. */
  settings: MoneyFormat;
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
    /*
     * `suppressHydrationWarning` por la notación compacta: Node y el navegador
     * traen versiones distintas de ICU y escriben el sufijo con distinta caja
     * ("$ 775 K" contra "$ 775 k"). Es la misma cifra; sin esto React
     * considera que el árbol no coincide y lo vuelve a dibujar entero.
     */
    <span
      className={cn("tabular", className)}
      suppressHydrationWarning
      {...props}
    >
      {formatMoney(shown, settings, { signed, decimals, compact })}
    </span>
  );
}
