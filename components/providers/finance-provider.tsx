"use client";

import * as React from "react";

import {
  createCategoryAction,
  createInstallmentAction,
  createRecurringAction,
  createTransactionAction,
  deleteCategoryAction,
  deleteInstallmentAction,
  deleteRecurringAction,
  deleteTransactionAction,
  setRecurringActiveAction,
  toggleRecurringMonthAction,
  updateCategoryAction,
  updateInstallmentAction,
  updateRecurringAction,
  updateSettingsAction,
  updateTransactionAction,
  type ActionResult,
} from "@/app/actions/finance";
import {
  importStateAction,
  loadSampleDataAction,
  resetDataAction,
} from "@/app/actions/data";
import type {
  Category,
  Cotizacion,
  FinanceState,
  MoneyFormat,
  InstallmentPlan,
  RecurringRule,
  Settings,
  Transaction,
} from "@/lib/types";

type TransactionDraft = Omit<Transaction, "id" | "createdAt">;
type CategoryDraft = Omit<Category, "id" | "system">;
type RecurringDraft = Omit<RecurringRule, "id" | "createdAt" | "skipped">;
type InstallmentDraft = Omit<InstallmentPlan, "id" | "createdAt">;

interface FinanceActions {
  addTransaction: (draft: TransactionDraft) => void;
  updateTransaction: (id: string, draft: TransactionDraft) => void;
  removeTransaction: (id: string) => void;

  addCategory: (draft: CategoryDraft) => void;
  updateCategory: (id: string, draft: CategoryDraft) => void;
  removeCategory: (id: string) => void;

  addRecurring: (draft: RecurringDraft) => void;
  updateRecurring: (id: string, draft: Partial<RecurringDraft>) => void;
  removeRecurring: (id: string) => void;
  toggleRecurringMonth: (id: string, month: string) => void;

  addInstallment: (draft: InstallmentDraft) => void;
  updateInstallment: (id: string, draft: InstallmentDraft) => void;
  removeInstallment: (id: string) => void;

  updateSettings: (draft: Partial<Settings>) => void;

  importState: (json: string) => Promise<ActionResult>;
  loadSampleData: () => void;
  resetAll: () => void;
}

interface FinanceContextValue extends FinanceActions {
  state: FinanceState;
  /**
   * Con qué reglas se dibujan los montos. Es lo que hay que pasarle a `Money`
   * y a `formatMoney`, no `state.settings`: si la persona eligió ver en
   * dólares, acá ya viene la cotización con la que dividir.
   */
  moneyFormat: MoneyFormat;
  /** La cotización elegida, para mostrarla. `null` = se ve en pesos. */
  cotizacion: Cotizacion | null;
  /** Todas las casas que devolvió la API, para poder elegir. */
  cotizaciones: Cotizacion[];
  /** Hay una mutación en vuelo contra la base. */
  pending: boolean;
  /** Último error devuelto por el servidor, para mostrarlo en la interfaz. */
  error: string | null;
  dismissError: () => void;
}

const FinanceContext = React.createContext<FinanceContextValue | null>(null);

/* -------------------------------------------------------------------------- */
/* Estado optimista                                                           */
/* -------------------------------------------------------------------------- */

type OptimisticAction =
  | { type: "addTransaction"; draft: TransactionDraft }
  | { type: "updateTransaction"; id: string; draft: TransactionDraft }
  | { type: "removeTransaction"; id: string }
  | { type: "addCategory"; draft: CategoryDraft }
  | { type: "updateCategory"; id: string; draft: CategoryDraft }
  | { type: "removeCategory"; id: string }
  | { type: "addRecurring"; draft: RecurringDraft }
  | { type: "updateRecurring"; id: string; draft: Partial<RecurringDraft> }
  | { type: "removeRecurring"; id: string }
  | { type: "toggleRecurringMonth"; id: string; month: string }
  | { type: "addInstallment"; draft: InstallmentDraft }
  | { type: "updateInstallment"; id: string; draft: InstallmentDraft }
  | { type: "removeInstallment"; id: string }
  | { type: "updateSettings"; draft: Partial<Settings> };

/** Id temporal de una fila que todavía no existe en la base. */
function temporaryId(prefix: string): string {
  return `${prefix}-optimistic-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Aplica la mutación sobre una copia local del estado para que la interfaz
 * responda al instante. React descarta esta copia en cuanto llega el estado
 * real desde el servidor, así que no puede quedar desincronizada.
 */
function optimisticReducer(
  state: FinanceState,
  action: OptimisticAction,
): FinanceState {
  switch (action.type) {
    case "addTransaction":
      return {
        ...state,
        transactions: [
          ...state.transactions,
          {
            ...action.draft,
            id: temporaryId("tx"),
            createdAt: new Date().toISOString(),
          },
        ],
      };

    case "updateTransaction":
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.id
            ? { ...transaction, ...action.draft }
            : transaction,
        ),
      };

    case "removeTransaction":
      return {
        ...state,
        transactions: state.transactions.filter(
          (transaction) => transaction.id !== action.id,
        ),
      };

    case "addCategory":
      return {
        ...state,
        categories: [
          ...state.categories,
          { ...action.draft, id: temporaryId("cat") },
        ],
      };

    case "updateCategory":
      return {
        ...state,
        categories: state.categories.map((category) =>
          category.id === action.id
            ? { ...category, ...action.draft }
            : category,
        ),
      };

    case "removeCategory":
      return {
        ...state,
        categories: state.categories.filter(
          (category) => category.id !== action.id,
        ),
      };

    case "addRecurring":
      return {
        ...state,
        recurring: [
          ...state.recurring,
          {
            ...action.draft,
            id: temporaryId("fijo"),
            skipped: [],
            createdAt: new Date().toISOString(),
          },
        ],
      };

    case "updateRecurring":
      return {
        ...state,
        recurring: state.recurring.map((rule) =>
          rule.id === action.id ? { ...rule, ...action.draft } : rule,
        ),
      };

    case "removeRecurring":
      return {
        ...state,
        recurring: state.recurring.filter((rule) => rule.id !== action.id),
      };

    case "toggleRecurringMonth":
      return {
        ...state,
        recurring: state.recurring.map((rule) => {
          if (rule.id !== action.id) return rule;
          const skipped = rule.skipped.includes(action.month)
            ? rule.skipped.filter((value) => value !== action.month)
            : [...rule.skipped, action.month];
          return { ...rule, skipped };
        }),
      };

    case "addInstallment":
      return {
        ...state,
        installments: [
          ...state.installments,
          {
            ...action.draft,
            id: temporaryId("cuota"),
            createdAt: new Date().toISOString(),
          },
        ],
      };

    case "updateInstallment":
      return {
        ...state,
        installments: state.installments.map((plan) =>
          plan.id === action.id ? { ...plan, ...action.draft } : plan,
        ),
      };

    case "removeInstallment":
      return {
        ...state,
        installments: state.installments.filter(
          (plan) => plan.id !== action.id,
        ),
      };

    case "updateSettings":
      return { ...state, settings: { ...state.settings, ...action.draft } };
  }
}

/* -------------------------------------------------------------------------- */
/* Provider                                                                   */
/* -------------------------------------------------------------------------- */

export function FinanceProvider({
  initialState,
  cotizaciones,
  children,
}: {
  /** Estado leído en el servidor. Se refresca solo tras cada Server Action. */
  initialState: FinanceState;
  /**
   * Cotizaciones del dólar, leídas en el servidor. Vienen todas y no solo la
   * elegida para que cambiar de casa se vea al instante, sin ir y volver.
   * Lista vacía = la API no respondió; se muestra todo en pesos.
   */
  cotizaciones: Cotizacion[];
  children: React.ReactNode;
}) {
  const [state, applyOptimistic] = React.useOptimistic(
    initialState,
    optimisticReducer,
  );
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Aplica el cambio en pantalla y lo manda al servidor dentro de la misma
   * transición: mientras esté en vuelo se ve el estado optimista, y al terminar
   * React vuelve a los datos reales que llegan por revalidación.
   */
  const run = React.useCallback(
    (
      optimistic: OptimisticAction | null,
      mutate: () => Promise<ActionResult>,
    ) => {
      startTransition(async () => {
        if (optimistic) applyOptimistic(optimistic);
        const result = await mutate();
        if (!result.ok)
          setError(result.error ?? "No se pudo guardar el cambio");
      });
    },
    [applyOptimistic],
  );

  const actions = React.useMemo<FinanceActions>(
    () => ({
      addTransaction: (draft) =>
        run({ type: "addTransaction", draft }, () =>
          createTransactionAction(draft),
        ),

      updateTransaction: (id, draft) =>
        run({ type: "updateTransaction", id, draft }, () =>
          updateTransactionAction(id, draft),
        ),

      removeTransaction: (id) =>
        run({ type: "removeTransaction", id }, () =>
          deleteTransactionAction(id),
        ),

      addCategory: (draft) =>
        run({ type: "addCategory", draft }, () => createCategoryAction(draft)),

      updateCategory: (id, draft) =>
        run({ type: "updateCategory", id, draft }, () =>
          updateCategoryAction(id, draft),
        ),

      removeCategory: (id) =>
        run({ type: "removeCategory", id }, () => deleteCategoryAction(id)),

      addRecurring: (draft) =>
        run({ type: "addRecurring", draft }, () =>
          createRecurringAction(draft),
        ),

      updateRecurring: (id, draft) => {
        // El interruptor de activo/inactivo tiene su propia acción, más barata
        // que revalidar toda la regla.
        const onlyActive =
          Object.keys(draft).length === 1 && typeof draft.active === "boolean";

        if (onlyActive) {
          run({ type: "updateRecurring", id, draft }, () =>
            setRecurringActiveAction(id, draft.active as boolean),
          );
          return;
        }

        run({ type: "updateRecurring", id, draft }, () =>
          updateRecurringAction(id, draft),
        );
      },

      removeRecurring: (id) =>
        run({ type: "removeRecurring", id }, () => deleteRecurringAction(id)),

      toggleRecurringMonth: (id, month) =>
        run({ type: "toggleRecurringMonth", id, month }, () =>
          toggleRecurringMonthAction(id, month),
        ),

      addInstallment: (draft) =>
        run({ type: "addInstallment", draft }, () =>
          createInstallmentAction(draft),
        ),

      updateInstallment: (id, draft) =>
        run({ type: "updateInstallment", id, draft }, () =>
          updateInstallmentAction(id, draft),
        ),

      removeInstallment: (id) =>
        run({ type: "removeInstallment", id }, () =>
          deleteInstallmentAction(id),
        ),

      updateSettings: (draft) =>
        run({ type: "updateSettings", draft }, () =>
          updateSettingsAction({ ...initialState.settings, ...draft }),
        ),

      // Estas tres reescriben todo: no tienen versión optimista razonable,
      // se espera al servidor y llega el estado nuevo completo.
      importState: async (json) => {
        const result = await importStateAction(json);
        if (!result.ok) setError(result.error ?? "No se pudo importar");
        return result;
      },

      loadSampleData: () => run(null, () => loadSampleDataAction()),

      resetAll: () => run(null, () => resetDataAction()),
    }),
    [run, initialState.settings],
  );

  /*
   * La casa sale del estado optimista, así que al elegir otra los montos
   * cambian en el acto, sin esperar al servidor. Si la casa guardada ya no
   * existe (la API dejó de publicarla), `find` devuelve undefined y se cae
   * elegantemente a pesos.
   */
  const cotizacion =
    cotizaciones.find((item) => item.casa === state.settings.usdCasa) ?? null;

  const moneyFormat = React.useMemo<MoneyFormat>(
    () => ({
      currency: state.settings.currency,
      locale: state.settings.locale,
      usdRate: cotizacion?.venta ?? null,
    }),
    [state.settings.currency, state.settings.locale, cotizacion],
  );

  const value = React.useMemo<FinanceContextValue>(
    () => ({
      state,
      moneyFormat,
      cotizacion,
      cotizaciones,
      pending,
      error,
      dismissError: () => setError(null),
      ...actions,
    }),
    [state, moneyFormat, cotizacion, cotizaciones, pending, error, actions],
  );

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
}

export function useFinance(): FinanceContextValue | null {
  return React.useContext(FinanceContext);
}

/** Estado y acciones. Lanza si se usa fuera del provider. */
export function useFinanceReady(): FinanceContextValue {
  const context = React.useContext(FinanceContext);
  if (!context) {
    throw new Error(
      "useFinanceReady debe usarse dentro de <FinanceProvider />",
    );
  }
  return context;
}
