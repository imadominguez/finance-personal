import "server-only";

import { randomInt } from "node:crypto";

import { prisma } from "@/lib/db/prisma";

/**
 * Vinculación de un teléfono con una cuenta.
 *
 * El código va **de la app al WhatsApp**, nunca al revés. Que alguien escriba
 * un número en un formulario no prueba nada; mandar desde ese teléfono un
 * código que solo se ve estando con la sesión iniciada, sí.
 */

/**
 * Sin caracteres que se confundan al copiar a mano: no hay O ni 0, ni I, L
 * ni 1.
 */
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ";
const DIGITOS = "23456789";

const LARGO = 6;

/** Diez minutos: suficiente para copiarlo, poco para que quede dando vueltas. */
const MINUTOS_DE_VIDA = 10;

/**
 * Genera un código nuevo y de paso invalida los anteriores de esa persona:
 * tener varios vivos a la vez no aporta nada y agranda la superficie.
 *
 * El primer carácter es siempre una letra a propósito: así un código nunca se
 * puede confundir con un monto suelto de seis dígitos.
 */
export async function generarCodigo(userId: string): Promise<{
  code: string;
  expiresAt: Date;
}> {
  const code = Array.from({ length: LARGO }, (_, indice) =>
    indice === 0
      ? ALFABETO[randomInt(ALFABETO.length)]
      : (ALFABETO + DIGITOS)[randomInt(ALFABETO.length + DIGITOS.length)],
  ).join("");

  const expiresAt = new Date(Date.now() + MINUTOS_DE_VIDA * 60_000);

  await prisma.$transaction([
    prisma.phoneLinkCode.deleteMany({ where: { userId, usedAt: null } }),
    prisma.phoneLinkCode.create({ data: { userId, code, expiresAt } }),
  ]);

  return { code, expiresAt };
}

export type ResultadoVinculacion =
  | { ok: true; userId: string }
  | { ok: false; motivo: "codigo-invalido" | "numero-ocupado" };

/**
 * Canjea un código y deja el teléfono pegado a esa cuenta.
 *
 * Un número solo puede estar en una cuenta: si ya está en otra, se rechaza en
 * vez de moverlo en silencio.
 */
export async function canjearCodigo(
  code: string,
  telefono: string,
): Promise<ResultadoVinculacion> {
  const guardado = await prisma.phoneLinkCode.findUnique({
    where: { code },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });

  if (!guardado || guardado.usedAt || guardado.expiresAt < new Date()) {
    return { ok: false, motivo: "codigo-invalido" };
  }

  const ocupado = await prisma.user.findUnique({
    where: { phone: telefono },
    select: { id: true },
  });
  if (ocupado && ocupado.id !== guardado.userId) {
    return { ok: false, motivo: "numero-ocupado" };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: guardado.userId },
      data: { phone: telefono, phoneLinkedAt: new Date() },
    }),
    prisma.phoneLinkCode.update({
      where: { id: guardado.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { ok: true, userId: guardado.userId };
}

/** Suelta el teléfono de la cuenta y limpia los códigos que hayan quedado. */
export async function desvincular(userId: string): Promise<void> {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { phone: null, phoneLinkedAt: null },
    }),
    prisma.phoneLinkCode.deleteMany({ where: { userId } }),
  ]);
}
