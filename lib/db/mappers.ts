import "server-only";

import type { Prisma } from "@/lib/generated/prisma/client";
import type {
  Category,
  InstallmentPlan,
  RecurringRule,
  Settings,
  Transaction,
} from "@/lib/types";

/**
 * Los montos se guardan como `Decimal` (nunca `Float`: con plata los errores
 * de punto flotante no son aceptables), pero la interfaz trabaja con `number`.
 * Esta conversión ocurre una sola vez, acá.
 */
export function decimalToNumber(value: Prisma.Decimal): number {
  return value.toNumber();
}

/**
 * Las fechas de movimiento son días del calendario (`@db.Date`), guardados a
 * medianoche UTC. `toISOString().slice(0, 10)` las devuelve tal cual se
 * guardaron, sin que la zona horaria del servidor corra el día.
 */
export function dateToKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

/** Inversa de `dateToKey`: fija el día a medianoche UTC. */
export function keyToDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

type CategoryRow = {
  id: string;
  name: string;
  kind: "gasto" | "ingreso";
  color: string;
  icon: string;
  system: boolean;
};

export function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    color: row.color,
    icon: row.icon,
    system: row.system,
  };
}

type TransactionRow = {
  id: string;
  kind: "gasto" | "ingreso";
  amount: Prisma.Decimal;
  categoryId: string;
  description: string;
  date: Date;
  method: Transaction["method"];
  note: string | null;
  createdAt: Date;
};

export function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    kind: row.kind,
    amount: decimalToNumber(row.amount),
    categoryId: row.categoryId,
    description: row.description,
    date: dateToKey(row.date),
    method: row.method,
    note: row.note ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

type RecurringRow = {
  id: string;
  kind: "gasto" | "ingreso";
  description: string;
  categoryId: string;
  amount: Prisma.Decimal;
  dayOfMonth: number;
  startMonth: string;
  endMonth: string | null;
  active: boolean;
  skipped: string[];
  createdAt: Date;
};

export function toRecurringRule(row: RecurringRow): RecurringRule {
  return {
    id: row.id,
    kind: row.kind,
    description: row.description,
    categoryId: row.categoryId,
    amount: decimalToNumber(row.amount),
    dayOfMonth: row.dayOfMonth,
    startMonth: row.startMonth,
    endMonth: row.endMonth,
    active: row.active,
    skipped: row.skipped,
    createdAt: row.createdAt.toISOString(),
  };
}

type InstallmentRow = {
  id: string;
  description: string;
  categoryId: string;
  totalAmount: Prisma.Decimal;
  installments: number;
  firstMonth: string;
  dayOfMonth: number;
  method: InstallmentPlan["method"];
  createdAt: Date;
};

export function toInstallmentPlan(row: InstallmentRow): InstallmentPlan {
  return {
    id: row.id,
    description: row.description,
    categoryId: row.categoryId,
    totalAmount: decimalToNumber(row.totalAmount),
    installments: row.installments,
    firstMonth: row.firstMonth,
    dayOfMonth: row.dayOfMonth,
    method: row.method,
    createdAt: row.createdAt.toISOString(),
  };
}

type SettingsRow = {
  monthlyBudget: Prisma.Decimal;
  currency: string;
  locale: string;
  displayName: string;
  usdCasa: string | null;
};

export function toSettings(row: SettingsRow): Settings {
  return {
    monthlyBudget: decimalToNumber(row.monthlyBudget),
    currency: row.currency,
    locale: row.locale,
    displayName: row.displayName,
    usdCasa: row.usdCasa,
  };
}
