# Expense Tracker - Frontend Structure (Next.js 16)

## Visión General

**Stack**:
- Next.js 16 (App Router)
- TypeScript
- React 19
- Tailwind CSS
- shadcn/ui (componentes)
- Recharts (gráficos)
- Zustand o Context API (state)
- TanStack Query (data fetching, opcional)

---

## Estructura de Carpetas

```
frontend/
├── app/                           # Next.js App Router
│   ├── layout.tsx                # Layout raíz
│   ├── page.tsx                  # Dashboard principal (/)
│   ├── dashboard/                # Rutas dashboard
│   │   ├── layout.tsx            # Layout del dashboard
│   │   ├── page.tsx              # Dashboard overview
│   │   ├── dia/page.tsx          # Vista diaria
│   │   ├── mes/page.tsx          # Vista mensual
│   │   └── anio/page.tsx         # Vista anual
│   ├── transacciones/            # Gestión de gastos
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Listado de transacciones
│   │   ├── [id]/page.tsx         # Detalle gasto
│   │   ├── nuevo/page.tsx        # Crear gasto manual
│   │   └── editar/[id]/page.tsx  # Editar gasto
│   ├── categorias/               # Gestión categorías
│   │   ├── page.tsx              # Listado categorías
│   │   └── [id]/page.tsx         # Editar categoría
│   ├── api/                      # Route handlers
│   │   ├── gastos/route.ts
│   │   ├── categorias/route.ts
│   │   └── estadisticas/route.ts
│   └── error.tsx                 # Error boundaries
│
├── components/                    # Componentes React
│   ├── ui/                       # Base UI (shadcn)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   └── ...
│   │
│   ├── charts/                   # Componentes gráficos
│   │   ├── ExpensePieChart.tsx   # Pie chart categorías
│   │   ├── TrendLineChart.tsx    # Línea tendencia anual
│   │   ├── BarChartByCategory.tsx
│   │   └── ExpenseOverTime.tsx
│   │
│   ├── features/                 # Componentes de features
│   │   ├── ExpenseForm.tsx       # Formulario crear/editar
│   │   ├── ExpenseList.tsx       # Listado gastos
│   │   ├── ExpenseFilters.tsx    # Filtros búsqueda
│   │   ├── CategoryBadge.tsx     # Badge de categoría
│   │   ├── PeriodSelector.tsx    # Selector Hoy/Mes/Año
│   │   └── StatCard.tsx          # Tarjeta de stat
│   │
│   ├── layouts/                  # Layouts reutilizables
│   │   ├── DashboardLayout.tsx   # Layout del dashboard
│   │   ├── Sidebar.tsx           # Sidebar navegación
│   │   ├── Header.tsx            # Header/navbar
│   │   └── Footer.tsx
│   │
│   └── common/                   # Componentes comunes
│       ├── Loading.tsx
│       ├── ErrorBoundary.tsx
│       ├── EmptyState.tsx
│       └── Pagination.tsx
│
├── hooks/                         # Custom hooks
│   ├── useExpenses.ts            # Hook para fetch gastos
│   ├── useCategories.ts          # Hook para categorías
│   ├── usePeriod.ts              # Hook período actual
│   ├── useStatistics.ts          # Hook estadísticas
│   ├── useDateFormat.ts          # Hook formato fecha
│   └── useLocalStorage.ts        # Hook localStorage
│
├── lib/                           # Utilidades
│   ├── api.ts                    # Cliente HTTP
│   ├── types.ts                  # Tipos compartidos
│   ├── utils.ts                  # Funciones util
│   ├── constants.ts              # Constantes
│   ├── formatting.ts             # Formateo (moneda, fecha)
│   └── validation.ts             # Validación Zod
│
├── context/                       # React Context (si no usas Zustand)
│   ├── ExpensesContext.tsx       # Context gastos
│   ├── CategoriesContext.tsx     # Context categorías
│   └── UIContext.tsx             # Context UI state
│
├── store/                         # Zustand (si lo usas)
│   ├── expenseStore.ts           # Store gastos
│   ├── uiStore.ts               # Store UI
│   └── filterStore.ts            # Store filtros
│
├── styles/                        # CSS global
│   ├── globals.css               # Tailwind + custom
│   └── variables.css             # CSS variables
│
├── public/                        # Assets estáticos
│   └── icons/
│
├── .env.local.example            # Variables de entorno ejemplo
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## Convenciones de Archivos

### Componentes
- Nombrar con PascalCase: `ExpenseForm.tsx`
- Componentes del servidor (default): No usar hooks
- Componientes del cliente: `'use client'` al inicio
- Exportar como named exports

### Hooks
- Prefijo `use`: `useExpenses.ts`
- Siempre en archivos separados
- Exportar como default

### Types
- En archivo `lib/types.ts` centralizado
- Nombrar con PascalCase: `ExpenseDTO`, `CategoryDTO`
- Usar interfaces para objetos, types para uniones

### Servicios/APIs
- En `lib/api.ts`
- Funciones async que devuelven tipos
- Error handling centralizado

---

## Stack de State Management

### Opción 1: React Context (Recomendado para MVP)

**Ventajas**:
- Sin dependencias extra
- Suficiente para datos read-only
- Fácil de entender

**Estructura**:
```
context/
├── ExpensesContext.tsx
└── useExpenses.ts (hook custom)
```

**Uso**:
```tsx
const { expenses, loading, error } = useExpenses();
```

---

### Opción 2: Zustand (Si crece la complejidad)

**Ventajas**:
- Más lightweight que Redux
- TypeScript perfecto
- Devtools

**Estructura**:
```
store/
├── expenseStore.ts
└── useExpenseStore.ts (hook)
```

**Uso**:
```tsx
const { expenses, addExpense } = useExpenseStore();
```

---

### Opción 3: TanStack Query (Para data fetching)

**Ventajas**:
- Caching automático
- Revalidación automática
- Deduplicación de requests

**Uso**:
```tsx
const { data: expenses } = useQuery({
  queryKey: ['expenses', mes, anio],
  queryFn: () => fetchExpensesForMonth(mes, anio)
});
```

---

## Páginas Principales

### 1. Dashboard (/dashboard)
**Archivo**: `app/dashboard/page.tsx`

**Contenido**:
- Selector de período (Hoy/Mes/Año)
- Tarjeta de total
- Pie chart por categoría
- Top 5 categorías
- Último gasto registrado
- Botón crear gasto

**Datos necesarios**:
- Gastos de período seleccionado (desde hook)
- Categorías (para colores)

---

### 2. Vista Diaria (/dashboard/dia)
**Archivo**: `app/dashboard/dia/page.tsx`

**Contenido**:
- Resumen total hoy
- Transacciones de hoy (lista)
- Gasto por categoría (tabla o cards)
- Opción crear gasto rápido

---

### 3. Vista Mensual (/dashboard/mes)
**Archivo**: `app/dashboard/mes/page.tsx`

**Contenido**:
- Selector de mes/año (dropdown)
- Total del mes
- Pie chart categorías
- Tabla detallada:
  - Fecha | Categoría | Concepto | Monto | Acciones
- Filtros por categoría
- Exportar (CSV, PDF - futuro)

---

### 4. Vista Anual (/dashboard/anio)
**Archivo**: `app/dashboard/anio/page.tsx`

**Contenido**:
- Selector de año
- Total del año
- Línea chart tendencia (gasto por mes)
- Bar chart por categoría (comparativa anual)
- Tabla resumen por mes

---

### 5. Transacciones (/transacciones)
**Archivo**: `app/transacciones/page.tsx`

**Contenido**:
- Búsqueda avanzada:
  - Rango fechas
  - Categoría
  - Monto (min-max)
  - Concepto (búsqueda texto)
- Tabla con todos los gastos
- Paginación
- Acciones: editar, eliminar

---

### 6. Crear Gasto Manual (/transacciones/nuevo)
**Archivo**: `app/transacciones/nuevo/page.tsx`

**Contenido**:
- Formulario:
  - Fecha (date picker)
  - Hora (time picker)
  - Monto (input número)
  - Concepto (input texto)
  - Categoría (select)
  - Descripción (textarea opcional)
- Botones: Guardar, Cancelar
- Validación en tiempo real

---

### 7. Editar Gasto (/transacciones/editar/[id])
**Archivo**: `app/transacciones/editar/[id]/page.tsx`

**Contenido**:
- Mismo formulario que crear
- Pre-populated con datos del gasto
- Opción eliminar
- Confirmación al guardar

---

### 8. Detalles Gasto (/transacciones/[id])
**Archivo**: `app/transacciones/[id]/page.tsx`

**Contenido**:
- Información completa del gasto
- Botones: Editar, Eliminar
- Información de meta (fecha creación, mensaje_id)

---

### 9. Categorías (/categorias)
**Archivo**: `app/categorias/page.tsx`

**Contenido**:
- Lista de todas las categorías
- Editable:
  - Palabras clave
  - Color
  - Icono
- Opción crear nueva (futuro)

---

## Componentes Clave

### ExpenseForm

```tsx
interface ExpenseFormProps {
  onSubmit: (expense: CreateExpenseDTO) => Promise<void>;
  initialData?: ExpenseDTO;
  isLoading?: boolean;
}

export function ExpenseForm({ onSubmit, initialData, isLoading }: ExpenseFormProps) {
  // Implementación
}
```

**Funcionalidades**:
- Validación con Zod
- Manejo de errores
- Loading states
- Auto-focus en campo monto

---

### ExpensePieChart

```tsx
interface ExpensePieChartProps {
  data: CategoryExpense[];
  loading?: boolean;
}

export function ExpensePieChart({ data, loading }: ExpensePieChartProps) {
  // Recharts implementation
}
```

---

### PeriodSelector

```tsx
type Period = 'dia' | 'mes' | 'anio';

interface PeriodSelectorProps {
  value: Period;
  onChange: (period: Period) => void;
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  // Tabs o botones
}
```

---

## Types Principales

```typescript
// types.ts

export interface ExpenseDTO {
  id: number;
  fecha: string;
  hora: string;
  monto: number;
  concepto: string;
  categoria_id: number;
  descripcion?: string;
  mensaje_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseDTO {
  fecha: string;
  hora: string;
  monto: number;
  concepto: string;
  categoria_id: number;
  descripcion?: string;
}

export interface CategoryDTO {
  id: number;
  nombre: string;
  color: string;
  icono: string;
  palabras_clave: string[];
  descripcion?: string;
  activa: boolean;
}

export interface ExpenseSummary {
  fecha?: string;
  total: number;
  cantidad: number;
  gastos: CategoryExpense[];
}

export interface CategoryExpense {
  categoria: string;
  color: string;
  icono: string;
  total: number;
  cantidad: number;
  promedio?: number;
}

export interface TrendData {
  mes: string;
  total: number;
  cantidad: number;
}
```

---

## API Client

**Archivo**: `lib/api.ts`

```typescript
class ExpenseTrackerAPI {
  constructor(private baseURL: string) {}

  // Gastos
  async getExpensesToday(): Promise<ExpenseSummary>
  async getExpensesByMonth(mes: number, anio: number): Promise<ExpenseSummary>
  async getExpensesByYear(anio: number): Promise<ExpenseSummary>
  async getExpense(id: number): Promise<ExpenseDTO>
  async createExpense(data: CreateExpenseDTO): Promise<ExpenseDTO>
  async updateExpense(id: number, data: Partial<CreateExpenseDTO>): Promise<ExpenseDTO>
  async deleteExpense(id: number): Promise<void>
  async searchExpenses(filters: SearchFilters): Promise<PaginatedResponse<ExpenseDTO>>
  async getTrend(): Promise<TrendData[]>

  // Categorías
  async getCategories(): Promise<CategoryDTO[]>
  async getCategory(id: number): Promise<CategoryDTO>
  async updateCategory(id: number, data: Partial<CategoryDTO>): Promise<CategoryDTO>

  // Estadísticas
  async getStatistics(desde?: string, hasta?: string): Promise<Statistics>
  async getMonthComparison(): Promise<MonthComparison>
}
```

---

## Custom Hooks

### useExpenses
```typescript
hook useExpenses(period: 'dia' | 'mes' | 'anio', mes?: number, anio?: number) {
  - Fetcha gastos del período
  - Caching automático
  - Loading states
  - Error handling
}
```

### usePeriod
```typescript
hook usePeriod() {
  - State del período actual
  - Funciones para cambiar período
  - Parsed params (mes, anio)
}
```

### useDateFormat
```typescript
hook useDateFormat() {
  - Formatear fecha (DD/MM/YYYY)
  - Formatear moneda ($X.XXX)
  - Formatear hora (HH:MM)
}
```

---

## Styling

### Tailwind Configuration
```javascript
// tailwind.config.js
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Colores categorías (sync con BD)
        gasto: {
          alimentos: '#E85D24',
          transporte: '#3B8BD4',
          // ...
        }
      }
    }
  }
}
```

### Global Styles
```css
/* styles/globals.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #3B8BD4;
  --color-success: #078D92;
  --color-warning: #F2A623;
  --color-danger: #D0021B;
}

/* Custom components */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600;
  }
}
```

---

## Performance Optimizations

1. **Code Splitting**:
   - Dynamic imports para modales y features pesadas
   - `const Modal = dynamic(() => import('./Modal'))`

2. **Image Optimization**:
   - Next.js Image component
   - Lazy loading automático

3. **Data Fetching**:
   - SWR o React Query para caché automático
   - Revalidation automática

4. **Bundle**:
   - Tree shaking con TypeScript
   - Minificación automática (Vercel)

---

## Variables de Entorno

```
# .env.local

NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Expense Tracker
NEXT_PUBLIC_LOG_LEVEL=debug
```

**Nota**: Prefijo `NEXT_PUBLIC_` hace variables disponibles en browser

---

## Testing (Futuro)

```
__tests__/
├── components/
│   ├── ExpenseForm.test.tsx
│   └── ExpensePieChart.test.tsx
├── hooks/
│   └── useExpenses.test.ts
└── lib/
    └── api.test.ts
```

**Tools**:
- Jest
- React Testing Library
- MSW (Mock Service Worker)

---

## SEO y Metadata

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: 'Expense Tracker',
  description: 'Administra tus gastos diarios con WhatsApp',
  viewport: 'width=device-width, initial-scale=1'
};
```

---

## Deployment en Vercel

```json
// vercel.json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api-prod.com"
  }
}
```

---

## Roadmap de Componentes

### MVP
- ✅ Dashboard overview
- ✅ Vista diaria/mensual/anual
- ✅ Formulario crear gasto
- ✅ Listado transacciones
- ✅ Gráficos básicos

### Fase 2
- ⬜ Búsqueda avanzada
- ⬜ Exportar PDF
- ⬜ Dark mode
- ⬜ Responsive mobile

### Fase 3
- ⬜ Presupuestos
- ⬜ Alertas
- ⬜ Sincronización
- ⬜ PWA
