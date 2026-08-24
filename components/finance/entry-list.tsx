"use client";

import * as React from "react";
import { CalendarClock, Pencil, Repeat, CreditCard } from "lucide-react";

import { CategoryIcon } from "@/components/finance/category-icon";
import { Money } from "@/components/finance/money";
import { TransactionDialog } from "@/components/finance/transaction-dialog";
import { useFinanceReady } from "@/components/providers/finance-provider";
import { formatRelativeDay } from "@/lib/date";
import { findCategory } from "@/lib/finance";
import { cn } from "@/lib/utils";
import type { Entry } from "@/lib/types";

interface EntryListProps {
  entries: Entry[];
  /** Agrupa por fecha con un encabezado por día. */
  groupByDate?: boolean;
  emptyMessage?: string;
  className?: string;
  maxAnimatedIndex?: number;
}

/** Lista de movimientos. Los manuales se editan tocándolos. */
export function EntryList({
  entries,
  groupByDate = true,
  emptyMessage = "No hay movimientos para mostrar.",
  className,
  maxAnimatedIndex = 14,
}: EntryListProps) {
  const { state, moneyFormat } = useFinanceReady();
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const editing = React.useMemo(
    () =>
      state.transactions.find((transaction) => transaction.id === editingId) ??
      null,
    [state.transactions, editingId],
  );

  if (entries.length === 0) {
    return (
      <p
        className={cn(
          "py-10 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        {emptyMessage}
      </p>
    );
  }

  const groups = groupByDate ? groupEntries(entries) : [{ date: "", entries }];

  // Posición global de cada fila, para escalonar la animación de entrada sin
  // mutar un contador durante el render.
  const orderById = new Map(entries.map((entry, index) => [entry.id, index]));

  return (
    <>
      <div className={cn("flex flex-col gap-5", className)}>
        {groups.map((group) => {
          const dayTotal = group.entries.reduce(
            (sum, entry) =>
              sum + (entry.kind === "gasto" ? entry.amount : -entry.amount),
            0,
          );

          return (
            <section
              key={group.date || "todos"}
              className="flex flex-col gap-1"
            >
              {group.date ? (
                <header className="flex items-baseline justify-between gap-3 px-2 pb-1">
                  <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {formatRelativeDay(group.date)}
                  </h3>
                  <Money
                    value={dayTotal}
                    settings={moneyFormat}
                    className="text-xs tabular text-muted-foreground"
                  />
                </header>
              ) : null}

              <ul className="flex flex-col">
                {group.entries.map((entry) => {
                  const order = orderById.get(entry.id) ?? 0;
                  const category = findCategory(
                    state.categories,
                    entry.categoryId,
                    entry.kind,
                  );
                  const animated = order < maxAnimatedIndex;

                  return (
                    <li
                      key={entry.id}
                      className={cn(
                        "border-b border-hairline/70 last:border-0",
                        animated && "animate-fade-up",
                      )}
                      style={
                        animated
                          ? { animationDelay: `${order * 35}ms` }
                          : undefined
                      }
                    >
                      <EntryRow
                        entry={entry}
                        categoryColor={category.color}
                        categoryIcon={category.icon}
                        categoryName={category.name}
                        onEdit={
                          entry.editable
                            ? () => setEditingId(entry.id)
                            : undefined
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <TransactionDialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditingId(null);
        }}
        transaction={editing}
      />
    </>
  );
}

interface EntryRowProps {
  entry: Entry;
  categoryColor: string;
  categoryIcon: string;
  categoryName: string;
  onEdit?: () => void;
}

function EntryRow({
  entry,
  categoryColor,
  categoryIcon,
  categoryName,
  onEdit,
}: EntryRowProps) {
  const { moneyFormat } = useFinanceReady();
  const isGasto = entry.kind === "gasto";

  const content = (
    <div
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left transition-all duration-200",
        onEdit &&
          "hover:translate-x-1 hover:bg-surface-raised motion-reduce:hover:translate-x-0",
        entry.projected && "opacity-70",
      )}
    >
      <CategoryIcon icon={categoryIcon} color={categoryColor} />

      <div className="min-w-0 flex-1">
        {/*
          En el teléfono la descripción se lleva el renglón entero: es lo que
          identifica al movimiento, y compartiéndolo con los badges quedaba
          cortada en tres letras. Los badges bajan al segundo renglón, al lado
          de la categoría. De `sm:` para arriba entra todo junto.
        */}
        <span className="block truncate text-sm font-medium text-foreground/90 sm:inline">
          {entry.description}
        </span>

        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="truncate">{categoryName}</span>
          {entry.origin === "fijo" ? (
            <OriginBadge icon={Repeat} label="Fijo" />
          ) : null}
          {entry.origin === "cuota" ? (
            <OriginBadge icon={CreditCard} label={entry.badge ?? "Cuota"} />
          ) : null}
          {entry.projected ? (
            <OriginBadge icon={CalendarClock} label="Proyectado" tone="muted" />
          ) : null}
        </div>
      </div>

      <Money
        value={entry.amount}
        settings={moneyFormat}
        className={cn(
          "shrink-0 text-sm font-semibold",
          isGasto ? "text-brand" : "text-success",
        )}
      />

      {onEdit ? (
        <Pencil className="size-3.5 shrink-0 text-transparent transition-colors duration-200 group-hover:text-muted-foreground" />
      ) : (
        <span className="size-3.5 shrink-0" />
      )}
    </div>
  );

  if (!onEdit) return content;

  return (
    <button type="button" onClick={onEdit} className="w-full cursor-pointer">
      {content}
    </button>
  );
}

function OriginBadge({
  icon: Icon,
  label,
  tone = "brand",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone?: "brand" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-px text-[10px] font-medium",
        tone === "brand"
          ? "border-brand/25 bg-brand/10 text-brand"
          : "border-hairline bg-surface-raised text-muted-foreground",
      )}
    >
      <Icon className="size-2.5" />
      {label}
    </span>
  );
}

function groupEntries(entries: Entry[]): { date: string; entries: Entry[] }[] {
  const groups = new Map<string, Entry[]>();
  for (const entry of entries) {
    const bucket = groups.get(entry.date) ?? [];
    bucket.push(entry);
    groups.set(entry.date, bucket);
  }
  return [...groups.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, items]) => ({ date, entries: items }));
}
