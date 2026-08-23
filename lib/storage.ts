import {
  DEFAULT_SETTINGS,
  SEED_CATEGORIES,
  STATE_VERSION,
  STORAGE_KEY,
} from "@/lib/constants";
import type { FinanceState } from "@/lib/types";

export function createEmptyState(): FinanceState {
  return {
    version: STATE_VERSION,
    settings: { ...DEFAULT_SETTINGS },
    categories: SEED_CATEGORIES.map((category) => ({ ...category })),
    transactions: [],
    recurring: [],
    installments: [],
  };
}

/**
 * Normaliza lo que venga de localStorage o de un archivo importado. La app es
 * de un solo usuario y sin backend, así que acá es donde se garantiza que el
 * estado tenga forma válida antes de llegar a la UI.
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

export function loadState(): FinanceState {
  if (typeof window === "undefined") return createEmptyState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyState();
    return normalizeState(JSON.parse(raw));
  } catch (error) {
    console.error(
      "No se pudo leer el estado guardado, se arranca de cero.",
      error,
    );
    return createEmptyState();
  }
}

export function saveState(state: FinanceState): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // Cuota llena o modo privado: la app sigue andando en memoria.
    console.error("No se pudo guardar el estado.", error);
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/** Ids cortos y únicos sin dependencias extra. */
export function createId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

export function stateToJson(state: FinanceState): string {
  return JSON.stringify(state, null, 2);
}

export function jsonToState(json: string): FinanceState {
  return normalizeState(JSON.parse(json));
}
