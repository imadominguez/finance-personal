"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface SectionCardProps extends React.ComponentProps<"section"> {
  title: string;
  description?: string;
  action?: React.ReactNode;
  delay?: number;
  contentClassName?: string;
}

/** Tarjeta con encabezado que agrupa una sección del dashboard. */
export function SectionCard({
  title,
  description,
  action,
  delay = 0,
  className,
  contentClassName,
  children,
  ...props
}: SectionCardProps) {
  return (
    <section
      className={cn("surface-card animate-fade-up rounded-2xl p-5", className)}
      style={{ animationDelay: `${delay}ms` }}
      {...props}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-sm font-semibold tracking-wide text-foreground/90 uppercase">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </header>

      <div className={cn("mt-4", contentClassName)}>{children}</div>
    </section>
  );
}
