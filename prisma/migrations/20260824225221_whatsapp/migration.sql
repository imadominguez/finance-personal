-- Cargar gastos por WhatsApp.
--
-- Aditiva: `users.phone` es nulo y con índice único (Postgres permite muchos
-- nulos, así que las cuentas que ya existen no se tocan). Las dos tablas
-- nuevas cuelgan de `users` en cascada, y `whatsapp_messages.transactionId`
-- queda en NULL si el movimiento se borra: la bitácora no puede impedir que
-- alguien borre un gasto suyo.

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "phoneLinkedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "phone_link_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_link_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "waMessageId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "phone_link_codes_code_key" ON "phone_link_codes"("code");

-- CreateIndex
CREATE INDEX "phone_link_codes_userId_idx" ON "phone_link_codes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_messages_waMessageId_key" ON "whatsapp_messages"("waMessageId");

-- CreateIndex
CREATE INDEX "whatsapp_messages_phone_createdAt_idx" ON "whatsapp_messages"("phone", "createdAt");

-- CreateIndex
CREATE INDEX "whatsapp_messages_userId_createdAt_idx" ON "whatsapp_messages"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- AddForeignKey
ALTER TABLE "phone_link_codes" ADD CONSTRAINT "phone_link_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

