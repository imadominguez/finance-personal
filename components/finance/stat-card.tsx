"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { Money } from "@/components/finance/money";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MoneyFormat } from "@/lib/types";

interface StatCardProps {
  label: string;
  value: number;
  /** Cómo dibujar el monto. Sale de `moneyFormat`, no de `state.settings`. */
  settings: MoneyFormat;
  icon?: LucideIcon;
  hint?: React.ReactNode;
  tone?: "default" | "gasto" | "ingreso" | "balance";
  signed?: boolean;
  /** `count` muestra el número pelado (cantidad de movimientos, por ejemplo). */
  format?: "money" | "count";
  delay?: number;
  className?: string;
}

const tones = {
  default: "text-foreground",
  gasto: "text-brand",
  ingreso: "text-success",
  balance: "text-foreground",
} as const;

/** Tarjeta chica de métrica: label, monto animado y una pista debajo. */
export function StatCard({
  label,
  value,
  settings,
  icon: Icon,
  hint,
  tone = "default",
  signed,
  format = "money",
  delay = 0,
  className,
}: StatCardProps) {
  const toneClass =
    tone === "balance"
      ? value >= 0
        ? "text-success"
        : "text-destructive"
      : tones[tone];

  return (
    <div
      className={cn(
        "group surface-card animate-fade-up rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_8px_24px_-12px_var(--sombra-marca)] motion-reduce:hover:translate-y-0",
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        {Icon ? (
          <Icon className="size-4 text-muted-foreground transition-colors duration-300 group-hover:text-brand" />
        ) : null}
      </div>

      {format === "count" ? (
        <span
          className={cn(
            "mt-2 block text-xl font-bold tracking-tight sm:text-2xl tabular",
            toneClass,
          )}
        >
          {formatNumber(value, settings.locale)}
        </span>
      ) : (
        <Money
          value={value}
          settings={settings}
          signed={signed}
          animate
          className={cn(
            "mt-2 block text-xl font-bold tracking-tight sm:text-2xl",
            toneClass,
          )}
        />
      )}

      {hint ? (
        <div className="mt-1.5 text-xs text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  );
}
