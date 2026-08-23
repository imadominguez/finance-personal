"use client";

import * as React from "react";
import * as icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const iconRegistry = icons as unknown as Record<string, LucideIcon>;

export function resolveIcon(name: string): LucideIcon {
  return iconRegistry[name] ?? icons.MoreHorizontal;
}

interface CategoryIconProps extends React.ComponentProps<"span"> {
  icon: string;
  color: string;
  size?: "sm" | "default" | "lg";
}

const sizes = {
  sm: "size-8 [&_svg]:size-4",
  default: "size-10 [&_svg]:size-[18px]",
  lg: "size-12 [&_svg]:size-5",
} as const;

/** Ícono de categoría dentro de una pastilla teñida con su color. */
export function CategoryIcon({
  icon,
  color,
  size = "default",
  className,
  ...props
}: CategoryIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl border transition-all duration-300",
        sizes[size],
        className,
      )}
      style={{
        color,
        backgroundColor: `color-mix(in oklch, ${color} 14%, transparent)`,
        borderColor: `color-mix(in oklch, ${color} 26%, transparent)`,
      }}
      {...props}
    >
      {/* El ícono se busca en el registro de lucide, no se define acá. */}
      {React.createElement(resolveIcon(icon), { strokeWidth: 1.75 })}
    </span>
  );
}
