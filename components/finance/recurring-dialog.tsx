"use client";

import * as React from "react";
import { Check, Trash2 } from "lucide-react";

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
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { currentMonthKey } from "@/lib/date";
import { formatMoney, parseAmountInput } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MovementKind, RecurringRule } from "@/lib/types";

interface RecurringDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: RecurringRule | null;
}

/** Alta y edición de gastos/ingresos que se repiten todos los meses. */
export function RecurringDialog({
  open,
  onOpenChange,
  rule,
}: RecurringDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <RecurringForm
          key={rule?.id ?? "nuevo"}
          rule={rule}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function RecurringForm({
  rule,
  onDone,
}: {
  rule?: RecurringRule | null;
  onDone: () => void;
}) {
  const { state, addRecurring, updateRecurring, removeRecurring } =
    useFinanceReady();

  const [kind, setKind] = React.useState<MovementKind>(rule?.kind ?? "gasto");
  const [description, setDescription] = React.useState(rule?.description ?? "");
  const [amount, setAmount] = React.useState(rule ? String(rule.amount) : "");
  const [categoryId, setCategoryId] = React.useState(
    () =>
      rule?.categoryId ??
      state.categories.find((category) => category.kind === "gasto")?.id ??
      "",
  );
  const [dayOfMonth, setDayOfMonth] = React.useState(
    String(rule?.dayOfMonth ?? 1),
  );
  const [startMonth, setStartMonth] = React.useState(
    rule?.startMonth ?? currentMonthKey(),
  );
  const [endMonth, setEndMonth] = React.useState(rule?.endMonth ?? "");
  const [error, setError] = React.useState<string | null>(null);

  const categories = state.categories.filter(
    (category) => category.kind === kind,
  );

  /** Al cambiar de tipo, la categoría elegida deja de corresponder. */
  function changeKind(next: MovementKind) {
    setKind(next);
    setCategoryId(
      state.categories.find((category) => category.kind === next)?.id ?? "",
    );
  }

  const parsedAmount = parseAmountInput(amount);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!description.trim()) {
      setError("Poné un nombre, por ejemplo “Alquiler”.");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Ingresá un monto mayor a cero.");
      return;
    }
    if (endMonth && endMonth < startMonth) {
      setError("El mes de fin no puede ser anterior al de inicio.");
      return;
    }

    const draft = {
      kind,
      description: description.trim(),
      amount: Math.round(parsedAmount * 100) / 100,
      categoryId,
      dayOfMonth: Math.min(Math.max(Number(dayOfMonth) || 1, 1), 31),
      startMonth,
      endMonth: endMonth || null,
      active: rule?.active ?? true,
    };

    if (rule) updateRecurring(rule.id, draft);
    else addRecurring(draft);

    onDone();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{rule ? "Editar fijo" : "Nuevo gasto fijo"}</DialogTitle>
        <DialogDescription>
          Se suma solo a cada mes, desde el mes de inicio en adelante.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-hairline bg-surface-raised p-1">
          {(["gasto", "ingreso"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => changeKind(option)}
              aria-pressed={kind === option}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                kind === option
                  ? option === "gasto"
                    ? "bg-brand text-primary-foreground"
                    : "bg-success text-[#0a0a0a]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option === "gasto" ? "Gasto fijo" : "Ingreso fijo"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rec-description">Nombre</Label>
          <Input
            id="rec-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={kind === "gasto" ? "Alquiler" : "Sueldo"}
            autoFocus
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rec-amount">Monto por mes</Label>
            <Input
              id="rec-amount"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0"
              className="tabular"
            />
            <p className="h-4 text-xs text-muted-foreground">
              {Number.isFinite(parsedAmount) && parsedAmount > 0
                ? formatMoney(parsedAmount, state.settings)
                : ""}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rec-day">Día del mes</Label>
            <Input
              id="rec-day"
              type="number"
              min={1}
              max={31}
              value={dayOfMonth}
              onChange={(event) => setDayOfMonth(event.target.value)}
            />
            <p className="h-4 text-xs text-muted-foreground">
              Si el mes es más corto, cae el último día.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rec-category">Categoría</Label>
          <NativeSelect
            id="rec-category"
            className="w-full"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            {categories.map((category) => (
              <NativeSelectOption key={category.id} value={category.id}>
                {category.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rec-start">Desde</Label>
            <Input
              id="rec-start"
              type="month"
              value={startMonth}
              onChange={(event) => setStartMonth(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rec-end">Hasta (opcional)</Label>
            <Input
              id="rec-end"
              type="month"
              value={endMonth}
              onChange={(event) => setEndMonth(event.target.value)}
            />
          </div>
        </div>

        {error ? (
          <p className="animate-fade-in rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-2 pt-1">
          {rule ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                removeRecurring(rule.id);
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
