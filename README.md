# Mis Finanzas

App de finanzas personales para llevar los gastos del **día**, del **mes** y del **año**.
Registrás lo que gastás y lo que cobrás, y la app te dice en qué se te está yendo la plata.

Construida con **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, componentes
**shadcn/ui** sobre Base UI, y **PostgreSQL con Prisma 7**. El diseño sigue `DESIGN.md`:
dark mode, acentos naranja y animaciones suaves.

## Qué hace

| Pantalla | Qué muestra |
|---|---|
| `/` **Hoy** | Cuánto llevás gastado hoy, contra tu promedio diario y contra el día anterior. Cuánto podés gastar por día con lo que queda del mes. |
| `/mes` **Mes** | "¿A dónde se fue tu sueldo?": total del mes, avance contra tu presupuesto, dona por categoría, gasto día por día, ranking de categorías y proyección de cierre. |
| `/anio` **Año** | Tendencia mes a mes, mes más caro y más barato, promedio mensual y en qué se fue el año. |
| `/movimientos` | Historial completo con filtros por texto, tipo, categoría y rango de fechas. |
| `/fijos` | Gastos e ingresos fijos (alquiler, servicios, sueldo) y compras en cuotas. |
| `/categorias` | ABM de categorías con color e ícono, y el acumulado del año de cada una. |
| `/ajustes` | Presupuesto mensual, moneda, exportar/importar JSON, cuenta y borrado. |
| `/ingresar`, `/crear-cuenta` | Acceso con email y contraseña. |

Atajo: la tecla **`n`** abre el alta de movimiento desde cualquier pantalla.

## Cuentas y datos

Cada persona tiene su cuenta y ve **solo lo suyo**. Todas las tablas cuelgan de `User`, y
ninguna consulta llega a la base sin pasar por el DAL (`lib/auth/dal.ts`), que es el único
lugar donde se resuelve de quién son los datos.

- **Contraseñas**: hash `scrypt` (Node core, sin binarios nativos que compliquen el deploy),
  con salt por usuario y comparación en tiempo constante.
- **Sesiones**: se guardan en la tabla `sessions`; el navegador solo recibe el id firmado
  (JWT con `jose`) en una cookie `httpOnly`, `sameSite=lax` y `secure` en producción.
- **`proxy.ts`** hace un chequeo optimista para redirigir al login sin consultar la base en
  cada navegación. La verificación real, contra la tabla de sesiones, vive en el DAL.
- Cada Server Action valida su entrada con **Zod** y filtra por `userId`: una acción es un
  endpoint público, así que nada se escribe confiando en lo que mande el cliente.

Borrar la cuenta elimina en cascada todos sus movimientos, categorías, fijos y cuotas.

## Cómo hablan las pantallas con la base

El layout de la zona autenticada lee **todo el estado del usuario en el servidor** y se lo
pasa al `FinanceProvider`. Gracias a eso, la lógica de negocio (`lib/finance.ts`) y las
siete vistas siguen trabajando con la misma forma de datos que cuando esto guardaba en
`localStorage`, y los cálculos de día/mes/año, los filtros y los gráficos siguen siendo
instantáneos.

Las mutaciones son **Server Actions**. Cada una aplica primero un cambio optimista en
pantalla (`useOptimistic` + `useTransition`) y después escribe en Postgres; al revalidar,
React reemplaza la copia optimista por los datos reales. Si el servidor rechaza el cambio,
la pantalla vuelve sola al estado correcto y aparece un aviso con el motivo.

Traer el estado completo es razonable para una app personal (miles de filas como mucho). Si
alguna vez crece, el corte natural es paginar `/movimientos` y calcular los totales del año
con agregaciones en SQL.

### Fijos y cuotas: proyectados, no duplicados

Un gasto fijo o una compra en cuotas se carga **una sola vez**. No se materializan
movimientos mes a mes: se calculan al leer cada período (`expandRecurring` y
`expandInstallments` en `lib/finance.ts`). Editar el alquiler corrige todos los meses de
una, y no quedan filas huérfanas.

Las ocurrencias con fecha futura se marcan como **proyectadas**: se ven atenuadas en las
listas y punteadas en los gráficos, para no confundir lo que ya pasó con lo que falta.

## Cómo correrlo

Necesitás una base PostgreSQL. Podés levantar una local o usar la de Vercel (ver más abajo).

```bash
pnpm install
cp .env.example .env          # completá las URLs y SESSION_SECRET
openssl rand -base64 32       # para SESSION_SECRET
pnpm db:migrate               # crea las tablas
pnpm dev                      # http://localhost:3000
```

Otros comandos:

```bash
pnpm build        # prisma generate + build de producción
pnpm start        # servir el build
pnpm lint         # eslint
pnpm db:migrate   # crear y aplicar una migración en desarrollo
pnpm db:deploy    # aplicar migraciones existentes (producción)
pnpm db:studio    # explorar la base en el navegador
```

Creá tu cuenta en `/crear-cuenta`. Arranca con las categorías base; podés cargar tu primer
gasto o tocar **"Cargar datos de ejemplo"** para ver 12 meses de datos verosímiles y
borrarlos después desde *Ajustes*.

### Si venías de la versión con localStorage

Al entrar a *Ajustes* desde el mismo navegador que usabas antes, la app detecta los datos
viejos y ofrece subirlos a tu cuenta con un botón. También podés importar a mano el JSON
que hayas exportado.

## Deploy en Vercel (con Neon)

1. **Creá la base**: en el panel de tu proyecto, **Storage → Create Database → Postgres**.
   Vercel la provisiona con Neon y agrega solas `DATABASE_URL` (pooled) y
   `DATABASE_URL_UNPOOLED` (directa) al proyecto.
2. **Agregá `SESSION_SECRET`** en *Settings → Environment Variables*, con el valor de
   `openssl rand -base64 32`. Usá uno distinto al de desarrollo.
3. **Deploy**. El `build` corre `prisma generate && prisma migrate deploy && next build`,
   así que las tablas se crean solas en el primer despliegue y las migraciones nuevas se
   aplican en cada uno. No hay un paso manual que se pueda olvidar.

   Las migraciones van sobre la conexión **sin pooler** a propósito: pgbouncer, en modo
   transacción, no soporta las sentencias que usan. `prisma.config.ts` prefiere
   `DATABASE_URL_UNPOOLED` cuando existe.

Si preferís aplicarlas a mano antes de deployar:

```bash
DATABASE_URL_UNPOOLED="<la URL directa de Neon>" pnpm db:deploy
pnpm db:status   # confirma contra qué base y si está al día
```

### Si algo falla

`pnpm db:status` dice contra qué base apunta el CLI y si las migraciones están al día. Es
lo primero que conviene mirar.

La app también sabe explicarse cuando el problema es de infraestructura: si la base
responde pero le faltan las tablas, o si no se puede conectar, la pantalla de ingreso lo
dice en castellano en vez de mostrar un stack trace. Cualquier otro error sigue
propagando, para no esconder un bug real detrás de un mensaje amable.

### Detalles de Neon que conviene saber

- La app usa la URL **pooled** en runtime. Todas las consultas van por
  `prisma.$transaction([...])` en su forma de array, que es compatible con el pooler; no se
  usan transacciones interactivas, que sí romperían.
- `channel_binding=require` funciona: `pg` negocia `SCRAM-SHA-256-PLUS` sobre TLS.
- El plan gratuito **apaga la base cuando no se usa**. La primera consulta después de un
  rato tarda un poco más mientras despierta. Si ves timeouts al arrancar, agregá
  `connect_timeout=15` a `DATABASE_URL`.

## Estructura

```
app/
  (auth)/               Pantallas públicas: ingresar y crear cuenta
  (app)/                Zona autenticada; su layout carga el estado del usuario
  actions/              Server Actions (auth, movimientos, datos)
proxy.ts                Chequeo optimista de sesión antes de cada navegación
prisma/
  schema.prisma         Modelo de datos
  migrations/           Historial de migraciones
components/
  auth/                 Formulario de ingreso y alta
  charts/               Dona y barras, en SVG/CSS y animadas con Tailwind
  finance/              Piezas del dominio: hero, desglose, listas, diálogos
  layout/               Marco de la app, navegación y menú de usuario
  providers/            Estado del cliente sobre el estado del servidor
  ui/                   Primitivas shadcn/ui (Base UI)
lib/
  auth/                 Sesiones, hash de contraseñas y DAL
  db/                   Cliente Prisma, consultas, mapeos y datos de ejemplo
  validation/           Schemas Zod de todo lo que entra desde el cliente
  types.ts              Modelo de datos de la interfaz
  finance.ts            Lógica de negocio pura (expansión, totales, presupuesto)
  date.ts               Períodos y formato de fechas en español
  format.ts             Moneda, porcentajes y parseo de montos
  storage.ts            Formato de respaldo JSON y lectura del localStorage viejo
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
- **Plata en `Decimal`, no en `Float`.** Los montos se guardan como `Decimal(14,2)`: con
  dinero los errores de punto flotante no son aceptables. La conversión a `number` ocurre
  en un solo lugar (`lib/db/mappers.ts`).
- **Fechas como días del calendario.** Un movimiento ocurre un día, no en un instante: se
  guarda en una columna `date` a medianoche UTC, así la zona horaria del servidor nunca
  corre el día.
