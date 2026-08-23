import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { readSessionCookie } from "@/lib/auth/session";

export interface AuthSession {
  userId: string;
  sessionId: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
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

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    select: { id: true, userId: true, expiresAt: true },
  });

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
    select: { id: true, email: true, name: true },
  });
});
