# Expense Tracker - Documentación Completa

Bienvenido al proyecto **Expense Tracker**, una aplicación de tracking de gastos personales integrada con WhatsApp.

Este directorio contiene toda la documentación necesaria para entender, desarrollar y mantener el proyecto.

---

## 📚 Archivos de Documentación

### 1. **PROJECT_CONTEXT.md** - Empieza aquí
**Qué leer**: Primero
**Duración**: 5 minutos

Visión general del proyecto:
- ¿Qué es Expense Tracker?
- Cómo funciona (flujo principal)
- Stack tecnológico
- Características principales
- Costos (todo gratis ✅)
- Estructura de carpetas

👉 **Ideal para**: Entender qué estás construyendo

---

### 2. **ARCHITECTURE.md** - Decisiones de diseño
**Qué leer**: Segundo
**Duración**: 10 minutos

Por qué se eligieron ciertos tecnologías y patrones:
- 10 decisiones clave de arquitectura
- Trade-offs considerados
- Flujos de datos (lectura y escritura)
- Patrones de código usados
- Escalabilidad futura
- Consideraciones de seguridad

👉 **Ideal para**: Entender POR QUÉ se hizo así

---

### 3. **DATABASE_SCHEMA.md** - Estructura PostgreSQL
**Qué leer**: Antes de tocar la BD
**Duración**: 15 minutos

Schema completo:
- Tablas: gastos, categorías
- Campos y constraints
- Índices para optimización
- 8 queries comunes (copiables)
- Vistas materializadas
- Backups y recovery

👉 **Ideal para**: Crear/modificar la BD

---

### 4. **API_ENDPOINTS.md** - REST API completa
**Qué leer**: Antes de llamar a la API
**Duración**: 20 minutos

Documentación de todos los endpoints:
- Webhook de WhatsApp (recibir/validar)
- CRUD de gastos (GET, POST, PUT, DELETE)
- Búsqueda avanzada
- Categorías
- Estadísticas
- Ejemplos reales (curl)
- Códigos de error

👉 **Ideal para**: Entender qué APIs existen y cómo usarlas

---

### 5. **FRONTEND_STRUCTURE.md** - Next.js 16 setup
**Qué leer**: Antes de trabajar en frontend
**Duración**: 20 minutos

Estructura completa del frontend:
- Carpetas y archivos
- 9 páginas principales
- Componentes clave
- State management (Context API vs Zustand)
- Types compartidos
- API client
- Custom hooks
- Routing

👉 **Ideal para**: Saber dónde crear componentes y páginas

---

### 6. **PRISMA_GUIDE.md** - ORM y Base de Datos
**Qué leer**: Antes de trabajar con BD
**Duración**: 20 minutos

Guía completa sobre Prisma:
- Setup inicial
- Schema Prisma
- CRUD operations
- Queries avanzadas
- Migraciones
- Mejores prácticas
- Debugging
- Performance
- Deployment

👉 **Ideal para**: Entender cómo usar Prisma + PostgreSQL

---

### 7. **CONVENTIONS.md** - Estándares de código
**Qué leer**: Constantemente mientras codifiques
**Duración**: 30 minutos (consulta frecuente)

Cómo escribir código en este proyecto:
- Tipos TypeScript (interfaces, DTOs)
- Nombres (variables, funciones, archivos)
- Componentes React (estructura, props)
- Next.js App Router (pages, routes)
- Estilos Tailwind (clases, responsive)
- Imports/exports
- Comments
- Git commits
- Validación con Zod
- Error handling
- Performance (memoization)

👉 **Ideal para**: Escribir código consistente con el proyecto

---

### 8. **CURSOR_RULES.md** - Reglas para Cursor IDE
**Qué leer**: Referencia durante desarrollo
**Duración**: 15 minutos

Directivas que Cursor debe seguir:
- 10 reglas de oro
- Reglas por tipo de tarea
- Checklist antes de finalizar
- Ejemplos de buenas/malas interacciones
- Cómo usar estos documentos

👉 **Ideal para**: Cursor y agentes de IA entienda el proyecto

---

### 8. **README.md** - Este archivo
**Qué leer**: Cuando necesitas orientación
**Duración**: 5 minutos

Índice y guía de navegación

---

## 🗂️ Cómo Usar Esta Documentación

### Escenario 1: Soy nuevo en el proyecto
1. Lee **PROJECT_CONTEXT.md** (5 min)
2. Lee **ARCHITECTURE.md** (10 min)
3. Consulta **CONVENTIONS.md** mientras codifiques

### Escenario 2: Voy a crear un componente
1. Consulta **FRONTEND_STRUCTURE.md** - "¿Dónde va?"
2. Lee **CONVENTIONS.md** - "¿Cómo escribirlo?"
3. Implementa y sigue el checklist en **CURSOR_RULES.md**

### Escenario 3: Voy a crear un endpoint de API
1. Consulta **API_ENDPOINTS.md** - "¿Qué endpoints existen?"
2. Lee **DATABASE_SCHEMA.md** - "¿Qué queries necesito?"
3. Implementa y documenta en **API_ENDPOINTS.md**

### Escenario 4: Voy a modificar la BD
1. Lee **DATABASE_SCHEMA.md** - Schema actual
2. Crea script SQL de migración
3. Actualiza tipos en `lib/types.ts`
4. Actualiza queries en backend

### Escenario 5: Tengo una pregunta sobre arquitectura
1. Consulta **ARCHITECTURE.md** - "¿Por qué se eligió esto?"
2. Si no está, documenta la decisión

### Escenario 6: Reporte un bug
1. Localiza el código responsable
2. Cita la sección relevante (FRONTEND_STRUCTURE, DATABASE_SCHEMA, etc.)
3. Propón una solución

---

## 📋 Checklist Antes de Commitear

```
TypeScript y tipos:
  ☐ Todos los .ts o .tsx
  ☐ Tipos explícitos en funciones
  ☐ No hay `any`
  ☐ Importa tipos de Prisma si es necesario

Prisma y BD:
  ☐ Si cambias schema.prisma: creaste migración
  ☐ ✅ npx prisma migrate dev --name descripcion
  ☐ No hay queries SQL puras (usa Prisma Client)
  ☐ Error handling con try-catch

Nombres:
  ☐ Descriptivos (ExpenseForm, no form)
  ☐ PascalCase para componentes
  ☐ camelCase para variables
  ☐ UPPERCASE para constantes

Validación:
  ☐ Input validado con Zod
  ☐ Error handling explícito (throw o return error)
  ☐ NextResponse con status correcto

Componentes React:
  ☐ Interface Props documentada
  ☐ 'use client' si usa hooks
  ☐ Tailwind CSS para estilos
  ☐ Mobile-first responsive

Route Handlers:
  ☐ Valida input con Zod
  ☐ Usa Prisma Client desde @/lib/prisma
  ☐ Try-catch alrededor de Prisma
  ☐ Retorna NextResponse con status

Documentación:
  ☐ Actualizar .md si cambia estructura
  ☐ JSDoc para funciones/endpoints públicos
  ☐ Comments para lógica compleja

Git:
  ☐ Commit message: feat/fix/docs/refactor/...
  ☐ Mensaje descriptivo (no "update" o "asdf")
  ☐ Sin commits WIP

Verificación Final:
  ☐ npm run lint ← sin warnings
  ☐ npx tsc --noEmit ← sin errores TS
  ☐ Testeado localmente ← funciona
```

---

## 🚀 Quick Start (Desarrollo)

**Para empezar rápido, ver `QUICK_START.md` (5 minutos)**

Resumen:
1. `npm install`
2. Configurar `.env.local` (DATABASE_URL, WhatsApp tokens)
3. `npx prisma migrate deploy`
4. `npm run dev`
5. Abre http://localhost:3000

---

## 📦 Archivos de Documentación (Completa)

**Orden recomendado de lectura**:

1. **README.md** (este) → Índice y orientación
2. **PROJECT_CONTEXT.md** → Visión general
3. **QUICK_START.md** → Setup inicial
4. **ARCHITECTURE.md** → Decisiones de diseño
5. **CONVENTIONS.md** → Cómo escribir código
6. **FRONTEND_STRUCTURE.md** → Estructura páginas/componentes
7. **PRISMA_GUIDE.md** → Base de datos
8. **API_ENDPOINTS.md** → Endpoints disponibles
9. **CURSOR_RULES.md** → Reglas para Cursor IDE

---

## 📊 Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Lenguaje Backend** | Node.js + TypeScript |
| **Lenguaje Frontend** | React + TypeScript |
| **Base de Datos** | PostgreSQL |
| **Gráficos** | Recharts |
| **Estilos** | Tailwind CSS |
| **Validación** | Zod |
| **Integración** | Meta WhatsApp API |
| **Costo Total** | $0 (Todo gratis) |
| **Usuarios** | 1 (Personal) |

---

## 🔒 Seguridad

Puntos críticos:
- ✅ CORS solo a frontend
- ✅ Prepared statements en BD (SQL injection prevention)
- ✅ Validación con Zod
- ✅ Token de Meta validado
- ✅ Mensaje_id único (evitar duplicados)
- ✅ Variables en .env (no hardcodear)

---

## 🎯 Roadmap

### MVP (Lanzamiento Inicial) ✅
- [x] Recibir mensajes WhatsApp
- [x] Parsear gastos
- [x] Categorización automática
- [x] Dashboard con vistas día/mes/año
- [x] Gráficos básicos

### Fase 2 (Futuro)
- [ ] Editar/eliminar gastos desde dashboard
- [ ] Búsqueda avanzada
- [ ] Reportes exportables (PDF)
- [ ] Presupuestos

### Fase 3 (Escalabilidad)
- [ ] Autenticación multi-usuario
- [ ] Sincronización real-time
- [ ] App móvil
- [ ] Machine Learning para categorización

---

## 📞 Support

Si tienes dudas:

1. **Sobre arquitectura** → ARCHITECTURE.md
2. **Sobre código** → CONVENTIONS.md
3. **Sobre BD** → DATABASE_SCHEMA.md
4. **Sobre API** → API_ENDPOINTS.md
5. **Sobre estructura** → FRONTEND_STRUCTURE.md o PROJECT_CONTEXT.md
6. **Sobre reglas generales** → CURSOR_RULES.md

---

## 📝 Cómo Mantener la Documentación

### Cuando crees algo nuevo:
- Documenta en la sección correspondiente (.md)
- Actualiza ejemplos si aplica
- Menciona en este README si es importante

### Cuando cambies algo:
- Actualiza la documentación ANTES o JUNTO al código
- No dejes docs obsoletos
- Ejecuta "check" contra docs si hay inconsistencias

### Convención de Versiones en Docs:
```markdown
Última actualización: 2024-01-15
Versión: 1.0.0
Stack: Node.js 18, React 19, Next.js 16, PostgreSQL 15
```

---

## 🎓 Recursos Externos

Si necesitas aprender algo:

- **Next.js 16**: https://nextjs.org/docs
- **React 19**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **PostgreSQL**: https://www.postgresql.org/docs
- **Recharts**: https://recharts.org
- **Zod**: https://zod.dev
- **Meta WhatsApp API**: https://developers.facebook.com/docs/whatsapp

---

## ✨ Summary

Este proyecto está completamente documentado para que:

✅ Nuevos desarrolladores entiendan rápidamente  
✅ Cambios futuros sean consistentes  
✅ Cursor IDE entienda el contexto  
✅ Bugs sean más fáciles de rastrear  
✅ Code review sea más rápido  
✅ Onboarding sea prácticamente automático  

**La documentación es parte del código, trátala con el mismo cuidado.**

---

## 📄 Licencia

Proyecto personal - Uso exclusivo del autor

---

## 🎉 Bienvenido al Proyecto

¿Listo para empezar?

1. Lee **PROJECT_CONTEXT.md**
2. Revisa **ARCHITECTURE.md**
3. Consulta **CONVENTIONS.md** mientras codifiques
4. ¡Empieza a construir! 🚀

**Última actualización**: 2024-01-15  
**Versión**: 1.0  
**Estado**: En desarrollo
