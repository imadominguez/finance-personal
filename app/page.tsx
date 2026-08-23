import type { Metadata } from "next";

import { HoyView } from "@/components/views/hoy-view";

export const metadata: Metadata = {
  title: "Hoy",
  description: "Cuánto llevás gastado hoy y en qué.",
};

export default function HoyPage() {
  return <HoyView />;
}
