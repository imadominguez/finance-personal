import "server-only";

import { Prisma } from "@/lib/generated/prisma/client";
import {
  crearMovimiento,
  getFallbackCategoryId,
} from "@/lib/db/finance-repository";
import { prisma } from "@/lib/db/prisma";
import { toCategory } from "@/lib/db/mappers";
import { todayKey } from "@/lib/date";
import { formatMoney } from "@/lib/format";
import { elegirCategoria, interpretar } from "@/lib/whatsapp/parser";
import { canjearCodigo } from "@/lib/whatsapp/vincular";
import type { MoneyFormat } from "@/lib/types";

/**
 * Qué hacer con un mensaje que llegó por WhatsApp.
 *
 * Todo el módulo se decide acá: el bot es tonto y solo reenvía. Eso permite
 * cambiar de transporte —hoy open-wa, mañana la API oficial— sin tocar una
 * línea de esta lógica.
 */

/** Cuántos mensajes por hora se le atienden a un mismo número. */
const TOPE_POR_HORA = 30;

/** Cada cuánto se le vuelve a explicar a un número desconocido. */
const HORAS_ENTRE_AVISOS = 24;

/** Hasta cuándo se puede deshacer lo último cargado. */
const HORAS_PARA_DESHACER = 24;

export interface MensajeEntrante {
  waMessageId: string;
  /** Ya normalizado a E.164 por quien llama. */
  phone: string;
  body: string;
}

export interface Respuesta {
  /** `null` = no contestar nada. Cuidar el número es no hablar de más. */
  texto: string | null;
}

type Resultado =
  | "registrado"
  | "deshecho"
  | "vinculado"
  | "no-entendido"
  | "sin-cuenta"
  | "limitado";

const AYUDA = [
  "Mandame un gasto y lo cargo. Por ejemplo:",
  "",
  "• gasté $20000 en supermercado",
  "• 20 lucas nafta",
  "• café 1200",
  "• cobré 500 lucas de sueldo",
  "",
  "BORRAR deshace lo último que cargué.",
].join("\n");

export async function procesarMensaje(
  mensaje: MensajeEntrante,
): Promise<Respuesta> {
  // 1. Idempotencia. WhatsApp reintenta, y un gasto duplicado es un error caro.
  const yaVisto = await prisma.whatsAppMessage.findUnique({
    where: { waMessageId: mensaje.waMessageId },
    select: { id: true },
  });
  if (yaVisto) return { texto: null };

  // 2. Tope por número: protege la cuenta y el número del bot.
  const desdeHaceUnaHora = new Date(Date.now() - 60 * 60_000);
  const recientes = await prisma.whatsAppMessage.count({
    where: { phone: mensaje.phone, createdAt: { gte: desdeHaceUnaHora } },
  });

  if (recientes >= TOPE_POR_HORA) {
    // Se avisa una sola vez y después silencio, para no hacer ping-pong.
    const yaAvisado = await prisma.whatsAppMessage.findFirst({
      where: {
        phone: mensaje.phone,
        outcome: "limitado",
        createdAt: { gte: desdeHaceUnaHora },
      },
      select: { id: true },
    });

    return registrar(mensaje, {
      outcome: "limitado",
      userId: null,
      texto: yaAvisado
        ? null
        : "Recibí muchos mensajes seguidos. Probá de nuevo en un rato.",
    });
  }

  const intencion = interpretar(mensaje.body);

  const usuario = await prisma.user.findUnique({
    where: { phone: mensaje.phone },
    select: { id: true },
  });

  // 3. Número que todavía no está vinculado a ninguna cuenta.
  if (!usuario) {
    if (intencion.tipo === "codigo") {
      return vincularNumero(mensaje, intencion.codigo);
    }

    const desdeHaceUnDia = new Date(
      Date.now() - HORAS_ENTRE_AVISOS * 3_600_000,
    );
    const yaExplicado = await prisma.whatsAppMessage.findFirst({
      where: {
        phone: mensaje.phone,
        outcome: "sin-cuenta",
        createdAt: { gte: desdeHaceUnDia },
      },
      select: { id: true },
    });

    return registrar(mensaje, {
      outcome: "sin-cuenta",
      userId: null,
      texto: yaExplicado
        ? null
        : "Este número no está conectado a ninguna cuenta. Entrá a Mis Finanzas, andá a Ajustes → WhatsApp y mandame el código que te muestra.",
    });
  }

  // 4. Con cuenta: se actúa según lo que quiso decir.
  switch (intencion.tipo) {
    case "codigo":
      return registrar(mensaje, {
        outcome: "vinculado",
        userId: usuario.id,
        texto: "Este número ya está conectado a tu cuenta.",
      });

    case "ayuda":
      return registrar(mensaje, {
        outcome: "no-entendido",
        userId: usuario.id,
        texto: AYUDA,
      });

    case "deshacer":
      return deshacerUltimo(mensaje, usuario.id);

    case "movimiento":
      return registrarMovimiento(mensaje, usuario.id, intencion);

    default:
      return registrar(mensaje, {
        outcome: "no-entendido",
        userId: usuario.id,
        texto: `No entendí "${recortar(mensaje.body)}". ${AYUDA}`,
      });
  }
}

/* -------------------------------------------------------------------------- */
/* Acciones                                                                   */
/* -------------------------------------------------------------------------- */

async function vincularNumero(
  mensaje: MensajeEntrante,
  codigo: string,
): Promise<Respuesta> {
  const resultado = await canjearCodigo(codigo, mensaje.phone);

  if (!resultado.ok) {
    return registrar(mensaje, {
      outcome: "sin-cuenta",
      userId: null,
      texto:
        resultado.motivo === "numero-ocupado"
          ? "Este número ya está conectado a otra cuenta. Desconectalo desde ahí antes de usarlo acá."
          : "Ese código no sirve o ya venció. Generá uno nuevo desde Ajustes → WhatsApp.",
    });
  }

  return registrar(mensaje, {
    outcome: "vinculado",
    userId: resultado.userId,
    texto:
      "Listo, quedaste conectado. Mandame un gasto y lo cargo: probá con «café 1200».",
  });
}

async function registrarMovimiento(
  mensaje: MensajeEntrante,
  userId: string,
  intencion: Extract<ReturnType<typeof interpretar>, { tipo: "movimiento" }>,
): Promise<Respuesta> {
  const [filas, settings] = await Promise.all([
    prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        kind: true,
        color: true,
        icon: true,
        system: true,
      },
    }),
    prisma.settings.findUnique({
      where: { userId },
      select: { currency: true, locale: true },
    }),
  ]);

  const categorias = filas.map(toCategory);
  const elegida = elegirCategoria(
    intencion.categoria,
    categorias,
    intencion.kind,
  );

  const categoryId =
    elegida?.id ?? (await getFallbackCategoryId(userId, intencion.kind));
  if (!categoryId) {
    return registrar(mensaje, {
      outcome: "no-entendido",
      userId,
      texto:
        "No tenés ninguna categoría cargada todavía. Creá una desde la app y volvé a mandarme el gasto.",
    });
  }

  const transactionId = await crearMovimiento(userId, {
    kind: intencion.kind,
    amount: intencion.monto,
    categoryId,
    description: intencion.descripcion ?? elegida?.name ?? "Movimiento",
    date: todayKey(),
    method: "otro",
    note: undefined,
  });

  const formato: MoneyFormat = {
    currency: settings?.currency ?? "ARS",
    locale: settings?.locale ?? "es-AR",
    // Siempre en la moneda de la cuenta: el mensaje confirma lo que se guardó.
    usdRate: null,
  };
  const monto = formatMoney(intencion.monto, formato);
  const nombreCategoria =
    elegida?.name ?? categorias.find((c) => c.id === categoryId)?.name;

  const partes = [
    intencion.kind === "gasto"
      ? `Listo, anoté un gasto de ${monto}`
      : `Listo, anoté un ingreso de ${monto}`,
  ];
  if (elegida) partes.push(`en ${elegida.name}.`);
  else
    partes.push(
      `en ${nombreCategoria ?? "una categoría"}, porque no reconocí en qué gastaste.`,
    );
  partes.push("Respondé BORRAR si me equivoqué.");

  return registrar(mensaje, {
    outcome: "registrado",
    userId,
    transactionId,
    texto: partes.join(" "),
  });
}

async function deshacerUltimo(
  mensaje: MensajeEntrante,
  userId: string,
): Promise<Respuesta> {
  const desde = new Date(Date.now() - HORAS_PARA_DESHACER * 3_600_000);
  const ultimo = await prisma.whatsAppMessage.findFirst({
    where: {
      userId,
      outcome: "registrado",
      transactionId: { not: null },
      createdAt: { gte: desde },
    },
    orderBy: { createdAt: "desc" },
    select: { transactionId: true },
  });

  if (!ultimo?.transactionId) {
    return registrar(mensaje, {
      outcome: "no-entendido",
      userId,
      texto: "No encontré nada reciente para borrar.",
    });
  }

  // Filtrado por userId igual que el resto de las mutaciones: si no es suyo,
  // no borra nada en vez de avisar que existe.
  const borrado = await prisma.transaction.deleteMany({
    where: { id: ultimo.transactionId, userId },
  });

  return registrar(mensaje, {
    outcome: "deshecho",
    userId,
    texto:
      borrado.count > 0 ? "Listo, lo borré." : "Ese movimiento ya no estaba.",
  });
}

/* -------------------------------------------------------------------------- */

function recortar(texto: string): string {
  const limpio = texto.replace(/\s+/g, " ").trim();
  return limpio.length > 40 ? `${limpio.slice(0, 40)}…` : limpio;
}

/**
 * Deja constancia del mensaje y devuelve la respuesta.
 *
 * La fila es lo que da idempotencia, así que se escribe siempre, incluso
 * cuando no se contesta nada. Si otro proceso la insertó primero (el mismo
 * mensaje entregado dos veces), se calla: ya está atendido.
 */
async function registrar(
  mensaje: MensajeEntrante,
  datos: {
    outcome: Resultado;
    userId: string | null;
    transactionId?: string;
    texto: string | null;
  },
): Promise<Respuesta> {
  try {
    await prisma.whatsAppMessage.create({
      data: {
        waMessageId: mensaje.waMessageId,
        phone: mensaje.phone,
        outcome: datos.outcome,
        userId: datos.userId,
        transactionId: datos.transactionId,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { texto: null };
    }
    throw error;
  }

  return { texto: datos.texto };
}
