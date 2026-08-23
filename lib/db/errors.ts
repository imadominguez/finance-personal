import "server-only";

import { Prisma } from "@/lib/generated/prisma/client";

/**
 * La base responde, pero le faltan las tablas: las migraciones nunca se
 * aplicaron contra esta base. Es un error de despliegue, no del usuario, así
 * que conviene decirlo con todas las letras en vez de mostrar un stack trace.
 */
export function isSchemaMissingError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021"
  );
}

/** No se pudo llegar a la base (host, credenciales, red o base dormida). */
export function isUnreachableError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P1001" || error.code === "P1002"))
  );
}

export const SCHEMA_MISSING_MESSAGE =
  "La base de datos está conectada pero le faltan las tablas. Falta aplicar las migraciones: corré `pnpm db:deploy` apuntando a esta base.";

export const UNREACHABLE_MESSAGE =
  "No se pudo conectar con la base de datos. Si es un plan gratuito puede estar despertando: probá de nuevo en unos segundos.";

/**
 * Traduce un error de base a algo que se pueda mostrar en pantalla.
 * Devuelve `null` si no es un problema de infraestructura reconocido, para que
 * el error siga propagando y no se oculte un bug real.
 */
export function describeDatabaseError(error: unknown): string | null {
  if (isSchemaMissingError(error)) return SCHEMA_MISSING_MESSAGE;
  if (isUnreachableError(error)) return UNREACHABLE_MESSAGE;
  return null;
}
