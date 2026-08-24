"use client";

import Link from "next/link";

import { useFinanceReady } from "@/components/providers/finance-provider";
import { formatMoney, formatoDeCuenta } from "@/lib/format";

/**
 * Aviso de que lo que se está viendo no son pesos.
 *
 * Los montos ya se muestran como "US$ 858,52", pero el símbolo solo se nota si
 * uno lo está buscando. Esta chapita dice además con qué dólar se convirtió,
 * que es la parte que cambia el número, y lleva a Ajustes para cambiarlo.
 *
 * No aparece cuando se ve en la moneda de la cuenta: no hay nada que aclarar.
 */
export function DolarBadge({ className }: { className?: string }) {
  const { state, cotizacion } = useFinanceReady();

  if (!cotizacion) return null;

  const valor = formatMoney(cotizacion.venta, formatoDeCuenta(state.settings));

  return (
    <Link
      href="/ajustes"
      title={`Mostrando todo en dólar ${cotizacion.nombre}. US$ 1 = ${valor}`}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-brand/40 bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand transition-colors duration-200 hover:bg-brand/20 ${className ?? ""}`}
    >
      <span className="font-semibold">US$</span>
      <span className="max-w-24 truncate">
        {cotizacion.nombre.toLowerCase()}
      </span>
    </Link>
  );
}
