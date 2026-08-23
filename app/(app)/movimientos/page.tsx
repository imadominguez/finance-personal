import type { Metadata } from "next";

import { MovimientosView } from "@/components/views/movimientos-view";

export const metadata: Metadata = {
  title: "Movimientos",
  description: "Historial completo de gastos e ingresos, con filtros.",
};

export default function MovimientosPage() {
  return <MovimientosView />;
}
