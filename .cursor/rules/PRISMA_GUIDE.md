# Expense Tracker - Prisma ORM Guide

## Introducción

**Prisma** es el ORM (Object-Relational Mapping) que usamos para interactuar con PostgreSQL.

Ventajas:
- ✅ Type-safe queries (TypeScript)
- ✅ Auto-genera tipos desde schema
- ✅ Migraciones automáticas
- ✅ Query builder intuitivo
- ✅ Previene SQL injection

---

## Setup Inicial

### 1. Instalar Prisma

```bash
npm install @prisma/client
npm install -D prisma
```

### 2. Inicializar Prisma

```bash
npx prisma init
```

Esto crea:
- `.env.local` - Variables de entorno
- `prisma/schema.prisma` - Schema de BD

### 3. Configurar DATABASE_URL

En `.env.local`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/expense_tracker"
```

### 4. Crear Schema

Actualizar `prisma/schema.prisma` con modelos (ver DATABASE_SCHEMA.md)

### 5. Ejecutar Primera Migración

```bash
npx prisma migrate dev --name init
```

Esto:
- Crea la migración SQL
- Aplica cambios a BD
- Genera Prisma Client

---

## Schema Prisma

### Modelo Expense (Gasto)

```prisma
model Expense {
  id            Int       @id @default(autoincrement())
  fecha         DateTime
  hora          String
  monto         Decimal   @db.Decimal(10, 2)
  concepto      String    @db.VarChar(255)
  categoria     Category  @relation(fields: [categoriaId], references: [id], onDelete: Restrict)
  categoriaId   Int
  descripcion   String?
  mensajeId     String    @unique
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([fecha])
  @@index([categoriaId])
  @@index([mensajeId])
  @@index([fecha, categoriaId])
}
```

### Modelo Category (Categoría)

```prisma
model Category {
  id            Int       @id @default(autoincrement())
  nombre        String    @unique @db.VarChar(100)
  descripcion   String?
  color         String    @db.VarChar(7)
  icono         String?   @db.VarChar(50)
  palabrasClave String[]
  activa        Boolean   @default(true)
  expenses      Expense[]
  createdAt     DateTime  @default(now())
}
```

### Anotaciones Importantes

| Anotación | Significado |
|-----------|------------|
| `@id` | Primary key |
| `@default(autoincrement())` | Auto-increment |
| `@default(now())` | Timestamp actual |
| `@updatedAt` | Se actualiza automáticamente |
| `@unique` | Campo único |
| `@relation` | Relación con otro modelo |
| `@db.VarChar(255)` | Tipo específico de BD |
| `@db.Decimal(10, 2)` | Decimal con 2 decimales |
| `@@index` | Índice de BD |

---

## Prisma Client

### Singleton Pattern (Recomendado)

Crear `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Por qué Singleton**: Evita crear múltiples instancias de Prisma Client en desarrollo.

### Usar en Route Handlers

```typescript
// app/api/gastos/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const gastos = await prisma.expense.findMany({
      include: { categoria: true },
      orderBy: { fecha: 'desc' },
    });
    return NextResponse.json(gastos);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}
```

---

## Operaciones CRUD

### CREATE (Crear)

```typescript
const nuevoGasto = await prisma.expense.create({
  data: {
    fecha: new Date(),
    hora: '14:30:00',
    monto: 20000,
    concepto: 'supermercado',
    categoriaId: 1,
    mensajeId: 'wamid_xxxx',
  },
  include: { categoria: true }, // Incluir datos de relación
});
```

### READ (Leer)

```typescript
// Obtener todos
const gastos = await prisma.expense.findMany({
  include: { categoria: true },
  orderBy: { fecha: 'desc' },
});

// Obtener uno por ID
const gasto = await prisma.expense.findUnique({
  where: { id: 123 },
  include: { categoria: true },
});

// Obtener con filtros
const gastosHoy = await prisma.expense.findMany({
  where: { fecha: { equals: new Date() } },
});

// Contar
const cantidad = await prisma.expense.count();

// Buscar primero o lanzar error
const gasto = await prisma.expense.findUniqueOrThrow({
  where: { id: 123 },
});
```

### UPDATE (Actualizar)

```typescript
const gastoActualizado = await prisma.expense.update({
  where: { id: 123 },
  data: {
    monto: 25000,
    concepto: 'supermercado grande',
  },
  include: { categoria: true },
});
```

### DELETE (Eliminar)

```typescript
const gastoEliminado = await prisma.expense.delete({
  where: { id: 123 },
});

// Opcionalmente, hacer borrado lógico
const gasto = await prisma.expense.update({
  where: { id: 123 },
  data: { activa: false }, // Si existiera campo activa
});
```

---

## Queries Avanzadas

### Agregaciones

```typescript
// Suma de montos
const total = await prisma.expense.aggregate({
  _sum: { monto: true },
  where: { fecha: { gte: new Date('2024-01-01') } },
});

console.log(total._sum.monto); // 250000

// Promedio
const stats = await prisma.expense.aggregate({
  _avg: { monto: true },
  _min: { monto: true },
  _max: { monto: true },
  _count: true,
});
```

### GROUP BY

```typescript
// Gastos por categoría
const porCategoria = await prisma.expense.groupBy({
  by: ['categoriaId'],
  _sum: { monto: true },
  _count: true,
  orderBy: { _sum: { monto: 'desc' } },
});

// Resultado:
// [
//   { categoriaId: 1, _sum: { monto: 100000 }, _count: 15 },
//   { categoriaId: 2, _sum: { monto: 50000 }, _count: 8 },
// ]
```

### Búsqueda de Texto

```typescript
// Buscar concepto que contenga palabra
const gastos = await prisma.expense.findMany({
  where: {
    concepto: { contains: 'super', mode: 'insensitive' },
  },
});

// Buscar con in
const gastos = await prisma.expense.findMany({
  where: {
    categoriaId: { in: [1, 2, 3] },
  },
});
```

### Rango de Fechas

```typescript
// Entre fechas
const gastos = await prisma.expense.findMany({
  where: {
    fecha: {
      gte: new Date('2024-01-01'),
      lte: new Date('2024-01-31'),
    },
  },
});
```

### Relaciones

```typescript
// Con include (traer datos relacionados)
const gasto = await prisma.expense.findUnique({
  where: { id: 123 },
  include: { categoria: true }, // Trae datos de Category
});

// Con select (traer campos específicos)
const gastos = await prisma.expense.findMany({
  select: {
    id: true,
    monto: true,
    concepto: true,
    categoria: { select: { nombre: true, color: true } },
  },
});
```

---

## Migraciones

### Crear Nueva Migración

Después de cambiar `schema.prisma`:

```bash
npx prisma migrate dev --name agregar_campo_descripcion
```

Esto:
1. Genera archivo de migración SQL
2. Aplica cambios a BD
3. Actualiza Prisma Client

### Ver Migraciones

```bash
npx prisma migrate status
```

### Ver Estado de BD

```bash
npx prisma studio  # Abre interfaz gráfica
```

### Seed (Datos Iniciales)

Crear `prisma/seed.ts`:

```typescript
import { prisma } from '@/lib/prisma';

async function main() {
  // Limpiar datos anteriores (solo en dev)
  await prisma.expense.deleteMany();
  await prisma.category.deleteMany();

  // Crear categorías
  const alimentos = await prisma.category.create({
    data: {
      nombre: 'Alimentos',
      color: '#E85D24',
      icono: 'shopping-cart',
      palabrasClave: ['supermercado', 'almacén', 'verdulería'],
    },
  });

  // Crear gastos de prueba
  await prisma.expense.create({
    data: {
      fecha: new Date(),
      hora: '14:30:00',
      monto: 20000,
      concepto: 'supermercado',
      categoriaId: alimentos.id,
      mensajeId: 'test_001',
    },
  });

  console.log('Seed completado');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

Ejecutar:

```bash
npx prisma db seed
```

---

## Mejores Prácticas

### 1. SIEMPRE usar try-catch

```typescript
// ✅ CORRECTO
try {
  const gasto = await prisma.expense.create({ data });
  return NextResponse.json(gasto);
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }
  return NextResponse.json({ error: 'Server error' }, { status: 500 });
}

// ❌ INCORRECTO
const gasto = await prisma.expense.create({ data });
```

### 2. Usar include/select para optimizar

```typescript
// ✅ CORRECTO: Solo traer datos necesarios
await prisma.expense.findMany({
  select: {
    id: true,
    monto: true,
    categoria: { select: { nombre: true } },
  },
});

// ❌ INCORRECTO: Traer todo después filtrar en JS
const gastos = await prisma.expense.findMany();
const resultado = gastos.map(g => ({ id: g.id, monto: g.monto }));
```

### 3. Usar índices apropiados

En `schema.prisma`:

```prisma
@@index([fecha])           // Búsquedas por fecha
@@index([categoriaId])     // Búsquedas por categoría
@@index([fecha, categoriaId])  // Búsquedas combinadas
```

### 4. Manejar relaciones correctamente

```typescript
// ✅ CORRECTO: Usar onDelete: Restrict
model Expense {
  categoria Category @relation(fields: [categoriaId], references: [id], onDelete: Restrict)
}

// Evita borrar categorías si hay gastos

// ❌ INCORRECTO: Usar Cascade sin pensar
// Borrar categoría elimina todos los gastos
```

### 5. Tipos TypeScript automáticos

Prisma genera tipos automáticamente:

```typescript
import { Expense, Category } from '@prisma/client';

// Estos tipos son auto-generados de schema.prisma
const gasto: Expense = {
  id: 1,
  fecha: new Date(),
  hora: '14:30:00',
  monto: 20000,
  concepto: 'test',
  categoriaId: 1,
  descripcion: null,
  mensajeId: 'msg_1',
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

---

## Debugging

### Logs de Prisma

En `lib/prisma.ts`:

```typescript
new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

Verás queries en consola durante desarrollo.

### Prisma Studio

```bash
npx prisma studio
```

Abre interfaz gráfica en http://localhost:5555

---

## Performance

### N+1 Queries Problem

```typescript
// ❌ MAL: N+1 queries
const gastos = await prisma.expense.findMany();
for (const gasto of gastos) {
  const categoria = await prisma.category.findUnique({
    where: { id: gasto.categoriaId },
  }); // Query por cada gasto
}

// ✅ BIEN: Una sola query
const gastos = await prisma.expense.findMany({
  include: { categoria: true }, // Trae todo junto
});
```

### Paginación

```typescript
const page = 1;
const pageSize = 20;

const gastos = await prisma.expense.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { fecha: 'desc' },
});

const total = await prisma.expense.count();
```

---

## Deployment

### En Vercel

Variables de entorno automáticas:
- Agrega `DATABASE_URL` en Project Settings
- Prisma Client se auto-genera en build

### Migraciones en Producción

En Vercel, las migraciones se ejecutan automáticamente en Deploy Scripts.

O manualmente:

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

---

## Recursos

- Docs: https://www.prisma.io/docs/
- Query API: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference
- Ejemplos: https://github.com/prisma/prisma-examples

---

## FAQ

**P: ¿Puedo hacer queries SQL puras?**
R: Sí, con `prisma.$queryRaw()`, pero usa Prisma Client siempre que puedas.

**P: ¿Cómo reseteo la BD?**
R: `npx prisma migrate reset` (borra y recrea todo)

**P: ¿Prisma es lento?**
R: No, es muy rápido. Usa índices adecuados.

**P: ¿Puedo usar Prisma sin migraciones?**
R: No recomendado, las migraciones mantienen histórico.
