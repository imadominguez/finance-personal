import type { Metadata } from "next";

import { CategoriasView } from "@/components/views/categorias-view";

export const metadata: Metadata = {
  title: "Categorías",
  description: "Creá y editá las categorías de tus gastos e ingresos.",
};

export default function CategoriasPage() {
  return <CategoriasView />;
}
