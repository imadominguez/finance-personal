import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

/**
 * Solo la landing y las pantallas de acceso son públicas. El resto son
 * pantallas con datos de una cuenta: no tiene sentido que las rastreen
 * (y sin sesión devuelven una redirección al login de todos modos).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/ingresar", "/crear-cuenta"],
      disallow: [
        "/hoy",
        "/mes",
        "/anio",
        "/movimientos",
        "/fijos",
        "/categorias",
        "/ajustes",
        "/sin-conexion",
      ],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
