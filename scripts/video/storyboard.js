/*
 * Motor de tiempo del video.
 *
 * En vez de animaciones CSS, todo se calcula desde una función `seek(t)`. El
 * grabador puede pedir cualquier instante exacto, así que los cuadros salen
 * perfectos y reproducibles: no hay cuadros perdidos ni timing que dependa de
 * lo rápido que vaya la máquina.
 */

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency", currency: "ARS", maximumFractionDigits: 0,
});

/* ---------- utilidades de interpolación ---------- */

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** Progreso 0..1 de `t` dentro de [a, b]. */
const p = (t, a, b) => clamp01((t - a) / (b - a));
/** Arranca rápido y frena suave; se lee bien en textos y números. */
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a, b, x) => a + (b - a) * x;

/* ---------- contenido ---------- */

const CATEGORIAS = [
  { nombre: "Alquiler",    color: "#e85d24", monto: 480000, ancho: 100, pct: 36, icono: "casa" },
  { nombre: "Cuotas tarjeta", color: "#c45628", monto: 250000, ancho: 52, pct: 19, icono: "tarjeta" },
  { nombre: "Supermercado",color: "#ff8c42", monto: 193400, ancho: 40, pct: 15, icono: "carrito" },
  { nombre: "Servicios",   color: "#f0a070", monto: 138000, ancho: 29, pct: 10, icono: "rayo" },
  { nombre: "Ocio",        color: "#a855f7", monto: 97600,  ancho: 20, pct: 7,  icono: "ocio" },
];

const MESES = [
  { m: "Ene", v: 78 }, { m: "Feb", v: 82 }, { m: "Mar", v: 70 }, { m: "Abr", v: 88 },
  { m: "May", v: 84 }, { m: "Jun", v: 95 }, { m: "Jul", v: 100 }, { m: "Ago", v: 92 },
  { m: "Sep", v: 63 }, { m: "Oct", v: 63 }, { m: "Nov", v: 63 }, { m: "Dic", v: 55 },
];

const CHIPS = ["Supermercado", "Delivery", "Transporte", "Alquiler", "Servicios", "Ocio"];
/** Índice del chip que se "elige" en la escena de uso. */
const CHIP_ELEGIDO = 1;

const ICONOS = {
  casa: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  tarjeta: '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/>',
  carrito: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12h11L21 7H6"/>',
  rayo: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
  ocio: '<path d="M4 8h16l-1.5 12h-13L4 8Z"/><path d="M4 8 6 3h12l2 5"/>',
  repetir: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
};

const svg = (d) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

/* ---------- construcción del DOM ---------- */

// Chips de categoría de la escena "cómo se usa"
document.querySelector('[data-anim="cats"]').innerHTML = CHIPS.map(
  (nombre, i) => `
    <span data-chip="${i}" style="border:1px solid var(--hairline);background:var(--raised);
      border-radius:11px;padding:11px 8px;font-size:14px;color:var(--muted);text-align:center;
      display:block;transition:none">${nombre}</span>`
).join("");

// Filas de categoría de la escena "tu mes"
document.getElementById("categorias").innerHTML = CATEGORIAS.map(
  (c, i) => `
  <div data-cat="${i}">
    <div class="fila">
      <span class="punto" style="color:${c.color};background:color-mix(in oklch, ${c.color} 15%, transparent);
        border:1px solid color-mix(in oklch, ${c.color} 28%, transparent)">${svg(ICONOS[c.icono])}</span>
      <span style="flex:1;font-size:17px;color:var(--fg2)">${c.nombre}</span>
      <span class="tabular" data-cat-monto="${i}" style="font-size:17px;font-weight:600;color:var(--brand)"></span>
    </div>
    <div class="fila" style="margin-top:9px;padding-left:48px">
      <span class="barra" style="flex:1"><span data-cat-barra="${i}" style="width:0;background:${c.color}"></span></span>
      <span class="tabular" data-cat-pct="${i}" style="font-size:13px;color:var(--muted);width:38px;text-align:right"></span>
    </div>
  </div>`
).join("");

// Barras del año
document.getElementById("meses").innerHTML = MESES.map(
  (_, i) => `<span style="flex:1;display:flex;align-items:flex-end;height:100%"><span data-mes="${i}"
     style="width:100%;height:0;border-radius:7px 7px 0 0;background:linear-gradient(180deg,var(--brand-light),var(--brand))"></span></span>`
).join("");
document.getElementById("mesesEtiquetas").innerHTML = MESES.map(
  (m) => `<span style="flex:1;text-align:center;font-size:12px;color:var(--muted)">${m.m}</span>`
).join("");

// Tarjetas de fijos y cuotas
document.getElementById("fijos").innerHTML = [
  { t: "Alquiler", s: "Todos los meses, el día 1", v: "$ 480.000" },
  { t: "Notebook", s: "Cuota 5 de 12", v: "$ 130.000" },
].map(
  (f, i) => `
  <div class="tarjeta" data-fijo="${i}" style="width:300px;padding:22px 24px">
    <div class="fila">
      <span class="punto" style="color:var(--brand);background:rgba(232,93,36,.14);border:1px solid rgba(232,93,36,.28)">${svg(ICONOS.repetir)}</span>
      <div style="flex:1">
        <p style="font-size:17px;font-weight:600">${f.t}</p>
        <p style="font-size:13px;color:var(--muted);margin-top:2px">${f.s}</p>
      </div>
    </div>
    <p class="tabular" style="font-size:24px;font-weight:700;color:var(--brand);margin-top:16px">${f.v}</p>
  </div>`
).join("");

/* ---------- línea de tiempo ---------- */

const ESCENAS = {
  hook:     [0.0,  4.2],
  problema: [4.2,  9.0],
  uso:      [9.0, 15.4],
  dia:      [15.4, 20.8],
  mes:      [20.8, 26.6],
  anio:     [26.6, 30.8],
  fijos:    [30.8, 34.6],
  cierre:   [34.6, 39.0],
};

export const DURACION = 39.0;
window.DURACION = DURACION;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const nodoEscena = (nombre) => $(`[data-escena="${nombre}"]`);

/** Entrada y salida de una escena: 0 antes, 1 en pantalla, 0 después. */
function visibilidadEscena(t, nombre, entrada = 0.55, salida = 0.45) {
  const [a, b] = ESCENAS[nombre];
  if (t < a - 0.001 || t > b + 0.001) return { visible: 0, local: 0 };
  const dentro = easeOut(p(t, a, a + entrada));
  const fuera = 1 - easeInOut(p(t, b - salida, b));
  return { visible: Math.min(dentro, fuera), local: t - a };
}

function aplicar(nodo, opacidad, desplazamiento = 0, escala = 1) {
  if (!nodo) return;
  nodo.style.opacity = String(opacidad);
  nodo.style.transform = `translateY(${desplazamiento}px) scale(${escala})`;
}

function seek(t) {
  // Fondo: el halo respira a lo largo de todo el video
  $("#halo").style.opacity = String(0.55 + 0.25 * Math.sin(t * 0.7));

  // Todas las escenas parten ocultas y cada bloque enciende la suya
  for (const nombre of Object.keys(ESCENAS)) {
    const nodo = nodoEscena(nombre);
    nodo.style.opacity = "0";
    nodo.style.pointerEvents = "none";
  }

  /* 1. Enganche */
  {
    const { visible, local } = visibilidadEscena(t, "hook", 0.9);
    const nodo = nodoEscena("hook");
    nodo.style.opacity = String(visible);
    const e = easeOut(p(local, 0, 1.1));
    aplicar(nodo.querySelector('[data-anim="titulo"]'), 1, lerp(26, 0, e), lerp(0.965, 1, e));
  }

  /* 2. El problema: las tres líneas entran escalonadas */
  {
    const { visible, local } = visibilidadEscena(t, "problema");
    const nodo = nodoEscena("problema");
    nodo.style.opacity = String(visible);
    for (let i = 0; i < 3; i += 1) {
      const e = easeOut(p(local, 0.25 + i * 0.75, 1.15 + i * 0.75));
      aplicar(nodo.querySelector(`[data-linea="${i}"]`), e, lerp(20, 0, e));
    }
  }

  /* 3. Cómo se usa: el monto sube, se elige la categoría, se confirma */
  {
    const { visible, local } = visibilidadEscena(t, "uso");
    const nodo = nodoEscena("uso");
    nodo.style.opacity = String(visible);

    const eTit = easeOut(p(local, 0, 0.8));
    aplicar(nodo.querySelector('[data-anim="etiqueta"]'), eTit, lerp(12, 0, eTit));
    aplicar(nodo.querySelector('[data-anim="titulo"]'), eTit, lerp(16, 0, eTit));

    const eCard = easeOut(p(local, 0.5, 1.4));
    aplicar(nodo.querySelector('[data-anim="tarjeta"]'), eCard, lerp(28, 0, eCard));

    // El monto se "tipea": sube hasta 24.200
    const eMonto = easeOut(p(local, 1.5, 3.1));
    nodo.querySelector('[data-anim="monto"]').textContent = fmt.format(Math.round(24200 * eMonto));

    // Se destaca la categoría elegida
    const eChip = p(local, 3.4, 4.0);
    $$("[data-chip]").forEach((chip, i) => {
      const elegido = i === CHIP_ELEGIDO ? eChip : 0;
      chip.style.borderColor = elegido > 0.5 ? "rgba(232,93,36,.6)" : "var(--hairline)";
      chip.style.background = elegido > 0.5 ? "rgba(232,93,36,.12)" : "var(--raised)";
      chip.style.color = elegido > 0.5 ? "var(--fg)" : "var(--muted)";
      chip.style.transform = `scale(${lerp(1, 1.05, elegido)})`;
    });

    // El botón confirma con un pulso
    const eBoton = p(local, 4.5, 4.9);
    const pulso = eBoton > 0 && eBoton < 1 ? Math.sin(eBoton * Math.PI) : 0;
    aplicar(nodo.querySelector('[data-anim="boton"]'), 1, 0, lerp(1, 1.09, pulso));
  }

  /* 4. El día: el número cuenta y la barra crece */
  {
    const { visible, local } = visibilidadEscena(t, "dia");
    const nodo = nodoEscena("dia");
    nodo.style.opacity = String(visible);

    const eTel = easeOut(p(local, 0.2, 1.2));
    aplicar(nodo.querySelector('[data-anim="telefono"]'), eTel, lerp(34, 0, eTel));

    const eNum = easeOut(p(local, 0.9, 2.8));
    nodo.querySelector('[data-anim="hoy"]').textContent = fmt.format(Math.round(40700 * eNum));
    nodo.querySelector('[data-anim="barraHoy"]').style.width = `${lerp(0, 92, easeOut(p(local, 1.1, 3.0)))}%`;
  }

  /* 5. El mes: las barras de cada categoría crecen escalonadas */
  {
    const { visible, local } = visibilidadEscena(t, "mes");
    const nodo = nodoEscena("mes");
    nodo.style.opacity = String(visible);

    const eTit = easeOut(p(local, 0, 0.8));
    aplicar(nodo.querySelector('[data-anim="etiqueta"]'), eTit, lerp(12, 0, eTit));
    aplicar(nodo.querySelector('[data-anim="titulo"]'), eTit, lerp(16, 0, eTit));
    const eCard = easeOut(p(local, 0.4, 1.3));
    aplicar(nodo.querySelector('[data-anim="tarjeta"]'), eCard, lerp(26, 0, eCard));

    CATEGORIAS.forEach((c, i) => {
      const inicio = 0.9 + i * 0.22;
      const e = easeOut(p(local, inicio, inicio + 1.0));
      const fila = nodo.querySelector(`[data-cat="${i}"]`);
      if (fila) { fila.style.opacity = String(easeOut(p(local, inicio - 0.15, inicio + 0.45))); }
      nodo.querySelector(`[data-cat-barra="${i}"]`).style.width = `${c.ancho * e}%`;
      nodo.querySelector(`[data-cat-monto="${i}"]`).textContent = fmt.format(Math.round(c.monto * e));
      nodo.querySelector(`[data-cat-pct="${i}"]`).textContent = `${Math.round(c.pct * e)}%`;
    });
  }

  /* 6. El año: doce barras que suben */
  {
    const { visible, local } = visibilidadEscena(t, "anio");
    const nodo = nodoEscena("anio");
    nodo.style.opacity = String(visible);

    const eTit = easeOut(p(local, 0, 0.8));
    aplicar(nodo.querySelector('[data-anim="etiqueta"]'), eTit, lerp(12, 0, eTit));
    aplicar(nodo.querySelector('[data-anim="titulo"]'), eTit, lerp(16, 0, eTit));
    const eCard = easeOut(p(local, 0.4, 1.3));
    aplicar(nodo.querySelector('[data-anim="tarjeta"]'), eCard, lerp(26, 0, eCard));

    MESES.forEach((m, i) => {
      const inicio = 0.9 + i * 0.075;
      const e = easeOut(p(local, inicio, inicio + 0.75));
      nodo.querySelector(`[data-mes="${i}"]`).style.height = `${m.v * e}%`;
    });
  }

  /* 7. Fijos y cuotas */
  {
    const { visible, local } = visibilidadEscena(t, "fijos");
    const nodo = nodoEscena("fijos");
    nodo.style.opacity = String(visible);

    const eTit = easeOut(p(local, 0, 0.8));
    aplicar(nodo.querySelector('[data-anim="etiqueta"]'), eTit, lerp(12, 0, eTit));
    aplicar(nodo.querySelector('[data-anim="titulo"]'), eTit, lerp(16, 0, eTit));
    const eBaj = easeOut(p(local, 0.5, 1.2));
    aplicar(nodo.querySelector('[data-anim="bajada"]'), eBaj, lerp(14, 0, eBaj));

    [0, 1].forEach((i) => {
      const e = easeOut(p(local, 0.9 + i * 0.3, 1.8 + i * 0.3));
      aplicar(nodo.querySelector(`[data-fijo="${i}"]`), e, lerp(24, 0, e));
    });
  }

  /* 8. Cierre */
  {
    const { visible, local } = visibilidadEscena(t, "cierre", 0.8, 0.6);
    const nodo = nodoEscena("cierre");
    nodo.style.opacity = String(visible);

    const eMarca = easeOut(p(local, 0, 1.0));
    aplicar(nodo.querySelector('[data-anim="marca"]'), eMarca, lerp(22, 0, eMarca), lerp(0.96, 1, eMarca));
    const eBaj = easeOut(p(local, 0.6, 1.5));
    aplicar(nodo.querySelector('[data-anim="bajada"]'), eBaj, lerp(16, 0, eBaj));
    const eCta = easeOut(p(local, 1.1, 2.0));
    aplicar(nodo.querySelector('[data-anim="cta"]'), eCta, lerp(18, 0, eCta));
  }
}

window.seek = seek;
seek(0);
