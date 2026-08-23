import "server-only";

import { prisma } from "@/lib/db/prisma";
import { seedNewUser } from "@/lib/db/finance-repository";
import type { GoogleProfile } from "@/lib/auth/google";

export type ResultadoIngreso =
  | { ok: true; userId: string; creada: boolean }
  | { ok: false; motivo: "email-sin-verificar" };

/**
 * Resuelve a qué cuenta corresponde un perfil de Google, creándola si hace falta.
 *
 * El orden importa y es una decisión de seguridad:
 *
 *  1. Por `googleId`, que es el identificador estable de Google. Si ya entró
 *     antes, es esta cuenta, aunque haya cambiado de email.
 *  2. Por email, SOLO si Google confirmó que el email le pertenece. Así una
 *     cuenta vieja (de cuando se entraba con contraseña) se vincula y conserva
 *     todos sus movimientos. Sin la verificación, cualquiera que pudiera
 *     declarar un email ajeno se quedaría con esa cuenta.
 *  3. Si no existe, se crea, con las categorías base ya cargadas.
 *
 * Un email sin verificar se rechaza directamente: en la práctica Google solo
 * los devuelve así en casos raros de cuentas corporativas mal configuradas, y
 * no hay forma segura de aceptarlos.
 */
export async function ingresarConGoogle(
  perfil: GoogleProfile,
): Promise<ResultadoIngreso> {
  // 1. Ya entró antes con esta cuenta de Google.
  const porGoogleId = await prisma.user.findUnique({
    where: { googleId: perfil.sub },
    select: { id: true },
  });

  if (porGoogleId) {
    await prisma.user.update({
      where: { id: porGoogleId.id },
      data: {
        // El email y la foto pueden haber cambiado del lado de Google.
        email: perfil.email,
        emailVerified: perfil.emailVerified,
        image: perfil.picture,
        ...(perfil.name ? { name: perfil.name } : {}),
      },
    });
    return { ok: true, userId: porGoogleId.id, creada: false };
  }

  if (!perfil.emailVerified)
    return { ok: false, motivo: "email-sin-verificar" };

  // 2. Cuenta preexistente con ese email: se vincula sin perder nada.
  const porEmail = await prisma.user.findUnique({
    where: { email: perfil.email },
    select: { id: true, name: true },
  });

  if (porEmail) {
    await prisma.user.update({
      where: { id: porEmail.id },
      data: {
        googleId: perfil.sub,
        emailVerified: true,
        image: perfil.picture,
        // No se pisa un nombre que la persona haya puesto a mano.
        ...(porEmail.name ? {} : { name: perfil.name }),
      },
    });
    return { ok: true, userId: porEmail.id, creada: false };
  }

  // 3. Cuenta nueva.
  const creado = await prisma.user.create({
    data: {
      email: perfil.email,
      googleId: perfil.sub,
      emailVerified: true,
      name: perfil.name,
      image: perfil.picture,
    },
    select: { id: true },
  });

  await seedNewUser(creado.id);
  return { ok: true, userId: creado.id, creada: true };
}
