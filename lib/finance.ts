import {
  addMonthsToKey,
  dateKeysOfMonth,
  dayInMonth,
  daysInMonthCount,
  elapsedDaysInMonth,
  getPeriodRange,
  isFutureDate,
  monthDiff,
  monthKeysOfYear,
  previousPeriod,
  toMonthKey,
  type DateKey,
  type DateRange,
  type MonthKey,
  type Period,
} from "@/lib/date";
import type {
  Category,
  CategoryBreakdown,
  Comparison,
  Entry,
  FinanceState,
  InstallmentPlan,
  PeriodSummary,
  RecurringRule,
  Transaction,
} from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Expansión de reglas                                                        */
/* -------------------------------------------------------------------------- */

function inRange(date: DateKey, range: DateRange): boolean {
  return date >= range.from && date <= range.to;
}

function transactionToEntry(transaction: Transaction): Entry {
  return {
    id: transaction.id,
    kind: transaction.kind,
    amount: transaction.amount,
    categoryId: transaction.categoryId,
    description: transaction.description,
    date: transaction.date,
    method: transaction.method,
    origin: "manual",
    editable: true,
    projected: isFutureDate(transaction.date),
  };
}

/**
 * Proyecta un gasto/ingreso fijo dentro del rango pedido. No se guardan
 * movimientos en la base: se calculan al leer, así editar la regla corrige
 * todos los meses de una y no quedan datos duplicados.
 */
export function expandRecurring(
  rule: RecurringRule,
  range: DateRange,
): Entry[] {
  if (!rule.active) return [];

  const firstMonth = toMonthKey(range.from);
  const lastMonth = toMonthKey(range.to);
  const startMonth =
    rule.startMonth > firstMonth ? rule.startMonth : firstMonth;
  const endMonth =
    rule.endMonth && rule.endMonth < lastMonth ? rule.endMonth : lastMonth;

  const months = monthDiff(startMonth, endMonth);
  if (months < 0) return [];

  const entries: Entry[] = [];
  for (let index = 0; index <= months; index += 1) {
    const month = addMonthsToKey(startMonth, index);
    if (rule.skipped.includes(month)) continue;

    const date = dayInMonth(month, rule.dayOfMonth);
    if (!inRange(date, range)) continue;

    entries.push({
      id: `fijo:${rule.id}:${month}`,
      kind: rule.kind,
      amount: rule.amount,
      categoryId: rule.categoryId,
      description: rule.description,
      date,
      method: "otro",
      origin: "fijo",
      sourceId: rule.id,
      badge: "Fijo",
      editable: false,
      projected: isFutureDate(date),
    });
  }

  return entries;
}

/**
 * Monto de cada cuota. La última absorbe el redondeo para que la suma de las
 * cuotas dé exactamente el total financiado.
 */
export function installmentAmount(
  plan: InstallmentPlan,
  index: number,
): number {
  const base = Math.round((plan.totalAmount / plan.installments) * 100) / 100;
  if (index < plan.installments - 1) return base;
  return (
    Math.round((plan.totalAmount - base * (plan.installments - 1)) * 100) / 100
  );
}

export function expandInstallments(
  plan: InstallmentPlan,
  range: DateRange,
): Entry[] {
  const entries: Entry[] = [];

  for (let index = 0; index < plan.installments; index += 1) {
    const month = addMonthsToKey(plan.firstMonth, index);
    const date = dayInMonth(month, plan.dayOfMonth);
    if (!inRange(date, range)) continue;

    entries.push({
      id: `cuota:${plan.id}:${index}`,
      kind: "gasto",
      amount: installmentAmount(plan, index),
      categoryId: plan.categoryId,
      description: plan.description,
      date,
      method: plan.method,
      origin: "cuota",
      sourceId: plan.id,
      badge: `Cuota ${index + 1}/${plan.installments}`,
      editable: false,
      projected: isFutureDate(date),
    });
  }

  return entries;
}

/** Todos los movimientos visibles de un rango: manuales + fijos + cuotas. */
export function getEntriesInRange(
  state: FinanceState,
  range: DateRange,
): Entry[] {
  const manual = state.transactions
    .filter((transaction) => inRange(transaction.date, range))
    .map(transactionToEntry);

  const fijos = state.recurring.flatMap((rule) => expandRecurring(rule, range));
  const cuotas = state.installments.flatMap((plan) =>
    expandInstallments(plan, range),
  );

  return [...manual, ...fijos, ...cuotas].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.id.localeCompare(a.id);
  });
}

export function getEntriesInPeriod(
  state: FinanceState,
  period: Period,
): Entry[] {
  return getEntriesInRange(state, getPeriodRange(period));
}

/* -------------------------------------------------------------------------- */
/* Agregaciones                                                               */
/* -------------------------------------------------------------------------- */

function buildBreakdown(
  entries: Entry[],
  categories: Category[],
  kind: "gasto" | "ingreso",
): CategoryBreakdown[] {
  const filtered = entries.filter((entry) => entry.kind === kind);
  const total = filtered.reduce((sum, entry) => sum + entry.amount, 0);

  const buckets = new Map<string, { total: number; count: number }>();
  for (const entry of filtered) {
    const bucket = buckets.get(entry.categoryId) ?? { total: 0, count: 0 };
    bucket.total += entry.amount;
    bucket.count += 1;
    buckets.set(entry.categoryId, bucket);
  }

  const breakdown: CategoryBreakdown[] = [];
  for (const [categoryId, bucket] of buckets) {
    const category = findCategory(categories, categoryId, kind);
    breakdown.push({
      category,
      total: bucket.total,
      count: bucket.count,
      share: total > 0 ? (bucket.total / total) * 100 : 0,
    });
  }

  return breakdown.sort((a, b) => b.total - a.total);
}

/** Categoría por id, con un placeholder si quedó huérfana (categoría borrada). */
export function findCategory(
  categories: Category[],
  categoryId: string,
  kind: "gasto" | "ingreso" = "gasto",
): Category {
  const found = categories.find((category) => category.id === categoryId);
  if (found) return found;
  return {
    id: categoryId,
    name: "Sin categoría",
    kind,
    color: "#a8a8a8",
    icon: "MoreHorizontal",
  };
}

export function summarizeEntries(
  entries: Entry[],
  categories: Category[],
): PeriodSummary {
  let gastos = 0;
  let ingresos = 0;
  let gastosReales = 0;
  let gastosProyectados = 0;

  for (const entry of entries) {
    if (entry.kind === "gasto") {
      gastos += entry.amount;
      if (entry.projected) gastosProyectados += entry.amount;
      else gastosReales += entry.amount;
    } else {
      ingresos += entry.amount;
    }
  }

  return {
    entries,
    gastos,
    ingresos,
    balance: ingresos - gastos,
    count: entries.length,
    gastosReales,
    gastosProyectados,
    byCategory: buildBreakdown(entries, categories, "gasto"),
    ingresosByCategory: buildBreakdown(entries, categories, "ingreso"),
  };
}

export function getPeriodSummary(
  state: FinanceState,
  period: Period,
): PeriodSummary {
  return summarizeEntries(getEntriesInPeriod(state, period), state.categories);
}

export function comparePeriods(
  state: FinanceState,
  period: Period,
  metric: "gastos" | "ingresos" | "balance" = "gastos",
): Comparison {
  const current = getPeriodSummary(state, period)[metric];
  const previous = getPeriodSummary(state, previousPeriod(period))[metric];
  const changePct =
    previous === 0 ? null : ((current - previous) / Math.abs(previous)) * 100;
  return { current, previous, changePct };
}

export interface MonthTotals {
  month: MonthKey;
  gastos: number;
  ingresos: number;
  balance: number;
  /** El mes todavía no empezó: lo que se ve es proyección de fijos y cuotas. */
  future: boolean;
}

export function getMonthlyTotals(
  state: FinanceState,
  year: number,
): MonthTotals[] {
  const thisMonth = toMonthKey(new Date());

  return monthKeysOfYear(year).map((month) => {
    const summary = getPeriodSummary(state, { kind: "mes", month });
    return {
      month,
      gastos: summary.gastos,
      ingresos: summary.ingresos,
      balance: summary.balance,
      future: month > thisMonth,
    };
  });
}

export interface DayTotals {
  date: DateKey;
  gastos: number;
  ingresos: number;
  future: boolean;
}

export function getDailyTotals(
  state: FinanceState,
  month: MonthKey,
): DayTotals[] {
  const range = getPeriodRange({ kind: "mes", month });
  const entries = getEntriesInRange(state, range);

  const buckets = new Map<DateKey, { gastos: number; ingresos: number }>();
  for (const entry of entries) {
    const bucket = buckets.get(entry.date) ?? { gastos: 0, ingresos: 0 };
    if (entry.kind === "gasto") bucket.gastos += entry.amount;
    else bucket.ingresos += entry.amount;
    buckets.set(entry.date, bucket);
  }

  const days: DayTotals[] = [];
  for (const date of dateKeysOfMonth(month)) {
    const bucket = buckets.get(date) ?? { gastos: 0, ingresos: 0 };
    days.push({ date, ...bucket, future: isFutureDate(date) });
  }
  return days;
}

/* -------------------------------------------------------------------------- */
/* Presupuesto                                                                */
/* -------------------------------------------------------------------------- */

export interface BudgetStatus {
  budget: number;
  spent: number;
  remaining: number;
  /** Porcentaje consumido, sin tope (puede pasar 100). */
  usedPct: number;
  /** Porcentaje del mes transcurrido, para saber si vas adelantado. */
  elapsedPct: number;
  hasBudget: boolean;
  overBudget: boolean;
  /** Cuánto podés gastar por día con lo que queda del mes. */
  dailyAllowance: number;
}

export function getBudgetStatus(
  state: FinanceState,
  month: MonthKey,
  spent: number,
): BudgetStatus {
  const budget = state.settings.monthlyBudget;
  const hasBudget = budget > 0;
  const remaining = budget - spent;

  const totalDays = daysInMonthCount(month);
  const elapsed = elapsedDaysInMonth(month);
  const daysLeft = Math.max(totalDays - elapsed, 0);

  return {
    budget,
    spent,
    remaining,
    usedPct: hasBudget ? (spent / budget) * 100 : 0,
    elapsedPct: (elapsed / totalDays) * 100,
    hasBudget,
    overBudget: hasBudget && spent > budget,
    dailyAllowance:
      hasBudget && daysLeft > 0 ? Math.max(remaining, 0) / daysLeft : 0,
  };
}

/** Promedio diario gastado en el mes, contando solo los días transcurridos. */
export function getDailyAverage(month: MonthKey, gastos: number): number {
  const elapsed = elapsedDaysInMonth(month);
  if (elapsed <= 0) return 0;
  return gastos / elapsed;
}

/** Proyección simple a fin de mes: ritmo actual × días del mes + lo ya agendado. */
export function projectMonthEnd(
  state: FinanceState,
  month: MonthKey,
  summary: PeriodSummary,
): number {
  const totalDays = daysInMonthCount(month);
  const elapsed = elapsedDaysInMonth(month);
  if (elapsed <= 0) return summary.gastos;
  if (elapsed >= totalDays) return summary.gastos;

  // Los fijos y cuotas que faltan ya están agendados: no se extrapolan.
  const manualReal = summary.entries
    .filter(
      (entry) =>
        entry.kind === "gasto" && !entry.projected && entry.origin === "manual",
    )
    .reduce((sum, entry) => sum + entry.amount, 0);

  const dailyRate = manualReal / elapsed;
  const projectedManual = dailyRate * (totalDays - elapsed);

  return summary.gastos + projectedManual;
}
