"use client";

import * as React from "react";

import { saveThemeAction } from "@/app/actions/theme";
import {
  guardarTema,
  haySeleccionGuardada,
  leerTema,
  leerTemaServidor,
  subscribirTema,
} from "@/components/theme/store";
import type { Tema } from "@/lib/theme";

/**
 * Puente entre la apariencia de este dispositivo y la de la cuenta.
 *
 * Se monta solo en la zona con sesión, que es la única que tiene una cuenta
 * contra la cual sincronizar. Hace dos cosas:
 *
 *  - **Dispositivo nuevo**: si acá todavía no se eligió nada, adopta lo que la
 *    persona haya dejado guardado en su cuenta, así el tema la sigue de la
 *    computadora al teléfono.
 *  - **Cambio local**: lo manda a la cuenta.
 *
 * Los efectos comparan textos, no objetos: el `tema` que llega del servidor es
 * un objeto nuevo en cada render y usarlo como dependencia sería un bucle.
 * Escribir en el almacén tampoco es `setState`, así que no hay render de más.
 */
export function SincronizarTema({ tema }: { tema: Tema }) {
  const local = React.useSyncExternalStore(
    subscribirTema,
    leerTema,
    leerTemaServidor,
  );
  const hayLocal = React.useSyncExternalStore(
    subscribirTema,
    haySeleccionGuardada,
    // En el servidor se asume que sí, para no provocar un guardado al hidratar.
    () => true,
  );

  const remoto = JSON.stringify(tema);
  const enEsteEquipo = JSON.stringify(local);

  React.useEffect(() => {
    if (!hayLocal) {
      guardarTema(JSON.parse(remoto) as Tema);
      return;
    }

    if (enEsteEquipo === remoto) return;

    /*
     * Espera a que la mano se quede quieta. Arrastrar el selector de color
     * dispara un cambio por cuadro: sin esto sería una escritura en la base
     * por cada tono intermedio.
     */
    const id = window.setTimeout(() => {
      // Si falla no hay nada que hacer: el tema ya se ve bien acá.
      void saveThemeAction(JSON.parse(enEsteEquipo) as Tema).catch(() => {});
    }, 600);

    return () => window.clearTimeout(id);
  }, [hayLocal, enEsteEquipo, remoto]);

  return null;
}
