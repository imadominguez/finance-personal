#!/usr/bin/env node
/*
 * Guarda un estado de sesión de Playwright para auditar las pantallas privadas.
 *
 * Entra con el Google falso local (scripts de prueba del repo), porque el
 * ingreso real no está disponible desde el contenedor. Requiere el servidor de
 * desarrollo levantado con GOOGLE_OAUTH_BASE apuntando a ese falso.
 *
 *   node sesion.mjs --url http://localhost:3800 --salida /tmp/sesion.json
 */
import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";

/** Acepta tanto `--clave=valor` como `--clave valor`. */
function leerArgumentos(argv) {
  const salida = {};
  for (let i = 0; i < argv.length; i++) {
    const actual = argv[i];
    if (!actual.startsWith("--")) continue;
    const [clave, ...resto] = actual.replace(/^--/, "").split("=");
    if (resto.length > 0) {
      salida[clave] = resto.join("=");
    } else if (argv[i + 1] && !argv[i + 1].startsWith("--")) {
      salida[clave] = argv[++i];
    } else {
      salida[clave] = true;
    }
  }
  return salida;
}

const args = leerArgumentos(process.argv.slice(2));

const BASE = args.url ?? "http://localhost:3000";
const FALSO = args.google ?? "http://localhost:4300";
const SALIDA = String(args.salida ?? "/tmp/sesion.json");
const EJECUTABLE = args.chromium ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const email = args.email ?? `auditoria-${Date.now()}@example.com`;

await fetch(`${FALSO}/__perfil`, {
  method: "POST",
  body: JSON.stringify({
    sub: `sub-auditoria-${Date.now()}`,
    email,
    email_verified: true,
    name: "Auditoría UX",
    picture: null,
  }),
}).catch(() => {
  console.error("No responde el Google falso en " + FALSO);
  process.exit(1);
});

const navegador = await chromium.launch({ executablePath: EJECUTABLE, args: ["--no-sandbox"] });
const ctx = await navegador.newContext({ locale: "es-AR" });
const page = await ctx.newPage();

await page.goto(`${BASE}/ingresar`, { waitUntil: "networkidle" });
await page.getByRole("link", { name: /Continuar con Google/i }).click();
await page.waitForURL(`${BASE}/hoy`, { timeout: 30000 });

if (args.datos !== "no") {
  // Datos de ejemplo: una app vacía no muestra listados ni filtros, y ahí es
  // donde están la mayoría de los hallazgos.
  await page.goto(`${BASE}/ajustes`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Cargar datos de ejemplo/i }).click();
  await page.waitForTimeout(2500);
}

writeFileSync(SALIDA, JSON.stringify(await ctx.storageState(), null, 2));
console.log(`sesión guardada en ${SALIDA} (cuenta: ${email})`);
await navegador.close();
