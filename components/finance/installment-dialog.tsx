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
import { PAYMENT_METHODS } from "@/lib/constants";
import { addMonthsToKey, currentMonthKey, formatMonthLong } from "@/lib/date";
import { formatMoney, parseAmountInput } from "@/lib/format";
import type { InstallmentPlan, PaymentMethod } from "@/lib/types";

interface InstallmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: InstallmentPlan | null;
}

const COMMON_INSTALLMENTS = [3, 6, 9, 12, 18, 24];

/** Alta y edición de compras en cuotas. */
export function InstallmentDialog({
  open,
  onOpenChange,
  plan,
}: InstallmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <InstallmentForm
          key={plan?.id ?? "nuevo"}
          plan={plan}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function InstallmentForm({
  plan,
  onDone,
}: {
  plan?: InstallmentPlan | null;
  onDone: () => void;
}) {
  const { state, addInstallment, updateInstallment, removeInstallment } =
    useFinanceReady();

  const categories = state.categories.filter(
    (category) => category.kind === "gasto",
  );

  const [description, setDescription] = React.useState(plan?.description ?? "");
  const [totalAmount, setTotalAmount] = React.useState(
    plan ? String(plan.totalAmount) : "",
  );
  const [installments, setInstallments] = React.useState(
    String(plan?.installments ?? 12),
  );
  const [categoryId, setCategoryId] = React.useState(
    () =>
      plan?.categoryId ??
      categories.find((category) => category.id === "cat-cuotas")?.id ??
      categories[0]?.id ??
      "",
  );
  const [firstMonth, setFirstMonth] = React.useState(
    plan?.firstMonth ?? currentMonthKey(),
  );
  const [dayOfMonth, setDayOfMonth] = React.useState(
    String(plan?.dayOfMonth ?? 10),
  );
  const [method, setMethod] = React.useState<PaymentMethod>(
    plan?.method ?? "credito",
  );
  const [error, setError] = React.useState<string | null>(null);

  const parsedTotal = parseAmountInput(totalAmount);
  const count = Number(installments) || 0;
  const perInstallment =
    count > 0 && Number.isFinite(parsedTotal) ? parsedTotal / count : 0;
  const lastMonth =
    count > 0 ? addMonthsToKey(firstMonth, count - 1) : firstMonth;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!description.trim()) {
      setError("Poné qué compraste.");
      return;
    }
    if (!Number.isFinite(parsedTotal) || parsedTotal <= 0) {
      setError("Ingresá el total financiado.");
      return;
    }
    if (count < 1 || count > 120) {
      setError("La cantidad de cuotas tiene que estar entre 1 y 120.");
      return;
    }

    const draft = {
      description: description.trim(),
      totalAmount: Math.round(parsedTotal * 100) / 100,
      installments: count,
      categoryId,
      firstMonth,
      dayOfMonth: Math.min(Math.max(Number(dayOfMonth) || 1, 1), 31),
      method,
    };

    if (plan) updateInstallment(plan.id, draft);
    else addInstallment(draft);

    onDone();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {plan ? "Editar cuotas" : "Nueva compra en cuotas"}
        </DialogTitle>
        <DialogDescription>
          Cargá el total y las cuotas: la app las reparte mes a mes sola.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="plan-description">Qué compraste</Label>
          <Input
            id="plan-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Notebook"
            autoFocus
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan-total">Total financiado</Label>
            <Input
              id="plan-total"
              inputMode="decimal"
              value={totalAmount}
              onChange={(event) => setTotalAmount(event.target.value)}
              placeholder="0"
              className="tabular"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan-count">Cuotas</Label>
            <Input
              id="plan-count"
              type="number"
              min={1}
              max={120}
              value={installments}
              onChange={(event) => setInstallments(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {COMMON_INSTALLMENTS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setInstallments(String(option))}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
                count === option
                  ? "border-brand/60 bg-brand/10 text-brand"
                  : "border-hairline bg-surface-raised text-muted-foreground hover:text-foreground"
              }`}
            >
              {option} cuotas
            </button>
          ))}
        </div>

        {perInstallment > 0 ? (
          <div className="animate-fade-in rounded-xl border border-brand/25 bg-brand/8 px-3 py-2.5 text-sm">
            <p className="text-muted-foreground">
              Quedan{" "}
              <span className="font-semibold text-brand tabular">
                {count} ×{" "}
                {formatMoney(perInstallment, state.settings, {
                  decimals: true,
                })}
              </span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              De {formatMonthLong(firstMonth)} a {formatMonthLong(lastMonth)}
            </p>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan-first">Primera cuota</Label>
            <Input
              id="plan-first"
              type="month"
              value={firstMonth}
              onChange={(event) => setFirstMonth(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan-day">Día de vencimiento</Label>
            <Input
              id="plan-day"
              type="number"
              min={1}
              max={31}
              value={dayOfMonth}
              onChange={(event) => setDayOfMonth(event.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan-category">Categoría</Label>
            <NativeSelect
              id="plan-category"
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan-method">Medio de pago</Label>
            <NativeSelect
              id="plan-method"
              className="w-full"
              value={method}
              onChange={(event) =>
                setMethod(event.target.value as PaymentMethod)
              }
            >
              {PAYMENT_METHODS.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        </div>

        {error ? (
          <p className="animate-fade-in rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-2 pt-1">
          {plan ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                removeInstallment(plan.id);
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
