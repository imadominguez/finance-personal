"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth/dal";
import { desvincular, generarCodigo } from "@/lib/whatsapp/vincular";

/**
 * Conectar y desconectar el WhatsApp de la cuenta.
 *
 * El código se genera acá y se muestra en pantalla; la vinculación en sí la
 * cierra el webhook cuando ese código llega **desde** el teléfono. Es lo que
 * prueba que quien escribe es quien dice ser.
 */

export interface CodigoGenerado {
  code: string;
  /** ISO, para mostrar cuánto le queda. */
  expiresAt: string;
}

export async function generarCodigoAction(): Promise<CodigoGenerado> {
  const { userId } = await requireSession();
  const { code, expiresAt } = await generarCodigo(userId);

  return { code, expiresAt: expiresAt.toISOString() };
}

export async function desvincularAction(): Promise<void> {
  const { userId } = await requireSession();
  await desvincular(userId);

  revalidatePath("/", "layout");
}
