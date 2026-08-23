"use server";

import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/dal";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { seedNewUser } from "@/lib/db/finance-repository";
import { credentialsSchema, signupSchema } from "@/lib/validation/schemas";

export interface AuthFormState {
  error?: string;
  /** Errores por campo, para mostrarlos al lado del input. */
  fieldErrors?: Record<string, string>;
}

/** Solo se permite volver a rutas internas: evita redirecciones abiertas. */
function safeRedirect(target: FormDataEntryValue | null): string {
  const value = typeof target === "string" ? target : "";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function signupAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name") ?? undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { fieldErrors };
  }

  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return { fieldErrors: { email: "Ya hay una cuenta con ese email" } };
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      name: name ?? "",
    },
    select: { id: true },
  });

  // Categorías base y ajustes, para que la app no arranque vacía del todo.
  await seedNewUser(user.id);
  await createSession(user.id);

  // `redirect` lanza una excepción de control: va fuera de cualquier try/catch.
  redirect(safeRedirect(formData.get("siguiente")));
}

export async function loginAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // Ante credenciales mal formadas se responde igual que ante credenciales
  // incorrectas: no se le confirma a nadie si un email existe o no.
  const genericError = { error: "Email o contraseña incorrectos" };
  if (!parsed.success) return genericError;

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, passwordHash: true },
  });
  if (!user) return genericError;

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return genericError;

  await createSession(user.id);

  redirect(safeRedirect(formData.get("siguiente")));
}

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

  redirect("/crear-cuenta");
}
