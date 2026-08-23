import type { Metadata } from "next";

import { AjustesView } from "@/components/views/ajustes-view";

export const metadata: Metadata = {
  title: "Ajustes",
  description: "Presupuesto mensual, moneda y respaldo de tus datos.",
};

export default function AjustesPage() {
  return <AjustesView />;
}
