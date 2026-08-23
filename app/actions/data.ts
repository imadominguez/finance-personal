"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import { seedNewUser } from "@/lib/db/finance-repository";
import { buildSampleData } from "@/lib/db/sample-data";
import { keyToDate } from "@/lib/db/mappers";
import { normalizeState } from "@/lib/storage";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import type { ActionResult } from "@/app/actions/finance";

function refresh(): void {
  revalidatePath("/", "layout");
}

/** Borra todos los datos financieros del usuario, sin tocar su cuenta. */
async function wipeUserData(userId: string): Promise<void> {
  // El orden importa: los movimientos referencian categorías con onDelete:
  // Restrict, así que primero se van los hijos.
  await prisma.$transaction([
    prisma.transaction.deleteMany({ where: { userId } }),
    prisma.recurringRule.deleteMany({ where: { userId } }),
    prisma.installmentPlan.deleteMany({ where: { userId } }),
    prisma.category.deleteMany({ where: { userId } }),
    prisma.settings.deleteMany({ where: { userId } }),
  ]);
}

export async function loadSampleDataAction(): Promise<ActionResult> {
  const { userId } = await requireSession();

  await wipeUserData(userId);
  await seedNewUser(userId);

  const categories = await prisma.category.findMany({
    where: { userId },
    select: { id: true, name: true },
  });
  const categoryIdByName = new Map(categories.map((c) => [c.name, c.id]));

  const sample = buildSampleData(userId, categoryIdByName);

  await prisma.$transaction([
    prisma.transaction.createMany({ data: sample.transactions }),
    prisma.recurringRule.createMany({ data: sample.recurring }),
    prisma.installmentPlan.createMany({ data: sample.installments }),
    prisma.settings.update({
      where: { userId },
      data: { monthlyBudget: sample.monthlyBudget },
    }),
  ]);

  refresh();
  return { ok: true };
}

export async function resetDataAction(): Promise<ActionResult> {
  const { userId } = await requireSession();

  await wipeUserData(userId);
  await seedNewUser(userId);

  refresh();
  return { ok: true };
}

/**
 * Importa un respaldo JSON. Sirve también para migrar los datos que quedaron
 * en localStorage de la versión anterior de la app.
 *
 * Las categorías se reconcilian por nombre y tipo, no por id: los ids viejos
 * (`cat-alquiler`) no existen en la base, así que se arma un mapa viejo → nuevo
 * y con eso se reasignan movimientos, fijos y cuotas.
 */
export async function importStateAction(json: string): Promise<ActionResult> {
  const { userId } = await requireSession();

  let incoming;
  try {
    incoming = normalizeState(JSON.parse(json));
  } catch {
    return { ok: false, error: "El archivo no es un JSON válido" };
  }

  if (
    incoming.transactions.length === 0 &&
    incoming.recurring.length === 0 &&
    incoming.installments.length === 0
  ) {
    return {
      ok: false,
      error: "El archivo no tiene movimientos para importar",
    };
  }

  await wipeUserData(userId);

  await prisma.settings.create({
    data: {
      userId,
      monthlyBudget:
        incoming.settings.monthlyBudget ?? DEFAULT_SETTINGS.monthlyBudget,
      currency: incoming.settings.currency ?? DEFAULT_SETTINGS.currency,
      locale: incoming.settings.locale ?? DEFAULT_SETTINGS.locale,
      displayName: incoming.settings.displayName ?? "",
    },
  });

  const categoryIdByOldId = new Map<string, string>();

  for (const category of incoming.categories) {
    const created = await prisma.category.create({
      data: {
        userId,
        name: category.name,
        kind: category.kind,
        color: category.color,
        icon: category.icon,
        system: category.system ?? false,
      },
      select: { id: true },
    });
    categoryIdByOldId.set(category.id, created.id);
  }

  // Cualquier referencia huérfana cae en una categoría de respaldo del tipo
  // correcto, en vez de perder el movimiento.
  const fallbackByKind = new Map<string, string>();
  for (const kind of ["gasto", "ingreso"] as const) {
    const found = incoming.categories.find((c) => c.kind === kind);
    const mapped = found ? categoryIdByOldId.get(found.id) : undefined;
    if (mapped) fallbackByKind.set(kind, mapped);
  }

  function resolveCategory(
    oldId: string,
    kind: "gasto" | "ingreso",
  ): string | null {
    return categoryIdByOldId.get(oldId) ?? fallbackByKind.get(kind) ?? null;
  }

  const transactions = incoming.transactions
    .map((transaction) => {
      const categoryId = resolveCategory(
        transaction.categoryId,
        transaction.kind,
      );
      if (!categoryId) return null;
      return {
        userId,
        kind: transaction.kind,
        amount: transaction.amount,
        categoryId,
        description: transaction.description,
        date: keyToDate(transaction.date),
        method: transaction.method,
        note: transaction.note ?? null,
      };
    })
    .filter((value) => value !== null);

  const recurring = incoming.recurring
    .map((rule) => {
      const categoryId = resolveCategory(rule.categoryId, rule.kind);
      if (!categoryId) return null;
      return {
        userId,
        kind: rule.kind,
        description: rule.description,
        categoryId,
        amount: rule.amount,
        dayOfMonth: rule.dayOfMonth,
        startMonth: rule.startMonth,
        endMonth: rule.endMonth,
        active: rule.active,
        skipped: rule.skipped ?? [],
      };
    })
    .filter((value) => value !== null);

  const installments = incoming.installments
    .map((plan) => {
      const categoryId = resolveCategory(plan.categoryId, "gasto");
      if (!categoryId) return null;
      return {
        userId,
        description: plan.description,
        categoryId,
        totalAmount: plan.totalAmount,
        installments: plan.installments,
        firstMonth: plan.firstMonth,
        dayOfMonth: plan.dayOfMonth,
        method: plan.method,
      };
    })
    .filter((value) => value !== null);

  await prisma.$transaction([
    prisma.transaction.createMany({ data: transactions }),
    prisma.recurringRule.createMany({ data: recurring }),
    prisma.installmentPlan.createMany({ data: installments }),
  ]);

  refresh();
  return { ok: true };
}
