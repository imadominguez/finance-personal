"use client";

import * as React from "react";
import { ListFilter, Search, X } from "lucide-react";

import { EntryList } from "@/components/finance/entry-list";
import { EmptyState } from "@/components/finance/empty-state";
import { Money } from "@/components/finance/money";
import { SectionCard } from "@/components/finance/section-card";
import { useFinanceReady } from "@/components/providers/finance-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { currentYear, todayKey } from "@/lib/date";
import { getEntriesInRange } from "@/lib/finance";
import type { MovementKind } from "@/lib/types";

type KindFilter = MovementKind | "todos";

/** Historial completo con filtros. Incluye fijos y cuotas proyectados. */
export function MovimientosView() {
  const { state, moneyFormat } = useFinanceReady();

  const [search, setSearch] = React.useState("");
  const [kind, setKind] = React.useState<KindFilter>("todos");
  const [categoryId, setCategoryId] = React.useState("todas");
  const [from, setFrom] = React.useState(`${currentYear()}-01-01`);
  const [to, setTo] = React.useState(todayKey());

  const entries = React.useMemo(() => {
    if (from > to) return [];
    return getEntriesInRange(state, { from, to });
  }, [state, from, to]);

  const filtered = React.useMemo(() => {
    const needle = search.trim().toLowerCase();

    return entries.filter((entry) => {
      if (kind !== "todos" && entry.kind !== kind) return false;
      if (categoryId !== "todas" && entry.categoryId !== categoryId)
        return false;
      if (needle && !entry.description.toLowerCase().includes(needle))
        return false;
      return true;
    });
  }, [entries, kind, categoryId, search]);

  const totals = React.useMemo(
    () =>
      filtered.reduce(
        (accumulator, entry) => {
          if (entry.kind === "gasto") accumulator.gastos += entry.amount;
          else accumulator.ingresos += entry.amount;
          return accumulator;
        },
        { gastos: 0, ingresos: 0 },
      ),
    [filtered],
  );

  const hasFilters =
    search !== "" || kind !== "todos" || categoryId !== "todas";

  function resetFilters() {
    setSearch("");
    setKind("todos");
    setCategoryId("todas");
    setFrom(`${currentYear()}-01-01`);
    setTo(todayKey());
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="animate-fade-up">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Movimientos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Todo lo que registraste, más los fijos y cuotas del período.
        </p>
      </header>

      <SectionCard title="Filtros" delay={60}>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por descripción…"
              className="h-9 pl-8"
              aria-label="Buscar movimientos"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Limpiar búsqueda"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kind">Tipo</Label>
              <NativeSelect
                id="kind"
                className="w-full"
                value={kind}
                onChange={(event) => setKind(event.target.value as KindFilter)}
              >
                <NativeSelectOption value="todos">Todos</NativeSelectOption>
                <NativeSelectOption value="gasto">
                  Solo gastos
                </NativeSelectOption>
                <NativeSelectOption value="ingreso">
                  Solo ingresos
                </NativeSelectOption>
              </NativeSelect>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Categoría</Label>
              <NativeSelect
                id="category"
                className="w-full"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
              >
                <NativeSelectOption value="todas">Todas</NativeSelectOption>
                {state.categories.map((category) => (
                  <NativeSelectOption key={category.id} value={category.id}>
                    {category.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="from">Desde</Label>
              <Input
                id="from"
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="to">Hasta</Label>
              <Input
                id="to"
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
              />
            </div>
          </div>

          {hasFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="animate-fade-in self-start"
            >
              <X />
              Limpiar filtros
            </Button>
          ) : null}
        </div>
      </SectionCard>

      <div className="grid grid-cols-3 gap-3">
        <SummaryTile
          label="Movimientos"
          delay={100}
          value={<span className="tabular">{filtered.length}</span>}
        />
        <SummaryTile
          label="Gastos"
          delay={140}
          value={
            <Money
              value={totals.gastos}
              settings={moneyFormat}
              compact
              className="text-brand"
            />
          }
        />
        <SummaryTile
          label="Ingresos"
          delay={180}
          value={
            <Money
              value={totals.ingresos}
              settings={moneyFormat}
              compact
              className="text-success"
            />
          }
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ListFilter}
          title="Sin resultados"
          description="Probá ampliar el rango de fechas o quitar algún filtro."
          action={
            hasFilters ? (
              <Button variant="outline" onClick={resetFilters}>
                Limpiar filtros
              </Button>
            ) : null
          }
        />
      ) : (
        <SectionCard title="Historial" delay={220}>
          <EntryList entries={filtered} />
        </SectionCard>
      )}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  delay,
}: {
  label: string;
  value: React.ReactNode;
  delay: number;
}) {
  return (
    <div
      className="surface-card animate-fade-up rounded-xl p-3 text-center"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
