import type { Metadata } from "next";

import { AjustesView } from "@/components/views/ajustes-view";
import { getCurrentUser } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Ajustes",
  description: "Presupuesto mensual, moneda, respaldo de tus datos y cuenta.",
};

export default async function AjustesPage() {
  const user = await getCurrentUser();

  return (
    <AjustesView
      user={user}
      // Vive solo en el servidor: al cliente le llega el número, no el secreto
      // con el que el bot se autentica.
      numeroDelBot={process.env["WHATSAPP_NUMERO"] ?? null}
    />
  );
}
