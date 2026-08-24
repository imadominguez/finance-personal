"use client";

import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Evita perder lo cargado al cerrar una hoja sin querer.
 *
 * En el teléfono cerrar de más es un gesto de un dedo —tocar fuera de la hoja—
 * y pasa todo el tiempo. Sin esto, lo escrito se descarta en silencio.
 *
 * Solo intercepta los cierres implícitos: tocar afuera, `Esc`, la cruz.
 * "Cancelar" es una decisión explícita de descartar y sigue de largo.
 */
export function useCierreConCambios(onOpenChange: (abierto: boolean) => void) {
  const [hayCambios, setHayCambios] = React.useState(false);
  const [preguntando, setPreguntando] = React.useState(false);

  const alCambiarApertura = React.useCallback(
    (abierto: boolean) => {
      if (!abierto && hayCambios) {
        setPreguntando(true);
        return;
      }
      onOpenChange(abierto);
    },
    [hayCambios, onOpenChange],
  );

  /**
   * Se le pasa al `<form>`. Detecta que se tocó algo sin tener que enganchar
   * cada `onChange`: lo escrito dispara `input`, y los selectores de tipo,
   * categoría, color e ícono son controles con `aria-pressed`.
   */
  const propsDelFormulario = React.useMemo(
    () => ({
      onInput: () => setHayCambios(true),
      onClickCapture: (evento: React.MouseEvent) => {
        if ((evento.target as HTMLElement).closest("[aria-pressed]")) {
          setHayCambios(true);
        }
      },
    }),
    [],
  );

  const confirmacion = (
    <ConfirmarSalida
      abierto={preguntando}
      onOpenChange={setPreguntando}
      onSalir={() => {
        setPreguntando(false);
        setHayCambios(false);
        onOpenChange(false);
      }}
    />
  );

  return { alCambiarApertura, propsDelFormulario, confirmacion };
}

function ConfirmarSalida({
  abierto,
  onOpenChange,
  onSalir,
}: {
  abierto: boolean;
  onOpenChange: (abierto: boolean) => void;
  onSalir: () => void;
}) {
  return (
    <AlertDialog open={abierto} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Tenés cambios sin guardar</AlertDialogTitle>
          <AlertDialogDescription>
            Si salís ahora se pierde lo que cargaste.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Seguir editando</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onSalir}>
            Salir sin guardar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
