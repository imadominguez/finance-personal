"use client";

import * as React from "react";

import { CategoryIcon } from "@/components/finance/category-icon";
import { Money } from "@/components/finance/money";
import { ProgressBar } from "@/components/finance/progress-bar";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CategoryBreakdown, MoneyFormat } from "@/lib/types";

interface CategoryBreakdownListProps {
  items: CategoryBreakdown[];
  /** Cómo dibujar los montos. Sale de `moneyFormat`, no de `state.settings`. */
  settings: MoneyFormat;
  /** Cuántas filas mostrar antes del botón "ver todas". */
  limit?: number;
  emptyMessage?: string;
  className?: string;
}

/**
 * Ranking de categorías del período: ícono, nombre, monto, participación y una
 * barra proporcional. Es la vista central de "¿en qué se me fue la plata?".
 */
export function CategoryBreakdownList({
  items,
  settings,
  limit,
  emptyMessage = "Todavía no hay gastos en este período.",
  className,
}: CategoryBreakdownListProps) {
  const [expanded, setExpanded] = React.useState(false);
  const visible = limit && !expanded ? items.slice(0, limit) : items;
  const hidden = limit ? items.length - visible.length : 0;

  if (items.length === 0) {
    return (
      <p
        className={cn(
          "py-8 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        {emptyMessage}
      </p>
    );
  }

  const max = items[0]?.total ?? 0;

  return (
    <div className={cn("flex flex-col", className)}>
      <ul className="flex flex-col">
        {visible.map((item, index) => (
          <li
            key={item.category.id}
            className="group animate-fade-up border-b border-hairline/70 last:border-0"
            style={{ animationDelay: `${index * 45}ms` }}
          >
            <div className="flex items-center gap-3 rounded-lg px-2 py-3 transition-all duration-200 hover:translate-x-1 hover:bg-surface-raised motion-reduce:hover:translate-x-0">
              <CategoryIcon
                icon={item.category.icon}
                color={item.category.color}
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-medium text-foreground/90">
                    {item.category.name}
                  </span>
                  <Money
                    value={item.total}
                    settings={settings}
                    className="shrink-0 text-sm font-semibold text-brand transition-colors duration-200 group-hover:text-brand-light"
                  />
                </div>

                <div className="mt-1.5 flex items-center gap-3">
                  <ProgressBar
                    value={max > 0 ? (item.total / max) * 100 : 0}
                    color={item.category.color}
                    size="sm"
                    delay={index * 60}
                    className="flex-1"
                  />
                  <span className="shrink-0 text-xs tabular text-muted-foreground">
                    {formatPercent(item.share, settings.locale)}
                  </span>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {item.count} {item.count === 1 ? "movimiento" : "movimientos"}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {hidden > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-3 flex min-h-11 items-center self-center rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-raised hover:text-brand sm:min-h-0"
        >
          Ver {hidden} categoría{hidden === 1 ? "" : "s"} más
        </button>
      ) : null}
    </div>
  );
}
