"use client";

import { COLOR_BARRA, variablesDeTema, type Tema } from "@/lib/theme";

/** Resuelve `modo: "sistema"` contra lo que pide el sistema operativo. */
export function esOscuro(tema: Tema, sistemaOscuro: boolean): boolean {
  if (tema.modo === "sistema") return sistemaOscuro;
  return tema.modo === "oscuro";
}

/**
 * Escribe el tema en el DOM.
 *
 * Se pisan tres variables en línea sobre <html> —el acento, el texto que va
 * encima y el radio—; el resto de la paleta las sigue desde `globals.css`.
 * Va en línea a propósito: gana sobre cualquier regla de la hoja de estilos y
 * evita tener que inyectar un <style> por cada cambio.
 */
export function aplicarTema(tema: Tema, oscuro: boolean): void {
  const raiz = document.documentElement;

  raiz.classList.toggle("dark", oscuro);

  const variables = variablesDeTema(tema)[oscuro ? "oscuro" : "claro"];
  for (const [nombre, valor] of Object.entries(variables)) {
    raiz.style.setProperty(nombre, valor);
  }

  // El color de la barra del navegador y de la barra de estado en Android.
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute(
    "content",
    oscuro ? COLOR_BARRA.oscuro : COLOR_BARRA.claro,
  );
}
