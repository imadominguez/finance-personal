import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { procesarMensaje } from "@/lib/whatsapp/procesar";
import { normalizarTelefono } from "@/lib/whatsapp/telefono";
import { whatsappEntranteSchema } from "@/lib/validation/schemas";

/**
 * Entrada de los mensajes de WhatsApp.
 *
 * **Es la superficie más peligrosa de la app**: crea movimientos sin cookie de
 * sesión. El orden de los controles no es decorativo —primero se prueba quién
 * llama, después qué manda, y recién ahí se toca la base—.
 *
 * El bot que llama acá vive fuera de Vercel (open-wa necesita un proceso
 * prendido). Ver `bot/README.md`.
 */

/** Comparación en tiempo constante: comparar con `===` filtra el token. */
function tokenValido(recibido: string, esperado: string): boolean {
  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: Request): Promise<Response> {
  const esperado = process.env["WHATSAPP_BOT_TOKEN"];
  if (!esperado) {
    // Sin secreto configurado el módulo queda apagado, no abierto.
    return NextResponse.json({ error: "no configurado" }, { status: 503 });
  }

  const cabecera = request.headers.get("authorization") ?? "";
  const recibido = cabecera.startsWith("Bearer ") ? cabecera.slice(7) : "";
  if (!recibido || !tokenValido(recibido, esperado)) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "cuerpo inválido" }, { status: 400 });
  }

  const parsed = whatsappEntranteSchema.safeParse(cuerpo);
  if (!parsed.success) {
    return NextResponse.json({ error: "datos inválidos" }, { status: 400 });
  }

  // Los grupos no se atienden: nadie quiere que sus gastos se carguen desde el
  // grupo de la facultad.
  if (parsed.data.isGroup || parsed.data.phone.includes("@g.us")) {
    return NextResponse.json({ respuesta: null });
  }

  const phone = normalizarTelefono(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: "teléfono inválido" }, { status: 400 });
  }

  try {
    const { texto } = await procesarMensaje({
      waMessageId: parsed.data.waMessageId,
      phone,
      body: parsed.data.body,
    });

    return NextResponse.json({ respuesta: texto });
  } catch (error) {
    // Que el bot no se quede esperando: contesta 500 y él decide si reintenta.
    console.error("[whatsapp] falló al procesar el mensaje", error);
    return NextResponse.json({ error: "error interno" }, { status: 500 });
  }
}
