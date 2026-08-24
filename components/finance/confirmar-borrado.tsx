"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmarBorradoProps {
  abierto: boolean;
  onOpenChange: (abierto: boolean) => void;
  /** Qué se va a borrar, con el dato adentro: "este movimiento de $ 12.500". */
  que: string;
  /** Qué más se pierde, si algo se pierde. Opcional. */
  consecuencia?: React.ReactNode;
  /** Texto del botón que confirma. Dice la acción, nunca "Aceptar". */
  etiqueta?: string;
  onConfirmar: () => void;
}

/**
 * Confirmación única para todo lo que no se puede deshacer.
 *
 * Sigue la fórmula de `docs/ux/02-voz-y-tono.md`: qué se va a borrar (concreto,
 * con el dato adentro), qué más se pierde, y que no hay vuelta atrás. El botón
 * dice la acción.
 *
 * Va por encima de la hoja que la disparó, que es la única superposición
 * permitida (`docs/ux/04-navegacion.md`): no se apilan dos hojas.
 */
export function ConfirmarBorrado({
  abierto,
  onOpenChange,
  que,
  consecuencia,
  etiqueta = "Sí, borrar",
  onConfirmar,
}: ConfirmarBorradoProps) {
  return (
    <AlertDialog open={abierto} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Vas a borrar {que}</AlertDialogTitle>
          <AlertDialogDescription>
            {consecuencia ? <>{consecuencia} </> : null}
            No se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          {/*
            Cancelar va primero en el DOM para que sea lo que recibe el foco, y
            en el teléfono queda abajo de todo (`flex-col-reverse`): el botón
            que borra no cae justo donde venía el dedo.
          */}
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              onConfirmar();
              onOpenChange(false);
            }}
          >
            {etiqueta}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
