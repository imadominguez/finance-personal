# Mis Finanzas — contexto del proyecto

> **Ojo con el resto de esta carpeta.** Los demás archivos de `.cursor/rules/`
> describen un diseño anterior que nunca se construyó: un bot de WhatsApp
> autónomo con tablas `gastos` y `categorias` que no existen en la base. No los
> uses como referencia.
>
> Las fuentes confiables son:
>
> | Qué                             | Dónde                                                |
> | ------------------------------- | ---------------------------------------------------- |
> | Qué hace la app y cómo correrla | [`README.md`](../../README.md)                       |
> | Sistema de diseño y temas       | [`DESIGN.md`](../../DESIGN.md)                       |
> | Criterios de UX e interacción   | [`docs/ux/`](../../docs/ux/)                         |
> | Modelo de datos                 | [`prisma/schema.prisma`](../../prisma/schema.prisma) |
> | Lógica de negocio               | [`lib/finance.ts`](../../lib/finance.ts)             |
> | Cómo construir pantallas        | las skills en `.claude/skills/`                      |

## Qué es

Una app de finanzas personales: se anotan gastos e ingresos y la app arma el
resumen del **día**, del **mes** y del **año**. Está pensada para una persona
llevando su plata, no para una empresa.

Posicionamiento explícito, escrito en la landing: **no se conecta con el banco**.
Los movimientos los carga la persona. Es lo que hace que los números cierren.

## Stack

| Capa       | Qué                                                                    |
| ---------- | ---------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack)                                     |
| Interfaz   | React 19, Tailwind CSS v4, shadcn/ui sobre Base UI                     |
| Base       | PostgreSQL (Neon) con Prisma 7 y driver adapter (`@prisma/adapter-pg`) |
| Mutaciones | Server Actions con estado optimista                                    |
| Sesión     | Propia: sesiones en base + JWT en cookie httpOnly. Se entra con Google |
| Hosting    | Vercel, todo en un solo proyecto                                       |
| Tests      | Runner de Node (`pnpm test`), sin dependencias extra                   |

**El gestor de paquetes es pnpm.** Agregar algo con `npm install` rompe el
deploy: actualiza `package-lock.json` y deja `pnpm-lock.yaml` sin el paquete, y
Vercel instala con `--frozen-lockfile`.

## Pantallas

`/hoy` · `/mes` · `/anio` (las tres vistas de período, siempre visibles en la
navegación) · `/movimientos` · `/fijos` · `/categorias` · `/ajustes`, más la
landing pública `/` y el ingreso `/ingresar`.

## Modelo de datos

`User` · `Session` · `Settings` · `Category` · `Transaction` · `RecurringRule` ·
`InstallmentPlan` · `PhoneLinkCode` · `WhatsAppMessage`.

Dos cosas que conviene saber antes de tocar nada:

- **Los gastos fijos y las cuotas no se materializan.** No hay una fila por cada
  ocurrencia: se proyectan al leer, con `expandRecurring` y `expandInstallments`
  en `lib/finance.ts`. Eso es lo que permite editar una regla y que se corrija
  todo el historial proyectado.
- **La plata se guarda en `Decimal(14,2)`**, nunca en `Float`.

## Módulos con parte afuera de la app

**WhatsApp** (`bot/`): se pueden cargar gastos mandándole un mensaje al bot.
open-wa necesita un proceso prendido, así que vive fuera de Vercel; la app solo
expone `POST /api/whatsapp/entrante`. Toda la lógica —interpretar el texto,
vincular el número, guardar— está en `lib/whatsapp/`, con tests. Ver
[`bot/README.md`](../../bot/README.md).

## Cómo trabajar acá

1. **Mobile primero.** Se resuelve a 360 px y el escritorio es la ampliación,
   nunca al revés. Está en `docs/ux/` y en la skill `ux-mobile-first`.
2. **Los textos siguen una guía**: voseo rioplatense, y todo mensaje dice qué
   pasó, por qué y qué hacer. Skill `ux-copy`.
3. **Nada de hex sueltos**: se usan los tokens (`bg-brand`, `text-brand`,
   `border-hairline`), porque el acento es configurable por cada persona.
4. **Al terminar**, correr la auditoría: `node
.claude/skills/ux-auditoria/scripts/auditar.mjs`.
