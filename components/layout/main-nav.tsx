"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CalendarRange,
  ListFilter,
  Repeat,
  Settings,
  Sun,
  Tag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Los tres períodos van juntos en el grupo principal. */
  primary?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/hoy", label: "Hoy", icon: Sun, primary: true },
  { href: "/mes", label: "Mes", icon: CalendarDays, primary: true },
  { href: "/anio", label: "Año", icon: CalendarRange, primary: true },
  { href: "/movimientos", label: "Movimientos", icon: ListFilter },
  { href: "/fijos", label: "Fijos y cuotas", icon: Repeat },
  { href: "/categorias", label: "Categorías", icon: Tag },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

export function MainNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones"
      className={cn("no-scrollbar -mx-4 overflow-x-auto px-4", className)}
    >
      <ul className="flex w-max items-center gap-1">
        {NAV_ITEMS.map((item, index) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex animate-fade-down items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all duration-200",
                  active
                    ? "bg-brand/12 text-brand"
                    : "text-muted-foreground hover:bg-surface-raised hover:text-foreground",
                )}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <Icon className="size-4" />
                {item.label}
                <span
                  className={cn(
                    "absolute inset-x-2 -bottom-px h-px origin-left rounded-full bg-brand transition-transform duration-300",
                    active ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
