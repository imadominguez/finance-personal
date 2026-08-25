/**
 * Normalización de números de teléfono.
 *
 * Puro y sin dependencias, para poder probarlo. open-wa entrega el número como
 * `5491123456789@c.us`; acá se lo deja en un formato único y comparable, porque
 * es lo que después identifica a la cuenta.
 */

/** Mínimo y máximo razonables para un número internacional (E.164). */
const MINIMO = 8;
const MAXIMO = 15;

/**
 * Devuelve el número en formato E.164 (`+5491123456789`), o `null` si no
 * parece un teléfono.
 */
export function normalizarTelefono(crudo: string): string | null {
  if (typeof crudo !== "string") return null;

  // Se corta en la arroba: open-wa manda `numero@c.us` para personas y
  // `...@g.us` para grupos.
  const soloNumero = crudo.split("@")[0] ?? "";
  const digitos = soloNumero.replace(/\D/g, "");

  if (digitos.length < MINIMO || digitos.length > MAXIMO) return null;
  return `+${digitos}`;
}

/**
 * Para mostrar en pantalla sin exponerlo entero: `+54 9 11 •••• 6789`.
 * Se ven los últimos cuatro dígitos, que alcanzan para reconocerlo.
 */
export function enmascararTelefono(telefono: string): string {
  const digitos = telefono.replace(/\D/g, "");
  if (digitos.length < 4) return "•••";
  return `+${digitos.slice(0, -4).replace(/\d/g, "•")}${digitos.slice(-4)}`;
}
