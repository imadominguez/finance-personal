import type { Metadata } from "next";

import { AnioView } from "@/components/views/anio-view";

export const metadata: Metadata = {
  title: "Este año",
  description:
    "Tu año en números: tendencia mes a mes y peso de cada categoría.",
};

export default function AnioPage() {
  return <AnioView />;
}
