"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthFormState } from "@/app/actions/auth";

interface AuthFormProps {
  mode: "ingresar" | "crear-cuenta";
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
}

const COPY = {
  ingresar: {
    title: "Entrá a tu cuenta",
    description: "Retomá donde dejaste.",
    submit: "Ingresar",
    footer: "¿Todavía no tenés cuenta?",
    footerLink: "Creá una",
    footerHref: "/crear-cuenta",
  },
  "crear-cuenta": {
    title: "Creá tu cuenta",
    description: "Empezá a llevar tus gastos en un minuto.",
    submit: "Crear cuenta",
    footer: "¿Ya tenés cuenta?",
    footerLink: "Ingresá",
    footerHref: "/ingresar",
  },
} as const;

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, pending] = React.useActionState(action, {});
  const searchParams = useSearchParams();
  const copy = COPY[mode];

  // A dónde volver después de entrar, si el proxy nos mandó acá desde otra ruta.
  const siguiente = searchParams.get("siguiente") ?? "/hoy";

  return (
    <div className="surface-card animate-fade-up rounded-2xl p-6">
      <h1 className="font-heading text-xl font-bold tracking-tight">
        {copy.title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{copy.description}</p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="siguiente" value={siguiente} />

        {mode === "crear-cuenta" ? (
          <Field
            id="name"
            name="name"
            label="Nombre (opcional)"
            placeholder="Cómo te llamamos"
            autoComplete="name"
            error={state.fieldErrors?.name}
          />
        ) : null}

        <Field
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="vos@email.com"
          autoComplete="email"
          required
          error={state.fieldErrors?.email}
        />

        <Field
          id="password"
          name="password"
          type="password"
          label="Contraseña"
          placeholder={
            mode === "crear-cuenta" ? "Mínimo 8 caracteres" : "········"
          }
          autoComplete={
            mode === "crear-cuenta" ? "new-password" : "current-password"
          }
          required
          error={state.fieldErrors?.password}
        />

        {state.error ? (
          <p
            role="alert"
            className="animate-fade-in rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {state.error}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="mt-1 w-full"
        >
          {pending ? <Loader2 className="animate-spin" /> : <ArrowRight />}
          {pending ? "Un segundo…" : copy.submit}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        {copy.footer}{" "}
        <Link
          href={copy.footerHref}
          className="font-medium text-brand underline-offset-4 hover:underline"
        >
          {copy.footerLink}
        </Link>
      </p>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  ...props
}: React.ComponentProps<typeof Input> & {
  id: string;
  label: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-10"
        {...props}
      />
      {error ? (
        <p
          id={`${id}-error`}
          className="animate-fade-in text-xs text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
