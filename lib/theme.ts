/**
 * Sistema de temas.
 *
 * La app nació dark-only. Acá vive todo lo necesario para que además sea
 * personalizable: modo (claro / oscuro / el del sistema), color de acento y
 * radio de los bordes.
 *
 * Reglas de diseño que sostienen el resto del archivo:
 *
 *  1. **Una sola variable manda el color.** El acento se aplica pisando
 *     `--brand`; en `globals.css` el resto (`--primary`, `--ring`, los
 *     `--chart-*`, la barra lateral) se deriva de ahí con `color-mix`. Así
 *     cambiar de acento no implica recalcular quince valores.
 *  2. **Nada se muestra ilegible.** Los presets están medidos contra el fondo
 *     y contra las tarjetas de su modo, y un color elegido a mano se ajusta
 *     solo hasta cumplir 4.5:1 (WCAG AA para texto chico), porque `text-brand`
 *     se usa en etiquetas de 12px.
 *
 * Este módulo no importa React ni nada del servidor: lo usan por igual el
 * script que corre antes del primer pintado, el provider y las Server Actions.
 */

export const MODOS = ["claro", "oscuro", "sistema"] as const;
export type Modo = (typeof MODOS)[number];

export const ACENTO_PERSONALIZADO = "personalizado";

/** Contraste mínimo exigido al acento contra el fondo. WCAG AA, texto normal. */
const OBJETIVO_CONTRASTE = 4.6;

/**
 * Las dos superficies sobre las que se apoya el acento en cada modo. Se piden
 * ambas porque no siempre gana la misma: en claro el fondo de página es más
 * oscuro que las tarjetas, y en oscuro es al revés.
 */
const SUPERFICIES = {
  claro: ["#faf9f7", "#ffffff"],
  oscuro: ["#0a0a0a", "#121212"],
} as const;

/** Color de la barra del navegador (meta `theme-color`) en cada modo. */
export const COLOR_BARRA = {
  claro: "#faf9f7",
  oscuro: "#0a0a0a",
} as const;

export interface Acento {
  id: string;
  nombre: string;
  /** Valor para modo claro y para modo oscuro: el mismo color no sirve en los dos. */
  claro: string;
  oscuro: string;
}

/**
 * Acentos listos para usar. Cada par está medido: los dos valores llegan a
 * 4.5:1 contra el fondo y contra las tarjetas de su modo, y el texto que va
 * encima (`--primary-foreground`) también.
 */
export const ACENTOS: readonly Acento[] = [
  { id: "naranja", nombre: "Naranja", oscuro: "#e85d24", claro: "#c2410c" },
  { id: "ambar", nombre: "Ámbar", oscuro: "#f59e0b", claro: "#96600b" },
  { id: "verde", nombre: "Verde", oscuro: "#10b981", claro: "#047857" },
  { id: "agua", nombre: "Agua", oscuro: "#22d3ee", claro: "#0e7490" },
  { id: "azul", nombre: "Azul", oscuro: "#60a5fa", claro: "#1d4ed8" },
  { id: "violeta", nombre: "Violeta", oscuro: "#a78bfa", claro: "#6d28d9" },
  { id: "rosa", nombre: "Rosa", oscuro: "#f472b6", claro: "#be185d" },
  { id: "grafito", nombre: "Grafito", oscuro: "#d6d3d1", claro: "#3f3a34" },
];

export interface Radio {
  id: string;
  nombre: string;
  valor: string;
}

/** `--radius`; el resto de la escala sale de este valor en `globals.css`. */
export const RADIOS: readonly Radio[] = [
  { id: "recto", nombre: "Recto", valor: "0.25rem" },
  { id: "suave", nombre: "Suave", valor: "0.5rem" },
  { id: "normal", nombre: "Normal", valor: "0.75rem" },
  { id: "redondo", nombre: "Redondo", valor: "1.15rem" },
];

export interface Tema {
  modo: Modo;
  /** Id de un preset de `ACENTOS`, o `"personalizado"`. */
  acento: string;
  /** Color elegido a mano. Solo cuenta cuando `acento` es `"personalizado"`. */
  color: string;
  /** Id de un preset de `RADIOS`. */
  radio: string;
}

/**
 * El tema original de la app: oscuro y naranja. Es el que renderiza el
 * servidor, así que quien nunca tocó nada no ve ningún salto al cargar.
 */
export const TEMA_POR_DEFECTO: Tema = {
  modo: "oscuro",
  acento: "naranja",
  color: "#e85d24",
  radio: "normal",
};

/** Clave de localStorage. Corta a propósito: viaja en el script en línea. */
export const CLAVE_TEMA = "tema";

/**
 * Versión del formato guardado. Si cambia cómo se derivan los colores, subirla
 * hace que el provider recalcule lo que haya en el navegador en vez de pintar
 * con valores viejos.
 */
export const VERSION_TEMA = 1;

/* -------------------------------------------------------------------------- */
/* Color: contraste y mezclas                                                  */
/* -------------------------------------------------------------------------- */

function aRgb(hex: string): [number, number, number] {
  const limpio = hex.replace("#", "");
  const completo =
    limpio.length === 3
      ? limpio
          .split("")
          .map((c) => c + c)
          .join("")
      : limpio;
  return [
    parseInt(completo.slice(0, 2), 16),
    parseInt(completo.slice(2, 4), 16),
    parseInt(completo.slice(4, 6), 16),
  ];
}

function aHex(rgb: number[]): string {
  return `#${rgb
    .map((valor) =>
      Math.round(Math.min(255, Math.max(0, valor)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

/** Luminancia relativa según WCAG. */
function luminancia(hex: string): number {
  const [r, g, b] = aRgb(hex).map((valor) => {
    const s = valor / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Relación de contraste entre dos colores, de 1 a 21. */
export function contraste(a: string, b: string): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Mezcla en sRGB. Alcanza: lo único que importa acá es que sea monótona. */
function mezclar(hex: string, hacia: string, cantidad: number): string {
  const desde = aRgb(hex);
  const destino = aRgb(hacia);
  return aHex(
    desde.map((valor, i) => valor + (destino[i]! - valor) * cantidad),
  );
}

/**
 * Acerca `hex` al blanco o al negro —lo que corresponda según los fondos—
 * hasta que contrasta lo suficiente contra todos ellos.
 *
 * La búsqueda binaria encuentra la mezcla más chica que cumple, así el color
 * conserva todo el tono que puede: un violeta sigue siendo violeta.
 */
export function ajustarContraste(
  hex: string,
  fondos: readonly string[],
  objetivo: number,
): string {
  const cumple = (color: string) =>
    fondos.every((fondo) => contraste(color, fondo) >= objetivo);
  if (cumple(hex)) return hex;

  const hacia = luminancia(fondos[0]!) > 0.5 ? "#000000" : "#ffffff";
  let bajo = 0;
  let alto = 1;
  for (let i = 0; i < 24; i++) {
    const medio = (bajo + alto) / 2;
    if (cumple(mezclar(hex, hacia, medio))) alto = medio;
    else bajo = medio;
  }
  return mezclar(hex, hacia, alto);
}

/** Blanco o casi negro: el que mejor se lea encima de `hex`. */
export function textoSobre(hex: string): string {
  return contraste("#ffffff", hex) >= contraste("#0a0a0a", hex)
    ? "#ffffff"
    : "#0a0a0a";
}

const HEX_VALIDO = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function esHexValido(valor: unknown): valor is string {
  return typeof valor === "string" && HEX_VALIDO.test(valor);
}

/* -------------------------------------------------------------------------- */
/* De preferencia a variables CSS                                              */
/* -------------------------------------------------------------------------- */

/** Variables que se pisan en línea sobre `<html>`, por modo. */
export type Variables = Record<string, string>;

export interface TemaAplicado {
  claro: Variables;
  oscuro: Variables;
}

export function acentoPorId(id: string): Acento | undefined {
  return ACENTOS.find((acento) => acento.id === id);
}

export function radioPorId(id: string): Radio {
  return RADIOS.find((radio) => radio.id === id) ?? RADIOS[2]!;
}

/** El par de colores (claro y oscuro) que corresponde a un tema. */
export function coloresDeAcento(tema: Tema): { claro: string; oscuro: string } {
  const preset = acentoPorId(tema.acento);
  if (preset) return { claro: preset.claro, oscuro: preset.oscuro };

  const base = esHexValido(tema.color) ? tema.color : TEMA_POR_DEFECTO.color;
  return {
    claro: ajustarContraste(base, SUPERFICIES.claro, OBJETIVO_CONTRASTE),
    oscuro: ajustarContraste(base, SUPERFICIES.oscuro, OBJETIVO_CONTRASTE),
  };
}

/**
 * Traduce una preferencia a las variables CSS de cada modo.
 *
 * Son solo tres: el acento, el color del texto que va encima del acento y el
 * radio. Todo lo demás se deriva en CSS.
 */
export function variablesDeTema(tema: Tema): TemaAplicado {
  const acento = coloresDeAcento(tema);
  const radio = radioPorId(tema.radio).valor;

  return {
    claro: {
      "--brand": acento.claro,
      "--primary-foreground": textoSobre(acento.claro),
      "--radius": radio,
    },
    oscuro: {
      "--brand": acento.oscuro,
      "--primary-foreground": textoSobre(acento.oscuro),
      "--radius": radio,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Guardado                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Lo que se guarda en `localStorage`: la preferencia y las variables ya
 * calculadas.
 *
 * Las variables van precalculadas para que el script que corre antes del
 * primer pintado no tenga que hacer cuentas de contraste: lee, aplica y listo.
 */
export interface TemaGuardado extends Tema {
  v: number;
  vars: TemaAplicado;
}

export function normalizarTema(valor: unknown): Tema {
  const crudo = (valor ?? {}) as Partial<Tema>;

  const modo = MODOS.includes(crudo.modo as Modo)
    ? (crudo.modo as Modo)
    : TEMA_POR_DEFECTO.modo;

  const acento =
    typeof crudo.acento === "string" &&
    (crudo.acento === ACENTO_PERSONALIZADO || acentoPorId(crudo.acento))
      ? crudo.acento
      : TEMA_POR_DEFECTO.acento;

  const color = esHexValido(crudo.color) ? crudo.color : TEMA_POR_DEFECTO.color;

  const radio = RADIOS.some((item) => item.id === crudo.radio)
    ? (crudo.radio as string)
    : TEMA_POR_DEFECTO.radio;

  return { modo, acento, color, radio };
}

export function empaquetarTema(tema: Tema): TemaGuardado {
  return { ...tema, v: VERSION_TEMA, vars: variablesDeTema(tema) };
}

export function esTemaPorDefecto(tema: Tema): boolean {
  return (
    tema.modo === TEMA_POR_DEFECTO.modo &&
    tema.acento === TEMA_POR_DEFECTO.acento &&
    tema.radio === TEMA_POR_DEFECTO.radio
  );
}
