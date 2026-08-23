import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { signupAction } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Creá tu cuenta para empezar a registrar tus gastos.",
};

export default function CrearCuentaPage() {
  return (
    <Suspense
      fallback={<div className="surface-card h-96 animate-pulse rounded-2xl" />}
    >
      <AuthForm mode="crear-cuenta" action={signupAction} />
    </Suspense>
  );
}
