"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PeriodStepperProps {
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  /** Deshabilita "siguiente" cuando ya estás en el período actual. */
  nextDisabled?: boolean;
  onReset?: () => void;
  resetLabel?: string;
  className?: string;
}

/** Selector "‹ Agosto 2026 ›" usado en las vistas de mes y año. */
export function PeriodStepper({
  label,
  onPrevious,
  onNext,
  nextDisabled,
  onReset,
  resetLabel = "Hoy",
  className,
}: PeriodStepperProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-xl border border-hairline bg-surface-raised p-1",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Período anterior"
        onClick={onPrevious}
        className="transition-transform duration-200 hover:-translate-x-0.5 motion-reduce:hover:translate-x-0"
      >
        <ChevronLeft />
      </Button>

      <span className="min-w-28 text-center text-sm font-medium tabular">
        {label}
      </span>

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Período siguiente"
        onClick={onNext}
        disabled={nextDisabled}
        className="transition-transform duration-200 hover:translate-x-0.5 motion-reduce:hover:translate-x-0"
      >
        <ChevronRight />
      </Button>

      {onReset && !nextDisabled ? (
        <Button variant="ghost" size="xs" onClick={onReset} className="ml-1">
          {resetLabel}
        </Button>
      ) : null}
    </div>
  );
}
