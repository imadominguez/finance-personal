import type { MoneyFormat, Settings } from "@/lib/types";

/**
 * La cotización con la que hay que dividir, o `null` si el monto va en la
 * moneda de la cuenta.
 *
 * Se exige mayor a cero, no solo distinta de `null`: esto viene de una API de
 * afuera, y dividir por cero o por un negativo daría un monto sin sentido.
 */
export function cotizacionDe(
  format: Pick<MoneyFormat, "usdRate">,
): number | null {
  const rate = format.usdRate;
  return typeof rate === "number" && rate > 0 ? rate : null;
}

/**
 * El formato de la moneda en que se cargan los movimientos.
 *
 * Los campos donde se escribe un monto —el alta, el presupuesto— van siempre
 * en la moneda de la cuenta, aunque la persona esté mirando todo en dólares:
 * mostrar el eco de lo que acaba de tipear en otra moneda sería confuso, y
 * convertirlo al guardar dejaría la cotización de hoy metida adentro del dato.
 */
export function formatoDeCuenta(
  settings: Pick<Settings, "currency" | "locale">,
): MoneyFormat {
  return {
    currency: settings.currency,
    locale: settings.locale,
    usdRate: null,
  };
}

/**
 * Formatea plata. Por defecto sin decimales: en el día a día los centavos
 * ensucian más de lo que aportan, y el diseño muestra montos redondos.
 *
 * Si el formato pide dólares, el monto se divide por la cotización y ahí sí se
 * muestran los centavos: un café son US$ 3,20, y redondeado a US$ 3 se pierde
 * justo la parte que importa.
 */
export function formatMoney(
  amount: number,
  format: MoneyFormat,
  options?: { decimals?: boolean; signed?: boolean; compact?: boolean },
): string {
  const compact = options?.compact ?? false;
  const cotizacion = cotizacionDe(format);

  const convertido = cotizacion === null ? amount : amount / cotizacion;
  const value = Math.abs(convertido);

  const decimals = options?.decimals ?? (cotizacion !== null && !compact);

  // En notación compacta hacen falta decimales: sin ellos, 1.084.300 y
  // 1.373.800 se muestran los dos como "$ 1 M".
  const maximumFractionDigits = compact ? 1 : decimals ? 2 : 0;

  const formatter = new Intl.NumberFormat(format.locale, {
    style: "currency",
    currency: cotizacion === null ? format.currency : "USD",
    minimumFractionDigits: compact ? 0 : decimals ? 2 : 0,
    maximumFractionDigits,
    notation: compact ? "compact" : "standard",
  });

  const formatted = formatter.format(value);
  if (!options?.signed) return convertido < 0 ? `-${formatted}` : formatted;
  return `${convertido < 0 ? "-" : "+"}${formatted}`;
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
