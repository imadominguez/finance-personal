import "server-only";

/** Cookies temporales del ida y vuelta con Google. */
export const COOKIE_ESTADO = "oauth-estado";
export const COOKIE_VERIFICADOR = "oauth-verificador";
export const COOKIE_SIGUIENTE = "oauth-siguiente";

/**
 * Viven lo que dura el ida y vuelta con Google y nada más.
 *
 * `sameSite: lax` es necesario: la vuelta es una navegación desde el dominio de
 * Google, y con `strict` el navegador no mandaría estas cookies y el ingreso
 * fallaría siempre.
 */
export function opcionesCookieCorta() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 10 * 60,
  };
}
