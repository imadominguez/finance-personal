import { NextResponse, type NextRequest } from "next/server";

import { decrypt } from "@/lib/auth/session";
import { COOKIE_NAME } from "@/lib/auth/session";

const PUBLIC_ROUTES = ["/ingresar", "/crear-cuenta"];

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
    if (path !== "/") url.searchParams.set("siguiente", path);
    return NextResponse.redirect(url);
  }

  if (isPublic && session) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
