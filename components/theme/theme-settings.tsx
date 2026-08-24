"use client";

import * as React from "react";
import { Monitor, Moon, RotateCcw, Sun } from "lucide-react";

import { useTema } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import {
  ACENTO_PERSONALIZADO,
  ACENTOS,
  coloresDeAcento,
  esTemaPorDefecto,
  RADIOS,
  TEMA_POR_DEFECTO,
  type Modo,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const MODOS_UI: { id: Modo; nombre: string; icono: typeof Sun }[] = [
  { id: "claro", nombre: "Claro", icono: Sun },
  { id: "oscuro", nombre: "Oscuro", icono: Moon },
  { id: "sistema", nombre: "El del sistema", icono: Monitor },
];

/**
 * Controles de apariencia.
 *
 * No hay vista previa aparte: los cambios se aplican en el acto sobre las
 * variables de `<html>`, así que la pantalla entera —el encabezado, los
 * montos, los botones— es la vista previa.
 */
export function ThemeSettings() {
  const { tema, oscuro, cambiar, restaurar } = useTema();
  const colores = coloresDeAcento(tema);
  const colorActual = oscuro ? colores.oscuro : colores.claro;

  return (
    <div className="flex flex-col gap-5">
      <div
        role="group"
        aria-labelledby="tema-modo"
        className="flex flex-col gap-2"
      >
        <span id="tema-modo" className="text-sm leading-none font-medium">
          Modo
        </span>
        <div className="grid grid-cols-3 gap-1 rounded-xl border border-hairline bg-surface-raised p-1">
          {MODOS_UI.map(({ id, nombre, icono: Icono }) => (
            <button
              key={id}
              type="button"
              onClick={() => cambiar({ modo: id })}
              aria-pressed={tema.modo === id}
              className={cn(
                "flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 sm:min-h-9",
                tema.modo === id
                  ? "bg-brand text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icono className="size-4 shrink-0" />
              <span className="truncate">{nombre}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {tema.modo === "sistema"
            ? `Ahora tu sistema está en ${oscuro ? "oscuro" : "claro"}.`
            : "Vale solo para vos: no cambia cómo lo ve nadie más."}
        </p>
      </div>

      <div
        role="group"
        aria-labelledby="tema-color"
        className="flex flex-col gap-2"
      >
        <span id="tema-color" className="text-sm leading-none font-medium">
          Color
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {ACENTOS.map((acento) => (
            <button
              key={acento.id}
              type="button"
              onClick={() => cambiar({ acento: acento.id })}
              aria-label={acento.nombre}
              aria-pressed={tema.acento === acento.id}
              title={acento.nombre}
              className={cn(
                "relative size-8 rounded-full border-2 transition-transform duration-200 after:absolute after:-inset-1.5 after:content-[''] hover:scale-110 motion-reduce:hover:scale-100 sm:after:content-none",
                tema.acento === acento.id
                  ? "scale-110 border-foreground"
                  : "border-transparent",
              )}
              style={{ backgroundColor: oscuro ? acento.oscuro : acento.claro }}
            />
          ))}

          <ColorPropio />
        </div>
        <p className="text-xs text-muted-foreground">
          Si elegís uno a mano, se oscurece o se aclara lo justo para que los
          montos se sigan leyendo sobre el fondo.
        </p>
      </div>

      <div
        role="group"
        aria-labelledby="tema-bordes"
        className="flex flex-col gap-2"
      >
        <span id="tema-bordes" className="text-sm leading-none font-medium">
          Bordes
        </span>
        <div className="grid grid-cols-4 gap-1 rounded-xl border border-hairline bg-surface-raised p-1">
          {RADIOS.map((radio) => (
            <button
              key={radio.id}
              type="button"
              onClick={() => cambiar({ radio: radio.id })}
              aria-pressed={tema.radio === radio.id}
              className={cn(
                "flex min-h-11 flex-col items-center justify-center gap-1.5 rounded-lg px-1 py-2 text-xs font-medium transition-all duration-200 sm:min-h-0",
                tema.radio === radio.id
                  ? "bg-brand text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                aria-hidden
                className="size-5 border-2 border-current"
                style={{ borderRadius: radio.valor }}
              />
              {radio.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          onClick={restaurar}
          disabled={esTemaPorDefecto(tema)}
        >
          <RotateCcw />
          Volver al original
        </Button>
        <span className="text-xs text-muted-foreground">
          Se guarda en tu cuenta, así lo ves igual en el teléfono.
        </span>
      </div>

      <p className="sr-only" aria-live="polite">
        {`Modo ${tema.modo}, color ${colorActual}, bordes ${tema.radio}.`}
      </p>
    </div>
  );
}

/**
 * Selector libre de color.
 *
 * El `<input type="color">` va encima del círculo y transparente: así se ve el
 * color elegido y el clic abre el selector nativo del sistema, que en el
 * teléfono es mucho mejor que cualquier rueda hecha a mano.
 */
function ColorPropio() {
  const { tema, oscuro, cambiar } = useTema();
  const elegido = tema.acento === ACENTO_PERSONALIZADO;
  const colores = coloresDeAcento(tema);

  return (
    <label
      title="Elegir un color"
      className={cn(
        "relative size-8 cursor-pointer rounded-full border-2 transition-transform duration-200 after:absolute after:-inset-1.5 after:content-[''] hover:scale-110 motion-reduce:hover:scale-100 sm:after:content-none",
        elegido ? "scale-110 border-foreground" : "border-transparent",
      )}
      style={{
        // Rueda de color: se ve que acá se elige, sin necesidad de un ícono.
        backgroundImage: elegido
          ? "none"
          : "conic-gradient(#ef4444, #f59e0b, #22c55e, #22d3ee, #3b82f6, #a855f7, #ef4444)",
        backgroundColor: elegido
          ? oscuro
            ? colores.oscuro
            : colores.claro
          : undefined,
      }}
    >
      <span className="sr-only">Elegir un color a tu gusto</span>
      <input
        type="color"
        value={tema.color || TEMA_POR_DEFECTO.color}
        onChange={(evento) =>
          cambiar({ acento: ACENTO_PERSONALIZADO, color: evento.target.value })
        }
        className="absolute inset-0 size-full cursor-pointer opacity-0"
      />
    </label>
  );
}
