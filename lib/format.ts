import type { Settings } from "@/lib/types";

/**
 * Formatea plata. Por defecto sin decimales: en el día a día los centavos
 * ensucian más de lo que aportan, y el diseño muestra montos redondos.
 */
export function formatMoney(
  amount: number,
  settings: Pick<Settings, "currency" | "locale">,
  options?: { decimals?: boolean; signed?: boolean; compact?: boolean },
): string {
  const decimals = options?.decimals ?? false;
  const compact = options?.compact ?? false;
  const value = Math.abs(amount);

  // En notación compacta hacen falta decimales: sin ellos, 1.084.300 y
  // 1.373.800 se muestran los dos como "$ 1 M".
  const maximumFractionDigits = compact ? 1 : decimals ? 2 : 0;

  const formatter = new Intl.NumberFormat(settings.locale, {
    style: "currency",
    currency: settings.currency,
    minimumFractionDigits: compact ? 0 : decimals ? 2 : 0,
    maximumFractionDigits,
    notation: compact ? "compact" : "standard",
  });

  const formatted = formatter.format(value);
  if (!options?.signed) return amount < 0 ? `-${formatted}` : formatted;
  return `${amount < 0 ? "-" : "+"}${formatted}`;
}

/** Solo el número, sin símbolo de moneda (para inputs y ejes). */
export function formatNumber(
  amount: number,
  locale: string,
  maximumFractionDigits = 0,
): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(
    amount,
  );
}

/** Versión corta para ejes de gráficos: 1,2 M / 340 k. */
export function formatCompact(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatPercent(
  value: number,
  locale: string,
  decimals = 0,
): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/** Capitaliza la primera letra (los meses en español vienen en minúscula). */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convierte lo que el usuario tipea en un input de monto a número.
 * Acepta "12.500,50", "12500.50", "$ 12.500" y "12500".
 */
export function parseAmountInput(raw: string): number {
  const cleaned = raw.replace(/[^\d.,-]/g, "").trim();
  if (!cleaned) return NaN;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const decimalSeparator =
    lastComma > lastDot ? "," : lastDot > lastComma ? "." : "";

  let normalized = cleaned;
  if (decimalSeparator) {
    const thousandSeparator = decimalSeparator === "," ? "." : ",";
    normalized = cleaned.split(thousandSeparator).join("");
    normalized = normalized.replace(decimalSeparator, ".");
  } else {
    normalized = cleaned.split(".").join("").split(",").join("");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}
