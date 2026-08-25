"use client";

import * as React from "react";
import { CreditCard, Plus, Repeat } from "lucide-react";

import { CategoryIcon } from "@/components/finance/category-icon";
import { EmptyState } from "@/components/finance/empty-state";
import { InstallmentDialog } from "@/components/finance/installment-dialog";
import { Money } from "@/components/finance/money";
import { ProgressBar } from "@/components/finance/progress-bar";
import { RecurringDialog } from "@/components/finance/recurring-dialog";
import { SectionCard } from "@/components/finance/section-card";
import { StatCard } from "@/components/finance/stat-card";
import { useFinanceReady } from "@/components/providers/finance-provider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  addMonthsToKey,
  currentMonthKey,
  formatMonthLong,
  monthDiff,
} from "@/lib/date";
import { findCategory, installmentAmount } from "@/lib/finance";
import { formatMoney } from "@/lib/format";
import type { InstallmentPlan, RecurringRule } from "@/lib/types";

/**
 * Gastos fijos y cuotas: se cargan una vez y la app los imputa a cada mes.
 * No se guardan movimientos duplicados; se calculan al leer.
 */
export function FijosView() {
  const { state, updateRecurring, moneyFormat } = useFinanceReady();
  const month = currentMonthKey();

  const [editingRule, setEditingRule] = React.useState<RecurringRule | null>(
    null,
  );
  const [ruleOpen, setRuleOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<InstallmentPlan | null>(
    null,
  );
  const [planOpen, setPlanOpen] = React.useState(false);

  const activeRules = state.recurring.filter((rule) => {
    if (!rule.active) return false;
    if (rule.startMonth > month) return false;
    if (rule.endMonth && rule.endMonth < month) return false;
    return true;
  });

  const fixedExpenses = activeRules
    .filter((rule) => rule.kind === "gasto" && !rule.skipped.includes(month))
    .reduce((sum, rule) => sum + rule.amount, 0);

  const fixedIncome = activeRules
    .filter((rule) => rule.kind === "ingreso" && !rule.skipped.includes(month))
    .reduce((sum, rule) => sum + rule.amount, 0);

  const activePlans = state.installments.filter((plan) => {
    const index = monthDiff(plan.firstMonth, month);
    return index >= 0 && index < plan.installments;
  });

  const installmentsThisMonth = activePlans.reduce((sum, plan) => {
    const index = monthDiff(plan.firstMonth, month);
    return sum + installmentAmount(plan, index);
  }, 0);

  function openNewRule() {
    setEditingRule(null);
    setRuleOpen(true);
  }

  function openNewPlan() {
    setEditingPlan(null);
    setPlanOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="animate-fade-up">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Fijos y cuotas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lo que se repite todos los meses. Se carga una vez y aparece solo en
          cada período.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Fijos del mes"
          value={fixedExpenses}
          settings={moneyFormat}
          icon={Repeat}
          tone="gasto"
          delay={60}
          hint={`${activeRules.filter((rule) => rule.kind === "gasto").length} gastos fijos`}
        />
        <StatCard
          label="Cuotas del mes"
          value={installmentsThisMonth}
          settings={moneyFormat}
          icon={CreditCard}
          tone="gasto"
          delay={110}
          hint={`${activePlans.length} compra${activePlans.length === 1 ? "" : "s"} activa${activePlans.length === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Ingresos fijos"
          value={fixedIncome}
          settings={moneyFormat}
          icon={Repeat}
          tone="ingreso"
          delay={160}
          hint="Sueldo y similares"
          className="col-span-2 sm:col-span-1"
        />
      </div>

      <SectionCard
        title="Gastos e ingresos fijos"
        description={`Imputados a ${formatMonthLong(month)}`}
        delay={140}
        action={
          <Button size="sm" onClick={openNewRule}>
            <Plus />
            Agregar
          </Button>
        }
      >
        {state.recurring.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="Sin gastos fijos"
            description="Cargá el alquiler, los servicios o el sueldo y se van a sumar solos todos los meses."
            action={
              <Button onClick={openNewRule}>
                <Plus />
                Nuevo gasto fijo
              </Button>
            }
            className="border-0 bg-transparent py-6"
          />
        ) : (
          <ul className="flex flex-col">
            {state.recurring.map((rule, index) => {
              const category = findCategory(
                state.categories,
                rule.categoryId,
                rule.kind,
              );
              const skippedThisMonth = rule.skipped.includes(month);
              const ended = rule.endMonth !== null && rule.endMonth < month;

              return (
                <li
                  key={rule.id}
                  className="animate-fade-up border-b border-hairline/70 last:border-0"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {/*
                    En pantallas muy angostas el monto y el interruptor bajan a
                    un segundo renglón: compartiendo uno solo, la descripción
                    quedaba en 38 px y no se leía ni se podía tocar.
                  */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg px-2 py-3 transition-colors duration-200 hover:bg-surface-raised">
                    <CategoryIcon icon={category.icon} color={category.color} />

                    <button
                      type="button"
                      onClick={() => {
                        setEditingRule(rule);
                        setRuleOpen(true);
                      }}
                      className="flex min-h-11 min-w-0 flex-1 basis-32 cursor-pointer flex-col justify-center text-left sm:min-h-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {rule.description}
                        </span>
                        {ended ? (
                          <span className="rounded-full border border-hairline bg-surface-raised px-1.5 py-px text-[10px] text-muted-foreground">
                            Terminado
                          </span>
                        ) : null}
                        {skippedThisMonth ? (
                          <span className="rounded-full border border-warning/30 bg-warning/10 px-1.5 py-px text-[10px] text-warning">
                            Salteado este mes
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {category.name} · Día {rule.dayOfMonth} ·{" "}
                        {rule.endMonth
                          ? `hasta ${formatMonthLong(rule.endMonth)}`
                          : "sin fecha de fin"}
                      </p>
                    </button>

                    <Money
                      value={rule.amount}
                      settings={moneyFormat}
                      className={`ml-auto shrink-0 text-sm font-semibold ${
                        rule.kind === "gasto" ? "text-brand" : "text-success"
                      }`}
                    />

                    <Switch
                      checked={rule.active}
                      onCheckedChange={(checked: boolean) =>
                        updateRecurring(rule.id, { active: checked })
                      }
                      aria-label={`Activar ${rule.description}`}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      <SectionCard
        title="Compras en cuotas"
        description="La app reparte el total entre los meses"
        delay={200}
        action={
          <Button size="sm" onClick={openNewPlan}>
            <Plus />
            Agregar
          </Button>
        }
      >
        {state.installments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="Sin compras en cuotas"
            description="Cargá una compra en cuotas y vas a ver cuánto te queda por pagar cada mes."
            action={
              <Button onClick={openNewPlan}>
                <Plus />
                Nueva compra en cuotas
              </Button>
            }
            className="border-0 bg-transparent py-6"
          />
        ) : (
          <ul className="flex flex-col gap-1">
            {state.installments.map((plan, index) => {
              const category = findCategory(state.categories, plan.categoryId);
              const currentIndex = monthDiff(plan.firstMonth, month);
              const paid = Math.min(
                Math.max(currentIndex + 1, 0),
                plan.installments,
              );
              const remaining = plan.installments - paid;
              const lastMonth = addMonthsToKey(
                plan.firstMonth,
                plan.installments - 1,
              );
              const finished = remaining <= 0;

              return (
                <li
                  key={plan.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPlan(plan);
                      setPlanOpen(true);
                    }}
                    className="w-full cursor-pointer rounded-xl border border-hairline bg-surface-raised/50 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 motion-reduce:hover:translate-y-0"
                  >
                    <div className="flex items-center gap-3">
                      <CategoryIcon
                        icon={category.icon}
                        color={category.color}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-medium">
                            {plan.description}
                          </span>
                          <Money
                            value={installmentAmount(
                              plan,
                              Math.max(currentIndex, 0),
                            )}
                            settings={moneyFormat}
                            className="shrink-0 text-sm font-semibold text-brand"
                          />
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {finished
                            ? `Terminó en ${formatMonthLong(lastMonth)}`
                            : `Cuota ${Math.max(paid, 1)} de ${plan.installments} · quedan ${remaining}`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <ProgressBar
                        value={(paid / plan.installments) * 100}
                        delay={index * 60}
                        className="flex-1"
                      />
                      <span className="shrink-0 text-xs tabular text-muted-foreground">
                        {formatMoney(plan.totalAmount, moneyFormat, {
                          compact: true,
                        })}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      <RecurringDialog
        open={ruleOpen}
        onOpenChange={setRuleOpen}
        rule={editingRule}
      />
      <InstallmentDialog
        open={planOpen}
        onOpenChange={setPlanOpen}
        plan={editingPlan}
      />
    </div>
  );
}
