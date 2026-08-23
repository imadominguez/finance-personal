/**
 * Modelo de datos de la app. Todo vive en el navegador (localStorage), por eso
 * las entidades se guardan planas y se relacionan por id, como lo haría una BD.
 */

/** Un movimiento es plata que entra (ingreso) o plata que sale (gasto). */
export type MovementKind = "gasto" | "ingreso";

export type PaymentMethod =
  | "efectivo"
  | "debito"
  | "credito"
  | "transferencia"
  | "otro";

/** De dónde salió un movimiento que se ve en pantalla. */
export type EntryOrigin = "manual" | "fijo" | "cuota";

export interface Category {
  id: string;
  name: string;
  kind: MovementKind;
  /** Hex, se usa en barras, puntos y gráficos. */
  color: string;
  icon: string;
  /** Las categorías semilla no se pueden borrar, solo editar. */
  system?: boolean;
}

export interface Transaction {
  id: string;
  kind: MovementKind;
  /** Siempre positivo: el signo lo define `kind`. */
  amount: number;
  categoryId: string;
  description: string;
  /** Fecha local en formato `YYYY-MM-DD`. */
  date: string;
  method: PaymentMethod;
  note?: string;
  createdAt: string;
}

/**
 * Gasto (o ingreso) que se repite todos los meses: alquiler, sueldo, Netflix.
 * No se materializa en la base: se proyecta mes a mes al leer.
 */
export interface RecurringRule {
  id: string;
  kind: MovementKind;
  description: string;
  categoryId: string;
  amount: number;
  /** 1-31; si el mes es más corto se ajusta al último día. */
  dayOfMonth: number;
  /** `YYYY-MM` en que arranca. */
  startMonth: string;
  /** `YYYY-MM` en que termina (inclusive). `null` = sin fin. */
  endMonth: string | null;
  active: boolean;
  /** Meses `YYYY-MM` salteados puntualmente (ej: un mes no lo pagaste). */
  skipped: string[];
  createdAt: string;
}

/**
 * Compra en N cuotas. Genera una cuota por mes durante `installments` meses,
 * empezando en `firstMonth`. Tampoco se materializa: se proyecta al leer.
 */
export interface InstallmentPlan {
  id: string;
  description: string;
  categoryId: string;
  /** Monto total financiado; cada cuota es total / installments. */
  totalAmount: number;
  installments: number;
  /** `YYYY-MM` de la primera cuota. */
  firstMonth: string;
  dayOfMonth: number;
  method: PaymentMethod;
  createdAt: string;
}

export interface Settings {
  /** Sueldo o tope mensual de referencia para la barra de progreso. 0 = sin tope. */
  monthlyBudget: number;
  currency: string;
  locale: string;
  /** Nombre para saludar en el dashboard. Opcional. */
  displayName: string;
}

export interface FinanceState {
  version: number;
  settings: Settings;
  categories: Category[];
  transactions: Transaction[];
  recurring: RecurringRule[];
  installments: InstallmentPlan[];
}

/**
 * Lo que finalmente se muestra en las listas: un movimiento real o una
 * ocurrencia proyectada de un gasto fijo / cuota.
 */
export interface Entry {
  id: string;
  kind: MovementKind;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
  method: PaymentMethod;
  origin: EntryOrigin;
  /** Id de la regla o del plan que lo generó (si no es manual). */
  sourceId?: string;
  /** Etiqueta corta tipo "Cuota 3/12" o "Fijo". */
  badge?: string;
  /** Solo los movimientos manuales se editan/borran desde la lista. */
  editable: boolean;
  /** `true` si la fecha todavía no llegó: es una proyección, no un hecho. */
  projected: boolean;
}

export interface CategoryBreakdown {
  category: Category;
  total: number;
  /** Participación sobre el total del período, 0-100. */
  share: number;
  count: number;
}

export interface PeriodTotals {
  gastos: number;
  ingresos: number;
  balance: number;
  count: number;
}

export interface PeriodSummary extends PeriodTotals {
  entries: Entry[];
  byCategory: CategoryBreakdown[];
  ingresosByCategory: CategoryBreakdown[];
  /** Solo lo efectivamente ocurrido (fecha <= hoy). */
  gastosReales: number;
  /** Lo que falta ocurrir dentro del período (fijos y cuotas futuras). */
  gastosProyectados: number;
}

export interface Comparison {
  current: number;
  previous: number;
  /** Variación porcentual; `null` si el período anterior fue 0. */
  changePct: number | null;
}
