"use client";

import * as React from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Evento no estándar, todavía sin tipos en lib.dom. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "instalacion-descartada";

/**
 * Qué corresponde ofrecer en este dispositivo:
 * - `oculto`: ya está instalada, o la persona dijo que no.
 * - `ios`: Safari en iOS no implementa `beforeinstallprompt`; se explican los pasos.
 * - `prompt`: se espera el evento del navegador para abrir el instalador nativo.
 */
type Modo = "oculto" | "ios" | "prompt";

function leerModo(): Modo {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && Boolean(window.navigator.standalone));
  if (standalone) return "oculto";

  try {
    if (window.localStorage.getItem(DISMISSED_KEY) === "1") return "oculto";
  } catch {
    // Modo privado o almacenamiento bloqueado: se ofrece igual.
  }

  const agente = window.navigator.userAgent;
  const esIos = /iphone|ipad|ipod/i.test(agente) && !/crios|fxios/i.test(agente);

  return esIos ? "ios" : "prompt";
}

/** El entorno no cambia mientras la pantalla está abierta. */
function noSuscribir(): () => void {
  return () => {};
}

/**
 * Invitación a instalar la app. En el servidor y hasta la hidratación no se
 * muestra nada, que es lo correcto: todavía no se sabe en qué dispositivo estamos.
 */
export function InstallPrompt({ className }: { className?: string }) {
  const modo = React.useSyncExternalStore(
    noSuscribir,
    leerModo,
    (): Modo => "oculto"
  );

  const [deferred, setDeferred] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [descartado, setDescartado] = React.useState(false);

  React.useEffect(() => {
    if (modo !== "prompt") return;

    const onPrompt = (event: Event) => {
      // Se cancela el aviso del navegador para mostrarlo dentro del diseño.
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, [modo]);

  function descartar() {
    setDescartado(true);
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Si no se puede recordar, vuelve a aparecer en la próxima visita.
    }
  }

  async function instalar() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDescartado(true);
  }

  const mostrarIos = modo === "ios";
  const visible = !descartado && (mostrarIos || deferred !== null);
  if (!visible) return null;

  return (
    <div
      className={cn(
        "surface-card flex animate-fade-up items-start gap-3 rounded-xl p-4",
        className
      )}
    >
      <span className="brand-gradient flex size-9 shrink-0 items-center justify-center rounded-lg text-[#0a0a0a]">
        <Download className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Instalala en tu teléfono</p>

        {mostrarIos ? (
          <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            Tocá <Share className="inline size-3.5" /> Compartir y después
            <SquarePlus className="inline size-3.5" /> Agregar a inicio.
          </p>
        ) : (
          <>
            <p className="mt-1 text-xs text-muted-foreground">
              Se abre como una app, a pantalla completa y desde tu inicio.
            </p>
            <Button size="sm" onClick={instalar} className="mt-2.5">
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
