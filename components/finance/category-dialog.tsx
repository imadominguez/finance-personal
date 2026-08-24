"use client";

import * as React from "react";
import { Check, Trash2 } from "lucide-react";

import { CategoryIcon, resolveIcon } from "@/components/finance/category-icon";
import { useFinanceReady } from "@/components/providers/finance-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category, MovementKind } from "@/lib/types";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  defaultKind?: MovementKind;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  defaultKind = "gasto",
}: CategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <CategoryForm
          key={category?.id ?? `nuevo-${defaultKind}`}
          category={category}
          defaultKind={defaultKind}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function CategoryForm({
  category,
  defaultKind,
  onDone,
}: {
  category?: Category | null;
  defaultKind: MovementKind;
  onDone: () => void;
}) {
  const { addCategory, updateCategory, removeCategory } = useFinanceReady();

  const [name, setName] = React.useState(category?.name ?? "");
  const [kind, setKind] = React.useState<MovementKind>(
    category?.kind ?? defaultKind,
  );
  const [color, setColor] = React.useState(
    category?.color ?? CATEGORY_COLORS[0],
  );
  const [icon, setIcon] = React.useState<string>(
    category?.icon ?? CATEGORY_ICONS[0],
  );
  const [error, setError] = React.useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Poné un nombre.");
      return;
    }

    const draft = { name: name.trim(), kind, color, icon };

    if (category) updateCategory(category.id, draft);
    else addCategory(draft);

    onDone();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {category ? "Editar categoría" : "Nueva categoría"}
        </DialogTitle>
        <DialogDescription>
          Elegí un nombre, un color y un ícono para reconocerla de un vistazo.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-hairline bg-surface-raised p-3">
          <CategoryIcon icon={icon} color={color} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {name || "Sin nombre"}
            </p>
            <p className="text-xs text-muted-foreground">
              {kind === "gasto"
                ? "Categoría de gastos"
                : "Categoría de ingresos"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cat-name">Nombre</Label>
          <Input
            id="cat-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej: Mascotas"
            autoFocus
          />
        </div>

        {!category?.system ? (
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-hairline bg-surface-raised p-1">
            {(["gasto", "ingreso"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setKind(option)}
                aria-pressed={kind === option}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  kind === option
                    ? option === "gasto"
                      ? "bg-brand text-primary-foreground"
                      : "bg-success text-success-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option === "gasto" ? "Gastos" : "Ingresos"}
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setColor(option)}
                aria-label={`Color ${option}`}
                aria-pressed={color === option}
                className={cn(
                  "size-7 rounded-full border-2 transition-transform duration-200 hover:scale-110 motion-reduce:hover:scale-100",
                  color === option
                    ? "border-foreground scale-110"
                    : "border-transparent",
                )}
                style={{ backgroundColor: option }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Ícono</Label>
          <div className="grid grid-cols-8 gap-1.5 sm:max-h-40 sm:overflow-y-auto sm:pr-1">
            {CATEGORY_ICONS.map((option) => {
              const Icon = resolveIcon(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setIcon(option)}
                  aria-label={option}
                  aria-pressed={icon === option}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg border transition-all duration-200",
                    icon === option
                      ? "border-brand/60 bg-brand/10 text-brand"
                      : "border-hairline bg-surface-raised text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <p className="animate-fade-in rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-2 sticky bottom-0 -mx-4 -mb-4 mt-1 border-t border-hairline bg-popover/95 px-4 py-3 backdrop-blur sm:-mb-4">
          {category && !category.system ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                removeCategory(category.id);
                onDone();
              }}
            >
              <Trash2 />
              Borrar
            </Button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onDone}>
              Cancelar
            </Button>
            <Button type="submit" size="lg">
              <Check />
              Guardar
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
