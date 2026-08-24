"use client";

import { useFinanceReady } from "@/components/providers/finance-provider";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { formatMoney, formatoDeCuenta } from "@/lib/format";
import type { Cotizacion } from "@/lib/types";

/**
 * Elegir en qué dólar ver los montos.
 *
 * Es una forma de mirar, no una conversión de los datos: lo que se guarda
 * sigue siendo en pesos y se divide recién al dibujar. Por eso cambiar de casa
 * —o volver a pesos— no toca ni un movimiento.
 */
export function DolarSettings() {
  const { state, cotizaciones, cotizacion, updateSettings } = useFinanceReady();

  const enPesos = formatoDeCuenta(state.settings);

  if (cotizaciones.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No pudimos traer las cotizaciones ahora mismo. Los montos se muestran en{" "}
        {state.settings.currency}; probá de nuevo en un rato.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dolar">Mostrar los montos en</Label>
        <NativeSelect
          id="dolar"
          className="w-full sm:w-80"
          value={cotizacion?.casa ?? ""}
          onChange={(evento) =>
            updateSettings({ usdCasa: evento.target.value || null })
          }
        >
          <NativeSelectOption value="">
            {state.settings.currency} (sin convertir)
          </NativeSelectOption>
          {cotizaciones.map((item) => (
            <NativeSelectOption key={item.casa} value={item.casa}>
              {`Dólar ${item.nombre} · ${formatMoney(item.venta, enPesos)}`}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      {cotizacion ? (
        <div className="flex flex-col gap-1 rounded-xl border border-hairline bg-surface-raised p-3">
          <p className="text-sm">
            <span className="font-semibold text-brand tabular">
              US$ 1 ={" "}
              {formatMoney(cotizacion.venta, enPesos, { decimals: true })}
            </span>{" "}
            <span className="text-muted-foreground">
              (dólar {cotizacion.nombre.toLowerCase()}, valor de venta)
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            {textoActualizado(cotizacion)}
          </p>
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Es solo para mirar: tus movimientos se siguen cargando y guardando en{" "}
        {state.settings.currency}. Todo se convierte con la cotización de hoy,
        también lo de meses anteriores.
      </p>
    </div>
  );
}

/**
 * Cuándo se actualizó, en hora argentina.
 *
 * Dos decisiones, las dos por el mismo motivo: que el servidor y el navegador
 * escriban exactamente lo mismo.
 *
 *  - La zona va fija. Con la del equipo, cada uno mostraría una hora distinta
 *    y React marcaría desajuste al hidratar. Además es la hora que
 *    corresponde: la cotización es de acá.
 *  - La frase se arma a mano con los números, en vez de dejar que `format()`
 *    la escriba entera. Node y el navegador traen versiones distintas de ICU y
 *    difieren en detalles invisibles —qué tipo de espacio va antes de "a. m.",
 *    por ejemplo—, suficiente para que React lo tome como texto distinto.
 */
function textoActualizado(cotizacion: Cotizacion): string {
  if (!cotizacion.actualizado) return "Sin fecha de actualización.";

  const fecha = new Date(cotizacion.actualizado);
  if (Number.isNaN(fecha.getTime())) return "Sin fecha de actualización.";

  const partes = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Argentina/Buenos_Aires",
  }).formatToParts(fecha);

  const parte = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((item) => item.type === tipo)?.value ?? "";

  const dia = `${parte("day")}/${parte("month")}`;
  const hora = `${parte("hour")}:${parte("minute")}`;

  return `Actualizada el ${dia} a las ${hora} (hora de Argentina).`;
}
