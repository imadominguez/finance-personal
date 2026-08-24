/**
 * Tests del parser de WhatsApp.
 *
 * Se corren con el runner de Node, sin sumar una sola dependencia al proyecto:
 *
 *     pnpm test
 *
 * El parser es puro y determinista, así que acá se cubre lo que de verdad
 * importa: que un mensaje escrito como se escribe en la calle termine en el
 * movimiento correcto, y que lo que no se entiende no invente nada.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  elegirCategoria,
  interpretar,
  interpretarNumero,
  normalizar,
} from "./parser.ts";
import type { Category } from "../types.ts";

/* -------------------------------------------------------------------------- */

const CATEGORIAS: Category[] = [
  { id: "1", name: "Supermercado", kind: "gasto", color: "#e85d24", icon: "ShoppingCart" },
  { id: "2", name: "Delivery y salidas", kind: "gasto", color: "#d97634", icon: "Utensils" },
  { id: "3", name: "Transporte", kind: "gasto", color: "#e8956b", icon: "Bus" },
  { id: "4", name: "Salud", kind: "gasto", color: "#14b8a6", icon: "Stethoscope" },
  { id: "5", name: "Alquiler", kind: "gasto", color: "#c45628", icon: "Home" },
  { id: "6", name: "Sueldo", kind: "ingreso", color: "#10b981", icon: "Wallet" },
];

/** Atajo: interpreta y resuelve la categoría de una, como hace el endpoint. */
function cargar(texto: string) {
  const intencion = interpretar(texto);
  if (intencion.tipo !== "movimiento") return { tipo: intencion.tipo };
  return {
    tipo: intencion.tipo,
    kind: intencion.kind,
    monto: intencion.monto,
    categoria:
      elegirCategoria(intencion.categoria, CATEGORIAS, intencion.kind)?.name ??
      null,
    descripcion: intencion.descripcion,
  };
}

/* -------------------------------------------------------------------------- */
/* Montos                                                                     */
/* -------------------------------------------------------------------------- */

test("interpreta el separador de miles y el decimal", () => {
  assert.equal(interpretarNumero("20000"), 20000);
  assert.equal(interpretarNumero("1.500"), 1500);
  assert.equal(interpretarNumero("1.500,50"), 1500.5);
  assert.equal(interpretarNumero("1,500.50"), 1500.5);
  assert.equal(interpretarNumero("20.50"), 20.5);
  assert.equal(interpretarNumero("20,50"), 20.5);
  assert.equal(interpretarNumero("1.234.567"), 1234567);
});

test("aplica los multiplicadores rioplatenses", () => {
  assert.equal(cargar("20 lucas nafta").monto, 20000);
  assert.equal(cargar("35k asado").monto, 35000);
  assert.equal(cargar("20 mil super").monto, 20000);
  assert.equal(cargar("2 palos auto").monto, 2000000);
  assert.equal(cargar("1,5 millones auto").monto, 1500000);
});

test("acepta el signo pesos pegado o separado", () => {
  assert.equal(cargar("gasté $20000 en supermercado").monto, 20000);
  assert.equal(cargar("gasté $ 20.000 en supermercado").monto, 20000);
});

/* -------------------------------------------------------------------------- */
/* Gasto vs ingreso                                                           */
/* -------------------------------------------------------------------------- */

test("por defecto es un gasto", () => {
  assert.equal(cargar("20000 super").kind, "gasto");
  assert.equal(cargar("café 1200").kind, "gasto");
});

test("reconoce un ingreso", () => {
  assert.equal(cargar("cobré 500 lucas de sueldo").kind, "ingreso");
  assert.equal(cargar("me pagaron 300000").kind, "ingreso");
  assert.equal(cargar("me depositaron 45000").kind, "ingreso");
});

test("el verbo de gasto le gana al sustantivo de ingreso", () => {
  // "sueldo" sugiere ingreso, pero "gasté" es explícito y manda.
  assert.equal(cargar("gasté el sueldo, 200000 en super").kind, "gasto");
});

/* -------------------------------------------------------------------------- */
/* Categorías                                                                 */
/* -------------------------------------------------------------------------- */

test("machea la categoría por nombre exacto", () => {
  assert.equal(cargar("gasté $20000 en supermercado").categoria, "Supermercado");
});

test("machea por alias de la calle", () => {
  assert.equal(cargar("20000 super").categoria, "Supermercado");
  assert.equal(cargar("20 lucas nafta").categoria, "Transporte");
  assert.equal(cargar("café 1200").categoria, "Delivery y salidas");
  assert.equal(cargar("1.500,50 farmacia").categoria, "Salud");
  assert.equal(cargar("gasté 80000 en expensas").categoria, "Alquiler");
});

test("machea contra una categoría de varias palabras", () => {
  assert.equal(cargar("gasté 9000 en delivery").categoria, "Delivery y salidas");
});

test("solo ofrece categorías del tipo correcto", () => {
  // "Sueldo" es de ingresos: un gasto no puede caer ahí.
  assert.equal(cargar("gasté 1000 en sueldo").categoria, null);
  assert.equal(cargar("cobré 500000 de sueldo").categoria, "Sueldo");
});

test("no inventa una categoría cuando no reconoce nada", () => {
  const resultado = cargar("12000 blablabla");
  assert.equal(resultado.categoria, null);
  assert.equal(resultado.monto, 12000);
});

test("un monto sin más texto queda sin categoría, no falla", () => {
  const resultado = cargar("15000");
  assert.equal(resultado.tipo, "movimiento");
  assert.equal(resultado.monto, 15000);
  assert.equal(resultado.categoria, null);
  assert.equal(resultado.descripcion, null);
});

/* -------------------------------------------------------------------------- */
/* Comandos                                                                   */
/* -------------------------------------------------------------------------- */

test("reconoce los comandos", () => {
  assert.equal(interpretar("ayuda").tipo, "ayuda");
  assert.equal(interpretar("AYUDA").tipo, "ayuda");
  assert.equal(interpretar("borrar").tipo, "deshacer");
  assert.equal(interpretar("deshacer").tipo, "deshacer");
});

test("reconoce un código de vinculación", () => {
  const intencion = interpretar("vincular a7k2m9");
  assert.equal(intencion.tipo, "codigo");
  assert.equal(intencion.tipo === "codigo" && intencion.codigo, "A7K2M9");

  const suelto = interpretar("A7K2M9");
  assert.equal(suelto.tipo, "codigo");
});

test("un monto de seis dígitos no se confunde con un código", () => {
  // Es la ambigüedad que obliga a exigir al menos una letra en el código.
  const intencion = interpretar("200000");
  assert.equal(intencion.tipo, "movimiento");
});

/* -------------------------------------------------------------------------- */
/* Lo que no se entiende                                                      */
/* -------------------------------------------------------------------------- */

test("no registra nada sin un monto", () => {
  assert.equal(interpretar("hola qué tal").tipo, "no-entendido");
  assert.equal(interpretar("gasté un montón en el super").tipo, "no-entendido");
});

test("descarta lo vacío, lo gigante y lo que no es texto", () => {
  assert.equal(interpretar("").tipo, "no-entendido");
  assert.equal(interpretar("   ").tipo, "no-entendido");
  assert.equal(interpretar("x".repeat(500)).tipo, "no-entendido");
  // @ts-expect-error: el endpoint valida, pero el parser no puede confiar.
  assert.equal(interpretar(null).tipo, "no-entendido");
});

test("no acepta un monto de cero ni negativo", () => {
  assert.equal(interpretar("gasté 0 en super").tipo, "no-entendido");
  // El signo menos no se interpreta: el tipo lo define el verbo, no el signo.
  assert.equal(cargar("-500 super").monto, 500);
});

test("los acentos y las mayúsculas no cambian nada", () => {
  assert.equal(normalizar("Gasté  $20.000 EN Supermercado"), "gaste $20.000 en supermercado");
  assert.equal(cargar("GASTÉ 20000 EN SUPERMERCADO").categoria, "Supermercado");
});

/* -------------------------------------------------------------------------- */
/* Descripción                                                                */
/* -------------------------------------------------------------------------- */

test("la descripción conserva lo que la persona escribió", () => {
  assert.equal(cargar("2500 cafe con juan").descripcion, "Cafe con juan");
  assert.equal(cargar("gasté 20000 en supermercado").descripcion, "Supermercado");
});
