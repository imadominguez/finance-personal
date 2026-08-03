# Expense Tracker - Cursor Rules

Este archivo contiene las reglas y directivas que el agente de Cursor debe seguir para este proyecto.

---

## Contexto General del Proyecto

### ¿Qué es?
**Expense Tracker Bot** - Una aplicación de tracking de gastos personales que se integra con WhatsApp.

**Flujo principal**:
1. Usuario envía mensaje por WhatsApp: `"gaste $20000 en supermercado"`
2. Meta WhatsApp API envía el mensaje al route handler
3. Route handler (`/api/webhook/whatsapp`) parsea, categoriza y guarda con Prisma
4. Bot responde con confirmación
5. Frontend (React en Next.js) muestra dashboard con análisis

### Tech Stack (Monolítico)
- **Framework**: Next.js 16 (Frontend + Backend)
- **Lenguaje**: TypeScript (todo end-to-end)
- **ORM**: Prisma + PostgreSQL
- **Estilos**: Tailwind CSS + shadcn/ui
- **Gráficos**: Recharts
- **Deployment**: Vercel (todo junto)

---

## Reglas de Desarrollo

### 1. SIEMPRE TypeScript

```
✅ CORRECTO:
- Todos los archivos .ts o .tsx
- Tipos explícitos en funciones
- Interfaces/types para data estructurada

❌ INCORRECTO:
- Archivos .js o .jsx
- Usar `any` type
- Sin tipado
```

### 2. NUNCA Cambiar la Estructura de Carpetas

El layout de carpetas está optimizado y debe respetarse.

```
Estructura existente:
├── app/           (Next.js App Router)
├── components/    (Componentes React)
├── hooks/         (Custom hooks)
├── lib/           (Utilidades y tipos)
└── styles/        (Tailwind + CSS)

❌ NO crear:
- nuevas carpetas al azar
- components/ui/something que no tenga sentido
- lib/helpers/utils/subfolders/etc

✅ SI necesitas nuevo código:
- Pregunta dónde va primero
- Respeta el layout existente
```

### 3. SIEMPRE Validar Input

Todo input del usuario debe validarse con Zod.

```typescript
// ✅ CORRECTO
import { z } from 'zod';

const createExpenseSchema = z.object({
  monto: z.number().positive(),
  concepto: z.string().min(1),
  // ...
});

// ❌ INCORRECTO
function createExpense(data: any) {
  // Sin validación
}
```

### 4. NUNCA Silenciar Errores

```typescript
// ❌ NO HACER:
try {
  await fetchData();
} catch (error) {
  // Silenciado - MAL
}

// ✅ SIEMPRE:
try {
  await fetchData();
} catch (error) {
  console.error('Error fetching data:', error);
  throw error; // o manejar apropiadamente
}
```

### 5. SIEMPRE Nombrar Componentes Descriptivamente

```
✅ CORRECTO:
- ExpenseForm.tsx
- ExpensePieChart.tsx
- PeriodSelector.tsx

❌ INCORRECTO:
- form.tsx
- chart.tsx
- selector.tsx
- MyComponent.tsx
```

### 6. NUNCA Hardcodear URLs o Valores

```typescript
// ✅ CORRECTO
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const DEFAULT_PAGE_SIZE = 20;

// ❌ INCORRECTO
const url = 'http://localhost:3000/api/gastos';
const limit = 20;
```

### 7. SIEMPRE Usar Absolute Imports

```typescript
// ✅ CORRECTO
import { ExpenseForm } from '@/components/features';
import { useExpenses } from '@/hooks';
import type { ExpenseDTO } from '@/lib/types';

// ❌ INCORRECTO
import { ExpenseForm } from '../../../components/features';
```

### 8. NUNCA Modificar el Schema de Base de Datos sin Notificar

Si necesitas agregar un campo:
- Primero comentar
- Crear migración
- Actualizar tipos TypeScript
- Actualizar documentación

### 9. SIEMPRE Seguir las Convenciones de Código

Ver archivo `CONVENTIONS.md` para:
- Nombres de variables
- Estructura de componentes
- Error handling
- Estilos Tailwind
- Comments

### 10. NUNCA Crear Dependencies sin Preguntar

```
❌ ANTES DE hacer npm install:
- Preguntar si la lib es necesaria
- Considerar alternativas built-in

✅ LIBRERÍAS PERMITIDAS:
- @prisma/client (ORM) - YA INSTALADA
- zod (validación)
- date-fns (fechas)
- recharts (gráficos)
- lucide-react (iconos)
```

### 11. SIEMPRE Usar Prisma Client Singleton

```typescript
// ✅ CORRECTO
import { prisma } from '@/lib/prisma';

const gasto = await prisma.expense.findMany();

// ❌ INCORRECTO
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // Nueva instancia cada vez
```

### 12. SIEMPRE Manejar Errores de Prisma

```typescript
// ✅ CORRECTO
try {
  await prisma.expense.create({ data });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }
  throw error;
}

// ❌ INCORRECTO
await prisma.expense.create({ data }); // Sin error handling
```

### 13. NUNCA Hacer Queries SQL Puras sin Razón

```typescript
// ✅ CORRECTO: Usar Prisma
await prisma.expense.findMany({
  where: { categoriaId: 1 },
  orderBy: { fecha: 'desc' }
});

// ❌ INCORRECTO: SQL puro sin necesidad
await prisma.$queryRaw`SELECT * FROM Expense WHERE categoriaId = 1`;
```

### 14. SIEMPRE Incluir Relaciones si las Necesitas

```typescript
// ✅ CORRECTO: Traer categoría junto
const gasto = await prisma.expense.findUnique({
  where: { id: 1 },
  include: { categoria: true }
});

// ❌ INCORRECTO: N+1 queries
const gasto = await prisma.expense.findUnique({ where: { id: 1 } });
const categoria = await prisma.category.findUnique({
  where: { id: gasto.categoriaId }
}); // Query separada
```

---

## Reglas por Tipo de Tarea

### Crear un Componente Nuevo

1. ✅ Crear archivo en `components/`
2. ✅ TypeScript con interfaz Props
3. ✅ Exportar como named export
4. ✅ Incluir JSDoc si es público
5. ✅ No usar hooks si es server component
6. ✅ `'use client'` si necesita hooks
7. ✅ Pasar tipos desde `@/lib/types.ts`
8. ✅ Usar Tailwind para estilos

```typescript
// Ejemplo correcto
'use client';

interface ExpenseFormProps {
  onSubmit: (data: CreateExpenseDTO) => Promise<void>;
  isLoading?: boolean;
}

export function ExpenseForm({ onSubmit, isLoading = false }: ExpenseFormProps) {
  // Implementación
}
```

### Crear un Route Handler (API)

1. ✅ Crear archivo en `app/api/...`
2. ✅ Importar Prisma Client desde `@/lib/prisma`
3. ✅ Validar input con Zod
4. ✅ Manejar errores de Prisma
5. ✅ Usar `include`/`select` para optimizar queries
6. ✅ Retornar NextResponse con status correcto
7. ✅ Documentar en `API_ENDPOINTS.md`

```typescript
// app/api/gastos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createExpenseSchema } from '@/lib/validation';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const gastos = await prisma.expense.findMany({
      include: { categoria: true },
      orderBy: { fecha: 'desc' },
    });
    return NextResponse.json(gastos);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createExpenseSchema.parse(body);

    const gasto = await prisma.expense.create({
      data: validated,
      include: { categoria: true },
    });

    return NextResponse.json(gasto, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Expense already exists (duplicate message_id)' },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 400 }
    );
  }
}
```

### Agregar una Nueva Feature (Página)

1. ✅ Crear ruta en `app/feature/page.tsx`
2. ✅ Agregar metadata si es necesario
3. ✅ Separar lógica en componentes
4. ✅ Usar layout si es compartido
5. ✅ Documentar en `FRONTEND_STRUCTURE.md`

### Modificar la Base de Datos (con Prisma)

1. ✅ Actualizar `prisma/schema.prisma` (modelo)
2. ✅ Crear migración: `npx prisma migrate dev --name nombre_cambio`
3. ✅ Actualizar tipos en `lib/types.ts` si aplica
4. ✅ Actualizar queries en route handlers
5. ✅ Probar con `npx prisma studio` (interfaz gráfica)
6. ✅ Actualizar `DATABASE_SCHEMA.md` con cambios

**Ejemplo: Agregar campo a Expense**

```prisma
// prisma/schema.prisma
model Expense {
  // ... campos existentes ...
  notas String?  // Campo nuevo
}
```

```bash
# Crear migración automáticamente
npx prisma migrate dev --name add_notes_to_expense
```

Prisma:
- Genera archivo SQL automáticamente
- Aplica cambios a BD
- Actualiza Prisma Client
- Listo para usar

---

## Reglas de Consultas y Testing

### Cuando Pides Ayuda (Consulta)

```
❌ MALO:
"Necesito un componente para mostrar gastos"

✅ BUENO:
"Necesito un componente en components/features/ que:
1. Muestre tabla de gastos
2. Tenga paginación
3. Permita editar/eliminar
4. Use tipos ExpenseDTO y CategoryDTO
Dónde debo ponerlo?"
```

### Cuando Reportas un Bug

```
❌ MALO:
"El dashboard no funciona"

✅ BUENO:
"En /dashboard/mes, cuando selecciono enero 2024,
la query /api/gastos/mes?mes=1&anio=2024 retorna 500.
Error en backend: 'Cannot read property fecha'"
```

### Cuando Pides Refactoring

```
❌ MALO:
"Refactoriza el código"

✅ BUENO:
"El hook useExpenses en hooks/useExpenses.ts está
haciendo muchas cosas. Sugiero:
1. Separar parsing en otro hook
2. Centralizar caching
¿Estás de acuerdo?"
```

---

## Reglas para Cambios en Arquitectura

### ANTES de cambiar algo importante:

```
1. Documentar la decisión actual en ARCHITECTURE.md
2. Explicar por qué el cambio es necesario
3. Mostrar alternativas consideradas
4. Impacto en otras partes del código
5. Plan de migración
6. Testing necesario
```

### Ejemplos de cambios importantes:

❌ Cambiar de Context API a Redux
❌ Cambiar de PostgreSQL a MongoDB
❌ Cambiar de Express a FastAPI
❌ Reescribir el parser
✅ Agregar validación con Zod
✅ Mejorar performance con índices BD
✅ Agregar nuevo componente UI

---

## Checklist Antes de Finalizar

### Para todo cambio de código:

- [ ] TypeScript compila sin errores
- [ ] ESLint sin warnings
- [ ] Convenciones de código respetadas
- [ ] Nombres descriptivos
- [ ] No hay `any` types
- [ ] Error handling apropiado
- [ ] Comments para lógica compleja
- [ ] Actualizar documentación (.md) si es necesario
- [ ] Git commit message descriptivo

### Para cambios en frontend:

- [ ] Responsive (mobile first)
- [ ] Accesibilidad (alt text, aria labels)
- [ ] Dark mode compatible (CSS variables)
- [ ] TypeScript props interface
- [ ] 'use client' si necesita hooks
- [ ] Tailwind para estilos
- [ ] Reutilizar componentes existentes

### Para cambios en backend:

- [ ] Validación input con Zod
- [ ] Manejo de errores explícito
- [ ] Tipos TypeScript completos
- [ ] SQL injection prevention (prepared statements)
- [ ] Índices BD para queries frecuentes
- [ ] Documentación en API_ENDPOINTS.md

### Para cambios en BD:

- [ ] Script SQL de migración
- [ ] Actualizar schema en DATABASE_SCHEMA.md
- [ ] Actualizar tipos en lib/types.ts
- [ ] Backup antes de cambios destructivos
- [ ] Índices apropiados para nuevas queries

---

## Archivos Importantes a Respetar

```
NUNCA BORRAR O MODIFICAR SIN PERMISO:

📄 PROJECT_CONTEXT.md        - Visión del proyecto
📄 ARCHITECTURE.md            - Decisiones de diseño
📄 DATABASE_SCHEMA.md         - Schema PostgreSQL
📄 API_ENDPOINTS.md          - Documentación API
📄 FRONTEND_STRUCTURE.md     - Estructura Next.js
📄 PRISMA_GUIDE.md           - Guía de Prisma ORM
📄 CONVENTIONS.md            - Convenciones código
📄 CURSOR_RULES.md           - Este archivo (reglas)

CAN MODIFY:
✏️  Código en app/, components/, lib/, hooks/
✏️  prisma/schema.prisma (con migraciones)
✏️  prisma/migrations/* (archivos generados)
✏️  package.json (con cuidado)
✏️  Archivos de config (.env, next.config.js, tsconfig.json)
```

---

## Ejemplos de Interacciones Correctas

### Ejemplo 1: Solicitar Nuevo Componente

```
❌ MALO:
"Dame un componente para los gastos"

✅ BUENO:
"Necesito un componente <ExpenseTable> en 
components/features/ que:

Props requeridas:
- expenses: ExpenseDTO[]
- onEdit: (id: number) => void
- onDelete: (id: number) => Promise<void>

Funcionalidades:
- Mostrar tabla con columnas: fecha, categoría, concepto, monto
- Botones de acción (editar, eliminar)
- Estados de loading
- Mensajes de error

Tipos desde @/lib/types.ts
Estilos con Tailwind"
```

### Ejemplo 2: Reportar Error

```
❌ MALO:
"El gasto no se guarda"

✅ BUENO:
"Cuando intento crear un gasto con POST /api/gastos:

Request:
{
  "fecha": "2024-01-15",
  "monto": 20000,
  "concepto": "test"
}

Response Error:
{
  "error": "categoria_id is required"
}

Pero en el frontend no estoy validando categoria_id antes.
Debería retornar 400 con mensaje sobre campo faltante?"
```

### Ejemplo 3: Pedir Mejora

```
❌ MALO:
"El código está lento"

✅ BUENO:
"En app/dashboard/mes/page.tsx, cuando carga mes=1&anio=2024
con 500 gastos, tarda 3 segundos.

Creo que es porque:
1. Fetch no está cacheado (refetch cada render)
2. Query BD no tiene índice en (fecha, categoria)
3. JSON response completa incluye timestamp

Sugiero:
1. Agregar SWR o React Query
2. Agregar índice en BD
3. Optimizar JSON response

¿Estás de acuerdo?"
```

---

## Integración con Cursor

### Para usar estos archivos en Cursor:

1. **Copiar archivos a la raíz del proyecto**:
   ```bash
   cp *.md /ruta/del/proyecto/
   ```

2. **Crear .cursor/rules si no existe**:
   ```
   .cursor/
   └── rules
       └── project-rules.txt  # Contiene este resumen
   ```

3. **Referenciar en conversación**:
   ```
   "Siguiendo las reglas en PROJECT_CONTEXT.md y CONVENTIONS.md,
   crea un componente que..."
   ```

4. **Cursor leerá automáticamente**:
   - `PROJECT_CONTEXT.md` al inicio
   - `ARCHITECTURE.md` para decisiones
   - `CONVENTIONS.md` para código
   - `API_ENDPOINTS.md` para endpoints
   - `DATABASE_SCHEMA.md` para BD
   - `FRONTEND_STRUCTURE.md` para estructura

---

## Preguntas Frecuentes para el Agente

### ¿Dónde va este código?

**Componente React**: `components/...` - Ver FRONTEND_STRUCTURE.md
**Route Handler (API)**: `app/api/...` - Ver API_ENDPOINTS.md
**Lógica de BD**: En el route handler con Prisma
**Tipos**: `lib/types.ts` - Centralizado
**Hooks**: `hooks/...` - Custom hooks

### ¿Qué tipos debería usar?

**Tipos de Prisma** (auto-generados):
```typescript
import { Expense, Category } from '@prisma/client';
```

**DTOs customizados** en `lib/types.ts`:
```typescript
export interface ExpenseDTO { /* ... */ }
```

### ¿Cómo hacer una query a BD?

```typescript
// En route handler o server component
import { prisma } from '@/lib/prisma';

const gastos = await prisma.expense.findMany({
  where: { /* filtros */ },
  include: { categoria: true },
  orderBy: { fecha: 'desc' }
});
```

Ver `PRISMA_GUIDE.md` para ejemplos avanzados.

### ¿Qué endpoint debo llamar?

Ver `API_ENDPOINTS.md` - Todos documentados con ejemplos y estructura.

### ¿Qué convención seguir?

Ver `CONVENTIONS.md` - Nombres, estilos, tipos, git, Prisma.

### ¿Cuál es el flujo de datos?

Ver `ARCHITECTURE.md` - Sección "Flujo de Datos"
Todo en una sola app Next.js (no backend separado).

### ¿Cómo modifico la BD?

Edita `prisma/schema.prisma` y ejecuta:
```bash
npx prisma migrate dev --name descripcion_cambio
```

Ver `PRISMA_GUIDE.md` - Sección "Migraciones"

### ¿Cómo deployment?

Todo en Vercel:
1. Push a GitHub
2. Vercel detecta cambios
3. Build automático
4. Migraciones Prisma automáticas
5. Deploy listo

Ver `PROJECT_CONTEXT.md`

---

## Resumen Ejecutivo de Reglas

| Regla | Aplicar Siempre |
|-------|-----------------|
| TypeScript con tipos | ✅ |
| Validación con Zod | ✅ |
| Error handling explícito | ✅ |
| Nombres descriptivos | ✅ |
| Estructura de carpetas fija | ✅ |
| Absolute imports | ✅ |
| Tailwind para estilos | ✅ |
| JSDoc para funciones públicas | ✅ |
| Consultar CONVENTIONS.md | ✅ |
| Preguntar cambios importantes | ✅ |

---

## Contacto y Escalaciones

Si hay conflicto entre reglas o no está claro:

1. Revisar ARCHITECTURE.md - decisión original
2. Revisar CONVENTIONS.md - aplicable si similar
3. Preguntar explícitamente antes de proceder
4. Documentar la decisión tomada

**Bienvenido al proyecto Expense Tracker 🚀**
