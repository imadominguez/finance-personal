"use client";

import * as React from "react";
import { Check, Download, MonitorDown, Share, SquarePlus } from "lucide-react";

import { useInstall, type Plataforma } from "@/components/pwa/install-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { APP_NAME } from "@/lib/constants";

/**
 * Botón para instalar la app.
 *
 * Cuando el navegador ofrece el instalador nativo (Chrome, Edge, Android) se
 * abre directo. Cuando no —Safari en iOS no implementa `beforeinstallprompt`, y
 * en escritorio el evento a veces no llega— se muestran los pasos concretos de
 * esa plataforma, que es mejor que un botón que no hace nada.
 */
export function InstallButton({
  className,
  variant = "default",
  size = "lg",
  label = "Instalar la app",
}: {
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  label?: string;
}) {
  const { puedeInstalar, instalada, plataforma, instalar } = useInstall();
  const [ayudaAbierta, setAyudaAbierta] = React.useState(false);

  if (instalada) {
    return (
      <p className={className}>
        <span className="inline-flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          <Check className="size-4" />
          Ya la tenés instalada
        </span>
      </p>
    );
  }

  async function alTocar() {
    if (puedeInstalar) {
      const aceptó = await instalar();
      // Si la rechazó, no se insiste: cerró el instalador a propósito.
      if (aceptó) return;
      return;
    }
    setAyudaAbierta(true);
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={alTocar}
        className={className}
      >
        {plataforma === "escritorio" ? <MonitorDown /> : <Download />}
        {label}
      </Button>

      <Dialog open={ayudaAbierta} onOpenChange={setAyudaAbierta}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cómo instalar {APP_NAME}</DialogTitle>
            <DialogDescription>
              Tu navegador no ofrece el instalador automático, pero se puede
              agregar a mano en unos toques.
            </DialogDescription>
          </DialogHeader>

          <Pasos plataforma={plataforma} />

          <p className="text-xs text-muted-foreground">
            Una vez instalada se abre a pantalla completa, sin la barra del
            navegador, y queda con su ícono junto al resto de tus apps.
          </p>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setAyudaAbierta(false)}>
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Pasos({ plataforma }: { plataforma: Plataforma }) {
  const pasos: React.ReactNode[] =
    plataforma === "ios"
      ? [
          <>
            Abrí este sitio en <strong>Safari</strong> (desde otro navegador iOS
            no se puede instalar).
          </>,
          <>
            Tocá <Share className="inline size-4 align-text-bottom" />{" "}
            <strong>Compartir</strong>, abajo en el centro.
          </>,
          <>
            Elegí <SquarePlus className="inline size-4 align-text-bottom" />{" "}
            <strong>Agregar a inicio</strong> y confirmá.
          </>,
        ]
      : plataforma === "android"
        ? [
            <>
              Abrí el menú <strong>⋮</strong> arriba a la derecha.
            </>,
            <>
              Tocá <strong>Instalar app</strong> o{" "}
              <strong>Agregar a pantalla principal</strong>.
            </>,
          ]
        : [
            <>
              Buscá el ícono{" "}
              <MonitorDown className="inline size-4 align-text-bottom" /> de
              instalar, al final de la barra de direcciones.
            </>,
            <>
              Si no aparece, abrí el menú <strong>⋮</strong> y elegí{" "}
              <strong>Instalar {APP_NAME}</strong>.
            </>,
            <>
              En Firefox y en algunos navegadores la instalación no está
              disponible: probá con Chrome o Edge.
            </>,
          ];

  return (
    <ol className="flex flex-col gap-3">
      {pasos.map((paso, index) => (
        <li key={index} className="flex gap-3">
          <span className="brand-gradient flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold text-primary-foreground">
            {index + 1}
          </span>
          <span className="text-sm leading-relaxed text-muted-foreground">
            {paso}
          </span>
        </li>
      ))}
    </ol>
  );
}
