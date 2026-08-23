import {
  DEFAULT_SETTINGS,
  SEED_CATEGORIES,
  STATE_VERSION,
} from "@/lib/constants";
import type { FinanceState } from "@/lib/types";

/**
 * Formato de respaldo de la app (exportar / importar JSON). Desde que los datos
 * viven en Postgres esto ya no es la fuente de verdad: se usa para llevarse una
 * copia, para restaurarla, y para migrar lo que quedó en el localStorage de la
 * versión anterior.
 */

/** Clave que usaba la versión anterior de la app en el navegador. */
export const LEGACY_STORAGE_KEY = "finanzas-personales:v1";

export function createEmptyState(): FinanceState {
  return {
    version: STATE_VERSION,
    settings: { ...DEFAULT_SETTINGS },
    // Los ids reales los genera la base; acá solo hacen falta para que el
    // JSON exportado sea autoconsistente.
    categories: SEED_CATEGORIES.map((category, index) => ({
      ...category,
      id: `semilla-${index}`,
    })),
    transactions: [],
    recurring: [],
    installments: [],
  };
}

/**
 * Normaliza lo que venga de un archivo importado o del localStorage viejo.
 * Es la frontera con datos que no controlamos: acá se garantiza que el estado
 * tenga forma válida antes de tocar la base.
 */
export function normalizeState(input: unknown): FinanceState {
  const base = createEmptyState();
  if (!input || typeof input !== "object") return base;

  const raw = input as Partial<FinanceState>;

  return {
    version: STATE_VERSION,
    settings: { ...base.settings, ...(raw.settings ?? {}) },
    categories:
      Array.isArray(raw.categories) && raw.categories.length > 0
        ? raw.categories
        : base.categories,
    transactions: Array.isArray(raw.transactions) ? raw.transactions : [],
    recurring: Array.isArray(raw.recurring)
      ? raw.recurring.map((rule) => ({ ...rule, skipped: rule.skipped ?? [] }))
      : [],
    installments: Array.isArray(raw.installments) ? raw.installments : [],
  };
}

export function stateToJson(state: FinanceState): string {
  return JSON.stringify(state, null, 2);
}

/**
 * Lee los datos que hayan quedado guardados en este navegador por la versión
 * anterior de la app. Devuelve `null` si no hay nada que migrar.
 */
export function readLegacyLocalState(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<FinanceState>;
    const hasData =
      (parsed.transactions?.length ?? 0) > 0 ||
      (parsed.recurring?.length ?? 0) > 0 ||
      (parsed.installments?.length ?? 0) > 0;

    return hasData ? raw : null;
  } catch {
    return null;
  }
}

export function clearLegacyLocalState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
}
