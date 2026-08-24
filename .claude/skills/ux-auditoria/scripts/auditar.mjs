#!/usr/bin/env node
/*
 * Auditoría UX automática, de mobile a desktop.
 *
 * Mide lo que se puede medir: áreas táctiles, contraste real sobre la pantalla
 * pintada, desbordes horizontales, botones de ícono sin nombre accesible y
 * campos sin label. Lo que no se puede medir —si el texto es claro, si el orden
 * tiene sentido— va con el checklist de docs/ux/07-checklist.md.
 *
 * Uso:
 *   node auditar.mjs --url http://localhost:3000 --rutas /hoy,/mes --sesion sesion.json
 *   node auditar.mjs --anchos 360,768        # por defecto 360,390,768,1280
 */
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";

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
const ANCHOS = String(args.anchos ?? "360,390,768,1280").split(",").map(Number);
const RUTAS = String(
  args.rutas ?? "/,/hoy,/mes,/anio,/movimientos,/fijos,/categorias,/ajustes",
).split(",");
const EJECUTABLE =
  args.chromium ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

/*
 * Mínimo de área del control, en px.
 *
 * Con el dedo, 44: es la práctica establecida en móvil (WCAG 2.5.5, nivel AAA)
 * y lo que separa una app cómoda de una que hay que apuntar. Con mouse alcanza
 * con 24 (WCAG 2.5.8, nivel AA), y bajar el umbral permite que el escritorio
 * sea más denso sin que la auditoría grite por algo que no es un problema.
 */
const AREA_MINIMA_TACTIL = 44;
const AREA_MINIMA_PUNTERO = 24;

/** A partir de este ancho se asume mouse en vez de dedo. */
const ANCHO_DE_ESCRITORIO = 700;

/* -------------------------------------------------------------------------- */
/* Lo que corre adentro de la página                                          */
/* -------------------------------------------------------------------------- */

const auditarEnPagina = (minimo) => `(() => {
  const AREA_MINIMA = ${minimo};
  const lienzo = document.createElement("canvas");
  lienzo.width = lienzo.height = 1;
  const ctx = lienzo.getContext("2d", { willReadFrequently: true });

  // Pinta el color sobre un fondo conocido: resuelve oklab, color-mix y alfa.
  const pixel = (color, debajo) => {
    ctx.clearRect(0, 0, 1, 1);
    if (debajo) { ctx.fillStyle = debajo; ctx.fillRect(0, 0, 1, 1); }
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r, g, b];
  };
  const luminancia = (rgb) => {
    const [r, g, b] = rgb.map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contraste = (color, fondo, base) => {
    const f = pixel(fondo, base ?? "#ffffff");
    const c = pixel(color, "rgb(" + f.join(",") + ")");
    const la = luminancia(c), lb = luminancia(f);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  };

  const fondoBase = getComputedStyle(document.body).backgroundColor;
  const fondoDe = (el) => {
    let n = el;
    while (n) {
      const c = getComputedStyle(n).backgroundColor;
      if (c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent") return c;
      n = n.parentElement;
    }
    return fondoBase;
  };
  const visible = (el) => {
    const css = getComputedStyle(el);
    if (css.visibility === "hidden" || css.display === "none" || css.opacity === "0")
      return false;
    // Los inputs escondidos que algunas librerías dejan para que el formulario
    // se envíe: 1x1 px, aria-hidden y fuera del orden de foco. No son controles.
    if (el.getAttribute("aria-hidden") === "true") return false;
    const caja = el.getBoundingClientRect();
    if (caja.width < 4 || caja.height < 4) return false;
    return true;
  };

  /*
   * Un enlace adentro de una oración es una excepción reconocida por WCAG
   * 2.5.5: agrandarlo a 44 px rompería el renglón. Se reporta aparte para no
   * mezclarlo con los controles que sí hay que arreglar.
   */
  const CONTENEDORES_DE_TEXTO = ["P", "SPAN", "SMALL", "LI", "TD", "LABEL", "FOOTER"];
  const esEnlaceEnTexto = (el) => {
    if (el.tagName !== "A") return false;
    const padre = el.parentElement;
    // Tiene que estar dentro de un bloque de texto, no de un contenedor de
    // maquetado: un logo en un <div> flex no es un enlace en una oración.
    if (!padre || !CONTENEDORES_DE_TEXTO.includes(padre.tagName)) return false;
    const textoDelPadre = (padre.textContent ?? "").trim();
    const textoPropio = (el.textContent ?? "").trim();
    return textoDelPadre.length > textoPropio.length + 8;
  };
  const donde = (el) => {
    const partes = [];
    let n = el;
    for (let i = 0; n && i < 3; i++, n = n.parentElement) {
      partes.unshift(n.tagName.toLowerCase() + (n.className && typeof n.className === "string"
        ? "." + n.className.trim().split(/\\s+/).slice(0, 2).join(".") : ""));
    }
    return partes.join(" > ").slice(0, 110);
  };
  const texto = (el) => (el.textContent ?? "").trim().replace(/\\s+/g, " ").slice(0, 40);

  const hallazgos = [];
  const agregar = (tipo, el, detalle) =>
    hallazgos.push({ tipo, detalle, texto: texto(el), donde: donde(el) });

  // 1. Áreas táctiles.
  const interactivos = document.querySelectorAll(
    'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])',
  );
  const vistos = new Set();
  for (const el of interactivos) {
    if (!visible(el)) continue;
    const caja = el.getBoundingClientRect();
    // El área efectiva puede agrandarse con un ::after; se mide también eso.
    let ancho = caja.width, alto = caja.height;
    for (const pseudo of ["::after", "::before"]) {
      const css = getComputedStyle(el, pseudo);
      if (css.content && css.content !== "none" && css.position === "absolute") {
        const inset = ["top", "right", "bottom", "left"].map((l) => parseFloat(css[l]) || 0);
        ancho = Math.max(ancho, caja.width - inset[1] - inset[3]);
        alto = Math.max(alto, caja.height - inset[0] - inset[2]);
      }
    }
    if (ancho < AREA_MINIMA - 0.5 || alto < AREA_MINIMA - 0.5) {
      const clave = donde(el) + texto(el);
      if (!vistos.has(clave)) {
        vistos.add(clave);
        agregar(
          esEnlaceEnTexto(el) ? "area-tactil-inline" : "area-tactil",
          el,
          Math.round(ancho) + "x" + Math.round(alto) + " px",
        );
      }
    }
  }

  // 2. Nombre accesible en controles sin texto.
  for (const el of interactivos) {
    if (!visible(el)) continue;
    if (el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA") continue;
    const tieneTexto = texto(el).length > 0;
    const tieneNombre =
      el.getAttribute("aria-label") || el.getAttribute("title") ||
      el.getAttribute("aria-labelledby") || tieneTexto;
    if (!tieneNombre) agregar("sin-nombre", el, "control sin texto ni aria-label");
  }

  // 3. Campos sin label asociado.
  for (const el of document.querySelectorAll("input:not([type=hidden]), select, textarea")) {
    if (!visible(el)) continue;
    const id = el.getAttribute("id");
    const tieneLabel =
      (id && document.querySelector('label[for="' + CSS.escape(id) + '"]')) ||
      el.closest("label") || el.getAttribute("aria-label") || el.getAttribute("aria-labelledby");
    if (!tieneLabel) agregar("sin-label", el, (el.getAttribute("type") ?? el.tagName.toLowerCase()) + " sin label");
  }

  // 4. Contraste de texto.
  const combinaciones = new Set();
  for (const el of document.querySelectorAll("p,span,h1,h2,h3,h4,a,button,li,td,th,label,dd,dt,small,strong,em")) {
    if (!visible(el) || el.children.length > 0) continue;
    if (!texto(el)) continue;
    const css = getComputedStyle(el);
    if (css.color === "rgba(0, 0, 0, 0)") continue; // texto con degradado
    const fondo = fondoDe(el);
    const tam = parseFloat(css.fontSize);
    const grande = tam >= 24 || (tam >= 18.66 && Number(css.fontWeight) >= 700);
    const clave = css.color + "|" + fondo + "|" + grande;
    if (combinaciones.has(clave)) continue;
    combinaciones.add(clave);
    const ratio = contraste(css.color, fondo, fondoBase);
    const minimo = grande ? 3 : 4.5;
    if (ratio < minimo)
      agregar("contraste", el, ratio.toFixed(2) + ":1 (mínimo " + minimo + ")");
  }

  // 5. Imágenes sin alternativa textual.
  for (const el of document.querySelectorAll("img")) {
    if (!visible(el)) continue;
    if (el.getAttribute("alt") === null) agregar("img-sin-alt", el, el.getAttribute("src")?.slice(0, 50) ?? "");
  }

  // 6. Desborde horizontal.
  const desborde = document.documentElement.scrollWidth - document.documentElement.clientWidth;

  return { hallazgos, desborde };
})()`;

/* -------------------------------------------------------------------------- */

const navegador = await chromium.launch({
  executablePath: EJECUTABLE,
  args: ["--no-sandbox"],
});

const estado = args.sesion
  ? JSON.parse(readFileSync(String(args.sesion), "utf8"))
  : undefined;

const TIPOS = {
  "area-tactil": "Control más chico que el mínimo del dispositivo",
  "area-tactil-inline": "Enlace chico dentro de un texto (excepción WCAG 2.5.5, revisar a ojo)",
  "sin-nombre": "Control sin nombre accesible",
  "sin-label": "Campo sin label",
  contraste: "Contraste por debajo del mínimo",
  "img-sin-alt": "Imagen sin alt",
  desborde: "La página scrollea en horizontal",
};

let total = 0;

for (const ancho of ANCHOS) {
  const ctx = await navegador.newContext({
    viewport: { width: ancho, height: ancho < ANCHO_DE_ESCRITORIO ? 780 : 900 },
    deviceScaleFactor: 2,
    isMobile: ancho < ANCHO_DE_ESCRITORIO,
    hasTouch: ancho < ANCHO_DE_ESCRITORIO,
    locale: "es-AR",
    storageState: estado,
  });
  const page = await ctx.newPage();

  const tactil = ancho < ANCHO_DE_ESCRITORIO;
  console.log(
    `\n${"=".repeat(64)}\n  ${ancho} px  ${tactil ? "(teléfono · mínimo 44 px)" : ancho < 1024 ? "(tablet · mínimo 24 px)" : "(escritorio · mínimo 24 px)"}\n${"=".repeat(64)}`,
  );

  for (const ruta of RUTAS) {
    let resultado;
    try {
      await page.goto(BASE + ruta, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(400);
      resultado = await page.evaluate(
        auditarEnPagina(
          ancho < ANCHO_DE_ESCRITORIO ? AREA_MINIMA_TACTIL : AREA_MINIMA_PUNTERO,
        ),
      );
    } catch (error) {
      console.log(`\n  ${ruta.padEnd(16)} NO SE PUDO CARGAR: ${error.message.split("\n")[0]}`);
      continue;
    }

    const { hallazgos, desborde } = resultado;
    if (desborde > 1) hallazgos.push({ tipo: "desborde", detalle: desborde + " px de más", texto: "", donde: "documento" });

    // Las excepciones se muestran, pero no hacen fallar la auditoría.
    total += hallazgos.filter((h) => h.tipo !== "area-tactil-inline").length;

    if (hallazgos.length === 0) {
      console.log(`\n  ${ruta.padEnd(16)} sin hallazgos`);
      continue;
    }

    console.log(`\n  ${ruta.padEnd(16)} ${hallazgos.length} hallazgo(s)`);
    const porTipo = {};
    for (const h of hallazgos) (porTipo[h.tipo] ??= []).push(h);
    for (const [tipo, lista] of Object.entries(porTipo)) {
      console.log(`    · ${TIPOS[tipo] ?? tipo} (${lista.length})`);
      const tope = args.todo ? lista.length : 6;
      for (const h of lista.slice(0, tope)) {
        const etiqueta = h.texto ? `"${h.texto}"` : h.donde;
        console.log(`        ${h.detalle.padEnd(24)} ${etiqueta}`);
      }
      if (lista.length > tope)
        console.log(`        … y ${lista.length - tope} más (--todo para verlos)`);
    }
  }

  await ctx.close();
}

console.log(`\n${"=".repeat(64)}\nTOTAL: ${total} hallazgo(s)\n`);
await navegador.close();
process.exit(total > 0 ? 1 : 0);
