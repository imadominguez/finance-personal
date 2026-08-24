"use client";

import * as React from "react";

import { aplicarTema, esOscuro } from "@/components/theme/aplicar";
import {
  estaDesactualizado,
  guardarTema,
  leerTema,
  leerTemaServidor,
  sistemaEnOscuro,
  sistemaEnOscuroServidor,
  subscribirSistema,
  subscribirTema,
} from "@/components/theme/store";
import { TEMA_POR_DEFECTO, type Tema } from "@/lib/theme";

interface ValorTema {
  tema: Tema;
  /** El modo ya resuelto: `"sistema"` traducido a claro u oscuro. */
  oscuro: boolean;
  cambiar: (parcial: Partial<Tema>) => void;
  restaurar: () => void;
}

const ContextoTema = React.createContext<ValorTema | null>(null);

/**
 * `useLayoutEffect` avisa por consola si se ejecuta en el servidor. Acá hace
 * falta que corra antes del pintado (para reponer lo que borra el remontaje de
 * Strict Mode en desarrollo), así que se elige el hook según dónde estemos.
 */
const useEfectoDeDiseno =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const tema = React.useSyncExternalStore(
    subscribirTema,
    leerTema,
    leerTemaServidor,
  );
  const sistemaOscuro = React.useSyncExternalStore(
    subscribirSistema,
    sistemaEnOscuro,
    sistemaEnOscuroServidor,
  );

  const oscuro = esOscuro(tema, sistemaOscuro);

  /*
   * En producción el script del <head> ya dejó el DOM como corresponde y esto
   * es un no-op. Sirve para dos casos: cuando cambia la preferencia (acá o en
   * otra pestaña) y cuando React, al remontar en desarrollo, reinicia los
   * atributos de <html> que el script había puesto.
   */
  useEfectoDeDiseno(() => {
    aplicarTema(tema, oscuro);
  }, [tema, oscuro]);

  // Si cambió cómo se derivan los colores, se recalcula lo guardado.
  React.useEffect(() => {
    if (estaDesactualizado()) guardarTema(tema);
  }, [tema]);

  const valor = React.useMemo<ValorTema>(
    () => ({
      tema,
      oscuro,
      cambiar: (parcial) => guardarTema({ ...tema, ...parcial }),
      restaurar: () => guardarTema(TEMA_POR_DEFECTO),
    }),
    [tema, oscuro],
  );

  return (
    <ContextoTema.Provider value={valor}>{children}</ContextoTema.Provider>
  );
}

export function useTema(): ValorTema {
  const valor = React.useContext(ContextoTema);
  if (!valor)
    throw new Error("useTema necesita estar dentro de <ThemeProvider>");
  return valor;
}
