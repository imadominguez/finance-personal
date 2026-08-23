import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Configuración del CLI de Prisma (migraciones, studio, generate).
 * El cliente en runtime NO lee este archivo: usa `DATABASE_URL` desde
 * `lib/db/prisma.ts`.
 *
 * Por eso acá se prefiere la conexión **sin pooler**: las migraciones usan
 * sentencias que pgbouncer, en modo transacción, no sabe manejar. Vercel y Neon
 * exponen esa URL como `DATABASE_URL_UNPOOLED`; si no existe, se cae a
 * `DIRECT_URL` y finalmente a `DATABASE_URL` (el caso de una Postgres local,
 * donde no hay pooler y las dos son la misma).
 */
const migrationUrl =
  process.env["DATABASE_URL_UNPOOLED"] ??
  process.env["DIRECT_URL"] ??
  process.env["DATABASE_URL"];

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrationUrl,
  },
});
