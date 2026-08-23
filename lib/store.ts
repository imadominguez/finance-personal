import { loadState, saveState } from "@/lib/storage";
import { STORAGE_KEY } from "@/lib/constants";
import type { FinanceState } from "@/lib/types";

/**
 * Store mínimo sobre localStorage, pensado para `useSyncExternalStore`.
 *
 * localStorage es una fuente externa a React: leerla dentro de un efecto
 * provoca un render en cascada y no tiene una respuesta válida en el servidor.
 * Con este store, React se suscribe a los cambios y el servidor renderiza
 * `null` (esqueleto) hasta que el cliente entrega el primer snapshot real.
 */

let cache: FinanceState | null = null;
let subscribed = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function handleStorageEvent(event: StorageEvent): void {
  // `key === null` es un `clear()`; también escuchamos nuestra propia clave
  // para mantener sincronizadas dos pestañas abiertas a la vez.
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  cache = loadState();
  emit();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  if (!subscribed && typeof window !== "undefined") {
    window.addEventListener("storage", handleStorageEvent);
    subscribed = true;
  }

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Debe devolver siempre la misma referencia mientras el estado no cambie:
 * por eso la lectura se cachea en lugar de volver a parsear en cada llamada.
 */
export function getSnapshot(): FinanceState | null {
  if (cache === null) cache = loadState();
  return cache;
}

/** En el servidor no hay datos del usuario: se renderiza el esqueleto. */
export function getServerSnapshot(): FinanceState | null {
  return null;
}

export function setFinanceState(next: FinanceState): void {
  cache = next;
  saveState(next);
  emit();
}

export function updateFinanceState(
  updater: (current: FinanceState) => FinanceState,
): void {
  const current = getSnapshot();
  if (!current) return;
  setFinanceState(updater(current));
}

/** Vuelve a leer del almacenamiento (después de borrar todo, por ejemplo). */
export function refreshFinanceState(): void {
  cache = loadState();
  emit();
}
