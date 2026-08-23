"use client";

import * as React from "react";
import { Check, Trash2 } from "lucide-react";

import { CategoryIcon } from "@/components/finance/category-icon";
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
import { todayKey } from "@/lib/date";
import { formatMoney, parseAmountInput } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MovementKind, PaymentMethod, Transaction } from "@/lib/types";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Si viene, el diálogo edita en lugar de crear. */
  transaction?: Transaction | null;
  defaultKind?: MovementKind;
  defaultDate?: string;
}

interface FormState {
  kind: MovementKind;
  amount: string;
  categoryId: string;
  description: string;
  date: string;
  method: PaymentMethod;
  note: string;
}

/**
 * El diálogo solo enmarca; el formulario vive en un hijo que se monta al abrir.
 * Así el estado del form nace limpio en cada apertura, sin efectos de reseteo.
 */
export function TransactionDialog({
  open,
  onOpenChange,
  transaction,
  defaultKind = "gasto",
  defaultDate,
}: TransactionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <TransactionForm
          key={transaction?.id ?? "nuevo"}
          onDone={() => onOpenChange(false)}
          transaction={transaction}
          defaultKind={defaultKind}
          defaultDate={defaultDate}
        />
      </DialogContent>
    </Dialog>
  );
}

interface TransactionFormProps {
  onDone: () => void;
  transaction?: Transaction | null;
  defaultKind: MovementKind;
  defaultDate?: string;
}

function TransactionForm({
  onDone,
  transaction,
  defaultKind,
  defaultDate,
}: TransactionFormProps) {
  const { state, addTransaction, updateTransaction, removeTransaction } =
    useFinanceReady();

  const categoriesFor = React.useCallback(
    (kind: MovementKind) =>
      state.categories.filter((category) => category.kind === kind),
    [state.categories],
  );

  const [form, setForm] = React.useState<FormState>(() => {
    if (transaction) {
      return {
        kind: transaction.kind,
        amount: String(transaction.amount),
        categoryId: transaction.categoryId,
        description: transaction.description,
        date: transaction.date,
        method: transaction.method,
        note: transaction.note ?? "",
      };
    }
    return {
      kind: defaultKind,
      amount: "",
      categoryId:
        state.categories.find((category) => category.kind === defaultKind)
          ?.id ?? "",
      description: "",
      date: defaultDate ?? todayKey(),
      method: "efectivo",
      note: "",
    };
  });
  const [error, setError] = React.useState<string | null>(null);

  const categories = categoriesFor(form.kind);
  const parsedAmount = parseAmountInput(form.amount);
  const isEditing = Boolean(transaction);

  function setKind(kind: MovementKind) {
    setForm((current) => ({
      ...current,
      kind,
      // La categoría pertenece a un tipo: al cambiar de tipo hay que reasignarla.
      categoryId: categoriesFor(kind)[0]?.id ?? "",
    }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Ingresá un monto mayor a cero.");
      return;
    }
    if (!form.categoryId) {
      setError("Elegí una categoría.");
      return;
    }

    const draft = {
      kind: form.kind,
      amount: Math.round(parsedAmount * 100) / 100,
      categoryId: form.categoryId,
      description:
        form.description.trim() ||
        state.categories.find((category) => category.id === form.categoryId)
          ?.name ||
        "Movimiento",
      date: form.date,
      method: form.method,
      note: form.note.trim() || undefined,
    };

    if (transaction) updateTransaction(transaction.id, draft);
    else addTransaction(draft);

    onDone();
  }

  function handleDelete() {
    if (!transaction) return;
    removeTransaction(transaction.id);
    onDone();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-base">
          {isEditing ? "Editar movimiento" : "Nuevo movimiento"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Cambiá lo que necesites y guardá."
            : "Cargá lo que gastaste o cobraste."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Tipo */}
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-hairline bg-surface-raised p-1">
          {(["gasto", "ingreso"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => setKind(kind)}
              aria-pressed={form.kind === kind}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium capitalize transition-all duration-200",
                form.kind === kind
                  ? kind === "gasto"
                    ? "bg-brand text-primary-foreground shadow-[0_4px_14px_-6px_rgba(232,93,36,0.9)]"
                    : "bg-success text-[#0a0a0a] shadow-[0_4px_14px_-6px_rgba(16,185,129,0.9)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {kind === "gasto" ? "Gasto" : "Ingreso"}
            </button>
          ))}
        </div>

        {/* Monto */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount">Monto</Label>
          <Input
            id="amount"
            inputMode="decimal"
            autoFocus
            placeholder="0"
            value={form.amount}
            onChange={(event) =>
              setForm((current) => ({ ...current, amount: event.target.value }))
            }
            className="h-12 text-2xl font-bold tabular"
          />
          <p className="h-4 text-xs text-muted-foreground">
            {Number.isFinite(parsedAmount) && parsedAmount > 0
              ? formatMoney(parsedAmount, state.settings, { decimals: true })
              : ""}
          </p>
        </div>

        {/* Categoría */}
        <div className="flex flex-col gap-2">
          <Label>Categoría</Label>
          <div className="grid max-h-44 grid-cols-2 gap-1.5 overflow-y-auto pr-1 pb-1 sm:grid-cols-3">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    categoryId: category.id,
                  }))
                }
                aria-pressed={form.categoryId === category.id}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs transition-all duration-200",
                  form.categoryId === category.id
                    ? "border-brand/60 bg-brand/10 text-foreground"
                    : "border-hairline bg-surface-raised text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                <CategoryIcon
                  icon={category.icon}
                  color={category.color}
                  size="sm"
                  className="size-6 [&_svg]:size-3"
                />
                <span className="truncate">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Detalle */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              placeholder="Ej: Supermercado"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((current) => ({ ...current, date: event.target.value }))
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="method">Medio de pago</Label>
          <NativeSelect
            id="method"
            className="w-full"
            value={form.method}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                method: event.target.value as PaymentMethod,
              }))
            }
          >
            {PAYMENT_METHODS.map((method) => (
              <NativeSelectOption key={method.value} value={method.value}>
                {method.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        {error ? (
          <p className="animate-fade-in rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-2 pt-1">
          {isEditing ? (
            <Button type="button" variant="destructive" onClick={handleDelete}>
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
              {isEditing ? "Guardar" : "Agregar"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
