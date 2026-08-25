/*
 * Puente entre WhatsApp y Mis Finanzas.
 *
 * Este proceso no sabe nada de finanzas: recibe un mensaje, se lo pasa a la
 * app y contesta lo que la app le diga. Toda la lógica —interpretar el texto,
 * vincular el número, guardar el movimiento— vive en el repo de la app, con
 * sus tests.
 *
 * Es a propósito: si mañana el número se cae o se migra a la API oficial de
 * Meta, se reemplaza este archivo y nada más.
 *
 * No corre en Vercel: open-wa maneja una sesión de WhatsApp Web con un
 * Chromium y necesita un proceso prendido. Ver README.md.
 */
import { create } from "@open-wa/wa-automate";

const APP_URL = requerido("APP_URL");
const TOKEN = requerido("WHATSAPP_BOT_TOKEN");

/** Cuánto se espera a la app antes de dar el mensaje por perdido. */
const ESPERA_MS = 15_000;

function requerido(nombre) {
  const valor = process.env[nombre];
  if (!valor) {
    console.error(`Falta la variable ${nombre}. Ver README.md`);
    process.exit(1);
  }
  return valor;
}

async function consultarALaApp(mensaje) {
  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), ESPERA_MS);

  try {
    const respuesta = await fetch(`${APP_URL}/api/whatsapp/entrante`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(mensaje),
      signal: control.signal,
    });

    if (!respuesta.ok) {
      console.error(`[bot] la app respondió ${respuesta.status}`);
      return null;
    }

    const datos = await respuesta.json();
    return typeof datos?.respuesta === "string" ? datos.respuesta : null;
  } catch (error) {
    console.error("[bot] no se pudo hablar con la app:", error.message);
    return null;
  } finally {
    clearTimeout(reloj);
  }
}

create({
  sessionId: "mis-finanzas",
  headless: true,
  /*
   * La sesión se guarda acá. Si se pierde hay que volver a escanear el QR, así
   * que en un servidor conviene que sea un volumen que sobreviva a los
   * despliegues.
   */
  sessionDataPath: process.env.SESSION_PATH ?? "./sesion",
  qrTimeout: 0,
  authTimeout: 0,
  restartOnCrash: true,
  killProcessOnBrowserClose: true,
  disableSpins: true,
}).then((cliente) => {
  console.log("[bot] conectado, esperando mensajes");

  cliente.onMessage(async (mensaje) => {
    /*
     * Solo conversaciones uno a uno y solo texto. Nada de grupos, estados ni
     * listas de difusión: es la regla que más cuida el número.
     */
    if (mensaje.isGroupMsg) return;
    if (mensaje.type !== "chat") return;
    if (typeof mensaje.body !== "string" || !mensaje.body.trim()) return;

    const respuesta = await consultarALaApp({
      waMessageId: mensaje.id,
      phone: mensaje.from,
      body: mensaje.body,
      isGroup: false,
    });

    // Silencio deliberado cuando la app no manda texto: no se contesta de más.
    if (!respuesta) return;

    try {
      await cliente.reply(mensaje.from, respuesta, mensaje.id);
    } catch (error) {
      console.error("[bot] no se pudo responder:", error.message);
    }
  });
});
