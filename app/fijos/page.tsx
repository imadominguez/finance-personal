import type { Metadata } from "next";

import { FijosView } from "@/components/views/fijos-view";

export const metadata: Metadata = {
  title: "Fijos y cuotas",
  description: "Gastos que se repiten todos los meses y compras en cuotas.",
};

export default function FijosPage() {
  return <FijosView />;
}
