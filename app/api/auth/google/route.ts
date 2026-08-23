import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import {
  buildAuthorizationUrl,
  challengeFor,
  createState,
  createVerifier,
  getGoogleConfig,
} from "@/lib/auth/google";
import {
  COOKIE_ESTADO,
  COOKIE_SIGUIENTE,
  COOKIE_VERIFICADOR,
  opcionesCookieCorta,
} from "@/lib/auth/oauth-cookies";
import { destinoSeguro } from "@/lib/auth/redirect";

/**
 * Arranque del ingreso con Google.
 *
 * Guarda `state` y el verificador PKCE en cookies de vida corta y manda a
 * Google. El `state` es el que después prueba que la vuelta corresponde a esta
 * misma petición y no a un pedido armado por otro sitio.
 */
export async function GET(request: NextRequest) {
  const origen = request.nextUrl.origin;

  let config;
  try {
    config = getGoogleConfig(origen);
  } catch (error) {
    console.error("Configuración de Google incompleta:", error);
    return NextResponse.redirect(
      new URL("/ingresar?error=configuracion", origen),
    );
  }

  const state = createState();
  const verificador = createVerifier();
  const siguiente = destinoSeguro(
    request.nextUrl.searchParams.get("siguiente"),
  );

  const almacen = await cookies();
  almacen.set(COOKIE_ESTADO, state, opcionesCookieCorta());
  almacen.set(COOKIE_VERIFICADOR, verificador, opcionesCookieCorta());
  // A dónde volver después de entrar; se valida al leerla.
  almacen.set(COOKIE_SIGUIENTE, siguiente, opcionesCookieCorta());

  return NextResponse.redirect(
    buildAuthorizationUrl(config, state, challengeFor(verificador)),
  );
}
