"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  Scale,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { BarChart, type BarDatum } from "@/components/charts/bar-chart";
import { CategoryBreakdownList } from "@/components/finance/category-breakdown-list";
import { EmptyState } from "@/components/finance/empty-state";
import { Money } from "@/components/finance/money";
import { PeriodStepper } from "@/components/finance/period-stepper";
import { ProgressBar } from "@/components/finance/progress-bar";
import { SectionCard } from "@/components/finance/section-card";
import { StatCard } from "@/components/finance/stat-card";
import { SummaryHero } from "@/components/finance/summary-hero";
import { TrendBadge } from "@/components/finance/trend-badge";
import { useFinanceReady } from "@/components/providers/finance-provider";
import { Button } from "@/components/ui/button";
import {
  currentMonthKey,
  currentYear,
  formatMonthLong,
  formatMonthShort,
  type Period,
} from "@/lib/date";
import {
  comparePeriods,
  getMonthlyTotals,
  getPeriodSummary,
} from "@/lib/finance";
import { formatMoney } from "@/lib/format";

/** Vista anual: tendencia mes a mes y en qué se fue el año. */
export function AnioView() {
  const { state, loadSampleData, moneyFormat } = useFinanceReady();
  const [year, setYear] = React.useState(currentYear());

  const period: Period = { kind: "anio", year };
  const summary = getPeriodSummary(state, period);
  const comparison = comparePeriods(state, period, "gastos");
  const months = getMonthlyTotals(state, year);

  const thisMonth = currentMonthKey();
  const isCurrentYear = year === currentYear();

  // Solo los meses ya transcurridos cuentan para promedios y récords.
  const pastMonths = months.filter(
    (month) => month.month <= thisMonth && month.gastos > 0,
  );
  const average =
    pastMonths.length > 0
      ? pastMonths.reduce((sum, month) => sum + month.gastos, 0) /
        pastMonths.length
      : 0;

  const mostExpensive = pastMonths.reduce<(typeof pastMonths)[number] | null>(
    (worst, month) => (!worst || month.gastos > worst.gastos ? month : worst),
    null,
  );
  const cheapest = pastMonths.reduce<(typeof pastMonths)[number] | null>(
    (best, month) => (!best || month.gastos < best.gastos ? month : best),
    null,
  );

  const bars: BarDatum[] = months.map((month) => ({
    id: month.month,
    label: formatMonthShort(month.month),
    value: month.gastos,
    projected: month.future,
    highlight: month.month === thisMonth,
  }));

  const maxMonth = Math.max(...months.map((month) => month.gastos), 0);
  const hasData = summary.entries.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <SummaryHero
        title="Tu año en números"
        subtitle={`Enero a diciembre de ${year}`}
        amount={summary.gastos}
        settings={moneyFormat}
        comparison={comparison}
        comparisonLabel="vs. año anterior"
      />

      <PeriodStepper
        label={String(year)}
        onPrevious={() => setYear(year - 1)}
        onNext={() => setYear(year + 1)}
        nextDisabled={isCurrentYear}
        onReset={() => setYear(currentYear())}
        resetLabel="Este año"
        className="self-center"
      />

      {!hasData ? (
        <EmptyState
          icon={CalendarRange}
          title={`Sin movimientos en ${year}`}
          description="Cuando cargues gastos vas a ver acá la comparación mes a mes y el peso de cada categoría en el año."
          action={
            <Button size="lg" onClick={loadSampleData}>
              <Sparkles />
              Cargar datos de ejemplo
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Gastos del año"
              value={summary.gastos}
              settings={moneyFormat}
              icon={ArrowDownRight}
              tone="gasto"
              delay={60}
            />
            <StatCard
              label="Ingresos del año"
              value={summary.ingresos}
              settings={moneyFormat}
              icon={ArrowUpRight}
              tone="ingreso"
              delay={110}
            />
            <StatCard
              label="Balance"
              value={summary.balance}
              settings={moneyFormat}
              icon={Scale}
              tone="balance"
              signed
              delay={160}
              hint={summary.balance >= 0 ? "Ahorraste" : "Gastaste de más"}
            />
            <StatCard
              label="Promedio mensual"
              value={average}
              settings={moneyFormat}
              icon={TrendingUp}
              delay={210}
              hint={`Sobre ${pastMonths.length} mes${pastMonths.length === 1 ? "" : "es"}`}
            />
          </div>

          <SectionCard
            title="Gasto mes a mes"
            description="Las barras punteadas son meses que todavía no llegaron"
            delay={140}
          >
            <BarChart
              data={bars}
              formatValue={(value) => formatMoney(value, moneyFormat)}
              height={170}
            />
          </SectionCard>

          {mostExpensive && cheapest ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <HighlightCard
                label="Mes más caro"
                month={mostExpensive.month}
                amount={mostExpensive.gastos}
                settings={moneyFormat}
                tone="alto"
                delay={180}
              />
              <HighlightCard
                label="Mes más barato"
                month={cheapest.month}
                amount={cheapest.gastos}
                settings={moneyFormat}
                tone="bajo"
                delay={220}
              />
            </div>
          ) : null}

          <SectionCard
            title="Detalle por mes"
            description="Comparado con el mes anterior"
            delay={260}
          >
            <ul className="flex flex-col">
              {months.map((month, index) => {
                const previous = index > 0 ? months[index - 1] : null;
                const changePct =
                  previous && previous.gastos > 0
                    ? ((month.gastos - previous.gastos) / previous.gastos) * 100
                    : null;

                return (
                  <li
                    key={month.month}
                    className="group animate-fade-up border-b border-hairline/70 last:border-0"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-all duration-200 hover:translate-x-1 hover:bg-surface-raised motion-reduce:hover:translate-x-0">
                      <span
                        className={`w-12 shrink-0 text-sm sm:w-16 ${
                          month.month === thisMonth
                            ? "font-semibold text-brand"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatMonthShort(month.month)}
                      </span>

                      <ProgressBar
                        value={
                          maxMonth > 0 ? (month.gastos / maxMonth) * 100 : 0
                        }
                        size="sm"
                        delay={index * 40}
                        className="flex-1"
                        color={
                          month.future
                            ? "color-mix(in oklch, var(--brand) 35%, transparent)"
                            : undefined
                        }
                      />

                      <Money
                        value={month.gastos}
                        settings={moneyFormat}
                        className="shrink-0 text-right text-xs font-semibold whitespace-nowrap text-brand sm:text-sm"
                      />

                      <span className="hidden w-20 shrink-0 justify-end sm:flex">
                        {changePct === null ? (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        ) : (
                          <TrendBadge changePct={changePct} inverted />
                        )}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </SectionCard>

          <SectionCard
            title="En qué se fue el año"
            description={`${summary.byCategory.length} categorías`}
            delay={300}
          >
            <CategoryBreakdownList
              items={summary.byCategory}
              settings={moneyFormat}
              limit={8}
            />
          </SectionCard>

          <SectionCard title="Ver el detalle" delay={340}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Mirá mes por mes o filtrá todos los movimientos del año.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  render={<Link href="/mes" />}
                >
                  Ir al mes
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  render={<Link href="/movimientos" />}
                >
                  Movimientos
                </Button>
              </div>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}

function HighlightCard({
  label,
  month,
  amount,
  settings,
  tone,
  delay,
}: {
  label: string;
  month: string;
  amount: number;
  settings: React.ComponentProps<typeof Money>["settings"];
  tone: "alto" | "bajo";
  delay: number;
}) {
  return (
    <div
      className="surface-card animate-fade-up rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 motion-reduce:hover:translate-y-0"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 font-heading text-lg font-semibold">
        {formatMonthLong(month)}
      </p>
      <Money
        value={amount}
        settings={settings}
        animate
        className={`mt-1 block text-2xl font-bold ${
          tone === "alto" ? "text-destructive" : "text-success"
        }`}
      />
    </div>
  );
}
