"use client";

import * as React from "react";

import { Money } from "@/components/finance/money";
import { ProgressBar } from "@/components/finance/progress-bar";
import { TrendBadge } from "@/components/finance/trend-badge";
import { cn } from "@/lib/utils";
import type { Comparison, MoneyFormat } from "@/lib/types";

interface SummaryHeroProps {
  title: string;
  subtitle: string;
  amount: number;
  /** Cómo dibujar los montos. Sale de `moneyFormat`, no de `state.settings`. */
  settings: MoneyFormat;
  /** Barra de avance opcional (gasto sobre presupuesto). */
  progress?: {
    value: number;
    marker?: number;
    markerLabel?: string;
    hint: React.ReactNode;
    over?: boolean;
  };
  comparison?: Comparison;
  comparisonLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Tarjeta principal de cada vista: la pregunta, el monto grande y el avance.
 * Es lo primero que se lee, así que el número manda.
 */
export function SummaryHero({
  title,
  subtitle,
  amount,
  settings,
  progress,
  comparison,
  comparisonLabel,
  actions,
  className,
}: SummaryHeroProps) {
  return (
    <section
      className={cn(
        "surface-card relative animate-fade-up overflow-hidden rounded-2xl p-6 shadow-(--sombra-card)",
        className,
      )}
    >
      {/* Halo de marca detrás del número */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 animate-glow rounded-full bg-brand/25 blur-3xl"
      />

      <div className="relative flex flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-xl leading-tight font-bold tracking-tight sm:text-2xl">
              {title}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {actions}
        </div>

        <div className="mt-5 flex flex-col items-center gap-2">
          <Money
            value={amount}
            settings={settings}
            animate
            className="brand-text-gradient text-[2.75rem] leading-none font-bold tracking-tight sm:text-5xl"
          />

          {comparison ? (
            <TrendBadge
              changePct={comparison.changePct}
              inverted
              label={comparisonLabel}
            />
          ) : null}
        </div>

        {progress ? (
          <div className="mt-6 flex flex-col gap-2">
            <ProgressBar
              value={progress.value}
              marker={progress.marker}
              markerLabel={progress.markerLabel}
              size="lg"
              delay={150}
              barClassName={progress.over ? "bg-destructive" : undefined}
              color={progress.over ? "var(--destructive)" : undefined}
            />
            <p className="text-center text-xs text-muted-foreground">
              {progress.hint}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
