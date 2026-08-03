# 📚 Expense Tracker - Documentación Index

**Proyecto**: App de tracking de gastos personales con WhatsApp
**Tech Stack**: Next.js 16 + Prisma + PostgreSQL (Monolítico)
**Deployment**: Vercel
**Usuarios**: 1 (Personal)
**Costo**: $0 (Todo gratis)

---

## 🎯 POR DÓNDE EMPEZAR

### Si eres NUEVO en el proyecto
👉 Lee EN ESTE ORDEN:

1. **README.md** (5 min) - Visión general de documentación
2. **PROJECT_CONTEXT.md** (5 min) - Qué estamos construyendo
3. **QUICK_START.md** (10 min) - Setup local
4. **ARCHITECTURE.md** (10 min) - Por qué se eligió así

### Si VIENES A CODIFICAR ALGO
👉 Abre estos según la tarea:

**Crear componente React**
→ FRONTEND_STRUCTURE.md → CONVENTIONS.md → CURSOR_RULES.md

**Crear API endpoint**
→ API_ENDPOINTS.md → PRISMA_GUIDE.md → CURSOR_RULES.md

**Modificar base de datos**
→ DATABASE_SCHEMA.md → PRISMA_GUIDE.md → CONVENTIONS.md

**Configurar por primera vez**
→ QUICK_START.md → PRISMA_GUIDE.md

---

## 📄 Todos Los Archivos (Descripción Rápida)

| Archivo | Para | Duración | Cuándo leer |
|---------|------|----------|------------|
| **INDEX.md** | Este archivo - Mapa mental | 5 min | Orientación |
| **README.md** | Índice detallado + guías | 10 min | Primera visita |
| **PROJECT_CONTEXT.md** | Visión general del proyecto | 5 min | **PRIMERO** |
| **QUICK_START.md** | Setup y comandos iniciales | 10 min | Antes de codificar |
| **ARCHITECTURE.md** | Decisiones de diseño | 10 min | Entender PORQUÉ |
| **DATABASE_SCHEMA.md** | Estructura PostgreSQL | 15 min | Antes de tocar BD |
| **PRISMA_GUIDE.md** | Guía completa de Prisma ORM | 20 min | Para consulta frecuente |
| **FRONTEND_STRUCTURE.md** | Carpetas y páginas Next.js | 20 min | Antes crear componente |
| **API_ENDPOINTS.md** | Documentación de endpoints | 15 min | Antes crear API |
| **CONVENTIONS.md** | Estándares de código | 30 min | Mientras codifiques |
| **CURSOR_RULES.md** | Reglas para Cursor IDE | 15 min | Durante desarrollo |

---

## 🗺️ Matriz: Qué leer según tu tarea

```
┌─────────────────────────────────────────────────────────────┐
│ TAREA → QUÉ LEER                                             │
├─────────────────────────────────────────────────────────────┤
│ Setup inicial (primera vez)                                 │
│   → PROJECT_CONTEXT → QUICK_START → ARCHITECTURE            │
│                                                               │
│ Crear componente React                                       │
│   → FRONTEND_STRUCTURE → CONVENTIONS → CURSOR_RULES          │
│                                                               │
│ Crear API route handler                                      │
│   → API_ENDPOINTS → PRISMA_GUIDE → CONVENTIONS             │
│                                                               │
│ Modificar schema de BD                                       │
│   → DATABASE_SCHEMA → PRISMA_GUIDE → Ejecutar migración    │
│                                                               │
│ Escribir query Prisma                                        │
│   → PRISMA_GUIDE (queries avanzadas)                        │
│                                                               │
│ Dudas sobre arquitectura                                     │
│   → ARCHITECTURE (decisiones)                               │
│                                                               │
│ ¿Cómo se nombra X? / ¿Dónde va X?                           │
│   → CONVENTIONS → FRONTEND_STRUCTURE                        │
│                                                               │
│ Dudas sobre Cursor IDE                                       │
│   → CURSOR_RULES                                            │
│                                                               │
│ Help! Error/Bug                                              │
│   → QUICK_START (troubleshooting)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ 5-Minute Crash Course

### ¿Qué es esto?
App personal para trackear gastos. Envías mensaje por WhatsApp (`"gaste $20000 en supermercado"`), se registra automáticamente en dashboard.

### ¿Cómo funciona?
```
WhatsApp → Meta API → Next.js Route Handler → Prisma → PostgreSQL → React Dashboard
```

### ¿Dónde está todo?
- Frontend + Backend: **Una sola app Next.js** (`/app`)
- BD: **PostgreSQL** (Railway o local)
- Deployment: **Vercel**

### Tech Stack
- **Next.js 16** - Framework (frontend + backend)
- **Prisma** - ORM (database)
- **PostgreSQL** - Database
- **Tailwind CSS** - Estilos
- **Recharts** - Gráficos
- **Zod** - Validación

### Estructura
```
app/
├── api/          ← Route handlers (backend)
├── dashboard/    ← Frontend páginas
├── transacciones/
└── categorias/

lib/
├── prisma.ts    ← BD connection
├── types.ts     ← Tipos compartidos
└── validation.ts ← Schemas Zod

components/      ← Componentes React

prisma/
└── schema.prisma ← Modelo de datos
```

### Cómo Codificar
1. **¿Necesito página?** → Crear en `app/`
2. **¿Necesito componente?** → Crear en `components/`
3. **¿Necesito API?** → Crear en `app/api/`
4. **¿Necesito cambiar BD?** → Editar `prisma/schema.prisma` + migración

---

## 📖 Flujo de Lectura Recomendado

### Semana 1: Entender el proyecto
```
Day 1: README.md → PROJECT_CONTEXT.md
Day 2: QUICK_START.md (setup local)
Day 3: ARCHITECTURE.md
Day 4: QUICK_START.md (troubleshooting si hay problemas)
Day 5: FRONTEND_STRUCTURE.md (explorando rutas)
```

### Semana 2: Codificar
```
Day 1: CONVENTIONS.md (standards)
Day 2: FRONTEND_STRUCTURE.md + crear primer componente
Day 3: PRISMA_GUIDE.md (entender ORM)
Day 4: API_ENDPOINTS.md + crear primer endpoint
Day 5: CURSOR_RULES.md + escribir con reglas
```

### Durante desarrollo
```
Momento → Consulta
─────────────────────
"¿Dónde va esto?" → FRONTEND_STRUCTURE.md
"¿Cómo se nombra?" → CONVENTIONS.md
"¿Cómo hacer query?" → PRISMA_GUIDE.md
"¿Qué endpoints existen?" → API_ENDPOINTS.md
"¿Cómo deployar?" → QUICK_START.md (deployment section)
```

---

## ✅ Checklist de Primer Desarrollo

- [ ] Leí PROJECT_CONTEXT.md
- [ ] Leí QUICK_START.md
- [ ] Ejecuté `npm install` y `npm run dev`
- [ ] Abrí http://localhost:3000 (funciona)
- [ ] Leí ARCHITECTURE.md (entiendo decisiones)
- [ ] Leí CONVENTIONS.md (entiendo estándares)
- [ ] Creé mi primer componente (en `components/`)
- [ ] Creé mi primer route handler (en `app/api/`)
- [ ] Leí CURSOR_RULES.md (entiendo reglas)
- [ ] Hice commit con mensaje descriptivo

**Una vez completado**: ¡Eres part-time contributor oficial! 🎉

---

## 🆘 Problema Común → Solución

| Problema | Solución |
|----------|----------|
| "No sé cómo empezar" | Abre **QUICK_START.md** |
| "BD no conecta" | Ver troubleshooting en **QUICK_START.md** |
| "No sé dónde crear X" | **FRONTEND_STRUCTURE.md** |
| "No sé cómo nombrar X" | **CONVENTIONS.md** |
| "No sé hacer query SQL" | **PRISMA_GUIDE.md** |
| "No sé qué endpoints hay" | **API_ENDPOINTS.md** |
| "¿Por qué se eligió X?" | **ARCHITECTURE.md** |
| "Cursor no entiende nada" | **CURSOR_RULES.md** |

---

## 📌 Puntos Importantes (Memorizar)

**NUNCA**:
- ❌ Usar `any` type
- ❌ Hacer queries SQL puras (usa Prisma)
- ❌ Silenciar errores (siempre try-catch visible)
- ❌ Cambiar estructura de carpetas
- ❌ Instalar libs sin preguntar
- ❌ Commitear `.env.local`

**SIEMPRE**:
- ✅ Usar Prisma Client desde `@/lib/prisma`
- ✅ Validar input con Zod
- ✅ TypeScript tipos explícitos
- ✅ Nombres descriptivos
- ✅ Error handling
- ✅ Actualizar .md si cambia algo importante
- ✅ NextResponse con status correcto

---

## 🚀 Próximos Pasos Típicos

**Después de leer esta documentación**:

1. Ejecuta `npm install` y `npm run dev`
2. Abre http://localhost:3000
3. Explora las páginas existentes
4. Crea tu primer componente (copia/modifica uno existente)
5. Haz tu primer commit con mensaje descriptivo
6. Abre PR con descripción clara

---

## 🎓 Recursos Externos

Si necesitas aprender tecnología:

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Prisma**: https://www.prisma.io/docs
- **PostgreSQL**: https://www.postgresql.org/docs
- **Tailwind**: https://tailwindcss.com/docs
- **Zod**: https://zod.dev

---

## 📞 FAQ Rápido

**P: ¿Dónde está el backend?**
R: Todo en una app Next.js. Los route handlers (`app/api/`) son el backend.

**P: ¿Cuántas DBs hay?**
R: Una sola. PostgreSQL (local, Railway, o Render).

**P: ¿Cuántos repos hay?**
R: Uno solo. Frontend + Backend en mismo repo.

**P: ¿Cómo cambio la BD?**
R: Edita `prisma/schema.prisma` y corre `npx prisma migrate dev --name cambio`

**P: ¿Cómo deployar?**
R: Push a GitHub → Vercel auto-deploya. Migraciones automáticas.

**P: ¿Cómo teseo WhatsApp localmente?**
R: Ngrok o Vercel preview. Ver QUICK_START.md.

**P: ¿Puedo agregar librería X?**
R: Pregunta primero. Ver lista permitida en CONVENTIONS.md

---

## 🎯 Resumen Ejecutivo

```
╔═══════════════════════════════════════════════════════════════╗
║ EXPENSE TRACKER - TODO EN UNA FRASE                          ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║ App de gastos personal: envías mensaje WhatsApp → se         ║
║ registra automáticamente en dashboard con gráficos.          ║
║                                                               ║
║ Tech: Next.js 16 (frontend + backend) + Prisma + PostgreSQL  ║
║ Deploy: Vercel (monolítico, todo junto)                      ║
║ Costo: $0                                                    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 📋 Documentos en Este Proyecto

```
INDEX.md                    ← Este archivo (Mapa mental)
README.md                   ← Índice detallado
PROJECT_CONTEXT.md         ← Visión general
QUICK_START.md             ← Setup y troubleshooting
ARCHITECTURE.md            ← Decisiones de diseño
DATABASE_SCHEMA.md         ← Schema PostgreSQL
PRISMA_GUIDE.md            ← Guía de Prisma ORM
FRONTEND_STRUCTURE.md      ← Carpetas y páginas Next.js
API_ENDPOINTS.md           ← Documentación REST API
CONVENTIONS.md             ← Estándares de código
CURSOR_RULES.md            ← Reglas para Cursor IDE
```

---

**Última actualización**: 2024-01-15  
**Versión documentación**: 2.0  
**Estado proyecto**: MVP Planning completado ✅

**¡Bienvenido! Empezá por PROJECT_CONTEXT.md 👉**
