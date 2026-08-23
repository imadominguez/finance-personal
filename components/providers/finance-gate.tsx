"use client";

import * as React from "react";

import { useFinance } from "@/components/providers/finance-provider";

/**
 * Bloquea el render hasta que el estado se leyó de localStorage.
 * El servidor no puede conocer esos datos, así que mostrar un esqueleto evita
 * un desajuste de hidratación y el parpadeo de "todo en cero".
 */
export function FinanceGate({ children }: { children: React.ReactNode }) {
  const finance = useFinance();

  if (!finance?.ready) return <FinanceSkeleton />;

  return <>{children}</>;
}

function FinanceSkeleton() {
  return (
    <div
      className="flex animate-fade-in flex-col gap-4"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Cargando tus datos…</span>
      <div className="skeleton-shimmer h-44 animate-shimmer rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="skeleton-shimmer h-24 animate-shimmer rounded-xl"
            style={{ animationDelay: `${index * 120}ms` }}
          />
        ))}
      </div>
      <div className="skeleton-shimmer h-72 animate-shimmer rounded-2xl" />
    </div>
  );
}
