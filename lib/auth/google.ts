import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Ingreso con Google (OAuth 2.0 + OpenID Connect), sin librerías de auth.
 *
 * Se sigue la misma línea que el resto del proyecto: la sesión ya se maneja a
 * mano con `jose` y una tabla propia, así que agregar una dependencia de auth
 * solo para esto traería más superficie que la que resuelve.
 */

const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

/**
 * Endpoints de Google. Se pueden apuntar a otro lado con `GOOGLE_OAUTH_BASE`
 * ÚNICAMENTE para pruebas automatizadas contra un servidor simulado: este
 * contenedor no tiene salida a Google. En producción no se define y se usan los
 * de Google.
 */
function base(): string | null {
  return process.env.GOOGLE_OAUTH_BASE ?? null;
}

export function authorizationEndpoint(): string {
  const b = base();
  return b ? `${b}/authorize` : "https://accounts.google.com/o/oauth2/v2/auth";
}

export function tokenEndpoint(): string {
  const b = base();
  return b ? `${b}/token` : "https://oauth2.googleapis.com/token";
}

function jwksUri(): string {
  const b = base();
  return b ? `${b}/certs` : "https://www.googleapis.com/oauth2/v3/certs";
}

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/** Lee y valida la configuración. Falla temprano y claro si falta algo. */
export function getGoogleConfig(origin: string): GoogleConfig {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Faltan GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET. Cargalas en las variables de entorno.",
    );
  }

  // La URI de retorno se arma con el origen real de la petición, así funciona
  // igual en local, en una preview de Vercel y en producción. Tiene que estar
  // dada de alta en la consola de Google, tal cual.
  return {
    clientId,
    clientSecret,
    redirectUri: `${origin}/api/auth/google/callback`,
  };
}

/* -------------------------------------------------------------------------- */
/* PKCE y state                                                               */
/* -------------------------------------------------------------------------- */

function base64url(buffer: Buffer): string {
  return buffer.toString("base64url");
}

export function createVerifier(): string {
  return base64url(randomBytes(32));
}

export function challengeFor(verifier: string): string {
  return base64url(createHash("sha256").update(verifier).digest());
}

export function createState(): string {
  return base64url(randomBytes(16));
}

/** URL a la que se manda a la persona para que se identifique en Google. */
export function buildAuthorizationUrl(
  config: GoogleConfig,
  state: string,
  codeChallenge: string,
): string {
  const url = new URL(authorizationEndpoint());
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  // Que siempre se pueda elegir con qué cuenta entrar.
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

/* -------------------------------------------------------------------------- */
/* Intercambio del código y verificación del id_token                         */
/* -------------------------------------------------------------------------- */

export interface GoogleProfile {
  /** Identificador estable de la cuenta en Google. */
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture: string | null;
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  jwks ??= createRemoteJWKSet(new URL(jwksUri()));
  return jwks;
}

/**
 * Cambia el `code` por tokens y devuelve el perfil.
 *
 * El `id_token` se verifica contra las claves públicas de Google aunque el
 * intercambio ya haya sido servidor a servidor sobre TLS: es barato y cierra la
 * puerta a que un endpoint mal configurado devuelva un token de otro emisor.
 */
export async function exchangeCodeForProfile(
  config: GoogleConfig,
  code: string,
  codeVerifier: string,
): Promise<GoogleProfile> {
  const respuesta = await fetch(tokenEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
      code_verifier: codeVerifier,
    }),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => "");
    throw new Error(
      `Google rechazó el intercambio del código: ${respuesta.status} ${detalle.slice(0, 200)}`,
    );
  }

  const datos = (await respuesta.json()) as { id_token?: string };
  if (!datos.id_token) throw new Error("Google no devolvió id_token");

  const { payload } = await jwtVerify(datos.id_token, getJwks(), {
    issuer: GOOGLE_ISSUERS,
    audience: config.clientId,
  });

  const sub = typeof payload.sub === "string" ? payload.sub : null;
  const email = typeof payload.email === "string" ? payload.email : null;
  if (!sub || !email)
    throw new Error("El id_token de Google no trae sub o email");

  return {
    sub,
    email: email.toLowerCase(),
    emailVerified: payload.email_verified === true,
    name: typeof payload.name === "string" ? payload.name : "",
    picture: typeof payload.picture === "string" ? payload.picture : null,
  };
}
