"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CalendarRange,
  LayoutGrid,
  ListFilter,
  Repeat,
  Settings,
  Sun,
  Tag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Una línea que dice para qué sirve. Solo se usa en el panel de secciones. */
  descripcion?: string;
}

/**
 * Las tres vistas de período: el corazón de la app y lo que se mira todos los
 * días. Van siempre a la vista, sin scroll ni menú de por medio.
 */
export const NAV_PRINCIPAL: NavItem[] = [
  { href: "/hoy", label: "Hoy", icon: Sun },
  { href: "/mes", label: "Mes", icon: CalendarDays },
  { href: "/anio", label: "Año", icon: CalendarRange },
];

/**
 * El resto: se entra cada tanto, a hacer algo puntual. Viven detrás de un
 * acceso único para no empujar a las tres de arriba fuera de la pantalla.
 */
export const NAV_SECUNDARIO: NavItem[] = [
  {
    href: "/movimientos",
    label: "Movimientos",
    icon: ListFilter,
    descripcion: "Todo lo cargado, con búsqueda y filtros",
  },
  {
    href: "/fijos",
    label: "Fijos y cuotas",
    icon: Repeat,
    descripcion: "Lo que se repite todos los meses",
  },
  {
    href: "/categorias",
    label: "Categorías",
    icon: Tag,
    descripcion: "En qué se clasifica tu plata",
  },
  {
    href: "/ajustes",
    label: "Ajustes",
    icon: Settings,
    descripcion: "Presupuesto, moneda, dólar y apariencia",
  },
];

export const NAV_ITEMS: NavItem[] = [...NAV_PRINCIPAL, ...NAV_SECUNDARIO];

/**
 * Navegación principal.
 *
 * Siete secciones no entran en una fila en un teléfono, y el marco de la app
 * está limitado a 768 px también en escritorio: no hay ancho en el que entren
 * cómodas. Antes la fila se scrolleaba de costado y lo que quedaba afuera no
 * existía, sin ninguna señal de que estaba ahí.
 *
 * Ahora se ven las tres de período más un botón "Más" que abre el resto. Mismo
 * comportamiento en todos los tamaños: el gesto se aprende una sola vez.
 */
export function MainNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const [panelAbierto, setPanelAbierto] = React.useState(false);

  const enUnaSecundaria = NAV_SECUNDARIO.some((item) => item.href === pathname);

  return (
    <>
      <nav aria-label="Secciones" className={cn("-mx-1", className)}>
        <ul className="flex items-center gap-1">
          {NAV_PRINCIPAL.map((item, index) => (
            <li key={item.href} className="min-w-0 flex-1 sm:flex-none">
              <NavTab
                item={item}
                activo={pathname === item.href}
                retraso={index * 40}
              />
            </li>
          ))}

          <li className="min-w-0 flex-1 sm:flex-none">
            <button
              type="button"
              onClick={() => setPanelAbierto(true)}
              aria-haspopup="dialog"
              aria-expanded={panelAbierto}
              /*
               * Se marca cuando estás en una de las secciones que agrupa: si no,
               * al entrar a Movimientos no habría nada indicando dónde estás.
               */
              aria-current={enUnaSecundaria ? "page" : undefined}
              className={cn(claseDeTab, colorDeTab(enUnaSecundaria))}
              style={{ animationDelay: "120ms" }}
            >
              <LayoutGrid className="size-4 shrink-0" />
              <span className="truncate">Más</span>
              <Subrayado activo={enUnaSecundaria} />
            </button>
          </li>
        </ul>
      </nav>

      <Dialog open={panelAbierto} onOpenChange={setPanelAbierto}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Más secciones</DialogTitle>
            <DialogDescription>
              Lo que no se mira todos los días.
            </DialogDescription>
          </DialogHeader>

          <ul className="flex flex-col gap-1">
            {NAV_SECUNDARIO.map((item) => {
              const activo = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setPanelAbierto(false)}
                    aria-current={activo ? "page" : undefined}
                    className={cn(
                      "flex min-h-14 items-center gap-3 rounded-xl border px-3 py-2 transition-colors duration-200",
                      activo
                        ? "border-brand/40 bg-brand/10"
                        : "border-hairline bg-surface-raised hover:border-border",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        activo
                          ? "bg-brand/15 text-brand"
                          : "bg-surface text-muted-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block truncate text-sm font-medium",
                          activo ? "text-brand" : "text-foreground",
                        )}
                      >
                        {item.label}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.descripcion}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* -------------------------------------------------------------------------- */

const claseDeTab =
  "relative flex h-11 w-full animate-fade-down items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-medium transition-all duration-200 sm:h-8 sm:w-auto sm:px-3";

function colorDeTab(activo: boolean): string {
  return activo
    ? "bg-brand/12 text-brand-realce"
    : "text-muted-foreground hover:bg-surface-raised hover:text-foreground";
}

function NavTab({
  item,
  activo,
  retraso,
}: {
  item: NavItem;
  activo: boolean;
  retraso: number;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={activo ? "page" : undefined}
      className={cn(claseDeTab, colorDeTab(activo))}
      style={{ animationDelay: `${retraso}ms` }}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{item.label}</span>
      <Subrayado activo={activo} />
    </Link>
  );
}

function Subrayado({ activo }: { activo: boolean }) {
  return (
    <span
      className={cn(
        "absolute inset-x-2 -bottom-px h-px origin-left rounded-full bg-brand transition-transform duration-300",
        activo ? "scale-x-100" : "scale-x-0",
      )}
    />
  );
}
