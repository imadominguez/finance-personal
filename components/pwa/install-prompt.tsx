"use client";

import * as React from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";

import { useInstall } from "@/components/pwa/install-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DISMISSED_KEY = "instalacion-descartada";

function leerDescartado(): boolean {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    // Modo privado o almacenamiento bloqueado: se ofrece igual.
    return false;
  }
}

/** El valor guardado no cambia mientras la pantalla está abierta. */
function noSuscribir(): () => void {
  return () => {};
}

/**
 * Invitación discreta a instalar, para la landing. Se puede descartar y no
 * vuelve a aparecer. El botón explícito de Ajustes es el que siempre está.
 */
export function InstallPrompt({ className }: { className?: string }) {
  const { puedeInstalar, instalada, plataforma, instalar } = useInstall();

  const descartadoAntes = React.useSyncExternalStore(
    noSuscribir,
    leerDescartado,
    () => true,
  );
  const [descartadoAhora, setDescartadoAhora] = React.useState(false);

  const esIos = plataforma === "ios";
  const visible =
    !instalada &&
    !descartadoAntes &&
    !descartadoAhora &&
    (puedeInstalar || esIos);

  if (!visible) return null;

  function descartar() {
    setDescartadoAhora(true);
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Si no se puede recordar, vuelve a aparecer en la próxima visita.
    }
  }

  return (
    <div
      className={cn(
        "surface-card flex animate-fade-up items-start gap-3 rounded-xl p-4",
        className,
      )}
    >
      <span className="brand-gradient flex size-9 shrink-0 items-center justify-center rounded-lg text-[#0a0a0a]">
        <Download className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Instalala en tu teléfono</p>

        {esIos && !puedeInstalar ? (
          <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            Tocá <Share className="inline size-3.5" /> Compartir y después
            <SquarePlus className="inline size-3.5" /> Agregar a inicio.
          </p>
        ) : (
          <>
            <p className="mt-1 text-xs text-muted-foreground">
              Se abre como una app, a pantalla completa y desde tu inicio.
            </p>
            <Button
              size="sm"
              onClick={() => void instalar()}
              className="mt-2.5"
            >
              <Download />
              Instalar
            </Button>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={descartar}
        aria-label="No mostrar más"
        className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
