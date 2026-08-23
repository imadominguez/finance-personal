import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function Section({
  id,
  eyebrow,
  title,
  description,
  className,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "mx-auto w-full max-w-5xl scroll-mt-20 px-4 py-16",
        className,
      )}
    >
      <header className="max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-medium tracking-widest text-brand uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
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
  delay = 0,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      className="surface-card group animate-fade-up rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_16px_40px_-20px_rgba(232,93,36,0.6)] motion-reduce:hover:translate-y-0"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="flex size-10 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-brand transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100">
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <h3 className="mt-4 font-heading text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

export function Step({
  number,
  title,
  children,
  delay = 0,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <li
      className="relative animate-fade-up pl-14"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="brand-gradient absolute left-0 top-0 flex size-10 items-center justify-center rounded-xl font-heading text-base font-bold text-[#0a0a0a]">
        {number}
      </span>
      <h3 className="font-heading text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {children}
      </p>
    </li>
  );
}

export function Faq({
  question,
  children,
  delay = 0,
}: {
  question: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <details
      className="group surface-card animate-fade-up rounded-xl px-5 py-4 transition-colors duration-200 hover:border-brand/30"
      style={{ animationDelay: `${delay}ms` }}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
        {question}
        <span className="relative size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-45">
          <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
          <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-current" />
        </span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </p>
    </details>
  );
}
