import { NextResponse, type NextRequest } from "next/server";

import { decrypt } from "@/lib/auth/session";
import { COOKIE_NAME } from "@/lib/auth/session";

const PUBLIC_ROUTES = ["/", "/ingresar", "/crear-cuenta", "/sin-conexion"];

/**
 * Chequeo optimista de sesión (en Next 16 el antiguo `middleware` se llama
 * `proxy`). Corre en cada navegación, incluidas las precargadas, así que solo
 * lee la cookie y NO consulta la base: la verificación real está en el DAL.
 */
export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_ROUTES.includes(path);

  const session = await decrypt(request.cookies.get(COOKIE_NAME)?.value);

  if (!isPublic && !session) {
    const url = new URL("/ingresar", request.nextUrl);
    // Para volver a donde quería entrar después de iniciar sesión.
    url.searchParams.set("siguiente", path);
    return NextResponse.redirect(url);
  }

  // Con sesión iniciada, la landing y las pantallas de acceso no aportan:
  // se va derecho al resumen del día. /sin-conexion sí tiene que poder verse.
  if (isPublic && session && path !== "/sin-conexion") {
    return NextResponse.redirect(new URL("/hoy", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * El proxy solo debe correr sobre navegaciones.
     *
     * Los archivos de la PWA (manifiesto, service worker, íconos) tienen que
     * poder pedirse sin sesión: si el proxy los redirige al login, el navegador
     * recibe HTML donde espera JSON o JavaScript y la app deja de ser
     * instalable.
     */
    "/((?!api|_next/static|_next/image|sw\\.js|manifest\\.webmanifest|icons/|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico|txt|xml|json)$).*)",
  ],
};
