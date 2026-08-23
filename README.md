# Mis Finanzas

App de finanzas personales para llevar los gastos del **día**, del **mes** y del **año**.
Registrás lo que gastás y lo que cobrás, y la app te dice en qué se te está yendo la plata.

Construida con **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4** y componentes
**shadcn/ui** sobre Base UI. El diseño sigue `DESIGN.md`: dark mode, acentos naranja y
animaciones suaves.

## Qué hace

| Pantalla | Qué muestra |
|---|---|
| `/` **Hoy** | Cuánto llevás gastado hoy, contra tu promedio diario y contra el día anterior. Cuánto podés gastar por día con lo que queda del mes. |
| `/mes` **Mes** | "¿A dónde se fue tu sueldo?": total del mes, avance contra tu presupuesto, dona por categoría, gasto día por día, ranking de categorías y proyección de cierre. |
| `/anio` **Año** | Tendencia mes a mes, mes más caro y más barato, promedio mensual y en qué se fue el año. |
| `/movimientos` | Historial completo con filtros por texto, tipo, categoría y rango de fechas. |
| `/fijos` | Gastos e ingresos fijos (alquiler, servicios, sueldo) y compras en cuotas. |
| `/categorias` | ABM de categorías con color e ícono, y el acumulado del año de cada una. |
| `/ajustes` | Presupuesto mensual, moneda, exportar/importar JSON y borrar todo. |

Atajo: la tecla **`n`** abre el alta de movimiento desde cualquier pantalla.

## Cómo se guardan los datos

Todo vive en **`localStorage` del navegador**. No hay backend, ni base de datos, ni cuentas:
la app arranca con `pnpm dev` y funciona. Desde *Ajustes* podés exportar un JSON de
respaldo e importarlo en otro dispositivo.

El acceso al almacenamiento está aislado detrás de dos módulos (`lib/storage.ts` y
`lib/store.ts`) y toda la lógica de negocio es pura (`lib/finance.ts`), así que mover la
persistencia a Prisma + PostgreSQL —como describe `.cursor/rules/`— es reemplazar esa capa
sin tocar las vistas.

### Fijos y cuotas: proyectados, no duplicados

Un gasto fijo o una compra en cuotas se carga **una sola vez**. No se materializan
movimientos mes a mes: se calculan al leer cada período (`expandRecurring` y
`expandInstallments` en `lib/finance.ts`). Editar el alquiler corrige todos los meses de
una, y no quedan filas huérfanas.

Las ocurrencias con fecha futura se marcan como **proyectadas**: se ven atenuadas en las
listas y punteadas en los gráficos, para no confundir lo que ya pasó con lo que falta.

## Cómo correrlo

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Otros comandos:

```bash
pnpm build        # build de producción
pnpm start        # servir el build
pnpm lint         # eslint
```

La primera vez la app está vacía. Podés cargar tu primer gasto, o tocar **"Cargar datos de
ejemplo"** para ver 12 meses de datos verosímiles y borrarlos después desde *Ajustes*.

## Estructura

```
app/                    Rutas del App Router (cada page.tsx es un Server Component
                        que exporta metadata y monta su vista cliente)
components/
  charts/               Dona y barras, en SVG/CSS y animadas con Tailwind
  finance/              Piezas del dominio: hero, desglose, listas, diálogos
  layout/               Marco de la app y navegación
  providers/            Contexto de estado y gate de hidratación
  ui/                   Primitivas shadcn/ui (Base UI)
lib/
  types.ts              Modelo de datos
  finance.ts            Lógica de negocio pura (expansión, totales, presupuesto)
  date.ts               Períodos y formato de fechas en español
  format.ts             Moneda, porcentajes y parseo de montos
  store.ts              Store externo sobre localStorage (useSyncExternalStore)
  storage.ts            Lectura/escritura y normalización del estado
  sample-data.ts        Generador de datos de ejemplo
```

## Decisiones que vale la pena conocer

- **Un solo tema.** La app es dark por diseño (`DESIGN.md`); `:root` y `.dark` comparten
  valores y la clase queda en `<html>` para que las variantes `dark:` de shadcn sigan
  aplicando.
- **Gráficos a mano.** La dona y las barras son SVG y divs animados con transiciones de
  Tailwind, en vez de una librería de charts: menos JavaScript al cliente y control total
  del estilo y de las animaciones.
- **Animaciones respetuosas.** Las entradas usan utilidades propias (`animate-fade-up`,
  `animate-grow-x`, etc.) definidas en `app/globals.css`, y todo se desactiva bajo
  `prefers-reduced-motion`.
- **Números que no bailan.** Los montos usan `font-variant-numeric: tabular-nums` y se
  animan con un contador que también respeta `prefers-reduced-motion`.
