# Expense Tracker - Contexto del Proyecto

## Visión General

**Nombre**: Expense Tracker Bot
**Descripción**: Aplicación personal para administrar gastos diarios, mensuales y anuales a través de WhatsApp.
**Usuario**: Multiusuario, con una cuenta por persona
**Propósito Principal**: Capturar gastos via WhatsApp y visualizarlos en un dashboard inteligente.

## Cómo Funciona

1. El usuario envía un mensaje por WhatsApp: `"gaste $20000 en supermercado"`
2. Meta WhatsApp Business API recibe el mensaje en el webhook backend
3. El backend parsea el mensaje (extrae monto, concepto, fecha/hora)
4. Se categoriza automáticamente el gasto (reglas + IA opcional)
5. Se guarda en PostgreSQL con la categoría correspondiente
6. El bot responde: `"✓ Registrado $20000 en Alimentos"`
7. El dashboard muestra:
   - Resumen de **hoy** (por categoría)
   - Resumen de **este mes** (gráfico + detalle)
   - Resumen de **este año** (tendencias por mes)
   - Historial completo filtrable

## Stack Tecnológico

### Full-Stack Monolítico (Una sola app)
- **Framework**: Next.js 16 (latest)
- **Runtime**: Node.js
- **Lenguaje**: TypeScript
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL

### Frontend (React)
- **Estilos**: Tailwind CSS
- **Componentes UI**: shadcn/ui (opcional)
- **Gráficos**: Recharts
- **State Management**: React Context API (MVP) o Zustand
- **Formatos de Fecha**: date-fns

### Backend (Route Handlers)
- **API**: Next.js `/app/api` route handlers
- **Integración WhatsApp**: Meta WhatsApp Business API
- **Validación**: Zod para schemas

### Deployment
- **Hosting**: Vercel (todo monolítico)
- **Base de Datos**: PostgreSQL (Railway, Render, o Supabase)

### Herramientas Adicionales
- **HTTP Client**: Fetch API nativa
- **Testing**: Jest + React Testing Library (futuro)
- **ORM**: Prisma Client

## Características Principales

### MVP (Lanzamiento inicial)
- ✅ Recibir mensajes de WhatsApp
- ✅ Parsear gastos (monto + concepto)
- ✅ Categorizar automáticamente
- ✅ Guardar en PostgreSQL
- ✅ Responder confirmación por WhatsApp
- ✅ Dashboard con vistas: Hoy / Mes / Año
- ✅ Gráficos por categoría (Pie chart)
- ✅ Listado de transacciones filtrable

### Futuro (Fase 2+)
- Editar/eliminar gastos desde dashboard
- Búsqueda avanzada (por fecha, categoría, rango)
- Reportes exportables (PDF)
- Predicciones de presupuesto
- Gráficos de tendencia anual
- Sincronización multi-dispositivo

## Costos

**Total**: $0 (100% gratuito)

- Meta WhatsApp API: Gratis (hasta 1000 msgs/mes)
- PostgreSQL: Gratis (Railway 5GB)
- Backend: Gratis (Railway/Render)
- Frontend: Gratis (Vercel)

## Equipo

- **Desarrollador**: 1 persona (uso personal)
- **Usuarios**: Cada persona con su cuenta; los datos no se comparten entre cuentas

## Restricciones y Requisitos

> **Actualizado**: la app pasó a ser **multiusuario con cuentas**. Cada persona se
> ingresa **con Google** (OAuth 2.0 + PKCE, implementado a mano en `lib/auth/google.ts`)
> y ve solo sus datos; todas las tablas cuelgan de `User`. No hay contraseñas. Las
> sesiones viven en la tabla `sessions`, con el id firmado en una cookie `httpOnly`.
> Ver `README.md` y `lib/auth/`.

❌ NO incluir:
- Notificaciones de presupuesto
- Sincronización en tiempo real
- Ingreso con email y contraseña: se eliminó, solo se entra con Google

✅ INCLUIR:
- Cuentas de usuario con datos aislados por `userId`
- Historial completo (todas las fechas)
- Vistas por día, mes, año
- Parseo flexible de mensajes
- Categorización automática
- Respuestas rápidas por WhatsApp

## Estructura de Carpetas

```
expense-tracker/                # Todo en una app Next.js
├── app/                       # Next.js App Router
│   ├── api/                   # Route handlers (Backend)
│   │   ├── gastos/
│   │   │   └── route.ts       # GET, POST /api/gastos
│   │   ├── gastos/[id]/
│   │   │   └── route.ts       # GET, PUT, DELETE /api/gastos/[id]
│   │   ├── gastos/mes/
│   │   │   └── route.ts       # GET /api/gastos/mes
│   │   ├── gastos/anio/
│   │   │   └── route.ts       # GET /api/gastos/anio
│   │   ├── gastos/tendencia/
│   │   │   └── route.ts       # GET /api/gastos/tendencia
│   │   ├── categorias/
│   │   │   └── route.ts       # GET, PUT /api/categorias
│   │   ├── estadisticas/
│   │   │   └── route.ts       # GET /api/estadisticas
│   │   ├── webhook/
│   │   │   └── whatsapp/
│   │   │       └── route.ts   # POST/GET /api/webhook/whatsapp
│   │   └── health/
│   │       └── route.ts       # GET /api/health
│   │
│   ├── dashboard/             # Frontend
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── dia/page.tsx
│   │   ├── mes/page.tsx
│   │   └── anio/page.tsx
│   │
│   ├── transacciones/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── [id]/page.tsx
│   │   ├── nuevo/page.tsx
│   │   └── editar/[id]/page.tsx
│   │
│   ├── categorias/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   │
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home (/)
│
├── components/                # Componentes React (Frontend)
│   ├── ui/                    # Base UI (shadcn)
│   ├── charts/                # Gráficos
│   ├── features/              # Features
│   ├── layouts/               # Layouts
│   └── common/                # Componentes comunes
│
├── hooks/                     # Custom hooks
│   ├── useExpenses.ts
│   ├── useCategories.ts
│   └── ...
│
├── lib/                       # Librerías y utilidades
│   ├── prisma.ts             # Prisma Client singleton
│   ├── api.ts                # Funciones de API (usado en route handlers)
│   ├── types.ts              # Tipos TypeScript (compartidos)
│   ├── constants.ts          # Constantes
│   ├── formatting.ts         # Formateo
│   ├── validation.ts         # Schemas Zod
│   └── utils.ts              # Utilidades
│
├── styles/                    # CSS global
│   ├── globals.css
│   └── variables.css
│
├── public/                    # Assets estáticos
│   └── icons/
│
├── prisma/                    # Prisma
│   ├── schema.prisma          # Schema BD
│   └── migrations/            # Migraciones
│
├── .env.example              # Variables de entorno
├── .env.local                # (local, no commitear)
├── .gitignore
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
├── prisma.schema
├── package.json
└── README.md
```

## Variables de Entorno

### .env.local (Development)
```
# PostgreSQL
DATABASE_URL=postgresql://user:pass@localhost:5432/expense_tracker

# Meta WhatsApp
WHATSAPP_PHONE_ID=xxxx
WHATSAPP_TOKEN=xxxx
VERIFY_TOKEN=tu_token_aleatorio

# Next.js (público en cliente)
NEXT_PUBLIC_APP_NAME=Expense Tracker

# Opcional
NODE_ENV=development
LOG_LEVEL=debug
```

### .env.production (Producción/Vercel)
```
DATABASE_URL=postgresql://user:pass@host:5432/expense_tracker  # Railway/Render
WHATSAPP_PHONE_ID=xxxx
WHATSAPP_TOKEN=xxxx
VERIFY_TOKEN=tu_token_aleatorio
NEXT_PUBLIC_APP_NAME=Expense Tracker
```

**Nota**: Las variables con prefijo `NEXT_PUBLIC_` son accesibles en el cliente (browser).
Las demás solo en el servidor (route handlers).

## URLs Base

### Desarrollo
- **App Completa**: `http://localhost:3000`
- **Frontend**: `http://localhost:3000` (pages en `/dashboard`, `/transacciones`, etc)
- **API**: `http://localhost:3000/api/...`
- **Webhook WhatsApp**: `POST http://localhost:3000/api/webhook/whatsapp`

### Producción (Vercel)
- **App Completa**: `https://expense-tracker.vercel.app`
- **API**: `https://expense-tracker.vercel.app/api/...`
- **Webhook WhatsApp**: `https://expense-tracker.vercel.app/api/webhook/whatsapp`

## Próximos Pasos

1. ✅ Planificación (actual)
2. ⬜ Setup inicial (BD, backend, frontend)
3. ⬜ Meta WhatsApp API integration
4. ⬜ Parser + Categorizador
5. ⬜ Dashboard básico
6. ⬜ Deploy y testing

## Notas Importantes

- La app es **responsabilidad del usuario** verificar que los gastos se registren correctamente
- No hay validación de presupuestos (solo tracking)
- Todos los datos se guardan localmente en la BD del usuario
- El historial es permanente (no se borra)
