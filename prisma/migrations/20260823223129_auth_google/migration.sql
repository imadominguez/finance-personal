-- Se pasa a ingreso solo con Google.
--
-- OJO: esto borra la columna `passwordHash`. Las cuentas creadas con email y
-- contraseña NO se pierden: al entrar con Google, si el email coincide y Google
-- confirma que es suyo, la cuenta se vincula y conserva todos sus movimientos.
-- Lo que se pierde es la posibilidad de volver atrás a ingreso con contraseña.

-- AlterTable
ALTER TABLE "users" DROP COLUMN "passwordHash",
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "image" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
