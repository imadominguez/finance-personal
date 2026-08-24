"use client";

import * as React from "react";
import {
  ChevronDown,
  ListFilter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { EntryList } from "@/components/finance/entry-list";
import { EmptyState } from "@/components/finance/empty-state";
import { cn } from "@/lib/utils";
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
  /*
   * En el teléfono los filtros arrancan cerrados: desplegados se comen la
   * pantalla entera y hay que scrollear un rato antes de ver un movimiento,
   * que es justo lo que se vino a ver. De `sm:` para arriba hay lugar de
   * sobra y se muestran siempre.
   */
  const [filtrosAbiertos, setFiltrosAbiertos] = React.useState(false);
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

  /** Solo los del panel: la búsqueda se ve siempre, no hace falta contarla. */
  const filtrosPuestos =
    (kind !== "todos" ? 1 : 0) + (categoryId !== "todas" ? 1 : 0);

  function resetFilters() {
    setSearch("");
    setKind("todos");
    setCategoryId("todas");
    setFrom(`${currentYear()}-01-01`);
    setTo(todayKey());
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <header className="animate-fade-up">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Movimientos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Todo lo que registraste, más los fijos y cuotas del período.
        </p>
      </header>

      {/*
        Con lugar, los filtros se van a una columna angosta y fija al costado:
        se ven puestos mientras se mira la lista, sin ocupar el lugar de los
        movimientos. En anchos chicos siguen plegados arriba.
      */}
      <div className="grid gap-4 lg:grid-cols-[19rem_1fr] lg:items-start">
        <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-32">
          <SectionCard title="Filtros" delay={60}>
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por descripción…"
                  className="pl-8 sm:h-9"
                  aria-label="Buscar movimientos"
                />
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Limpiar búsqueda"
                    className="absolute top-1/2 right-1 -translate-y-1/2 flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground sm:right-2 sm:size-7"
                  >
                    <X className="size-3.5" />
                  </button>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => setFiltrosAbiertos((abierto) => !abierto)}
                aria-expanded={filtrosAbiertos}
                aria-controls="filtros-avanzados"
                className="flex min-h-11 items-center justify-between gap-2 rounded-lg border border-hairline bg-surface-raised px-3 text-sm font-medium transition-colors hover:text-brand sm:hidden"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4" />
                  Filtros
                  {filtrosPuestos > 0 ? (
                    <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs text-brand">
                      {filtrosPuestos}
                    </span>
                  ) : null}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform duration-200",
                    filtrosAbiertos && "rotate-180",
                  )}
                />
              </button>

              <div
                id="filtros-avanzados"
                className={cn(
                  "grid gap-3 sm:grid-cols-2",
                  !filtrosAbiertos && "hidden sm:grid",
                )}
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="kind">Tipo</Label>
                  <NativeSelect
                    id="kind"
                    className="w-full"
                    value={kind}
                    onChange={(event) =>
                      setKind(event.target.value as KindFilter)
                    }
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
        </div>

        <div className="flex min-w-0 flex-col gap-4">
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
      </div>
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
