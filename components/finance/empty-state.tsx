"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "surface-card flex animate-fade-up flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex size-14 animate-float items-center justify-center rounded-2xl border border-brand/25 bg-brand/10 text-brand">
        <Icon className="size-6" />
      </span>
      <h3 className="font-heading text-base font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
