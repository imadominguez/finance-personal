import "server-only";

import { z } from "zod";

import type { Cotizacion } from "@/lib/types";

/**
 * Cotizaciones del dólar, tomadas de dolarapi.com.
 *
 * Tres reglas que valen para cualquier dato de un tercero, y más si es plata:
 *
 *  1. **Si falla, la app sigue.** Cualquier error —la API caída, lenta, o
 *     devolviendo algo raro— termina en una lista vacía y los montos se
 *     muestran en pesos. Nunca se rompe una pantalla por una cotización.
 *  2. **No se confía en la forma.** Lo que llega se valida con Zod y se
 *     descarta lo que no sirva. Una casa nueva no rompe nada: se muestra con
 *     el nombre que mande la API.
 *  3. **Se cachea.** El valor lo comparten todos los usuarios, así que una
 *     sola llamada cada diez minutos alcanza para toda la app.
 */

const URL_POR_DEFECTO = "https://dolarapi.com/v1/dolares";

/** Cada cuánto se vuelve a pedir. El blue se mueve, pero no cada segundo. */
const SEGUNDOS_DE_CACHE = 600;

/** Si tarda más que esto, no vale la pena hacer esperar a la pantalla. */
const MS_DE_ESPERA = 3000;

/**
 * Respuesta de la API. Todo lo que no sea `casa` es opcional a propósito: se
 * valida para poder descartar, no para exigirle una forma exacta a un servicio
 * que no controlamos.
 */
const respuestaApi = z.array(
  z.object({
    casa: z.string().min(1).max(40),
    nombre: z.string().min(1).max(60).optional(),
    compra: z.number().finite().nullish(),
    venta: z.number().finite().nullish(),
    fechaActualizacion: z.string().max(40).optional(),
  }),
);

/**
 * Orden en que se muestran y nombres cortos. Lo que no esté acá igual aparece,
 * con el nombre que venga de la API y al final de la lista.
 */
const ORDEN: readonly string[] = [
  "oficial",
  "blue",
  "bolsa",
  "contadoconliqui",
  "tarjeta",
  "cripto",
  "mayorista",
];

const NOMBRES: Record<string, string> = {
  bolsa: "Bolsa (MEP)",
  contadoconliqui: "Contado con liqui (CCL)",
};

function ordenDe(casa: string): number {
  const indice = ORDEN.indexOf(casa);
  return indice === -1 ? ORDEN.length : indice;
}

/**
 * Todas las cotizaciones utilizables, ordenadas.
 *
 * Devuelve `[]` ante cualquier problema: quien la llama solo tiene que
 * preguntarse si la lista está vacía, no manejar errores.
 */
export async function getCotizaciones(): Promise<Cotizacion[]> {
  const url = process.env["DOLAR_API_URL"] ?? URL_POR_DEFECTO;

  try {
    const respuesta = await fetch(url, {
      // Sin esto Next no cachea nada: desde la v15 `fetch` no guarda por defecto.
      next: { revalidate: SEGUNDOS_DE_CACHE },
      signal: AbortSignal.timeout(MS_DE_ESPERA),
      headers: { Accept: "application/json" },
    });

    if (!respuesta.ok) return [];

    const datos = respuestaApi.safeParse(await respuesta.json());
    if (!datos.success) return [];

    return datos.data
      .filter((item) => typeof item.venta === "number" && item.venta > 0)
      .map((item) => ({
        casa: item.casa,
        nombre: NOMBRES[item.casa] ?? item.nombre ?? item.casa,
        venta: item.venta as number,
        compra:
          typeof item.compra === "number" && item.compra > 0
            ? item.compra
            : null,
        actualizado: item.fechaActualizacion ?? null,
      }))
      .sort((a, b) => ordenDe(a.casa) - ordenDe(b.casa));
  } catch {
    // Timeout, DNS, JSON roto: da igual, la app se muestra en pesos.
    return [];
  }
}
