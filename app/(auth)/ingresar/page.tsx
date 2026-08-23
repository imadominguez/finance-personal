import { Suspense } from "react";
import type { Metadata } from "next";

import { GoogleSignIn } from "@/components/auth/google-signin";

export const metadata: Metadata = {
  title: "Ingresar",
  description: "Entrá con tu cuenta de Google para ver tus finanzas.",
};

/** Ingreso y alta son lo mismo: si la cuenta no existe, se crea al entrar. */
export default function IngresarPage() {
  return (
    // Lee `?siguiente=` y `?error=` con useSearchParams, que necesita un límite
    // de Suspense para no bloquear el prerender de la página.
    <Suspense
      fallback={<div className="surface-card h-72 animate-pulse rounded-2xl" />}
    >
      <GoogleSignIn />
    </Suspense>
  );
}
