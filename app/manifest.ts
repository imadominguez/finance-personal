import type { MetadataRoute } from "next";

import { APP_NAME } from "@/lib/constants";

/**
 * Manifiesto de la PWA.
 *
 * `start_url` apunta al resumen del día, no a la landing: quien instaló la app
 * ya sabe qué es, quiere entrar a sus números.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/hoy",
    name: `${APP_NAME} · Gastos del día, del mes y del año`,
    short_name: APP_NAME,
    description:
      "Registrá tus gastos e ingresos y mirá en qué se te va la plata día a día, mes a mes y año a año.",
    start_url: "/hoy",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    lang: "es-AR",
    dir: "ltr",
    categories: ["finance", "productivity", "utilities"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    // Accesos directos del menú contextual del ícono en Android y escritorio.
    shortcuts: [
      {
        name: "Resumen de hoy",
        short_name: "Hoy",
        url: "/hoy",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Este mes",
        short_name: "Mes",
        url: "/mes",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Movimientos",
        short_name: "Movimientos",
        url: "/movimientos",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
