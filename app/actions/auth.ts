"use server";

import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/dal";
import { destroySession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

/**
 * Acciones de cuenta.
 *
 * El ingreso vive en las rutas de `/api/auth/google`, porque OAuth es un ida y
 * vuelta con redirecciones del navegador y no algo que se pueda resolver dentro
 * de una Server Action.
 */

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/ingresar");
}

/** Borra la cuenta y, en cascada, todos sus datos. */
export async function deleteAccountAction(): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/ingresar");

  await destroySession();
  await prisma.user.delete({ where: { id: session.userId } });

  redirect("/ingresar");
}
