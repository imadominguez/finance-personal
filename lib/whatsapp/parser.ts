/**
 * Interpreta lo que llega por WhatsApp.
 *
 * Módulo **puro**: no toca la base, ni la red, ni el reloj. Recibe un texto y
 * devuelve qué quiso decir la persona. Eso lo hace testeable sin levantar nada
 * (ver `parser.test.ts`) y es la única pieza del módulo que se puede verificar
 * a fondo sin un WhatsApp de verdad.
 *
 * No reusa `parseAmountInput` de `lib/format.ts` a propósito: aquella resuelve
 * lo que se tipea en un campo de monto, y acá llega prosa suelta con
 * multiplicadores rioplatenses ("20 lucas", "35k"). Son dos problemas
 * distintos; mezclarlos ensuciaría las dos.
 */

import type { Category, MovementKind } from "@/lib/types";

/** Lo más largo que se atiende. Más que esto no es un gasto, es otra cosa. */
const LARGO_MAXIMO = 400;

export type Intencion =
  | {
      tipo: "movimiento";
      kind: MovementKind;
      monto: number;
      /** Texto candidato a categoría. Lo resuelve `elegirCategoria`. */
      categoria: string | null;
      descripcion: string | null;
    }
  | { tipo: "deshacer" }
  | { tipo: "ayuda" }
  | { tipo: "codigo"; codigo: string }
  | { tipo: "no-entendido" };

/* -------------------------------------------------------------------------- */
/* Normalización                                                              */
/* -------------------------------------------------------------------------- */

/** Minúsculas, sin acentos y con los espacios ordenados. */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/* -------------------------------------------------------------------------- */
/* Vocabulario                                                                */
/* -------------------------------------------------------------------------- */

/** Gana sobre los de ingreso: "gasté el sueldo" es un gasto. */
const VERBOS_GASTO = [
  "gaste",
  "gastamos",
  "pague",
  "pagamos",
  "compre",
  "compramos",
  "saque",
];

const VERBOS_INGRESO = [
  "cobre",
  "cobramos",
  "me pagaron",
  "me depositaron",
  "depositaron",
  "ingrese",
  "entro",
  "vendi",
  "vendimos",
];

/**
 * Sustantivos que también indican un ingreso, pero que **no** se sacan del
 * texto: son nombres de categorías reales. Si se borran, "cobré el sueldo"
 * queda sin categoría.
 */
const SUSTANTIVOS_INGRESO = ["sueldo", "aguinaldo", "ingreso", "deposito"];

/** Multiplicadores: "20 lucas" son veinte mil. */
const MULTIPLICADORES: Record<string, number> = {
  k: 1_000,
  mil: 1_000,
  luca: 1_000,
  lucas: 1_000,
  palo: 1_000_000,
  palos: 1_000_000,
  millon: 1_000_000,
  millones: 1_000_000,
};

/** Palabras que no aportan nada a la categoría ni a la descripción. */
const RELLENO = new Set([
  "en",
  "de",
  "del",
  "el",
  "la",
  "los",
  "las",
  "un",
  "una",
  "unos",
  "unas",
  "por",
  "para",
  "a",
  "al",
  "con",
  "mi",
  "me",
  "y",
  "pesos",
  "peso",
  "plata",
]);

/**
 * Cómo se dice en la calle lo que la app llama de otra forma. Se machea contra
 * el nombre de la categoría, así que sirve para cualquier persona sin importar
 * cómo llamó a las suyas.
 */
const ALIAS: Record<string, string> = {
  super: "supermercado",
  chino: "supermercado",
  mercado: "supermercado",
  verduleria: "supermercado",
  carniceria: "supermercado",
  nafta: "transporte",
  combustible: "transporte",
  sube: "transporte",
  colectivo: "transporte",
  bondi: "transporte",
  taxi: "transporte",
  uber: "transporte",
  remis: "transporte",
  subte: "transporte",
  farmacia: "salud",
  medico: "salud",
  remedios: "salud",
  pedido: "delivery y salidas",
  delivery: "delivery y salidas",
  rappi: "delivery y salidas",
  pedidosya: "delivery y salidas",
  bar: "delivery y salidas",
  cafe: "delivery y salidas",
  resto: "delivery y salidas",
  restaurante: "delivery y salidas",
  cine: "ocio",
  netflix: "ocio",
  spotify: "ocio",
  gimnasio: "ocio",
  gym: "ocio",
  luz: "servicios",
  gas: "servicios",
  agua: "servicios",
  internet: "servicios",
  telefono: "servicios",
  celular: "servicios",
  expensas: "alquiler",
};

const PALABRAS_AYUDA = new Set(["ayuda", "help", "?", "comandos", "hola"]);
const PALABRAS_DESHACER = new Set([
  "borrar",
  "borra",
  "deshacer",
  "cancelar",
  "undo",
]);

/* -------------------------------------------------------------------------- */
/* Montos                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Convierte el número tal como se escribió a un valor.
 *
 * La ambigüedad real es el punto: "1.500" son mil quinientos y "20.50" son
 * veinte con cincuenta. Se resuelve por la cantidad de dígitos que siguen al
 * separador: exactamente tres es separador de miles, cualquier otra cosa es
 * decimal.
 */
export function interpretarNumero(crudo: string): number {
  const limpio = crudo.replace(/\s/g, "");
  const ultimaComa = limpio.lastIndexOf(",");
  const ultimoPunto = limpio.lastIndexOf(".");

  // Con los dos separadores, el último es el decimal.
  if (ultimaComa !== -1 && ultimoPunto !== -1) {
    const decimal = ultimaComa > ultimoPunto ? "," : ".";
    const miles = decimal === "," ? "." : ",";
    return Number(limpio.split(miles).join("").replace(decimal, "."));
  }

  const separador = ultimaComa !== -1 ? "," : ultimoPunto !== -1 ? "." : null;
  if (!separador) return Number(limpio);

  const partes = limpio.split(separador);
  const ultima = partes[partes.length - 1] ?? "";
  const esMiles = partes.length > 1 && ultima.length === 3;

  return esMiles
    ? Number(partes.join(""))
    : Number(partes.slice(0, -1).join("") + "." + ultima);
}

const MONTO =
  /(?:\$\s*)?(\d{1,3}(?:[.,]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?)\s*(k|mil|lucas?|palos?|millones?|millon)?\b/;

interface MontoEncontrado {
  valor: number;
  desde: number;
  hasta: number;
}

function buscarMonto(texto: string): MontoEncontrado | null {
  const encontrado = MONTO.exec(texto);
  if (!encontrado || encontrado.index === undefined) return null;

  const [completo, numero, sufijo] = encontrado;
  if (!numero) return null;

  const base = interpretarNumero(numero);
  if (!Number.isFinite(base)) return null;

  const factor = sufijo ? (MULTIPLICADORES[sufijo] ?? 1) : 1;
  const valor = Math.round(base * factor * 100) / 100;

  return {
    valor,
    desde: encontrado.index,
    hasta: encontrado.index + completo.length,
  };
}

/* -------------------------------------------------------------------------- */
/* Interpretación                                                             */
/* -------------------------------------------------------------------------- */

export function interpretar(texto: string): Intencion {
  if (typeof texto !== "string") return { tipo: "no-entendido" };

  const limpio = normalizar(texto);
  if (!limpio || limpio.length > LARGO_MAXIMO) return { tipo: "no-entendido" };

  if (PALABRAS_AYUDA.has(limpio)) return { tipo: "ayuda" };
  if (PALABRAS_DESHACER.has(limpio)) return { tipo: "deshacer" };

  /*
   * Código de vinculación. Se exige al menos una letra para que un monto suelto
   * de seis dígitos ("200000") no se confunda con un código.
   */
  const codigo = /^(?:vincular\s+)?([a-z0-9]{6,12})$/.exec(limpio);
  if (codigo?.[1] && /[a-z]/.test(codigo[1])) {
    return { tipo: "codigo", codigo: codigo[1].toUpperCase() };
  }

  const monto = buscarMonto(limpio);
  if (!monto || monto.valor <= 0) return { tipo: "no-entendido" };

  const kind = deducirTipo(limpio);
  const resto = (limpio.slice(0, monto.desde) + " " + limpio.slice(monto.hasta))
    .replace(/\s+/g, " ")
    .trim();

  const sinVerbos = resto
    .split(" ")
    .filter((palabra) => palabra && !esVerbo(palabra));

  /*
   * Dos lecturas del mismo sobrante, porque sirven para cosas distintas:
   *
   * - Para buscar la categoría se saca todo el relleno, también el del medio:
   *   "en el super" y "super" tienen que machear igual.
   * - Para la descripción se conserva lo que la persona escribió y solo se
   *   recorta el relleno del principio: "café con juan" se guarda entero, pero
   *   "en supermercado" se guarda como "supermercado".
   */
  const candidato = sinVerbos
    .filter((palabra) => !RELLENO.has(palabra))
    .join(" ")
    .trim();

  const paraDescripcion = [...sinVerbos];
  while (paraDescripcion.length > 0 && RELLENO.has(paraDescripcion[0]!)) {
    paraDescripcion.shift();
  }
  const descripcion = paraDescripcion.join(" ").trim();

  return {
    tipo: "movimiento",
    kind,
    monto: monto.valor,
    categoria: candidato || null,
    descripcion: descripcion ? capitalizar(descripcion) : null,
  };
}

function deducirTipo(texto: string): MovementKind {
  if (VERBOS_GASTO.some((verbo) => contiene(texto, verbo))) return "gasto";
  const pistasDeIngreso = [...VERBOS_INGRESO, ...SUSTANTIVOS_INGRESO];
  if (pistasDeIngreso.some((pista) => contiene(texto, pista))) return "ingreso";
  return "gasto";
}

function contiene(texto: string, frase: string): boolean {
  return new RegExp(`(^|\\s)${frase}(\\s|$)`).test(texto);
}

/** Solo los verbos se sacan. Los sustantivos pueden ser la categoría. */
function esVerbo(palabra: string): boolean {
  return VERBOS_GASTO.includes(palabra) || VERBOS_INGRESO.includes(palabra);
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/* -------------------------------------------------------------------------- */
/* Categorías                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Machea el texto sobrante contra las categorías que esa persona ya tiene.
 *
 * Se prueba de lo más específico a lo más laxo, y se devuelve `null` antes que
 * adivinar mal: el que llama registra en la categoría de descarte y lo dice en
 * la respuesta, así queda claro qué pasó.
 */
export function elegirCategoria(
  candidato: string | null,
  categorias: Category[],
  kind: MovementKind,
): Category | null {
  if (!candidato) return null;

  const propias = categorias.filter((categoria) => categoria.kind === kind);
  if (propias.length === 0) return null;

  const texto = normalizar(candidato);
  const conNombre = propias.map((categoria) => ({
    categoria,
    nombre: normalizar(categoria.name),
  }));

  // 1. El texto es exactamente el nombre de una categoría.
  const exacta = conNombre.find((item) => item.nombre === texto);
  if (exacta) return exacta.categoria;

  // 2. Uno contiene al otro: "super chino" contra "Supermercado".
  const parcial = conNombre.find(
    (item) => texto.includes(item.nombre) || item.nombre.includes(texto),
  );
  if (parcial) return parcial.categoria;

  // 3. Alias: cómo se dice en la calle.
  for (const palabra of texto.split(" ")) {
    const aliasDe = ALIAS[palabra];
    if (!aliasDe) continue;
    const porAlias = conNombre.find(
      (item) => item.nombre === aliasDe || item.nombre.includes(aliasDe),
    );
    if (porAlias) return porAlias.categoria;
  }

  // 4. Una palabra suelta que coincide con una palabra del nombre.
  for (const palabra of texto.split(" ")) {
    if (palabra.length < 4) continue;
    const porPalabra = conNombre.find((item) =>
      item.nombre.split(" ").includes(palabra),
    );
    if (porPalabra) return porPalabra.categoria;
  }

  return null;
}
