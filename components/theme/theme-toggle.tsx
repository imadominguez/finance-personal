"use client";

import { Moon, Sun } from "lucide-react";

import { useTema } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";

/**
 * Cambio rápido entre claro y oscuro.
 *
 * Fija el modo de forma explícita (no deja "sistema"): quien toca esto quiere
 * ese modo ahora, en este dispositivo. Seguir al sistema se elige en Ajustes.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { oscuro, cambiar } = useTema();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      aria-label={oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={oscuro ? "Modo claro" : "Modo oscuro"}
      onClick={() => cambiar({ modo: oscuro ? "claro" : "oscuro" })}
    >
      {oscuro ? <Sun /> : <Moon />}
    </Button>
  );
}
