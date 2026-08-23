import type { Metadata } from "next";

import { MesView } from "@/components/views/mes-view";

export const metadata: Metadata = {
  title: "Este mes",
  description: "A dónde se fue tu sueldo este mes, categoría por categoría.",
};

export default function MesPage() {
  return <MesView />;
}
