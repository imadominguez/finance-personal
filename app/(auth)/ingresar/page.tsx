import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { loginAction } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "Ingresar",
  description: "Entrá a tu cuenta para ver tus finanzas.",
};

export default function IngresarPage() {
  return (
    // El formulario lee `?siguiente=` con useSearchParams, que necesita un
    // límite de Suspense para no bloquear el prerender de la página.
    <Suspense
      fallback={<div className="surface-card h-80 animate-pulse rounded-2xl" />}
    >
      <AuthForm mode="ingresar" action={loginAction} />
    </Suspense>
  );
}
