import "server-only";

/**
 * Solo se permite volver a rutas internas de la app.
 * Sin esto, un `?siguiente=https://otro-sitio` convertiría el ingreso en un
 * redirector abierto, útil para phishing.
 */
export function destinoSeguro(valor: string | null | undefined): string {
  if (typeof valor !== "string") return "/hoy";
  if (!valor.startsWith("/") || valor.startsWith("//")) return "/hoy";
  return valor;
}
