# Expense Tracker - Arquitectura

## Decisiones de Diseño

### 1. Arquitectura Monolítica (Next.js + Prisma)

**Decisión**: Todo en una sola aplicación Next.js 16

**Razones**:
- Proyecto personal, pequeño y sin escalabilidad crítica
- Un único deployment en Vercel
- Un único repository
- Simplifica desarrollo y mantenimiento
- No hay complejidad de comunicación entre servidores
- Prisma maneja ORM (mejor que queries SQL directas)
- Route handlers de Next.js actúan como backend

**Comunicación**: Route handlers → Prisma Client → PostgreSQL

**Ventajas vs Backend separado**:
- ✅ Simplificación: 1 app en lugar de 2
- ✅ Deployment: 1 comando en Vercel
- ✅ TypeScript end-to-end (frontend + backend)
- ✅ Mismo repositorio
- ✅ Comparte tipos (DTO pueden ser reutilizados)

**Limitaciones**:
- ❌ No escalable a muchos usuarios
- ❌ BD debe estar siempre accesible
- ❌ No hay separación de concerns

**Para futuro multi-usuario**: Extraer backend a servicio separado sin cambiar la API

---

### 2. ORM: Prisma

**Decisión**: Usar Prisma para interactuar con BD

**Razones**:
- TypeScript-first (excelente DX)
- Auto-genera tipos desde schema
- Migraciones automáticas
- Query builder type-safe
- Evita SQL injection
- Mejor que queries SQL manuales

**Alternativas rechazadas**:
- Queries SQL puras: SQL injection risk, menos type-safe
- TypeORM: Más pesado que lo necesario
- Sequelize: No tan bueno para TypeScript

**Estructura**:
- `prisma/schema.prisma` - Define modelo de datos
- `lib/prisma.ts` - Singleton del Prisma Client
- `app/api/*` - Route handlers usan Prisma Client

---

### 3. Base de Datos: PostgreSQL

**Decisión**: PostgreSQL en lugar de SQLite o MongoDB

**Razones**:
- ACID transactions garantizadas
- Índices eficientes para queries de fecha/categoría
- Capacidad de agregar datos (SUM, COUNT por período)
- Railway free tier incluye 5GB
- Mejor para crecer en el futuro

**Alternativas rechazadas**:
- SQLite: No escala bien con múltiples conexiones simultáneas
- MongoDB: Overkill para datos estructurados
- Firebase: Vendor lock-in, límites de queries

---

### 3. Webhook de WhatsApp (vs Polling)

**Decisión**: Webhook (push) en lugar de polling

**Razones**:
- Instantáneo (sin delay)
- Eficiente (sin solicitudes periódicas innecesarias)
- Meta WhatsApp API nativa para webhooks
- Menos costo de infraestructura

**Implementación**:
- POST `/webhook/whatsapp` valida token de Meta
- Procesa mensaje de forma asincrónica
- Responde inmediatamente a Meta (200 OK)

---

### 4. Parsing: Reglas + IA Opcionales

**Decisión**: Reglas regex primero, IA como fallback

**Razones**:
- Reglas son predecibles y rápidas
- No requieren API key (gratis)
- Cubre 95% de casos de uso
- IA solo si reglas fallan (para casos complejos)

**Formato soportado**:
- `"gaste 20000 en supermercado"`
- `"20k transporte"`
- `"$15000 farmacia"`
- `"supermercado 10000"`

---

### 5. Categorización: Diccionario + Machine Learning

**Decisión**: Reglas determinísticas, escalable a ML

**Razones**:
- Inicio con reglas (mantenimiento manual)
- Palabras clave por categoría
- Fallback a categoría "Otros"
- Fácil agregar Claude API después si es necesario

**Ejemplo de regla**:
```
alimentos: ["supermercado", "almacén", "verdulería", "mercado", "comida", "restaurante"]
transporte: ["uber", "taxi", "gasolina", "estacionamiento", "bondi"]
```

---

### 6. Autenticación: Simple para Desarrollo

**Decisión**: Sin autenticación (uso personal) → Guardar contexto en localStorage

**Razones**:
- Uso personal exclusivo
- Sin usuarios múltiples
- Reduce complejidad inicial
- Posible agregar autenticación después (OAuth)

**Seguridad**:
- CORS habilitado solo para frontend
- Webhook valida token de Meta
- Variables de entorno para secretos

---

### 7. Estado del Frontend: Context API

**Decisión**: React Context API (no Redux/Zustand en MVP)

**Razones**:
- Data es read-mostly (dashboard)
- No hay actualizaciones frecuentes
- Evita boilerplate innecesario
- Fácil migrar a Zustand después si es necesario

**Estructura de Context**:
- `AuthContext`: Token WhatsApp, usuario
- `ExpensesContext`: Gastos cacheados, filtros
- `UIContext`: Período seleccionado, tema

---

### 8. Caching de Datos

**Decisión**: Cache en cliente + cache en servidor

**Razones**:
- Queries frecuentes (mes actual)
- Reducir carga de BD
- UX más rápida

**Estrategia**:
- LocalStorage: Gastos del mes actual (TTL 1 hora)
- Redis (opcional): Resúmenes diarios/mensuales
- SWR/React Query: Revalidation automática

---

### 9. Gráficos: Recharts

**Decisión**: Recharts en lugar de Chart.js

**Razones**:
- React-native (componentes)
- TypeScript support excelente
- Responsive automático
- Fácil de personalizar
- Integración perfecta con Next.js

---

### 10. Estilos: Tailwind CSS

**Decisión**: Tailwind + componentes shadcn/ui (opcional)

**Razones**:
- Rapid development
- Consistencia visual
- Mobile-first
- Integración perfecta con Next.js 16
- shadcn/ui da componentes pre-hechos (botones, diálogos, etc)

---

## Flujo de Datos

### Escritura (Recibir gasto)

```
WhatsApp User
    ↓
[Meta WhatsApp API]
    ↓
Next.js Route Handler: POST /api/webhook/whatsapp
    ├→ Validar token de Meta
    ├→ Extraer mensaje, fecha, hora
    │
    ↓
Parser (Reglas Regex)
    ├→ Buscar patrón de formato ("gaste $20000 en...")
    ├→ Extraer: monto, concepto
    └→ Si no parsea → Retornar error 400
    │
    ↓
Categorizador (Diccionario)
    ├→ Buscar palabras clave en concepto
    └→ Asignar categoría (o "Otros")
    │
    ↓
Prisma Client → PostgreSQL: INSERT gastos
    ├→ Validar que no es duplicado (mensaje_id)
    ├→ Guardar con Prisma ORM
    └→ Retornar ID del gasto
    │
    ↓
Enviar respuesta WhatsApp
    └→ "✓ Registrado $20000 en Alimentos"

[Meta WhatsApp API]
    ↓
Mensaje recibido por usuario
```

### Lectura (Ver dashboard)

```
Cliente React (Browser)
    ↓
[Fetch API]
    ↓
Next.js Route Handler: GET /api/gastos/mes?mes=1&anio=2024
    │
    ↓
Prisma Client → PostgreSQL: SELECT
    ├→ Query con GROUP BY, SUM, etc
    └→ Retornar datos tipados
    │
    ↓
[JSON Response]
    ↓
React Hook (useExpenses)
    ├→ Caching opcional (SWR)
    └→ Renderizar dashboard
    │
    ↓
Usuario ve gráficos y tablas
```

---

## Flujo de Lectura (Dashboard)

```
React Client (Next.js)
    ↓
[Usuario selecciona período: Hoy / Mes / Año]
    ↓
useEffect → fetch `/api/gastos/{periodo}?mes=X&anio=Y`
    ↓
Backend: Query PostgreSQL
    ├→ GROUP BY categoría
    ├→ SUM(monto)
    ├→ ORDER BY total DESC
    └→ Retornar JSON
    │
    ↓
[Cache en localStorage si es necesario]
    │
    ↓
Renderizar Dashboard
    ├→ Card con total
    ├→ Pie Chart (categorías)
    ├→ Tabla con desglose
    └→ Filtros (fecha, categoría)
```

---

## Patrones de Código

### Patrón 1: Service Layer

Toda lógica de negocio en `/services`:
- `parseExpense.ts` - Parser del mensaje
- `categorizeExpense.ts` - Categorizador
- `expenseService.ts` - CRUD de gastos

Controladores solo orquestan llamadas a services.

### Patrón 2: Repository Pattern

Abstracción de BD:
- `ExpenseRepository.ts` - Queries de gastos
- `CategoryRepository.ts` - Queries de categorías

Permite cambiar BD sin tocar lógica de negocio.

### Patrón 3: Middleware de Validación

```
POST /api/gastos
    → validateSchema (Zod)
    → authenticate
    → parseBody
    → businessLogic
    → response
```

### Patrón 4: Error Handling

Clase `ApiError` con códigos HTTP:
- 400: Bad Request (parsing falló)
- 401: Unauthorized (token inválido)
- 409: Conflict (gasto duplicado)
- 500: Server Error

---

## Decisiones Postergadas (Futuro)

1. **Autenticación**: Agregar OAuth después de MVP
2. **Testing**: Jest + React Testing Library (cuando sea estable)
3. **Observabilidad**: Logs centralizados (cuando escale)
4. **Caché distribuida**: Redis si hay concurrencia (no necesario ahora)
5. **ML**: Categorización inteligente si reglas fallan mucho
6. **Sync real-time**: WebSockets si se agrega multi-usuario

---

## Trade-offs

| Aspecto | Elegido | Alternativa | Trade-off |
|--------|---------|-------------|-----------|
| **Arquitectura** | **Next.js Monolítico** | **Backend separado** | **Simple vs Escalable** |
| ORM | Prisma | SQL puro | Type-safe vs control total |
| BD | PostgreSQL | SQLite | Más complejo vs escalable |
| Frontend State | Context | Redux | Menos boilerplate vs menos poder |
| Gráficos | Recharts | Chart.js | React-native vs más flexible |
| Parsing | Regex | NLP/IA | Rápido vs más inteligente |
| Categorización | Reglas | ML | Simple vs automático |
| Auth | None | JWT | Menor seguridad vs desarrollo rápido |
| API | REST | GraphQL | Más simple vs queries optimizadas |

**Nota sobre Arquitectura**: La arquitectura monolítica es ideal para MVP personal.
Si en futuro crece a multi-usuario, extraer backend es posible sin cambiar API.

---

## Escalabilidad Futura

Si en el futuro quiero escalar:

1. **Multi-usuario**:
   - Agregar tabla `users`
   - Relación 1-N entre users y gastos
   - Auth con JWT/OAuth

2. **Tiempo real**:
   - Agregar WebSockets (Socket.io)
   - Reemplazar polling con subscriptions

3. **Performance**:
   - Caché con Redis
   - Índices adicionales en PostgreSQL
   - CDN para assets (ya incluido en Vercel)

4. **Analytics**:
   - Warehouse (BigQuery, Snowflake)
   - BI tool (Metabase, Superset)

---

## Deployment Architecture

```
Desarrollo
├── Local: Node.js + PostgreSQL (Docker)
└── Frontend: localhost:3000 (Next.js dev server)

Staging (opcional)
├── Backend: Railway
├── Frontend: Vercel preview
└── BD: PostgreSQL en Railway

Producción
├── Backend: Railway (Node.js)
├── Frontend: Vercel (Next.js static + serverless)
├── BD: PostgreSQL en Railway
└── WhatsApp: Meta Business API
```

---

## Consideraciones de Seguridad

1. **WhatsApp Webhook**:
   - Validar token de Meta en cada request
   - Rate limiting (evitar spam)
   - Verificar signature del mensaje

2. **API Backend**:
   - CORS solo a frontend domain
   - Validar input con Zod
   - No exponer IDs internos

3. **Base de Datos**:
   - Usar prepared statements (prevenir SQL injection)
   - Encriptar variables de entorno
   - Backups automáticos

4. **Frontend**:
   - HTTPS enforced
   - CSP headers
   - No guardar tokens sensibles en localStorage (no aplica aquí por ahora)
