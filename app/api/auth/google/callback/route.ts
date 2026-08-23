import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { ingresarConGoogle } from "@/lib/auth/account";
import { exchangeCodeForProfile, getGoogleConfig } from "@/lib/auth/google";
import {
  COOKIE_ESTADO,
  COOKIE_SIGUIENTE,
  COOKIE_VERIFICADOR,
} from "@/lib/auth/oauth-cookies";
import { destinoSeguro } from "@/lib/auth/redirect";
import { createSession } from "@/lib/auth/session";
import { describeDatabaseError } from "@/lib/db/errors";

/** Vuelve al login con un motivo que la pantalla sabe explicar. */
function fallar(origen: string, motivo: string) {
  return NextResponse.redirect(new URL(`/ingresar?error=${motivo}`, origen));
}

/**
 * Vuelta de Google.
 *
 * Antes de confiar en nada se verifica que el `state` coincida con el que se
 * guardó al arrancar: es lo que impide que otro sitio dispare este ingreso.
 */
export async function GET(request: NextRequest) {
  const origen = request.nextUrl.origin;
  const parametros = request.nextUrl.searchParams;
  const almacen = await cookies();

  const estadoGuardado = almacen.get(COOKIE_ESTADO)?.value;
  const verificador = almacen.get(COOKIE_VERIFICADOR)?.value;
  const siguiente = destinoSeguro(almacen.get(COOKIE_SIGUIENTE)?.value);

  // Se limpian siempre: sirven para un solo intento.
  almacen.delete(COOKIE_ESTADO);
  almacen.delete(COOKIE_VERIFICADOR);
  almacen.delete(COOKIE_SIGUIENTE);

  // La persona canceló en la pantalla de Google.
  if (parametros.get("error")) return fallar(origen, "cancelado");

  const code = parametros.get("code");
  const estadoRecibido = parametros.get("state");

  if (!code || !estadoRecibido) return fallar(origen, "respuesta-incompleta");
  if (!estadoGuardado || !verificador) return fallar(origen, "sesion-expirada");
  if (estadoRecibido !== estadoGuardado)
    return fallar(origen, "estado-invalido");

  try {
    const config = getGoogleConfig(origen);
    const perfil = await exchangeCodeForProfile(config, code, verificador);
    const resultado = await ingresarConGoogle(perfil);

    if (!resultado.ok) return fallar(origen, resultado.motivo);

    await createSession(resultado.userId);
    return NextResponse.redirect(new URL(siguiente, origen));
  } catch (error) {
    // Si es un problema de base conocido se dice cuál; el resto se registra y
    // se muestra un mensaje genérico, sin filtrar detalles a la pantalla.
    const deBase = describeDatabaseError(error);
    console.error("Falló el ingreso con Google:", error);
    return fallar(origen, deBase ? "base-de-datos" : "fallo");
  }
}
