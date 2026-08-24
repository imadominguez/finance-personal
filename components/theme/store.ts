"use client";

/**
 * El tema guardado en el navegador, tratado como lo que es: un almacén externo
 * a React.
 *
 * `localStorage` no es estado de React —lo lee también el script que corre
 * antes del primer pintado, y puede cambiarlo otra pestaña—, así que se expone
 * con la interfaz de `useSyncExternalStore`: suscribirse, leer una instantánea
 * estable y notificar cuando cambia. Eso evita el clásico "leer en un efecto y
 * llamar a setState", que provoca un render de más y un parpadeo.
 */

import {
  CLAVE_TEMA,
  VERSION_TEMA,
  empaquetarTema,
  normalizarTema,
  TEMA_POR_DEFECTO,
  type Tema,
  type TemaGuardado,
} from "@/lib/theme";

type Oyente = () => void;

const oyentes = new Set<Oyente>();

/**
 * La instantánea tiene que conservar la identidad entre lecturas o
 * `useSyncExternalStore` entra en un bucle de renders. Se cachea el objeto
 * parseado y solo se recalcula cuando el texto crudo cambió.
 */
let crudoCache: string | null = null;
let temaCache: Tema = TEMA_POR_DEFECTO;

function leerCrudo(): string | null {
  try {
    return window.localStorage.getItem(CLAVE_TEMA);
  } catch {
    // Modo privado, cookies bloqueadas: la app funciona igual, sin recordar.
    return null;
  }
}

/** Instantánea para React. Devuelve siempre el tema efectivo. */
export function leerTema(): Tema {
  const crudo = leerCrudo();
  if (crudo === crudoCache) return temaCache;

  crudoCache = crudo;
  temaCache = TEMA_POR_DEFECTO;

  if (crudo) {
    try {
      temaCache = normalizarTema(JSON.parse(crudo));
    } catch {
      temaCache = TEMA_POR_DEFECTO;
    }
  }

  return temaCache;
}

/** En el servidor no hay preferencia: se renderiza el tema original. */
export function leerTemaServidor(): Tema {
  return TEMA_POR_DEFECTO;
}

export function haySeleccionGuardada(): boolean {
  return leerCrudo() !== null;
}

/** `true` si lo guardado quedó viejo y hay que recalcular las variables. */
export function estaDesactualizado(): boolean {
  const crudo = leerCrudo();
  if (!crudo) return false;
  try {
    return (JSON.parse(crudo) as TemaGuardado).v !== VERSION_TEMA;
  } catch {
    return true;
  }
}

export function guardarTema(tema: Tema): void {
  try {
    window.localStorage.setItem(
      CLAVE_TEMA,
      JSON.stringify(empaquetarTema(tema)),
    );
  } catch {
    // Sin dónde guardar: se aplica igual, dura lo que dure la pestaña.
  }
  for (const oyente of oyentes) oyente();
}

export function subscribirTema(oyente: Oyente): () => void {
  oyentes.add(oyente);
  // Otra pestaña del mismo navegador también puede cambiarlo.
  window.addEventListener("storage", oyente);
  return () => {
    oyentes.delete(oyente);
    window.removeEventListener("storage", oyente);
  };
}

/* -------------------------------------------------------------------------- */
/* Preferencia del sistema                                                     */
/* -------------------------------------------------------------------------- */

const CONSULTA_OSCURO = "(prefers-color-scheme: dark)";

export function sistemaEnOscuro(): boolean {
  return window.matchMedia(CONSULTA_OSCURO).matches;
}

/** En el servidor se asume oscuro: es el modo por defecto de la app. */
export function sistemaEnOscuroServidor(): boolean {
  return true;
}

export function subscribirSistema(oyente: Oyente): () => void {
  const consulta = window.matchMedia(CONSULTA_OSCURO);
  consulta.addEventListener("change", oyente);
  return () => consulta.removeEventListener("change", oyente);
}
