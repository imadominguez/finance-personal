"use client";

import * as React from "react";
import { Plus, Tag } from "lucide-react";

import { CategoryDialog } from "@/components/finance/category-dialog";
import { CategoryIcon } from "@/components/finance/category-icon";
import { Money } from "@/components/finance/money";
import { SectionCard } from "@/components/finance/section-card";
import { useFinanceReady } from "@/components/providers/finance-provider";
import { Button } from "@/components/ui/button";
import { currentYear } from "@/lib/date";
import { getPeriodSummary } from "@/lib/finance";
import type { Category, MovementKind } from "@/lib/types";

/** ABM de categorías, con el total del año al lado de cada una. */
export function CategoriasView() {
  const { state } = useFinanceReady();
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [open, setOpen] = React.useState(false);
  const [defaultKind, setDefaultKind] = React.useState<MovementKind>("gasto");

  const year = currentYear();
  const summary = getPeriodSummary(state, { kind: "anio", year });

  const totalsByCategory = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const item of [...summary.byCategory, ...summary.ingresosByCategory]) {
      map.set(item.category.id, item.total);
    }
    return map;
  }, [summary]);

  const expenses = state.categories.filter(
    (category) => category.kind === "gasto",
  );
  const incomes = state.categories.filter(
    (category) => category.kind === "ingreso",
  );

  function openNew(kind: MovementKind) {
    setEditing(null);
    setDefaultKind(kind);
    setOpen(true);
  }

  function renderList(categories: Category[]) {
    return (
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {categories.map((category, index) => (
          <li
            key={category.id}
            className="animate-fade-up"
            style={{ animationDelay: `${index * 35}ms` }}
          >
            <button
              type="button"
              onClick={() => {
                setEditing(category);
                setOpen(true);
              }}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-hairline bg-surface-raised/50 p-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 motion-reduce:hover:translate-y-0"
            >
              <CategoryIcon icon={category.icon} color={category.color} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{category.name}</p>
                <p className="text-xs text-muted-foreground">
                  {totalsByCategory.get(category.id)
                    ? `Este año`
                    : "Sin movimientos"}
                </p>
              </div>
              <Money
                value={totalsByCategory.get(category.id) ?? 0}
                settings={state.settings}
                compact
                className={`shrink-0 text-sm font-semibold ${
                  category.kind === "gasto" ? "text-brand" : "text-success"
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="animate-fade-up">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Categorías
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Los montos son el acumulado de {year}. Tocá una para editarla.
        </p>
      </header>

      <SectionCard
        title="Gastos"
        description={`${expenses.length} categorías`}
        delay={60}
        action={
          <Button size="sm" onClick={() => openNew("gasto")}>
            <Plus />
            Agregar
          </Button>
        }
      >
        {renderList(expenses)}
      </SectionCard>

      <SectionCard
        title="Ingresos"
        description={`${incomes.length} categorías`}
        delay={120}
        action={
          <Button size="sm" onClick={() => openNew("ingreso")}>
            <Plus />
            Agregar
          </Button>
        }
      >
        {renderList(incomes)}
      </SectionCard>

      <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <Tag className="size-3.5" />
        Las categorías base no se pueden borrar, pero sí renombrar y recolorear.
      </p>

      <CategoryDialog
        open={open}
        onOpenChange={setOpen}
        category={editing}
        defaultKind={defaultKind}
      />
    </div>
  );
}
