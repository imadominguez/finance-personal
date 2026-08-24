import "server-only";

import { prisma } from "@/lib/db/prisma";
import { normalizarTema, TEMA_POR_DEFECTO, type Tema } from "@/lib/theme";

/**
 * La apariencia guardada en la cuenta, o el tema original si nunca se tocó.
 *
 * Vive acá y no en `app/actions/theme.ts` porque en un archivo `"use server"`
 * cada export es un endpoint público: una función que recibe un `userId` sería
 * una forma de leer preferencias ajenas. Acá el único que llama es el layout,
 * con el id que ya validó la sesión.
 */
export async function getSavedTheme(userId: string): Promise<Tema> {
  const settings = await prisma.settings.findUnique({
    where: { userId },
    select: { theme: true },
  });

  if (!settings?.theme) return TEMA_POR_DEFECTO;

  // Lo guardado puede ser viejo o inválido: normalizar nunca devuelve basura.
  return normalizarTema(settings.theme);
}
