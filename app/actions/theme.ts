"use server";

import { getSession } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import { themeSchema } from "@/lib/validation/schemas";

/**
 * Guarda la apariencia en la cuenta, para que viaje al resto de los
 * dispositivos.
 *
 * Quien manda es el navegador: el tema ya está aplicado antes de que esto
 * llegue al servidor. Por eso no revalida nada —haría re-renderizar el árbol
 * entero por un cambio que ya se ve— y por eso tampoco devuelve error: si esto
 * falla, la persona sigue viendo lo que eligió, solo que no la sigue a otro
 * dispositivo.
 *
 * Sin sesión no hace nada: en la landing también se puede cambiar el tema.
 */
export async function saveThemeAction(input: unknown): Promise<void> {
  const session = await getSession();
  if (!session) return;

  const parsed = themeSchema.safeParse(input);
  if (!parsed.success) return;

  const theme = parsed.data;

  await prisma.settings.upsert({
    where: { userId: session.userId },
    create: { userId: session.userId, theme },
    update: { theme },
  });
}
