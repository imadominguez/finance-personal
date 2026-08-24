"use client";

import { CLAVE_TEMA, COLOR_BARRA, VERSION_TEMA } from "@/lib/theme";

/**
 * Aplica el tema guardado antes del primer pintado.
 *
 * El servidor no sabe qué eligió esta persona: renderiza el tema original
 * (oscuro y naranja). Este script corre de forma sincrónica mientras el
 * navegador parsea el <head>, así que corrige el HTML antes de que se dibuje
 * nada. Un `useEffect` llegaría tarde y se vería el salto.
 *
 * No hace cuentas: las variables ya vienen calculadas en `localStorage` (ver
 * `empaquetarTema`). Si el formato guardado quedó viejo, no toca nada y el
 * provider lo recalcula al hidratar.
 */
const GUION = `(function(){try{
var g=localStorage.getItem(${JSON.stringify(CLAVE_TEMA)});if(!g)return;
var t=JSON.parse(g);if(!t||t.v!==${VERSION_TEMA}||!t.vars)return;
var o=t.modo==="oscuro"||(t.modo!=="claro"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
var r=document.documentElement;r.classList.toggle("dark",o);
var v=t.vars[o?"oscuro":"claro"]||{};for(var k in v){r.style.setProperty(k,v[k])}
var m=document.querySelector('meta[name="theme-color"]');
if(m)m.setAttribute("content",o?${JSON.stringify(COLOR_BARRA.oscuro)}:${JSON.stringify(COLOR_BARRA.claro)});
}catch(e){}})()`;

/**
 * En el cliente se emite como `text/plain` para que el navegador no lo vuelva
 * a ejecutar y para que React no avise por renderizar <script>. El desajuste
 * de `type` lo tapa `suppressHydrationWarning`.
 *
 * Es componente de cliente justamente por eso: uno de servidor solo puede
 * emitir un `type`, y React protesta al hidratar el <script> que llega en la
 * carga útil.
 */
export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: GUION }}
    />
  );
}
