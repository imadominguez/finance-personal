"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Logo de Google. Va con sus colores oficiales: es requisito de su marca. */
function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <path
        fill="#4285F4"
        d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.63h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.55Z"
      />
      <path
        fill="#34A853"
        d="M12 23.5c3.11 0 5.72-1.03 7.62-2.8l-3.72-2.89c-1.03.69-2.35 1.1-3.9 1.1-3 0-5.54-2.02-6.45-4.75H1.7v2.98A11.5 11.5 0 0 0 12 23.5Z"
      />
      <path
        fill="#FBBC05"
        d="M5.55 14.16a6.9 6.9 0 0 1 0-4.32V6.86H1.7a11.5 11.5 0 0 0 0 10.28l3.85-2.98Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.69 0 3.21.58 4.4 1.72l3.3-3.3C17.71 1.27 15.1.5 12 .5 7.5.5 3.6 3.08 1.7 6.86l3.85 2.98C6.46 7.1 9 4.77 12 4.77Z"
      />
    </svg>
  );
}

/** Qué salió mal, en castellano y sin filtrar detalles internos. */
const MENSAJES: Record<string, string> = {
  cancelado: "Cancelaste el ingreso. Podés intentar de nuevo cuando quieras.",
  "respuesta-incompleta":
    "Google devolvió una respuesta incompleta. Probá otra vez.",
  "sesion-expirada":
    "Pasó demasiado tiempo entre que empezaste y volviste. Probá de nuevo.",
  "estado-invalido":
    "No pudimos verificar que el ingreso haya empezado acá. Volvé a intentar desde esta pantalla.",
  "email-sin-verificar":
    "Google no confirma que ese email sea tuyo, así que no podemos crear la cuenta. Verificalo en tu cuenta de Google y volvé a probar.",
  "base-de-datos":
    "No pudimos conectar con la base de datos. Probá de nuevo en unos segundos.",
  configuracion:
    "Falta configurar el ingreso con Google en el servidor (GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET).",
  fallo: "No pudimos completar el ingreso. Probá de nuevo.",
};

export function GoogleSignIn() {
  const searchParams = useSearchParams();
  const [enviando, setEnviando] = React.useState(false);

  const siguiente = searchParams.get("siguiente") ?? "/hoy";
  const error = searchParams.get("error");
  const mensaje = error ? (MENSAJES[error] ?? MENSAJES.fallo) : null;

  const destino = `/api/auth/google?siguiente=${encodeURIComponent(siguiente)}`;

  return (
    <div className="surface-card animate-fade-up rounded-2xl p-6">
      <h1 className="font-heading text-xl font-bold tracking-tight">
        Entrá con tu cuenta de Google
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Si es tu primera vez, se crea la cuenta sola. No hay contraseñas que
        recordar.
      </p>

      {mensaje ? (
        <p
          role="alert"
          className="mt-5 flex animate-fade-in items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive"
        >
          <AlertTriangle className="mt-px size-3.5 shrink-0" />
          {mensaje}
        </p>
      ) : null}

      {/*
        Un enlace de verdad, no un botón con JavaScript: el ingreso con Google es
        una navegación completa del navegador hacia otro dominio. Como enlace
        funciona incluso con el JavaScript caído, y se puede abrir con el teclado
        o en otra pestaña como cualquier enlace.
      */}
      <Button
        size="lg"
        variant="outline"
        onClick={() => setEnviando(true)}
        render={<a href={destino} rel="nofollow" />}
        className="mt-6 h-12 w-full justify-center gap-3 text-[0.95rem] font-medium"
      >
        {enviando ? <Loader2 className="animate-spin" /> : <GoogleLogo />}
        {enviando ? "Llevándote a Google…" : "Continuar con Google"}
      </Button>

      <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
        Solo pedimos tu nombre, tu email y tu foto de perfil. No tenemos acceso
        a nada más de tu cuenta de Google.
      </p>
    </div>
  );
}
