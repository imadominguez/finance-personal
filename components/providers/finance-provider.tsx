"use client";

import * as React from "react";

import { buildSampleState } from "@/lib/sample-data";
import { clearState, createId } from "@/lib/storage";
import {
  getServerSnapshot,
  getSnapshot,
  refreshFinanceState,
  setFinanceState,
  subscribe,
  updateFinanceState,
} from "@/lib/store";
import type {
  Category,
  FinanceState,
  InstallmentPlan,
  RecurringRule,
  Settings,
  Transaction,
} from "@/lib/types";

type TransactionDraft = Omit<Transaction, "id" | "createdAt">;
type CategoryDraft = Omit<Category, "id">;
type RecurringDraft = Omit<RecurringRule, "id" | "createdAt" | "skipped">;
type InstallmentDraft = Omit<InstallmentPlan, "id" | "createdAt">;

interface FinanceActions {
  addTransaction: (draft: TransactionDraft) => void;
  updateTransaction: (id: string, draft: TransactionDraft) => void;
  removeTransaction: (id: string) => void;

  addCategory: (draft: CategoryDraft) => void;
  updateCategory: (id: string, draft: Partial<CategoryDraft>) => void;
  removeCategory: (id: string) => void;

  addRecurring: (draft: RecurringDraft) => void;
  updateRecurring: (id: string, draft: Partial<RecurringDraft>) => void;
  removeRecurring: (id: string) => void;
  toggleRecurringMonth: (id: string, month: string) => void;

  addInstallment: (draft: InstallmentDraft) => void;
  updateInstallment: (id: string, draft: Partial<InstallmentDraft>) => void;
  removeInstallment: (id: string) => void;

  updateSettings: (draft: Partial<Settings>) => void;

  replaceState: (next: FinanceState) => void;
  loadSampleData: () => void;
  resetAll: () => void;
}

interface FinanceContextValue extends FinanceActions {
  state: FinanceState;
  /** `false` hasta que se leyó localStorage. Evita desajustes de hidratación. */
  ready: boolean;
}

const FinanceContext = React.createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  // El estado vive en un store externo sobre localStorage: React se suscribe y
  // el servidor recibe `null`, así no hay desajuste de hidratación.
  const state = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const actions = React.useMemo<FinanceActions>(
    () => ({
      addTransaction: (draft) =>
        updateFinanceState((current) => ({
          ...current,
          transactions: [
            ...current.transactions,
            {
              ...draft,
              id: createId("tx"),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateTransaction: (id, draft) =>
        updateFinanceState((current) => ({
          ...current,
          transactions: current.transactions.map((transaction) =>
            transaction.id === id ? { ...transaction, ...draft } : transaction,
          ),
        })),

      removeTransaction: (id) =>
        updateFinanceState((current) => ({
          ...current,
          transactions: current.transactions.filter(
            (transaction) => transaction.id !== id,
          ),
        })),

      addCategory: (draft) =>
        updateFinanceState((current) => ({
          ...current,
          categories: [
            ...current.categories,
            { ...draft, id: createId("cat") },
          ],
        })),

      updateCategory: (id, draft) =>
        updateFinanceState((current) => ({
          ...current,
          categories: current.categories.map((category) =>
            category.id === id ? { ...category, ...draft } : category,
          ),
        })),

      // Borrar una categoría no borra su historial: los movimientos pasan a "Otros".
      removeCategory: (id) =>
        updateFinanceState((current) => {
          const fallback = current.categories.find(
            (category) =>
              category.id !== id &&
              category.kind === "gasto" &&
              category.system,
          );
          const fallbackId = fallback?.id ?? "cat-otros";

          return {
            ...current,
            categories: current.categories.filter(
              (category) => category.id !== id,
            ),
            transactions: current.transactions.map((transaction) =>
              transaction.categoryId === id
                ? { ...transaction, categoryId: fallbackId }
                : transaction,
            ),
            recurring: current.recurring.map((rule) =>
              rule.categoryId === id
                ? { ...rule, categoryId: fallbackId }
                : rule,
            ),
            installments: current.installments.map((plan) =>
              plan.categoryId === id
                ? { ...plan, categoryId: fallbackId }
                : plan,
            ),
          };
        }),

      addRecurring: (draft) =>
        updateFinanceState((current) => ({
          ...current,
          recurring: [
            ...current.recurring,
            {
              ...draft,
              id: createId("fijo"),
              skipped: [],
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateRecurring: (id, draft) =>
        updateFinanceState((current) => ({
          ...current,
          recurring: current.recurring.map((rule) =>
            rule.id === id ? { ...rule, ...draft } : rule,
          ),
        })),

      removeRecurring: (id) =>
        updateFinanceState((current) => ({
          ...current,
          recurring: current.recurring.filter((rule) => rule.id !== id),
        })),

      toggleRecurringMonth: (id, month) =>
        updateFinanceState((current) => ({
          ...current,
          recurring: current.recurring.map((rule) => {
            if (rule.id !== id) return rule;
            const skipped = rule.skipped.includes(month)
              ? rule.skipped.filter((value) => value !== month)
              : [...rule.skipped, month];
            return { ...rule, skipped };
          }),
        })),

      addInstallment: (draft) =>
        updateFinanceState((current) => ({
          ...current,
          installments: [
            ...current.installments,
            {
              ...draft,
              id: createId("cuota"),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateInstallment: (id, draft) =>
        updateFinanceState((current) => ({
          ...current,
          installments: current.installments.map((plan) =>
            plan.id === id ? { ...plan, ...draft } : plan,
          ),
        })),

      removeInstallment: (id) =>
        updateFinanceState((current) => ({
          ...current,
          installments: current.installments.filter((plan) => plan.id !== id),
        })),

      updateSettings: (draft) =>
        updateFinanceState((current) => ({
          ...current,
          settings: { ...current.settings, ...draft },
        })),

      replaceState: (next) => setFinanceState(next),

      loadSampleData: () => setFinanceState(buildSampleState()),

      resetAll: () => {
        clearState();
        refreshFinanceState();
      },
    }),
    [],
  );

  const value = React.useMemo<FinanceContextValue | null>(() => {
    if (!state) return null;
    return { state, ready: true, ...actions };
  }, [state, actions]);

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
}

/** Estado listo para usar. Devuelve `ready: false` mientras hidrata. */
export function useFinance(): FinanceContextValue | null {
  return React.useContext(FinanceContext);
}

/**
 * Igual que `useFinance` pero garantiza estado cargado. Usar dentro de
 * componentes que ya están detrás de `<FinanceGate />`.
 */
export function useFinanceReady(): FinanceContextValue {
  const context = React.useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinanceReady debe usarse dentro de <FinanceGate />");
  }
  return context;
}
