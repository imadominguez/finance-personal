"use client";

import { AlertTriangle, X } from "lucide-react";

import { useFinanceReady } from "@/components/providers/finance-provider";

/**
 * Cuando una Server Action falla, el cambio optimista se revierte solo y la
 * pantalla vuelve al estado real. Sin un aviso eso se ve como si nada hubiera
 * pasado, así que acá se muestra el motivo.
 */
export function ErrorToast() {
  const { error, dismissError } = useFinanceReady();

  if (!error) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md animate-fade-up items-start gap-3 rounded-xl border border-destructive/40 bg-surface px-4 py-3 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.8)] sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-destructive">No se pudo guardar</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{error}</p>
      </div>
      <button
        type="button"
        onClick={dismissError}
        aria-label="Cerrar aviso"
        className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
