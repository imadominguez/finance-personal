# Expense Tracker - Quick Start Guide

Guía rápida para empezar a desarrollar localmente.

---

## 1️⃣ Setup Inicial (Primera vez)

### Clonar Repositorio
```bash
git clone https://github.com/tu-usuario/expense-tracker.git
cd expense-tracker
```

### Instalar Dependencias
```bash
npm install
```

### Variables de Entorno
```bash
cp .env.example .env.local
```

Editar `.env.local`:
```
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/expense_tracker
WHATSAPP_PHONE_ID=tu_numero_whatsapp
WHATSAPP_TOKEN=tu_token_meta
VERIFY_TOKEN=token_aleatorio_para_webhook
NEXT_PUBLIC_APP_NAME=Expense Tracker
```

### Base de Datos

#### Opción A: Usar PostgreSQL Local
```bash
# Si tienes Docker
docker run --name expense-db \
  -e POSTGRES_USER=usuario \
  -e POSTGRES_PASSWORD=contraseña \
  -e POSTGRES_DB=expense_tracker \
  -p 5432:5432 \
  -d postgres:15
```

#### Opción B: Usar Railway (Cloud)
1. Ve a https://railway.app
2. Crea proyecto → Add Service → PostgreSQL
3. Copia la `DATABASE_URL` a `.env.local`

### Prisma Setup
```bash
# Crear esquema en BD
npx prisma migrate deploy

# (Opcional) Seed de datos de prueba
npx prisma db seed
```

---

## 2️⃣ Desarrollo Local

### Iniciar Servidor
```bash
npm run dev
```

Abre http://localhost:3000 en el navegador.

### Accesos Útiles

| URL | Qué es |
|-----|--------|
| http://localhost:3000 | App (home) |
| http://localhost:3000/dashboard | Dashboard principal |
| http://localhost:3000/dashboard/dia | Vista diaria |
| http://localhost:3000/dashboard/mes | Vista mensual |
| http://localhost:3000/dashboard/anio | Vista anual |
| http://localhost:3000/transacciones | Listado gastos |
| http://localhost:3000/categorias | Categorías |
| http://localhost:3000/api/health | Health check API |

### Verifica que Funciona

```bash
# En otra terminal
curl http://localhost:3000/api/health
```

Deberías recibir:
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## 3️⃣ Desarrollo Común

### Crear Componente

```bash
# 1. Crear archivo
touch components/features/MyComponent.tsx

# 2. Escribir componente (ver CONVENTIONS.md)
# 3. Usar en página
```

### Agregar Página

```bash
# 1. Crear carpeta
mkdir -p app/mi-feature

# 2. Crear page.tsx
touch app/mi-feature/page.tsx

# 3. Escribir componente exportado como default
# 4. Automáticamente accesible en /mi-feature
```

### Modificar Base de Datos

```bash
# 1. Editar prisma/schema.prisma
# Agregar campo, tabla, etc.

# 2. Crear migración
npx prisma migrate dev --name descripcion_cambio

# 3. Prisma genera SQL automáticamente y aplica cambios
# 4. Usa el nuevo campo en código
```

### Crear Route Handler (API)

```bash
# 1. Crear archivo
mkdir -p app/api/mi-endpoint
touch app/api/mi-endpoint/route.ts

# 2. Escribir handler
# GET, POST, PUT, DELETE, etc.

# 3. Usar en cliente
fetch('/api/mi-endpoint')
```

### Linting y Formato

```bash
# Verificar errores
npm run lint

# Formatear código
npm run format

# TypeScript
npx tsc --noEmit
```

---

## 4️⃣ Debugging

### Prisma Studio (Interfaz Gráfica)

```bash
npx prisma studio
```

Abre http://localhost:5555 - interfaz visual para BD

### Logs de Prisma

Ver queries SQL en consola (configurado automáticamente en dev).

### Errores TypeScript

```bash
# Ver errores en tiempo real
npx tsc --watch
```

### Browser DevTools

- F12 → Network → Ver requests a `/api/...`
- F12 → Console → Ver errores de JavaScript

---

## 5️⃣ Tesear WhatsApp Webhook Localmente

### Opción A: Usar Ngrok

```bash
# Instalar ngrok
brew install ngrok  # macOS
# o descargar desde https://ngrok.com

# Exponer localhost:3000
ngrok http 3000

# Copiar URL: https://xxxx-xxx-xxx.ngrok.io

# Configurar en Meta Developer:
# Webhook URL: https://xxxx-xxx-xxx.ngrok.io/api/webhook/whatsapp
# Verify Token: El de .env.local
```

### Opción B: Usar Vercel Preview (Recomendado)

```bash
# 1. Push a rama
git push origin feature-branch

# 2. Vercel auto-crea preview URL
# 3. Configurar en Meta Developer con preview URL

# 4. Modificar localmente, push, preview se actualiza automáticamente
```

### Probar Webhook

```bash
# Simular mensaje de WhatsApp
curl -X POST http://localhost:3000/api/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "5491234567890",
            "id": "test_001",
            "timestamp": "'$(date +%s)'",
            "type": "text",
            "text": {"body": "gaste 20000 en supermercado"}
          }]
        }
      }]
    }]
  }'
```

---

## 6️⃣ Tareas Comunes

### Resetear BD Completamente

```bash
# ⚠️ PELIGRO: Borra TODO
npx prisma migrate reset

# Preguntará confirmación, crea schema nuevo
# Ejecuta seed automáticamente si existe
```

### Ver Migraciones

```bash
npx prisma migrate status
```

### Actualizar Dependencias

```bash
# Ver outdated
npm outdated

# Actualizar todas
npm update
```

### Ver Tamaño Bundle

```bash
npm run build

# Verá el tamaño de output/
```

---

## 7️⃣ Deployment (Vercel)

### Primera vez

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Configura variables de entorno en Vercel dashboard
```

### Deploys Automáticos

Una vez configurado en Vercel:
- Todo push a `main` auto-deploya
- Todo push a rama crea preview URL

### Migraciones en Producción

Vercel ejecuta automáticamente `npx prisma migrate deploy` en cada deploy.

---

## 8️⃣ Archivos Importantes

```
expense-tracker/
├── .env.local              ← NUNCA commitear, solo local
├── .env.example            ← Plantilla, commitear
├── prisma/
│   ├── schema.prisma       ← Modelo de datos
│   └── migrations/         ← Auto-generadas
├── app/
│   ├── api/                ← Route handlers (backend)
│   ├── dashboard/          ← Frontend
│   └── page.tsx            ← Home
├── components/             ← Componentes React
├── lib/
│   ├── prisma.ts           ← Prisma Client singleton
│   ├── types.ts            ← Tipos TypeScript
│   └── validation.ts       ← Schemas Zod
├── hooks/                  ← Custom hooks
└── package.json            ← Dependencias
```

---

## 9️⃣ Comandos Útiles

```bash
# Desarrollo
npm run dev              # Inicia servidor dev

# Building
npm run build            # Build producción
npm run start            # Inicia servidor producción

# Linting
npm run lint             # ESLint
npm run format           # Prettier

# Prisma
npx prisma studio       # Interfaz gráfica BD
npx prisma migrate dev  # Crear migración
npx prisma db seed      # Ejecutar seed

# Testing (futuro)
npm test                 # Ejecutar tests
```

---

## 🆘 Troubleshooting

### Error: "Cannot connect to database"

1. Verifica `DATABASE_URL` en `.env.local`
2. Verifica que PostgreSQL está corriendo
3. Si usas Docker: `docker ps` debe mostrar postgres
4. Prueba: `psql $DATABASE_URL -c "SELECT 1"`

### Error: "Migration failed"

```bash
# Ver qué salió mal
npx prisma migrate resolve --rolled-back

# O resetear todo (en dev)
npx prisma migrate reset
```

### Port 3000 Already in Use

```bash
# Matar proceso
kill -9 $(lsof -t -i:3000)

# O usar otro puerto
PORT=3001 npm run dev
```

### Cambios no se ven

1. ¿Guardaste el archivo?
2. ¿Actualizó el servidor? (debería auto-reload)
3. ¿Hard refresh en navegador? (Ctrl+Shift+R o Cmd+Shift+R)
4. ¿Limpiaste `.next`? `rm -rf .next && npm run dev`

### Errores de Prisma Client

```bash
# Regenerar Prisma Client
npx prisma generate
```

---

## 📚 Más Info

- **Arquitectura**: Ver `ARCHITECTURE.md`
- **API Endpoints**: Ver `API_ENDPOINTS.md`
- **Prisma Detallado**: Ver `PRISMA_GUIDE.md`
- **Convenciones Código**: Ver `CONVENTIONS.md`
- **Estructura Frontend**: Ver `FRONTEND_STRUCTURE.md`

---

**¡Listo para desarrollar! 🚀**

Ante cualquier problema, consulta los archivos .md o crea un issue en GitHub.
