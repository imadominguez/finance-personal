import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Piezas de la landing.
 *
 * Las apariciones se manejan con las clases `revelar` / `revelar-hijos` de
 * globals.css, que se enganchan al scroll. Antes usaban animaciones con delay
 * fijo que arrancaban al cargar la página: para cuando bajabas, todo lo de
 * abajo del fold ya había terminado de animarse y aparecía quieto.
 */

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
  /** Capa de fondo que se desplaza a otra velocidad: el efecto de profundidad. */
  parallax?: "lento" | "contrario" | "ninguno";
  /** Línea de separación arriba, para darle ritmo a la página. */
  separador?: boolean;
}

export function Section({
  id,
  eyebrow,
  title,
  description,
  className,
  children,
  parallax = "ninguno",
  separador = true,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative isolate mx-auto w-full max-w-5xl scroll-mt-24 px-4 py-20 sm:py-24",
        className,
      )}
    >
      {separador ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-hairline to-transparent"
        />
      ) : null}

      {parallax !== "ninguno" ? (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[420px] w-[620px] rounded-full blur-3xl",
            parallax === "lento"
              ? "parallax-lento bg-brand/12"
              : "parallax-contrario bg-brand/8",
          )}
          // Sin soporte de animaciones de scroll queda quieta y centrada.
          style={{ transform: "translate3d(-50%, 0, 0)" }}
        />
      ) : null}

      <header className="revelar max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-medium tracking-widest text-brand uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </header>

      {children ? <div className="mt-10">{children}</div> : null}
    </section>
  );
}

export function FeatureCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group surface-card relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_16px_40px_-20px_rgba(232,93,36,0.6)] motion-reduce:hover:translate-y-0">
      {/* Brillo que asoma al pasar el mouse, para que la tarjeta responda */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-brand/15 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      />
      <span className="relative flex size-10 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-brand transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100">
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <h3 className="relative mt-4 font-heading text-base font-semibold">
        {title}
      </h3>
      <p className="relative mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

/**
 * Lista de pasos con una línea que se va dibujando a medida que bajás.
 * Los pasos van dentro; la línea vive en el contenedor.
 */
export function Steps({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="trazo-vertical absolute top-5 bottom-5 left-5 w-px bg-gradient-to-b from-brand via-brand/40 to-transparent"
      />
      <ol className="revelar-hijos relative flex flex-col gap-9 sm:gap-11">
        {children}
      </ol>
    </div>
  );
}

export function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="relative pl-16">
      <span className="brand-gradient absolute top-0 left-0 flex size-10 items-center justify-center rounded-xl font-heading text-base font-bold text-[#0a0a0a] shadow-[0_8px_24px_-10px_rgba(232,93,36,0.9)]">
        {number}
      </span>
      <h3 className="font-heading text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted-foreground">
        {children}
      </p>
    </li>
  );
}

export function Faq({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group surface-card rounded-xl px-5 py-4 transition-colors duration-200 hover:border-brand/30 open:border-brand/25">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
        {question}
        <span className="relative size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-45 group-open:text-brand">
          <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
          <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-current" />
        </span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-pretty text-muted-foreground">
        {children}
      </p>
    </details>
  );
}
