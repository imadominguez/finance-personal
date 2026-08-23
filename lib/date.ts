import {
  addDays,
  addMonths,
  addYears,
  differenceInCalendarDays,
  endOfMonth,
  endOfYear,
  format,
  getDaysInMonth,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfYear,
} from "date-fns";
import { es } from "date-fns/locale";

import { capitalize } from "@/lib/format";

/** Clave de mes: `YYYY-MM`. */
export type MonthKey = string;
/** Fecha local: `YYYY-MM-DD`. */
export type DateKey = string;

export type Period =
  | { kind: "dia"; date: DateKey }
  | { kind: "mes"; month: MonthKey }
  | { kind: "anio"; year: number };

export interface DateRange {
  from: DateKey;
  to: DateKey;
}

/**
 * Todas las fechas se manejan como strings `YYYY-MM-DD` interpretados en hora
 * local. `parseISO` de date-fns respeta eso (a diferencia de `new Date(iso)`,
 * que asume UTC y puede correr el día una posición).
 */
export function parseDate(value: DateKey): Date {
  return parseISO(value);
}

export function toDateKey(date: Date): DateKey {
  return format(date, "yyyy-MM-dd");
}

export function toMonthKey(value: Date | DateKey): MonthKey {
  const date = typeof value === "string" ? parseDate(value) : value;
  return format(date, "yyyy-MM");
}

export function todayKey(): DateKey {
  return toDateKey(new Date());
}

export function currentMonthKey(): MonthKey {
  return toMonthKey(new Date());
}

export function currentYear(): number {
  return new Date().getFullYear();
}

export function yearOfMonthKey(month: MonthKey): number {
  return Number(month.slice(0, 4));
}

export function monthKeyFromParts(year: number, monthIndex: number): MonthKey {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

export function addMonthsToKey(month: MonthKey, amount: number): MonthKey {
  return toMonthKey(addMonths(parseDate(`${month}-01`), amount));
}

/** Diferencia en meses entre dos claves (`b - a`). */
export function monthDiff(a: MonthKey, b: MonthKey): number {
  const [ay, am] = a.split("-").map(Number);
  const [by, bm] = b.split("-").map(Number);
  return (by - ay) * 12 + (bm - am);
}

/**
 * Devuelve la fecha del día `day` dentro del mes, recortada al último día si el
 * mes es más corto (un fijo el 31 cae el 28/29 en febrero).
 */
export function dayInMonth(month: MonthKey, day: number): DateKey {
  const first = parseDate(`${month}-01`);
  const total = getDaysInMonth(first);
  const safeDay = Math.min(Math.max(day, 1), total);
  return `${month}-${String(safeDay).padStart(2, "0")}`;
}

export function getPeriodRange(period: Period): DateRange {
  if (period.kind === "dia") {
    return { from: period.date, to: period.date };
  }
  if (period.kind === "mes") {
    const first = parseDate(`${period.month}-01`);
    return {
      from: toDateKey(startOfMonth(first)),
      to: toDateKey(endOfMonth(first)),
    };
  }
  const first = new Date(period.year, 0, 1);
  return {
    from: toDateKey(startOfYear(first)),
    to: toDateKey(endOfYear(first)),
  };
}

/** El mismo período corrido una posición hacia atrás (para comparar). */
export function previousPeriod(period: Period): Period {
  if (period.kind === "dia") {
    return {
      kind: "dia",
      date: toDateKey(addDays(parseDate(period.date), -1)),
    };
  }
  if (period.kind === "mes") {
    return { kind: "mes", month: addMonthsToKey(period.month, -1) };
  }
  return { kind: "anio", year: period.year - 1 };
}

/** Corre una fecha `YYYY-MM-DD` una cantidad de días. */
export function shiftDate(date: DateKey, amount: number): DateKey {
  return toDateKey(addDays(parseDate(date), amount));
}

export function shiftPeriod(period: Period, amount: number): Period {
  if (period.kind === "dia") {
    return {
      kind: "dia",
      date: toDateKey(addDays(parseDate(period.date), amount)),
    };
  }
  if (period.kind === "mes") {
    return { kind: "mes", month: addMonthsToKey(period.month, amount) };
  }
  return { kind: "anio", year: period.year + amount };
}

/** `true` si el período ya terminó o está en curso (no es futuro puro). */
export function isFutureDate(date: DateKey): boolean {
  return differenceInCalendarDays(parseDate(date), new Date()) > 0;
}

export function isToday(date: DateKey): boolean {
  return isSameDay(parseDate(date), new Date());
}

export function monthKeysOfYear(year: number): MonthKey[] {
  return Array.from({ length: 12 }, (_, index) =>
    monthKeyFromParts(year, index),
  );
}

export function dateKeysOfMonth(month: MonthKey): DateKey[] {
  const first = parseDate(`${month}-01`);
  return Array.from({ length: getDaysInMonth(first) }, (_, index) =>
    dayInMonth(month, index + 1),
  );
}

export function daysInMonthCount(month: MonthKey): number {
  return getDaysInMonth(parseDate(`${month}-01`));
}

/** Cuántos días del mes ya pasaron (para el promedio diario "real"). */
export function elapsedDaysInMonth(month: MonthKey): number {
  const today = new Date();
  if (toMonthKey(today) === month) return today.getDate();
  const total = daysInMonthCount(month);
  return parseDate(`${month}-01`) > today ? 0 : total;
}

export function formatMonthLong(month: MonthKey): string {
  return capitalize(
    format(parseDate(`${month}-01`), "MMMM yyyy", { locale: es }),
  );
}

export function formatMonthShort(month: MonthKey): string {
  return capitalize(format(parseDate(`${month}-01`), "LLL", { locale: es }));
}

export function formatDayLong(date: DateKey): string {
  return capitalize(
    format(parseDate(date), "EEEE d 'de' MMMM", { locale: es }),
  );
}

export function formatDayShort(date: DateKey): string {
  return capitalize(format(parseDate(date), "d MMM", { locale: es }));
}

export function formatDayNumber(date: DateKey): string {
  return format(parseDate(date), "d");
}

export function formatWeekdayShort(date: DateKey): string {
  return capitalize(format(parseDate(date), "EEE", { locale: es }));
}

/** "Hoy", "Ayer", "Mañana" o la fecha larga. */
export function formatRelativeDay(date: DateKey): string {
  const diff = differenceInCalendarDays(parseDate(date), new Date());
  if (diff === 0) return "Hoy";
  if (diff === -1) return "Ayer";
  if (diff === 1) return "Mañana";
  return formatDayLong(date);
}

export function formatPeriodLabel(period: Period): string {
  if (period.kind === "dia") return formatRelativeDay(period.date);
  if (period.kind === "mes") return formatMonthLong(period.month);
  return String(period.year);
}

export { addYears, endOfMonth, startOfMonth };
