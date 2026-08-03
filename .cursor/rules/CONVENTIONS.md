# Expense Tracker - Convenciones de Código

## TypeScript

### Tipos y Interfaces

```typescript
// ✅ CORRECTO: Interface para objetos
interface User {
  id: number;
  name: string;
}

// ✅ CORRECTO: Type para uniones
type Period = 'dia' | 'mes' | 'anio';

// ✅ CORRECTO: Genéricos bien nombrados
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
}

// ❌ INCORRECTO: Usar any
const data: any = fetchSomething(); // NO

// ❌ INCORRECTO: Type cuando debería ser interface
type Person = {
  name: string;
};
```

### DTOs (Data Transfer Objects)

Nombrar con sufijo `DTO`:

```typescript
// Backend envia
export interface ExpenseDTO {
  id: number;
  fecha: string;
  monto: number;
  // ...
}

// Para crear gasto
export interface CreateExpenseDTO {
  fecha: string;
  monto: number;
  // id y timestamps NO incluyen aquí
}

// Para actualizar
export type UpdateExpenseDTO = Partial<CreateExpenseDTO>;
```

### Null/Undefined

```typescript
// ✅ CORRECTO: Usar optional chaining
const value = user?.profile?.name;

// ✅ CORRECTO: Nullish coalescing
const count = items?.length ?? 0;

// ✅ CORRECTO: Type guards
if (typeof value === 'string') {
  // value es string aquí
}

// ❌ INCORRECTO: Chequear solo null
if (value !== null) { // podría ser undefined
}
```

---

## Nombres de Archivos y Carpetas

### Componentes React

```
✅ Componentes:
  - ExpenseForm.tsx
  - ExpenseChart.tsx
  - PeriodSelector.tsx

✅ Hooks:
  - useExpenses.ts
  - usePeriod.ts
  - useLocalStorage.ts

✅ Servicios/APIs:
  - api.ts
  - expenseService.ts

❌ INCORRECTO:
  - expenseform.tsx (minúsculas)
  - ExpenseChart.jsx (no usar .jsx)
  - expense_form.tsx (snake_case)
```

### Carpetas

```
✅ CORRECTO: Minúsculas, plural si contiene múltiples items
  components/
  hooks/
  lib/
  utils/
  services/

❌ INCORRECTO:
  Components/
  HOOKS/
  Lib/
```

---

## Variables y Funciones

### Nombres Descriptivos

```typescript
// ✅ CORRECTO: Nombres claros
const totalMonthlyExpense = 250000;
const isLoadingData = false;
const expensesByCategory = [];

const fetchExpensesByMonth = async (month: number) => {};

// ❌ INCORRECTO: Nombres cortos
const total = 250000; // ¿de qué?
const data = []; // ¿qué datos?
const get = () => {}; // ¿obtener qué?
```

### Convención de Booleanos

```typescript
// Prefijos: is, has, can, should
const isLoading = false;
const hasError = true;
const canDelete = user.role === 'admin';
const shouldFetch = false;

// En hooks/componentes
const [isOpen, setIsOpen] = useState(false);
```

### Constantes

```typescript
// MAYÚSCULAS_CON_UNDERSCORE para constantes inmutables
export const API_BASE_URL = 'http://localhost:3000';
export const DEFAULT_PAGE_SIZE = 20;
export const CATEGORY_COLORS = { /* ... */ };

// Dentro de componentes (PascalCase si es constantec)
const INITIAL_STATE = { /* ... */ };
```

---

## Funciones

### Funciones Asincrónicas

```typescript
// ✅ CORRECTO: Try-catch con tipos
async function fetchExpenses(): Promise<ExpenseDTO[]> {
  try {
    const response = await fetch('/api/gastos');
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error; // Re-throw para que el caller maneje
  }
}

// ✅ CORRECTO: Arrow functions
const getCategories = async (): Promise<CategoryDTO[]> => {
  // ...
};

// ❌ INCORRECTO: Sin tipo de retorno
async function getExpenses() { }

// ❌ INCORRECTO: Silent catch
try {
  // ...
} catch (error) {
  // Nunca hacer esto:
}
```

### Error Handling

```typescript
// ✅ CORRECTO: Clase de error custom
class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ✅ CORRECTO: Manejo específico
try {
  const expense = await createExpense(data);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.statusCode === 409) {
      console.log('Gasto duplicado');
    }
  }
}
```

---

## React Components

### Estructura de Componente Funcional

```typescript
// ✅ CORRECTO: Orden estándar
import React, { useState, useEffect } from 'react';
import { SomeComponent } from '@/components';
import { useCustomHook } from '@/hooks';
import { someUtility } from '@/lib/utils';

interface ComponentProps {
  title: string;
  onSubmit?: (data: FormData) => void;
  isLoading?: boolean;
}

export function MyComponent({
  title,
  onSubmit,
  isLoading = false
}: ComponentProps) {
  // 1. Hooks
  const [value, setValue] = useState('');
  
  // 2. Derived state
  const isEmpty = value.trim() === '';
  
  // 3. Effects
  useEffect(() => {
    // effect logic
  }, []);
  
  // 4. Event handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };
  
  const handleSubmit = async () => {
    if (!isEmpty && onSubmit) {
      await onSubmit({ value });
    }
  };
  
  // 5. Render
  return (
    <div>
      <h1>{title}</h1>
      <input value={value} onChange={handleChange} />
      <button onClick={handleSubmit} disabled={isLoading || isEmpty}>
        Submit
      </button>
    </div>
  );
}
```

### Props Destructuring

```typescript
// ✅ CORRECTO: Destructurar con valores por defecto
function Component({
  title,
  isOpen = false,
  onClose = () => {}
}: {
  title: string;
  isOpen?: boolean;
  onClose?: () => void;
}) {
  // ...
}

// ✅ CORRECTO: Separar en interfaz
interface Props {
  title: string;
  isOpen?: boolean;
}

function Component({ title, isOpen = false }: Props) {
  // ...
}
```

### Event Handlers

```typescript
// ✅ CORRECTO: Arrow functions con tipos
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  // ...
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

// ✅ CORRECTO: Nombres descriptivos
const handleFormSubmit = () => {};
const handleModalClose = () => {};
const handleCategoryChange = () => {};
```

### Condicionales en JSX

```typescript
// ✅ CORRECTO: Operador ternario para mostrar/ocultar
{isLoading ? <Spinner /> : <Content />}

// ✅ CORRECTO: AND operador para mostrar si existe
{error && <ErrorMessage msg={error} />}

// ❌ INCORRECTO: if statements en JSX
{
  if (isLoading) {
    return <Spinner />;
  }
}

// ✅ CORRECTO: Lógica en variable antes de render
const contentToRender = isLoading ? (
  <Spinner />
) : error ? (
  <ErrorMessage />
) : (
  <Content />
);

return <div>{contentToRender}</div>;
```

---

## Next.js App Router

### Estructura de Pages

```typescript
// ✅ CORRECTO: Metadata y default export
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Expense Tracker'
};

export default function Page() {
  return <Dashboard />;
}

// ❌ INCORRECTO: Named exports
export function Dashboard() { }
```

### Route Handlers (API Routes)

```typescript
// ✅ CORRECTO: Typed response
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validar body con Zod
    const result = await createExpense(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

### Server Components vs Client Components

```typescript
// ✅ CORRECTO: Server Component (default)
// En app/dashboard/page.tsx
export default async function Dashboard() {
  const expenses = await fetchExpenses(); // OK aquí
  return <div>{/* ... */}</div>;
}

// ✅ CORRECTO: Client Component explícito
'use client';

import { useState } from 'react';

export function ExpenseForm() {
  const [value, setValue] = useState(''); // OK con 'use client'
  return <form>{/* ... */}</form>;
}

// ❌ INCORRECTO: Mezclar server y async en client
'use client';

async function getData() { } // NO, async no funciona bien aquí
```

---

## Estilos (Tailwind CSS)

### Clases Tailwind

```typescript
// ✅ CORRECTO: Clases simples
<div className="flex gap-4 p-4 rounded-lg bg-white shadow">
  Content
</div>

// ✅ CORRECTO: Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  Items
</div>

// ✅ CORRECTO: Estado
<button className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50">
  Click me
</button>

// ❌ INCORRECTO: Clases dinámicas con interpolación
<div className={`bg-${color}-500`}> {/* No funciona */}

// ✅ CORRECTO: Clases dinámicas con condicionales
<div className={isActive ? 'bg-blue-500' : 'bg-gray-500'}>
```

### Variables CSS para Colores de Categoría

```css
/* styles/globals.css */
:root {
  --color-alimentos: #E85D24;
  --color-transporte: #3B8BD4;
  --color-vivienda: #078D92;
  /* ... */
}
```

```typescript
// En componentes
const categoryColors = {
  alimentos: 'var(--color-alimentos)',
  transporte: 'var(--color-transporte)',
  // ...
};
```

---

## Imports y Exports

### Orden de Imports

```typescript
// 1. Imports de librerías externas
import React, { useState } from 'react';
import { formatDate } from 'date-fns';

// 2. Imports de Next.js
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 3. Imports internos (absolute paths)
import { ExpenseForm } from '@/components/features';
import { useExpenses } from '@/hooks';
import { API } from '@/lib/api';

// 4. Imports de tipos
import type { ExpenseDTO } from '@/lib/types';

// 5. Imports de estilos
import '@/styles/form.css';

// ❌ INCORRECTO: Imports desordenados
import type { ExpenseDTO } from '@/lib/types';
import React from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/lib/api';
```

### Export Patterns

```typescript
// ✅ CORRECTO: Default export para páginas/componentes
export default function Page() { }

// ✅ CORRECTO: Named exports para utilidades
export const formatMoney = (value: number) => `$${value}`;
export const parseExpense = (text: string) => ({ /* ... */ });

// ✅ CORRECTO: Re-exports
export { ExpenseForm } from './ExpenseForm';
export type { ExpenseDTO } from '@/lib/types';

// ❌ INCORRECTO: Mezclar default con named
export default function Component() { }
export const helper = () => {}; // Evitar esto
```

---

## Comments y Documentación

### JSDoc para Funciones Públicas

```typescript
/**
 * Fetch expenses for a specific month
 * 
 * @param month - Month number (1-12)
 * @param year - Year (e.g., 2024)
 * @returns Promise with array of expenses
 * @throws {ApiError} If API returns error
 * 
 * @example
 * const expenses = await getExpensesByMonth(1, 2024);
 */
export async function getExpensesByMonth(
  month: number,
  year: number
): Promise<ExpenseDTO[]> {
  // implementation
}

// ✅ CORRECTO: Comentarios para lógica compleja
const result = expenses.reduce((acc, exp) => {
  // Group expenses by category
  const key = exp.categoria_id;
  if (!acc[key]) acc[key] = [];
  acc[key].push(exp);
  return acc;
}, {} as Record<number, ExpenseDTO[]>);

// ❌ INCORRECTO: Comentarios obvios
const name = 'John'; // Asignar nombre
const total = a + b; // Sumar a y b
```

---

## Git Commit Messages

```
✅ CORRECTO:
  feat: add expense form component
  fix: prevent duplicate expenses in webhook
  docs: update API documentation
  refactor: simplify categorization logic
  style: format code with prettier
  chore: update dependencies
  test: add tests for parseExpense utility

❌ INCORRECTO:
  changes
  fix bug
  update
  asdfgh
  WIP: working on features
```

### Formato Detallado

```
<type>: <subject>

<body>

<footer>

Ejemplos:
---
feat: add pagination to expense list

Add limit and offset parameters to expense search API.
This allows users to navigate through large result sets efficiently.

Closes #42
```

---

## Linting y Formatting

### ESLint

```json
// .eslintrc.json (recomendado)
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-types": "warn"
  }
}
```

### Prettier

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Editor Config

```
//.editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{js,ts,jsx,tsx}]
indent_style = space
indent_size = 2
```

---

## Validación con Zod

```typescript
// ✅ CORRECTO: Schemas centralizados
export const createExpenseSchema = z.object({
  fecha: z.string().date('Invalid date'),
  hora: z.string().time('Invalid time'),
  monto: z.number().positive('Amount must be positive'),
  concepto: z.string().min(1, 'Concept is required'),
  categoria_id: z.number().positive('Category is required'),
});

// En componentes
const handleSubmit = async (formData: FormData) => {
  try {
    const validated = createExpenseSchema.parse(formData);
    await createExpense(validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      setErrors(error.flatten().fieldErrors);
    }
  }
};
```

---

## Patrones de Error

### Custom Error Classes

```typescript
export class ExpenseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpenseError';
  }
}

export class ValidationError extends ExpenseError {
  constructor(public field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ExpenseError {
  constructor(public resource: string, public id: unknown) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

// Uso
try {
  // ...
} catch (error) {
  if (error instanceof NotFoundError) {
    showToast(`${error.resource} not found`);
  } else if (error instanceof ValidationError) {
    setFieldError(error.field, error.message);
  }
}
```

---

## Performance

### Memoization (Cuando Necesario)

```typescript
// ✅ CORRECTO: useMemo para cálculos costosos
const expensesByCategory = useMemo(
  () => groupByCategory(expenses),
  [expenses]
);

// ✅ CORRECTO: useCallback para event handlers pasados como props
const handleDelete = useCallback(
  async (id: number) => {
    await deleteExpense(id);
    refetchExpenses();
  },
  [refetchExpenses]
);

// ❌ INCORRECTO: Sobre-usar useMemo
const isOpen = useMemo(() => false, []); // No necesario

// ❌ INCORRECTO: Deps array incorrecto
useMemo(() => {
  // ...
}, [data]); // Si data es objeto, siempre se recalcula
```

---

## Resumen de Checklist

Antes de hacer commit:

- [ ] TypeScript compila sin errores (`tsc --noEmit`)
- [ ] ESLint sin warnings (`npm run lint`)
- [ ] Prettier formateado (`npm run format`)
- [ ] Tests pasando (futuro)
- [ ] Nombres descriptivos
- [ ] No hay `any` types
- [ ] Error handling adecuado
- [ ] Comments para lógica compleja
- [ ] Git commit message descriptivo
