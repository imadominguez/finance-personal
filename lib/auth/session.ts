import "server-only";

import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

import { prisma } from "@/lib/db/prisma";

const COOKIE_NAME = "sesion";
const SESSION_DAYS = 30;

interface SessionPayload {
  sessionId: string;
  userId: string;
  [key: string]: unknown;
}

function getKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "Falta SESSION_SECRET. Generá uno con `openssl rand -base64 32` y agregalo a tus variables de entorno.",
    );
  }

  return new TextEncoder().encode(secret);
}

async function encrypt(
  payload: SessionPayload,
  expiresAt: Date,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getKey());
}

/**
 * Lee y valida la cookie. Solo verifica la firma: no toca la base.
 * Sirve para chequeos optimistas (proxy.ts); la verificación real contra la
 * tabla de sesiones vive en el DAL.
 */
export async function decrypt(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
    });
    if (
      typeof payload.sessionId !== "string" ||
      typeof payload.userId !== "string"
    ) {
      return null;
    }
    return { sessionId: payload.sessionId, userId: payload.userId };
  } catch {
    // Firma inválida o token vencido: se trata como "sin sesión".
    return null;
  }
}

/** Crea la sesión en la base y deja la cookie firmada en el navegador. */
export async function createSession(userId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: { userId, expiresAt },
    select: { id: true },
  });

  const token = await encrypt({ sessionId: session.id, userId }, expiresAt);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function readSessionCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return decrypt(cookieStore.get(COOKIE_NAME)?.value);
}

/** Cierra la sesión: la borra de la base y limpia la cookie. */
export async function destroySession(): Promise<void> {
  const payload = await readSessionCookie();

  if (payload) {
    // Si la fila ya no existe (sesión vencida y limpiada), no es un error.
    await prisma.session.deleteMany({ where: { id: payload.sessionId } });
  }

  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
