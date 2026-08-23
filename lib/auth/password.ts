import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;

/**
 * Hash de contraseña con scrypt (RFC 7914), que viene en el core de Node.
 * Se elige sobre bcrypt/argon2 para no depender de un binario nativo, que es
 * la fuente típica de problemas al deployar en serverless.
 *
 * Formato guardado: `salt:hash`, ambos en hexadecimal.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scryptAsync(password, salt, KEY_LENGTH);
  return `${salt}:${derived.toString("hex")}`;
}

/**
 * Compara en tiempo constante para no filtrar información por el tiempo de
 * respuesta. Devuelve `false` ante cualquier hash con formato inesperado en
 * lugar de tirar excepción.
 */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const hashBuffer = Buffer.from(hash, "hex");
  if (hashBuffer.length !== KEY_LENGTH) return false;

  const derived = await scryptAsync(password, salt, KEY_LENGTH);
  return timingSafeEqual(hashBuffer, derived);
}
