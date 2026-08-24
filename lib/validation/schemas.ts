import { z } from "zod";

import { ACENTO_PERSONALIZADO, ACENTOS, MODOS, RADIOS } from "@/lib/theme";

/**
 * Validación de todo lo que entra desde el cliente. Las Server Actions son
 * endpoints públicos: nada que llegue de afuera se escribe sin pasar por acá.
 */

const monthKey = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "El mes tiene que tener formato AAAA-MM");

const dateKey = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha tiene que tener formato AAAA-MM-DD");

const amount = z
  .number()
  .finite("El monto no es un número válido")
  .positive("El monto tiene que ser mayor a cero")
  .max(1_000_000_000_000, "El monto es demasiado grande");

const movementKind = z.enum(["gasto", "ingreso"]);

const paymentMethod = z.enum([
  "efectivo",
  "debito",
  "credito",
  "transferencia",
  "otro",
]);

const hexColor = z
  .string()
  .regex(
    /^#[0-9a-fA-F]{6}$/,
    "El color tiene que ser hexadecimal, por ejemplo #e85d24",
  );

export const transactionSchema = z.object({
  kind: movementKind,
  amount,
  categoryId: z.string().min(1, "Elegí una categoría"),
  description: z.string().trim().min(1, "Poné una descripción").max(120),
  date: dateKey,
  method: paymentMethod,
  note: z.string().trim().max(500).optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Poné un nombre").max(40),
  kind: movementKind,
  color: hexColor,
  icon: z.string().trim().min(1).max(40),
});

export const recurringSchema = z
  .object({
    kind: movementKind,
    description: z.string().trim().min(1, "Poné un nombre").max(120),
    categoryId: z.string().min(1, "Elegí una categoría"),
    amount,
    dayOfMonth: z.number().int().min(1).max(31),
    startMonth: monthKey,
    endMonth: monthKey.nullable(),
    active: z.boolean(),
  })
  .refine((value) => !value.endMonth || value.endMonth >= value.startMonth, {
    message: "El mes de fin no puede ser anterior al de inicio",
    path: ["endMonth"],
  });

export const installmentSchema = z.object({
  description: z.string().trim().min(1, "Poné qué compraste").max(120),
  categoryId: z.string().min(1, "Elegí una categoría"),
  totalAmount: amount,
  installments: z.number().int().min(1).max(120),
  firstMonth: monthKey,
  dayOfMonth: z.number().int().min(1).max(31),
  method: paymentMethod,
});

export const settingsSchema = z.object({
  monthlyBudget: z.number().finite().min(0).max(1_000_000_000_000),
  currency: z.string().trim().length(3),
  locale: z.string().trim().min(2).max(10),
  displayName: z.string().trim().max(60),
  /*
   * Casa de cambio, o null para ver en pesos. Se valida como slug y no contra
   * una lista cerrada a propósito: si dolarapi suma una casa nueva, la app la
   * muestra sin necesidad de tocar este archivo. El valor no se interpola en
   * ningún lado, solo se compara contra lo que devolvió la API.
   */
  usdCasa: z
    .string()
    .regex(/^[a-z]{1,40}$/, "Esa cotización no existe")
    .nullable(),
});

/**
 * Apariencia. Se validan las opciones contra las listas reales en vez de
 * aceptar cualquier texto: lo que se guarde acá termina, sin más filtros, en
 * una variable CSS de todas las pantallas de esa persona.
 */
export const themeSchema = z.object({
  modo: z.enum(MODOS),
  acento: z
    .string()
    .refine(
      (valor) =>
        valor === ACENTO_PERSONALIZADO ||
        ACENTOS.some((acento) => acento.id === valor),
      "Ese acento no existe",
    ),
  color: z
    .string()
    .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "El color tiene que ser un hex"),
  radio: z
    .string()
    .refine(
      (valor) => RADIOS.some((radio) => radio.id === valor),
      "Ese radio no existe",
    ),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type RecurringInput = z.infer<typeof recurringSchema>;
export type InstallmentInput = z.infer<typeof installmentSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type ThemeInput = z.infer<typeof themeSchema>;
