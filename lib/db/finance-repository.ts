import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  toCategory,
  toInstallmentPlan,
  toRecurringRule,
  toSettings,
  toTransaction,
} from "@/lib/db/mappers";
import {
  DEFAULT_SETTINGS,
  SEED_CATEGORIES,
  STATE_VERSION,
} from "@/lib/constants";
import { keyToDate } from "@/lib/db/mappers";
import type { FinanceState, MovementKind, PaymentMethod } from "@/lib/types";

/**
 * Lee todo lo del usuario en una sola ida a la base y lo devuelve con la misma
 * forma que usaba localStorage. Gracias a eso, `lib/finance.ts` y las siete
 * vistas siguen funcionando sin cambios.
 *
 * Traer el estado completo es razonable para una app personal (miles de filas
 * como mucho) y es lo que permite que los cálculos de día, mes y año, los
 * filtros y los gráficos sigan siendo instantáneos del lado del cliente.
 */
export async function getFinanceState(userId: string): Promise<FinanceState> {
  const [settings, categories, transactions, recurring, installments] =
    await prisma.$transaction([
      prisma.settings.findUnique({
        where: { userId },
        select: {
          monthlyBudget: true,
          currency: true,
          locale: true,
          displayName: true,
          usdCasa: true,
        },
      }),
      prisma.category.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          kind: true,
          color: true,
          icon: true,
          system: true,
        },
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          kind: true,
          amount: true,
          categoryId: true,
          description: true,
          date: true,
          method: true,
          note: true,
          createdAt: true,
        },
      }),
      prisma.recurringRule.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          kind: true,
          description: true,
          categoryId: true,
          amount: true,
          dayOfMonth: true,
          startMonth: true,
          endMonth: true,
          active: true,
          skipped: true,
          createdAt: true,
        },
      }),
      prisma.installmentPlan.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          description: true,
          categoryId: true,
          totalAmount: true,
          installments: true,
          firstMonth: true,
          dayOfMonth: true,
          method: true,
          createdAt: true,
        },
      }),
    ]);

  return {
    version: STATE_VERSION,
    settings: settings ? toSettings(settings) : { ...DEFAULT_SETTINGS },
    categories: categories.map(toCategory),
    transactions: transactions.map(toTransaction),
    recurring: recurring.map(toRecurringRule),
    installments: installments.map(toInstallmentPlan),
  };
}

/**
 * Deja al usuario listo para usar la app: sus ajustes y las categorías base.
 * Se llama al crear la cuenta.
 */
export async function seedNewUser(userId: string): Promise<void> {
  await prisma.$transaction([
    prisma.settings.create({
      data: { userId, ...DEFAULT_SETTINGS },
    }),
    prisma.category.createMany({
      data: SEED_CATEGORIES.map((category) => ({
        userId,
        name: category.name,
        kind: category.kind,
        color: category.color,
        icon: category.icon,
        system: category.system ?? false,
      })),
    }),
  ]);
}

/**
 * Categoría a la que se reasignan los movimientos cuando se borra la suya.
 * Se prefiere "Otros"; si no existe, cualquier categoría del sistema del mismo
 * tipo, y como último recurso se crea una.
 */
export async function getFallbackCategoryId(
  userId: string,
  kind: "gasto" | "ingreso",
): Promise<string> {
  const preferredName = kind === "gasto" ? "Otros" : "Extras";

  const preferred = await prisma.category.findFirst({
    where: { userId, kind, name: preferredName },
    select: { id: true },
  });
  if (preferred) return preferred.id;

  const anySystem = await prisma.category.findFirst({
    where: { userId, kind, system: true },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (anySystem) return anySystem.id;

  const created = await prisma.category.create({
    data: {
      userId,
      kind,
      name: preferredName,
      color: "#a8a8a8",
      icon: "MoreHorizontal",
      system: true,
    },
    select: { id: true },
  });

  return created.id;
}

/** Lo mínimo para dar de alta un movimiento, venga de donde venga. */
export interface MovimientoNuevo {
  kind: MovementKind;
  amount: number;
  categoryId: string;
  description: string;
  /** `YYYY-MM-DD`. */
  date: string;
  method: PaymentMethod;
  note?: string;
}

/**
 * Da de alta un movimiento y devuelve su id.
 *
 * Vive acá y no adentro de la Server Action porque hay dos caminos que
 * terminan en lo mismo: la app y el webhook de WhatsApp. Compartir la
 * escritura es lo que evita que se separen con el tiempo.
 */
export async function crearMovimiento(
  userId: string,
  datos: MovimientoNuevo,
): Promise<string> {
  const creado = await prisma.transaction.create({
    data: {
      userId,
      kind: datos.kind,
      amount: datos.amount,
      categoryId: datos.categoryId,
      description: datos.description,
      date: keyToDate(datos.date),
      method: datos.method,
      note: datos.note,
    },
    select: { id: true },
  });

  return creado.id;
}
