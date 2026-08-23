import type { Metadata } from "next";

import { OfflineScreen } from "@/components/pwa/offline-screen";

export const metadata: Metadata = {
  title: "Sin conexión",
  description: "No hay internet en este momento.",
};

/**
 * Pantalla que muestra el service worker cuando no hay red.
 * Es estática a propósito: tiene que poder servirse desde la caché.
 */
export default function SinConexionPage() {
  return <OfflineScreen />;
}
