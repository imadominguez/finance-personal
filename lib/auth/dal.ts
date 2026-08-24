import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { describeDatabaseError } from "@/lib/db/errors";
import { readSessionCookie } from "@/lib/auth/session";

export interface AuthSession {
  userId: string;
  sessionId: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  /** Foto de perfil de Google, si la cuenta tiene. */
  image: string | null;
  /** Teléfono vinculado por WhatsApp, en E.164. `null` = sin conectar. */
  phone: string | null;
}

/**
 * Capa de acceso a datos (DAL).
 *
 * Es el único lugar donde se resuelve "quién es el usuario". Toda lectura y
 * toda Server Action pasa por acá, así ninguna consulta puede olvidarse de
 * filtrar por `userId`. El chequeo del proxy es solo optimista: esta es la
 * verificación real, contra la tabla de sesiones.
 *
 * `cache` memoiza el resultado durante un mismo render, para no repetir la
 * consulta una vez por componente.
 */
export const getSession = cache(async (): Promise<AuthSession | null> => {
  const payload = await readSessionCookie();
  if (!payload) return null;

  let session: { id: string; userId: string; expiresAt: Date } | null;

  try {
    session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
      select: { id: true, userId: true, expiresAt: true },
    });
  } catch (error) {
    // Si la base no está migrada o no responde, tratamos la petición como
    // anónima: el usuario cae en el login, que sí sabe explicar qué pasa.
    // Mejor eso que un 500 con stack trace en cada ruta de la app.
    const message = describeDatabaseError(error);
    if (!message) throw error;
    console.error("Error de base al verificar la sesión:", message);
    return null;
  }

  // La cookie puede sobrevivir a la sesión: si no está en la base, o venció,
  // o quedó apuntando a otro usuario, no vale.
  if (!session) return null;
  if (session.expiresAt < new Date()) return null;
  if (session.userId !== payload.userId) return null;

  return { userId: session.userId, sessionId: session.id };
});

/** Igual que `getSession` pero manda al login si no hay sesión válida. */
export const requireSession = cache(async (): Promise<AuthSession> => {
  const session = await getSession();
  if (!session) redirect("/ingresar");
  return session;
});

/** Datos del usuario para mostrar en la interfaz. Nunca incluye el hash. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      phone: true,
    },
  });
});
