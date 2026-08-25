"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  Scale,
  Sparkles,
} from "lucide-react";

import { BarChart, type BarDatum } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { CategoryBreakdownList } from "@/components/finance/category-breakdown-list";
import { EmptyState } from "@/components/finance/empty-state";
import { EntryList } from "@/components/finance/entry-list";
import { Money } from "@/components/finance/money";
import { PeriodStepper } from "@/components/finance/period-stepper";
import { SectionCard } from "@/components/finance/section-card";
import { StatCard } from "@/components/finance/stat-card";
import { SummaryHero } from "@/components/finance/summary-hero";
import { useFinanceReady } from "@/components/providers/finance-provider";
import { Button } from "@/components/ui/button";
import {
  addMonthsToKey,
  currentMonthKey,
  formatDayNumber,
  formatMonthLong,
  type Period,
} from "@/lib/date";
import {
  comparePeriods,
  getBudgetStatus,
  getDailyAverage,
  getDailyTotals,
  getPeriodSummary,
  projectMonthEnd,
} from "@/lib/finance";
import { formatMoney } from "@/lib/format";

/** Vista mensual: el corazón de la app. */
export function MesView() {
  const { state, loadSampleData, moneyFormat } = useFinanceReady();
  const [month, setMonth] = React.useState(currentMonthKey());
  const [activeCategory, setActiveCategory] = React.useState<string | null>(
    null,
  );

  const period: Period = { kind: "mes", month };
  const summary = getPeriodSummary(state, period);
  const comparison = comparePeriods(state, period, "gastos");
  const budget = getBudgetStatus(state, month, summary.gastos);
  const dailyAverage = getDailyAverage(month, summary.gastosReales);
  const projection = projectMonthEnd(state, month, summary);

  const isCurrentMonth = month === currentMonthKey();
  const days = getDailyTotals(state, month);

  const dayBars: BarDatum[] = days.map((day) => ({
    id: day.date,
    label: formatDayNumber(day.date),
    value: day.gastos,
    // Un día futuro sin gastos no es una proyección: es simplemente un día vacío.
    projected: day.future && day.gastos > 0,
  }));

  const donutSlices = summary.byCategory.slice(0, 8).map((item) => ({
    id: item.category.id,
    label: `${item.category.name}: ${formatMoney(item.total, moneyFormat)}`,
    value: item.total,
    color: item.category.color,
  }));

  const active = summary.byCategory.find(
    (item) => item.category.id === activeCategory,
  );
  const hasData = summary.entries.length > 0;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <SummaryHero
        title="¿A dónde se fue tu sueldo?"
        subtitle={formatMonthLong(month)}
        amount={summary.gastos}
        settings={moneyFormat}
        comparison={comparison}
        comparisonLabel="vs. mes anterior"
        progress={
          budget.hasBudget
            ? {
                value: budget.usedPct,
                marker: isCurrentMonth ? budget.elapsedPct : undefined,
                markerLabel: "Días transcurridos",
                over: budget.overBudget,
                hint: budget.overBudget ? (
                  <>
                    Te pasaste{" "}
                    <span className="font-medium text-destructive">
                      {formatMoney(Math.abs(budget.remaining), moneyFormat)}
                    </span>{" "}
                    de {formatMoney(budget.budget, moneyFormat)}
                  </>
                ) : (
                  <>
                    De {formatMoney(budget.budget, moneyFormat)} te quedan{" "}
                    <span className="font-medium text-foreground/80">
                      {formatMoney(budget.remaining, moneyFormat)}
                    </span>
                  </>
                ),
              }
            : {
                value: 0,
                hint: (
                  <Link
                    href="/ajustes"
                    className="inline-flex min-h-11 items-center text-brand hover:underline sm:min-h-6"
                  >
                    Definí tu sueldo o tope mensual para ver el avance
                  </Link>
                ),
              }
        }
      />

      <PeriodStepper
        label={formatMonthLong(month)}
        onPrevious={() => setMonth(addMonthsToKey(month, -1))}
        onNext={() => setMonth(addMonthsToKey(month, 1))}
        nextDisabled={isCurrentMonth}
        onReset={() => setMonth(currentMonthKey())}
        resetLabel="Este mes"
        className="self-center"
      />

      {!hasData ? (
        <EmptyState
          icon={Sparkles}
          title={`Sin movimientos en ${formatMonthLong(month)}`}
          description="Cargá un gasto con el botón de arriba o mirá cómo se ve la app con datos de ejemplo."
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
              label="Gastos"
              value={summary.gastos}
              settings={moneyFormat}
              icon={ArrowDownRight}
              tone="gasto"
              delay={60}
              hint={
                summary.gastosProyectados > 0
                  ? `${formatMoney(summary.gastosProyectados, moneyFormat)} por venir`
                  : "Todo ya ocurrido"
              }
            />
            <StatCard
              label="Ingresos"
              value={summary.ingresos}
              settings={moneyFormat}
              icon={ArrowUpRight}
              tone="ingreso"
              delay={110}
              hint={`${summary.ingresosByCategory.length} fuente${summary.ingresosByCategory.length === 1 ? "" : "s"}`}
            />
            <StatCard
              label="Balance"
              value={summary.balance}
              settings={moneyFormat}
              icon={Scale}
              tone="balance"
              signed
              delay={160}
              hint={summary.balance >= 0 ? "Te sobra plata" : "Estás en rojo"}
            />
            <StatCard
              label="Promedio diario"
              value={dailyAverage}
              settings={moneyFormat}
              icon={PiggyBank}
              delay={210}
              hint={
                isCurrentMonth
                  ? `Cierre estimado: ${formatMoney(projection, moneyFormat)}`
                  : "Sobre los días del mes"
              }
            />
          </div>

          {/*
            De `lg:` para arriba las tarjetas se reparten en dos columnas. No es
            por llenar el espacio: es para que el mes entre en una pantalla en
            vez de pedir scroll. En anchos chicos siguen una abajo de la otra.
          */}
          <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
            <div className="flex min-w-0 flex-col gap-4">
              <SectionCard
                title="Distribución del mes"
                description="Tocá una porción para ver el detalle"
                delay={120}
              >
                <div className="@container flex flex-col items-center gap-6 @md:flex-row @md:items-center @md:gap-8">
                  <DonutChart
                    slices={donutSlices}
                    activeId={activeCategory}
                    onSliceHover={setActiveCategory}
                    className="shrink-0"
                  >
                    <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
                      {active ? active.category.name : "Total gastado"}
                    </span>
                    <Money
                      value={active ? active.total : summary.gastos}
                      settings={moneyFormat}
                      compact
                      className="text-xl font-bold text-brand"
                    />
                    {active ? (
                      <span className="text-xs tabular text-muted-foreground">
                        {Math.round(active.share)}% del mes
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {summary.byCategory.length} categorías
                      </span>
                    )}
                  </DonutChart>

                  <ul className="grid w-full flex-1 grid-cols-1 gap-1.5 @lg:grid-cols-2">
                    {donutSlices.map((slice, index) => {
                      const item = summary.byCategory[index];
                      return (
                        <li key={slice.id}>
                          <button
                            type="button"
                            onMouseEnter={() => setActiveCategory(slice.id)}
                            onMouseLeave={() => setActiveCategory(null)}
                            onFocus={() => setActiveCategory(slice.id)}
                            onBlur={() => setActiveCategory(null)}
                            className="flex min-h-11 w-full animate-slide-in-right items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-raised sm:min-h-0"
                            style={{ animationDelay: `${index * 55}ms` }}
                          >
                            <span
                              className="size-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: slice.color }}
                            />
                            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                              {item.category.name}
                            </span>
                            <span className="shrink-0 text-xs font-medium tabular">
                              {Math.round(item.share)}%
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </SectionCard>

              <SectionCard
                title="Gasto día por día"
                description="Las barras punteadas son gastos ya agendados que todavía no ocurrieron"
                delay={160}
              >
                <BarChart
                  data={dayBars}
                  formatValue={(value) => formatMoney(value, moneyFormat)}
                  height={140}
                  showLabels={false}
                />
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                  <span>1</span>
                  <span>{Math.ceil(days.length / 2)}</span>
                  <span>{days.length}</span>
                </div>
              </SectionCard>
            </div>

            <div className="flex min-w-0 flex-col gap-4">
              <SectionCard
                title="Mayores gastos"
                description={`${summary.byCategory.length} categorías en ${formatMonthLong(month)}`}
                delay={200}
              >
                <CategoryBreakdownList
                  items={summary.byCategory}
                  settings={moneyFormat}
                  limit={6}
                />
              </SectionCard>

              {summary.ingresosByCategory.length > 0 ? (
                <SectionCard title="De dónde vino la plata" delay={240}>
                  <CategoryBreakdownList
                    items={summary.ingresosByCategory}
                    settings={moneyFormat}
                    emptyMessage="No registraste ingresos este mes."
                  />
                </SectionCard>
              ) : null}

              <SectionCard
                title="Últimos movimientos"
                delay={280}
                action={
                  <Link
                    href="/movimientos"
                    className="flex min-h-11 items-center rounded-lg px-2 text-xs text-muted-foreground transition-colors hover:bg-surface-raised hover:text-brand sm:min-h-6 sm:px-1 sm:hover:bg-transparent"
                  >
                    Ver todos
                  </Link>
                }
              >
                <EntryList entries={summary.entries.slice(0, 12)} />
              </SectionCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
