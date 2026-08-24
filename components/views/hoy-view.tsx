"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarDays,
  Receipt,
  Sparkles,
  TrendingDown,
  Wallet,
} from "lucide-react";

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
  formatDayLong,
  formatMonthLong,
  formatRelativeDay,
  shiftDate,
  todayKey,
  toMonthKey,
  type Period,
} from "@/lib/date";
import {
  comparePeriods,
  getBudgetStatus,
  getDailyAverage,
  getPeriodSummary,
} from "@/lib/finance";
import { formatMoney } from "@/lib/format";

/**
 * Vista del día: cuánto llevás gastado hoy, cómo se compara con tu promedio
 * y qué movimientos hubo. Es la pantalla de consulta rápida.
 */
export function HoyView() {
  const { state, loadSampleData, moneyFormat } = useFinanceReady();
  const [date, setDate] = React.useState(todayKey());

  const period: Period = { kind: "dia", date };
  const summary = getPeriodSummary(state, period);
  const comparison = comparePeriods(state, period, "gastos");

  const month = toMonthKey(date);
  const monthSummary = getPeriodSummary(state, { kind: "mes", month });
  const dailyAverage = getDailyAverage(month, monthSummary.gastosReales);
  const budget = getBudgetStatus(state, month, monthSummary.gastos);

  const isToday = date === todayKey();
  const hasAnyData =
    state.transactions.length > 0 ||
    state.recurring.length > 0 ||
    state.installments.length > 0;

  const versusAverage =
    dailyAverage > 0
      ? ((summary.gastos - dailyAverage) / dailyAverage) * 100
      : null;

  if (!hasAnyData) {
    return <FirstRun onLoadSample={loadSampleData} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <SummaryHero
        title={isToday ? "¿Cuánto llevás gastado hoy?" : "Gastos del día"}
        subtitle={formatDayLong(date)}
        amount={summary.gastos}
        settings={moneyFormat}
        comparison={comparison}
        comparisonLabel="vs. el día anterior"
        actions={
          <PeriodStepper
            label={formatRelativeDay(date)}
            onPrevious={() => setDate(shiftDate(date, -1))}
            onNext={() => setDate(shiftDate(date, 1))}
            nextDisabled={isToday}
            onReset={() => setDate(todayKey())}
            className="hidden sm:flex"
          />
        }
        progress={
          budget.hasBudget
            ? {
                value: budget.usedPct,
                marker: budget.elapsedPct,
                markerLabel: "Días transcurridos del mes",
                over: budget.overBudget,
                hint: budget.overBudget ? (
                  <>
                    Ya pasaste tu tope mensual de{" "}
                    {formatMoney(budget.budget, moneyFormat)} por{" "}
                    <span className="font-medium text-destructive">
                      {formatMoney(Math.abs(budget.remaining), moneyFormat)}
                    </span>
                  </>
                ) : (
                  <>
                    Llevás{" "}
                    <span className="font-medium text-foreground/80">
                      {formatMoney(monthSummary.gastos, moneyFormat)}
                    </span>{" "}
                    de {formatMoney(budget.budget, moneyFormat)} este mes
                  </>
                ),
              }
            : undefined
        }
      />

      <PeriodStepper
        label={formatRelativeDay(date)}
        onPrevious={() => setDate(shiftDate(date, -1))}
        onNext={() => setDate(shiftDate(date, 1))}
        nextDisabled={isToday}
        onReset={() => setDate(todayKey())}
        className="self-center sm:hidden"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Movimientos"
          value={
            summary.entries.filter((entry) => entry.kind === "gasto").length
          }
          settings={moneyFormat}
          format="count"
          icon={Receipt}
          delay={60}
          hint={
            summary.ingresos > 0 ? "Además hubo ingresos" : "Gastos del día"
          }
        />
        <StatCard
          label="Promedio diario"
          value={dailyAverage}
          settings={moneyFormat}
          icon={TrendingDown}
          delay={120}
          hint={
            versusAverage === null
              ? "Sin historial del mes"
              : versusAverage > 0
                ? `Hoy gastaste ${Math.round(versusAverage)}% más`
                : `Hoy gastaste ${Math.abs(Math.round(versusAverage))}% menos`
          }
        />
        <StatCard
          label={budget.hasBudget ? "Podés gastar por día" : "Ingresos del día"}
          value={budget.hasBudget ? budget.dailyAllowance : summary.ingresos}
          settings={moneyFormat}
          icon={Wallet}
          tone={budget.hasBudget ? "default" : "ingreso"}
          delay={180}
          hint={
            budget.hasBudget ? (
              "Con lo que queda del mes"
            ) : (
              <Link href="/ajustes" className="text-brand hover:underline">
                Definí tu presupuesto
              </Link>
            )
          }
          className="col-span-2 sm:col-span-1"
        />
      </div>

      <SectionCard
        title="En qué gastaste"
        description={`${summary.byCategory.length} categoría${summary.byCategory.length === 1 ? "" : "s"} este día`}
        delay={100}
      >
        <CategoryBreakdownList
          items={summary.byCategory}
          settings={moneyFormat}
          emptyMessage="No registraste gastos en este día."
        />
      </SectionCard>

      <SectionCard
        title="Movimientos del día"
        delay={160}
        action={
          <Link
            href="/movimientos"
            className="text-xs text-muted-foreground transition-colors hover:text-brand"
          >
            Ver todos
          </Link>
        }
      >
        <EntryList
          entries={summary.entries}
          groupByDate={false}
          emptyMessage="Todavía no cargaste nada este día."
        />
      </SectionCard>

      <SectionCard title="Este mes" delay={220}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">
              Gastado en {formatMonthLong(month)}
            </p>
            <Money
              value={monthSummary.gastos}
              settings={moneyFormat}
              className="text-xl font-bold text-brand"
            />
          </div>
          <Button variant="outline" size="lg" render={<Link href="/mes" />}>
            <CalendarDays />
            Ver el mes completo
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

function FirstRun({ onLoadSample }: { onLoadSample: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <SummaryHero
        title="Empezá a llevar tus finanzas"
        subtitle="Todavía no hay nada cargado"
        amount={0}
        settings={{ currency: "ARS", locale: "es-AR", usdRate: null }}
      />

      <EmptyState
        icon={Sparkles}
        title="Cargá tu primer movimiento"
        description="Anotá lo que gastás y la app arma sola los resúmenes del día, del mes y del año. También podés mirar cómo se ve con datos de ejemplo."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button size="lg" onClick={onLoadSample}>
              <Sparkles />
              Cargar datos de ejemplo
            </Button>
            <Button
              variant="outline"
              size="lg"
              render={<Link href="/ajustes" />}
            >
              Configurar mi sueldo
            </Button>
          </div>
        }
      />
    </div>
  );
}
