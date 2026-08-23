# Mis Finanzas

App de finanzas personales para llevar los gastos del **día**, del **mes** y del **año**.
Registrás lo que gastás y lo que cobrás, y la app te dice en qué se te está yendo la plata.

Construida con **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, componentes
**shadcn/ui** sobre Base UI, y **PostgreSQL con Prisma 7**. El diseño sigue `DESIGN.md`:
dark mode, acentos naranja y animaciones suaves.

## Qué hace

| Pantalla | Qué muestra |
|---|---|
| `/hoy` **Hoy** | Cuánto llevás gastado hoy, contra tu promedio diario y contra el día anterior. Cuánto podés gastar por día con lo que queda del mes. |
| `/mes` **Mes** | "¿A dónde se fue tu sueldo?": total del mes, avance contra tu presupuesto, dona por categoría, gasto día por día, ranking de categorías y proyección de cierre. |
| `/anio` **Año** | Tendencia mes a mes, mes más caro y más barato, promedio mensual y en qué se fue el año. |
| `/movimientos` | Historial completo con filtros por texto, tipo, categoría y rango de fechas. |
| `/fijos` | Gastos e ingresos fijos (alquiler, servicios, sueldo) y compras en cuotas. |
| `/categorias` | ABM de categorías con color e ícono, y el acumulado del año de cada una. |
| `/ajustes` | Presupuesto mensual, moneda, exportar/importar JSON, cuenta y borrado. |
| `/` | Landing institucional pública: qué hace la app, cómo funciona y preguntas. |
| `/ingresar` | Acceso con Google. `/crear-cuenta` redirige acá: no hay alta separada. |

Atajo: la tecla **`n`** abre el alta de movimiento desde cualquier pantalla.

`/` es la landing pública; el resumen del día vive en `/hoy`. Con la sesión iniciada, `/`
redirige directo a `/hoy`.

## Movimiento de la landing

Las secciones se revelan y las capas de fondo se desplazan **a medida que
scrolleás**, no al cargar. Está hecho con `animation-timeline: view()`, que ata el
progreso de la animación a la posición del elemento en pantalla: lo maneja el
navegador en el compositor, sin escuchar el evento `scroll` ni recalcular en cada
cuadro. Eso es lo que separa un parallax fluido de uno que traba.

El escalonado de las grillas sale gratis: cada tarjeta tiene su propia línea de
tiempo según dónde está, así que aparecen una tras otra sin delays fijos que se
desincronizan cuando cambia el contenido.

Tres degradaciones, todas verificadas:

- **Sin soporte** (`@supports`): la página se ve completa y quieta. El estado por
  defecto es visible, así que un navegador viejo nunca muestra secciones en blanco.
- **`prefers-reduced-motion`**: no se aplica ninguna de estas animaciones. Quien
  pidió menos movimiento no debería recibir justo lo contrario al hacer scroll.
- **Al imprimir**: no hay scroll, así que sin una regla explícita media landing
  saldría en blanco. `@media print` fuerza todo a visible.

## El video de la landing

El explicativo de la portada no es una grabación de pantalla: es **HTML y CSS
animados, capturados cuadro por cuadro**. La fuente está en `scripts/video/` y se
versiona como cualquier otro código.

La clave es que el guion no se anima solo: expone una función `seek(t)` que dibuja
el estado exacto del video en el segundo `t`. El grabador pide cada cuadro, lo
fotografía y lo manda por tubería a ffmpeg. Salen 30 cuadros por segundo exactos y
reproducibles, sin los cuadros perdidos de un grabador de pantalla, y sin escribir
1170 imágenes en disco.

Se publica en dos formatos —MP4 (H.264) para todo, incluido Safari en iOS, y WebM
(VP9), más liviano donde se soporta— con `preload="none"`, así quien entra a leer
no se baja un mega de video sin pedirlo. Los detalles y cómo regenerarlo están en
`scripts/video/README.md`.

## PWA

La app se instala en el teléfono o el escritorio y se abre a pantalla completa.

- **Manifiesto** en `app/manifest.ts` (ruta de metadatos de Next), con íconos comunes y
  *maskable*, y accesos directos a Hoy, Mes y Movimientos. `start_url` es `/hoy`: quien la
  instaló ya sabe qué es, quiere ver sus números.
- **Service worker** en `public/sw.js`, registrado después del `load` y solo en producción.
- **Sin conexión** muestra `/sin-conexion`, que se recarga sola cuando vuelve la red.
- **Botón de instalar** en Ajustes, en la landing y en el menú de usuario. El evento
  `beforeinstallprompt` llega una sola vez por carga, así que lo captura un provider en el
  layout raíz (`components/pwa/install-provider.tsx`) y desde ahí lo consume cualquier
  pantalla. Cuando el navegador no ofrece instalador —Safari en iOS no lo implementa— el
  botón abre las instrucciones concretas de esa plataforma en vez de no hacer nada.
- **Invitación discreta** en la landing, descartable, que no vuelve a molestar.

### Zonas seguras del dispositivo

Con `viewport-fit=cover` el contenido va de borde a borde, que es lo que hace que la app
instalada se vea como una app nativa. El costo es que hay que respetar a mano las zonas
que ocupa el sistema: la barra de estado arriba, la de gestos abajo, el notch a los
costados. Sin eso, la barra de estado del teléfono queda **encima** del encabezado.

Los insets se exponen como variables CSS en `globals.css` (`--safe-top`, `--safe-bottom`,
`--safe-left`, `--safe-right`) en vez de usar `env()` suelto en cada lugar. El motivo es
poder probarlo: `env()` no se puede sobreescribir desde una prueba, una variable sí, así
que se simula un teléfono con barra de estado y se verifica que nada quede tapado.

### Diálogos en pantallas chicas

En mobile los diálogos son una hoja inferior: los formularios de esta app pasan los 700px
de alto y, centrados, en un teléfono de 640 el encabezado quedaba cortado arriba del borde
y no había forma de scrollear. Ahora el diálogo tiene tope de alto en `dvh` (que sí
contempla el teclado abierto), el contenido scrollea por dentro, el botón de cerrar queda
fijo en la esquina y la fila de acciones es pegajosa al pie. En `sm:` y más arriba vuelve a
ser el modal centrado de siempre.

### Qué se cachea, y qué no

El service worker **nunca guarda el HTML de las pantallas con sesión**. Esas páginas llevan
los movimientos de una persona: guardarlas en el disco del navegador haría que, en un
dispositivo compartido, la siguiente persona pudiera verlos desde la caché. Solo se guardan
recursos estáticos, que son iguales para todos, y la pantalla de sin conexión.

Por eso la app necesita red para funcionar: sin conexión no hay forma honesta de mostrar
datos que viven en la cuenta. Si alguna vez se quiere trabajar offline de verdad, el camino
es replicar en IndexedDB con sincronización, no cachear HTML.

El `matcher` del proxy excluye el manifiesto, el service worker y los íconos: si el proxy
los redirigiera al login, el navegador recibiría HTML donde espera JSON y la app dejaría de
ser instalable.

## Cuentas y datos

Se entra **solo con Google**. No hay contraseñas: ingresar y registrarse son lo mismo, y si
la cuenta no existe se crea al entrar.

Cada persona ve **solo lo suyo**. Todas las tablas cuelgan de `User`, y ninguna consulta
llega a la base sin pasar por el DAL (`lib/auth/dal.ts`), que es el único lugar donde se
resuelve de quién son los datos.

- **OAuth con Google** implementado a mano en `lib/auth/google.ts` y `app/api/auth/google/`,
  con `state` (contra CSRF) y PKCE. El `id_token` se verifica contra las claves públicas de
  Google aunque el intercambio ya haya sido servidor a servidor: es barato y cierra la
  puerta a un token de otro emisor.
- **Sesiones**: se guardan en la tabla `sessions`; el navegador solo recibe el id firmado
  (JWT con `jose`) en una cookie `httpOnly`, `sameSite=lax` y `secure` en producción.
- **`proxy.ts`** hace un chequeo optimista para redirigir al login sin consultar la base en
  cada navegación. La verificación real, contra la tabla de sesiones, vive en el DAL.
- Cada Server Action valida su entrada con **Zod** y filtra por `userId`: una acción es un
  endpoint público, así que nada se escribe confiando en lo que mande el cliente.

### Cómo se resuelve a qué cuenta corresponde

El orden importa y es una decisión de seguridad (`lib/auth/account.ts`):

1. Por `googleId`, el identificador estable de Google. Si ya entró antes es esta cuenta,
   aunque haya cambiado de email.
2. Por email, **solo si Google confirma que le pertenece**. Así una cuenta vieja, de cuando
   se entraba con contraseña, se vincula y conserva todos sus movimientos. Sin esa
   verificación, declarar un email ajeno alcanzaría para quedarse con la cuenta.
3. Si no existe, se crea con las categorías base ya cargadas.

Un email sin verificar se rechaza con un mensaje explicando por qué.

### Configurar Google

En Google Cloud Console → APIs y servicios → Credenciales → ID de cliente OAuth, tipo
*Aplicación web*. En **URI de redireccionamiento autorizados** hay que dar de alta una por
cada origen, tal cual:

```
http://localhost:3000/api/auth/google/callback
https://tu-dominio.vercel.app/api/auth/google/callback
```

Después, `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en las variables de entorno.

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

Entrá en `/ingresar` con tu cuenta de Google. La primera vez se crea sola, con las
categorías base; podés cargar tu primer gasto o tocar **"Cargar datos de ejemplo"** para ver
12 meses de datos verosímiles y borrarlos después desde *Ajustes*.

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
  auth/                 OAuth con Google, sesiones y DAL
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
