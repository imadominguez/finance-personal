"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import { getFallbackCategoryId } from "@/lib/db/finance-repository";
import { keyToDate } from "@/lib/db/mappers";
import {
  categorySchema,
  installmentSchema,
  recurringSchema,
  settingsSchema,
  transactionSchema,
} from "@/lib/validation/schemas";

/**
 * Mutaciones de la app. Cada una:
 *  1. verifica la sesión contra la base (`requireSession`),
 *  2. valida la entrada con Zod, porque una Server Action es un endpoint
 *     público y el cliente puede mandar cualquier cosa,
 *  3. escribe filtrando SIEMPRE por `userId`, para que nadie pueda tocar
 *     datos ajenos pasando un id que no le pertenece,
 *  4. revalida para que los Server Components vuelvan a leer.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const OK: ActionResult = { ok: true };

function fail(error: string): ActionResult {
  return { ok: false, error };
}

function refresh(): void {
  revalidatePath("/", "layout");
}

/** Confirma que la categoría existe y es del usuario, y devuelve su tipo. */
async function assertOwnCategory(
  userId: string,
  categoryId: string,
): Promise<{ kind: "gasto" | "ingreso" } | null> {
  return prisma.category.findFirst({
    where: { id: categoryId, userId },
    select: { kind: true },
  });
}

/* -------------------------------------------------------------------------- */
/* Movimientos                                                                */
/* -------------------------------------------------------------------------- */

export async function createTransactionAction(
  input: unknown,
): Promise<ActionResult> {
  const { userId } = await requireSession();

  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Datos inválidos");

  const category = await assertOwnCategory(userId, parsed.data.categoryId);
  if (!category) return fail("La categoría no existe");

  await prisma.transaction.create({
    data: {
      userId,
      kind: parsed.data.kind,
      amount: parsed.data.amount,
      categoryId: parsed.data.categoryId,
      description: parsed.data.description,
      date: keyToDate(parsed.data.date),
      method: parsed.data.method,
      note: parsed.data.note,
    },
  });

  refresh();
  return OK;
}

export async function updateTransactionAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const { userId } = await requireSession();

  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Datos inválidos");

  const category = await assertOwnCategory(userId, parsed.data.categoryId);
  if (!category) return fail("La categoría no existe");

  // `updateMany` con userId en el where: si el movimiento es de otro usuario,
  // no actualiza nada en lugar de tirar error revelando que existe.
  const result = await prisma.transaction.updateMany({
    where: { id, userId },
    data: {
      kind: parsed.data.kind,
      amount: parsed.data.amount,
      categoryId: parsed.data.categoryId,
      description: parsed.data.description,
      date: keyToDate(parsed.data.date),
      method: parsed.data.method,
      note: parsed.data.note ?? null,
    },
  });

  if (result.count === 0) return fail("No se encontró el movimiento");

  refresh();
  return OK;
}

export async function deleteTransactionAction(
  id: string,
): Promise<ActionResult> {
  const { userId } = await requireSession();

  const result = await prisma.transaction.deleteMany({ where: { id, userId } });
  if (result.count === 0) return fail("No se encontró el movimiento");

  refresh();
  return OK;
}

/* -------------------------------------------------------------------------- */
/* Categorías                                                                 */
/* -------------------------------------------------------------------------- */

export async function createCategoryAction(
  input: unknown,
): Promise<ActionResult> {
  const { userId } = await requireSession();

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Datos inválidos");

  const duplicate = await prisma.category.findFirst({
    where: { userId, name: parsed.data.name, kind: parsed.data.kind },
    select: { id: true },
  });
  if (duplicate) return fail("Ya tenés una categoría con ese nombre");

  await prisma.category.create({ data: { userId, ...parsed.data } });

  refresh();
  return OK;
}

export async function updateCategoryAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const { userId } = await requireSession();

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Datos inválidos");

  const current = await prisma.category.findFirst({
    where: { id, userId },
    select: { id: true, system: true, kind: true },
  });
  if (!current) return fail("No se encontró la categoría");

  const duplicate = await prisma.category.findFirst({
    where: {
      userId,
      name: parsed.data.name,
      kind: parsed.data.kind,
      NOT: { id },
    },
    select: { id: true },
  });
  if (duplicate) return fail("Ya tenés una categoría con ese nombre");

  await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      color: parsed.data.color,
      icon: parsed.data.icon,
      // Cambiar el tipo de una categoría del sistema rompería sus movimientos.
      kind: current.system ? current.kind : parsed.data.kind,
    },
  });

  refresh();
  return OK;
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const { userId } = await requireSession();

  const category = await prisma.category.findFirst({
    where: { id, userId },
    select: { id: true, kind: true, system: true },
  });
  if (!category) return fail("No se encontró la categoría");
  if (category.system) return fail("Las categorías base no se pueden borrar");

  const fallbackId = await getFallbackCategoryId(userId, category.kind);

  // Borrar una categoría no borra su historial: los movimientos se mudan.
  await prisma.$transaction([
    prisma.transaction.updateMany({
      where: { userId, categoryId: id },
      data: { categoryId: fallbackId },
    }),
    prisma.recurringRule.updateMany({
      where: { userId, categoryId: id },
      data: { categoryId: fallbackId },
    }),
    prisma.installmentPlan.updateMany({
      where: { userId, categoryId: id },
      data: { categoryId: fallbackId },
    }),
    prisma.category.delete({ where: { id } }),
  ]);

  refresh();
  return OK;
}

/* -------------------------------------------------------------------------- */
/* Gastos fijos                                                               */
/* -------------------------------------------------------------------------- */

export async function createRecurringAction(
  input: unknown,
): Promise<ActionResult> {
  const { userId } = await requireSession();

  const parsed = recurringSchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Datos inválidos");

  const category = await assertOwnCategory(userId, parsed.data.categoryId);
  if (!category) return fail("La categoría no existe");

  await prisma.recurringRule.create({
    data: { userId, ...parsed.data, skipped: [] },
  });

  refresh();
  return OK;
}

export async function updateRecurringAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const { userId } = await requireSession();

  const parsed = recurringSchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Datos inválidos");

  const category = await assertOwnCategory(userId, parsed.data.categoryId);
  if (!category) return fail("La categoría no existe");

  const result = await prisma.recurringRule.updateMany({
    where: { id, userId },
    data: parsed.data,
  });
  if (result.count === 0) return fail("No se encontró el gasto fijo");

  refresh();
  return OK;
}

/** Prender o apagar un fijo sin tener que abrir el formulario. */
export async function setRecurringActiveAction(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const { userId } = await requireSession();

  const result = await prisma.recurringRule.updateMany({
    where: { id, userId },
    data: { active },
  });
  if (result.count === 0) return fail("No se encontró el gasto fijo");

  refresh();
  return OK;
}

export async function deleteRecurringAction(id: string): Promise<ActionResult> {
  const { userId } = await requireSession();

  const result = await prisma.recurringRule.deleteMany({
    where: { id, userId },
  });
  if (result.count === 0) return fail("No se encontró el gasto fijo");

  refresh();
  return OK;
}

/** Saltea (o vuelve a incluir) un mes puntual de un gasto fijo. */
export async function toggleRecurringMonthAction(
  id: string,
  month: string,
): Promise<ActionResult> {
  const { userId } = await requireSession();

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return fail("Mes inválido");

  const rule = await prisma.recurringRule.findFirst({
    where: { id, userId },
    select: { skipped: true },
  });
  if (!rule) return fail("No se encontró el gasto fijo");

  const skipped = rule.skipped.includes(month)
    ? rule.skipped.filter((value) => value !== month)
    : [...rule.skipped, month];

  await prisma.recurringRule.update({ where: { id }, data: { skipped } });

  refresh();
  return OK;
}

/* -------------------------------------------------------------------------- */
/* Cuotas                                                                     */
/* -------------------------------------------------------------------------- */

export async function createInstallmentAction(
  input: unknown,
): Promise<ActionResult> {
  const { userId } = await requireSession();

  const parsed = installmentSchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Datos inválidos");

  const category = await assertOwnCategory(userId, parsed.data.categoryId);
  if (!category) return fail("La categoría no existe");

  await prisma.installmentPlan.create({ data: { userId, ...parsed.data } });

  refresh();
  return OK;
}

export async function updateInstallmentAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const { userId } = await requireSession();

  const parsed = installmentSchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Datos inválidos");

  const category = await assertOwnCategory(userId, parsed.data.categoryId);
  if (!category) return fail("La categoría no existe");

  const result = await prisma.installmentPlan.updateMany({
    where: { id, userId },
    data: parsed.data,
  });
  if (result.count === 0) return fail("No se encontró la compra en cuotas");

  refresh();
  return OK;
}

export async function deleteInstallmentAction(
  id: string,
): Promise<ActionResult> {
  const { userId } = await requireSession();

  const result = await prisma.installmentPlan.deleteMany({
    where: { id, userId },
  });
  if (result.count === 0) return fail("No se encontró la compra en cuotas");

  refresh();
  return OK;
}

/* -------------------------------------------------------------------------- */
/* Ajustes                                                                    */
/* -------------------------------------------------------------------------- */

export async function updateSettingsAction(
  input: unknown,
): Promise<ActionResult> {
  const { userId } = await requireSession();

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Datos inválidos");

  await prisma.settings.upsert({
    where: { userId },
    create: { userId, ...parsed.data },
    update: parsed.data,
  });

  refresh();
  return OK;
}
