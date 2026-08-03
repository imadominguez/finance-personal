# Expense Tracker - API Endpoints

**Nota**: Los endpoints son route handlers de Next.js (`app/api/...`).
No es un backend separado, sino parte de la misma aplicación.

## Base URL

```
Development: http://localhost:3000
Production: https://expense-tracker.vercel.app
```

## Implementación

Todos los endpoints están en `app/api/` como route handlers:

```
app/api/
├── gastos/
│   ├── route.ts              # GET, POST /api/gastos
│   ├── [id]/route.ts         # GET, PUT, DELETE /api/gastos/[id]
│   ├── mes/route.ts          # GET /api/gastos/mes
│   ├── anio/route.ts         # GET /api/gastos/anio
│   └── tendencia/route.ts    # GET /api/gastos/tendencia
├── categorias/route.ts       # GET, PUT /api/categorias
├── estadisticas/route.ts     # GET /api/estadisticas
├── webhook/whatsapp/route.ts # POST, GET /api/webhook/whatsapp
└── health/route.ts           # GET /api/health
```

Cada route handler:
- Usa `Prisma Client` para BD
- Valida con `Zod`
- Retorna `NextResponse`

## Headers Requeridos
```
Content-Type: application/json
Accept: application/json
```

---

## Webhook WhatsApp

### Validación de Webhook
**Endpoint**: `GET /webhook/whatsapp`

Meta envía esto una sola vez al validar el webhook.

**Query Parameters**:
- `hub.mode`: "subscribe"
- `hub.challenge`: Token a devolver
- `hub.verify_token`: Token configurado en env

**Response**: 
```
200 OK
<hub.challenge>
```

**Ejemplo**:
```bash
curl "http://localhost:3000/webhook/whatsapp?hub.mode=subscribe&hub.challenge=abc123&hub.verify_token=mi_token_secreto"
```

---

### Recibir Mensajes
**Endpoint**: `POST /webhook/whatsapp`

Meta envía los mensajes a este endpoint.

**Request Body** (ejemplo simplificado):
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "changes": [
        {
          "value": {
            "messages": [
              {
                "from": "5491112345678",
                "id": "wamid.xxxx",
                "timestamp": "1234567890",
                "type": "text",
                "text": {
                  "body": "gaste 20000 en supermercado"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "gasto": {
    "id": 123,
    "fecha": "2024-01-15",
    "hora": "14:30:00",
    "monto": 20000,
    "concepto": "supermercado",
    "categoria_id": 1,
    "mensaje_id": "wamid.xxxx"
  },
  "mensaje": "✓ Registrado $20000 en Alimentos"
}
```

**Respuestas de Error**:
```json
{
  "success": false,
  "error": "Formato no reconocido. Usa: 'gaste $20000 en supermercado'"
}
```

---

## Gastos - CRUD

### 1. Obtener gastos de hoy
**Endpoint**: `GET /api/gastos/hoy`

Retorna el resumen de gastos de hoy agrupado por categoría.

**Query Parameters**: (ninguno)

**Response**:
```json
{
  "fecha": "2024-01-15",
  "total": 45000,
  "cantidad": 5,
  "gastos": [
    {
      "categoria": "Alimentos",
      "color": "#E85D24",
      "icono": "shopping-cart",
      "total": 25000,
      "cantidad": 2
    },
    {
      "categoria": "Transporte",
      "color": "#3B8BD4",
      "icono": "car",
      "total": 20000,
      "cantidad": 1
    }
  ]
}
```

**Ejemplo**:
```bash
curl http://localhost:3000/api/gastos/hoy
```

---

### 2. Obtener gastos de un mes específico
**Endpoint**: `GET /api/gastos/mes`

Retorna resumen mensual + detalle por categoría.

**Query Parameters**:
- `mes`: 1-12 (requerido)
- `anio`: 2024, 2025... (requerido)

**Response**:
```json
{
  "mes": 1,
  "anio": 2024,
  "total": 250000,
  "cantidad": 45,
  "gastos": [
    {
      "categoria": "Alimentos",
      "color": "#E85D24",
      "total": 100000,
      "cantidad": 15,
      "promedio": 6666.67,
      "transacciones": [
        {
          "id": 1,
          "fecha": "2024-01-15",
          "hora": "14:30:00",
          "monto": 20000,
          "concepto": "supermercado"
        }
      ]
    }
  ]
}
```

**Ejemplo**:
```bash
curl "http://localhost:3000/api/gastos/mes?mes=1&anio=2024"
```

---

### 3. Obtener gastos de un año completo
**Endpoint**: `GET /api/gastos/anio`

Retorna resumen anual mes-a-mes y por categoría.

**Query Parameters**:
- `anio`: 2024, 2025... (requerido)

**Response**:
```json
{
  "anio": 2024,
  "total": 3000000,
  "cantidad": 500,
  "por_mes": [
    {
      "mes": 1,
      "total": 250000,
      "cantidad": 45
    },
    {
      "mes": 2,
      "total": 280000,
      "cantidad": 52
    }
  ],
  "por_categoria": [
    {
      "categoria": "Alimentos",
      "total": 1200000,
      "cantidad": 200,
      "porcentaje": 40.0
    }
  ]
}
```

**Ejemplo**:
```bash
curl "http://localhost:3000/api/gastos/anio?anio=2024"
```

---

### 4. Obtener tendencia anual (últimos 12 meses)
**Endpoint**: `GET /api/gastos/tendencia`

Retorna gasto total por mes para gráfico de línea.

**Query Parameters**: (ninguno)

**Response**:
```json
{
  "periodos": [
    {
      "mes": "2023-02",
      "total": 180000,
      "cantidad": 35
    },
    {
      "mes": "2023-03",
      "total": 200000,
      "cantidad": 40
    }
  ]
}
```

**Ejemplo**:
```bash
curl http://localhost:3000/api/gastos/tendencia
```

---

### 5. Obtener gasto por ID
**Endpoint**: `GET /api/gastos/:id`

Retorna un gasto específico.

**URL Parameters**:
- `id`: ID del gasto (número)

**Response**:
```json
{
  "id": 123,
  "fecha": "2024-01-15",
  "hora": "14:30:00",
  "monto": 20000,
  "concepto": "supermercado",
  "categoria": {
    "id": 1,
    "nombre": "Alimentos",
    "color": "#E85D24"
  },
  "descripcion": "Compré verduras",
  "mensaje_id": "wamid.xxxx",
  "created_at": "2024-01-15T14:30:00Z"
}
```

**Ejemplo**:
```bash
curl http://localhost:3000/api/gastos/123
```

---

### 6. Crear gasto manualmente
**Endpoint**: `POST /api/gastos`

Crea un nuevo gasto (útil para dashboard).

**Request Body**:
```json
{
  "fecha": "2024-01-15",
  "hora": "14:30:00",
  "monto": 20000,
  "concepto": "supermercado",
  "categoria_id": 1,
  "descripcion": "Compra semanal"
}
```

**Response**:
```json
{
  "id": 124,
  "fecha": "2024-01-15",
  "hora": "14:30:00",
  "monto": 20000,
  "concepto": "supermercado",
  "categoria_id": 1,
  "mensaje_id": "manual_20240115_143000"
}
```

**Errores**:
```json
{
  "error": "Validación fallida",
  "details": [
    "El monto debe ser mayor a 0",
    "La categoría no existe"
  ]
}
```

**Ejemplo**:
```bash
curl -X POST http://localhost:3000/api/gastos \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2024-01-15",
    "hora": "14:30:00",
    "monto": 20000,
    "concepto": "supermercado",
    "categoria_id": 1
  }'
```

---

### 7. Actualizar gasto
**Endpoint**: `PUT /api/gastos/:id`

Actualiza un gasto existente.

**URL Parameters**:
- `id`: ID del gasto

**Request Body** (todos los campos opcionales):
```json
{
  "monto": 25000,
  "concepto": "supermercado grande",
  "categoria_id": 1,
  "descripcion": "Compra extra"
}
```

**Response**: El gasto actualizado (mismo formato que GET)

**Ejemplo**:
```bash
curl -X PUT http://localhost:3000/api/gastos/123 \
  -H "Content-Type: application/json" \
  -d '{"monto": 25000}'
```

---

### 8. Eliminar gasto
**Endpoint**: `DELETE /api/gastos/:id`

Elimina un gasto (borrado lógico recomendado).

**URL Parameters**:
- `id`: ID del gasto

**Response**:
```json
{
  "success": true,
  "message": "Gasto eliminado correctamente"
}
```

**Ejemplo**:
```bash
curl -X DELETE http://localhost:3000/api/gastos/123
```

---

### 9. Búsqueda avanzada
**Endpoint**: `GET /api/gastos/buscar`

Busca gastos con múltiples filtros.

**Query Parameters** (todos opcionales):
- `desde`: YYYY-MM-DD
- `hasta`: YYYY-MM-DD
- `categoria_id`: ID de categoría
- `monto_min`: Número
- `monto_max`: Número
- `concepto`: String (búsqueda parcial)
- `limit`: Número (default 100)
- `offset`: Número (default 0)
- `sort`: `fecha` | `monto` (default fecha DESC)

**Response**:
```json
{
  "total": 25,
  "limit": 10,
  "offset": 0,
  "gastos": [
    {
      "id": 123,
      "fecha": "2024-01-15",
      "monto": 20000,
      "concepto": "supermercado",
      "categoria": "Alimentos"
    }
  ]
}
```

**Ejemplo**:
```bash
curl "http://localhost:3000/api/gastos/buscar?desde=2024-01-01&hasta=2024-01-31&categoria_id=1&sort=monto"
```

---

## Categorías

### 1. Obtener todas las categorías
**Endpoint**: `GET /api/categorias`

Retorna lista de categorías con palabras clave.

**Response**:
```json
{
  "categorias": [
    {
      "id": 1,
      "nombre": "Alimentos",
      "descripcion": "Comida y bebidas",
      "color": "#E85D24",
      "icono": "shopping-cart",
      "palabras_clave": ["supermercado", "almacén", "verdulería"],
      "activa": true
    }
  ]
}
```

**Ejemplo**:
```bash
curl http://localhost:3000/api/categorias
```

---

### 2. Obtener categoría por ID
**Endpoint**: `GET /api/categorias/:id`

**Response**: Una categoría (formato igual al endpoint anterior)

---

### 3. Actualizar categoría
**Endpoint**: `PUT /api/categorias/:id`

Actualiza palabras clave, color, etc.

**Request Body**:
```json
{
  "palabras_clave": ["supermercado", "almacén", "despensa"],
  "color": "#FF5500"
}
```

**Ejemplo**:
```bash
curl -X PUT http://localhost:3000/api/categorias/1 \
  -H "Content-Type: application/json" \
  -d '{"palabras_clave": ["supermercado", "mercado"]}'
```

---

## Estadísticas

### 1. Estadísticas generales
**Endpoint**: `GET /api/estadisticas`

Retorna KPIs generales.

**Query Parameters** (opcionales):
- `desde`: YYYY-MM-DD
- `hasta`: YYYY-MM-DD

**Response**:
```json
{
  "total_gastos": 3000000,
  "promedio_gasto": 6000,
  "gasto_maximo": 150000,
  "gasto_minimo": 500,
  "desviacion_estandar": 12000,
  "cantidad_transacciones": 500,
  "dias_con_gastos": 120,
  "gasto_promedio_diario": 25000,
  "categoria_mas_gastada": "Alimentos"
}
```

---

### 2. Comparativa mes a mes
**Endpoint**: `GET /api/estadisticas/comparativa`

Compara gasto del mes actual con el anterior.

**Response**:
```json
{
  "mes_actual": {
    "mes": 1,
    "total": 250000
  },
  "mes_anterior": {
    "mes": 12,
    "total": 280000
  },
  "diferencia": -30000,
  "porcentaje_cambio": -10.71,
  "tendencia": "decrease"
}
```

---

## Salud de la API

### 1. Health Check
**Endpoint**: `GET /health`

Verifica que el backend está funcionando.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T14:30:00Z",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## Errores Estándar

### Códigos HTTP

| Código | Significado | Ejemplo |
|--------|------------|---------|
| 200 | OK | Gasto creado/actualizado |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Token inválido (futuro) |
| 404 | Not Found | Gasto/categoría no existe |
| 409 | Conflict | Gasto duplicado |
| 500 | Server Error | Error en BD |

### Formato de Error

```json
{
  "error": "Validation failed",
  "message": "El monto debe ser mayor a 0",
  "code": "VALIDATION_ERROR",
  "timestamp": "2024-01-15T14:30:00Z"
}
```

---

## Rate Limiting (Futuro)

Una vez en producción:
- WhatsApp webhook: Sin límite (confiable)
- API GET: 100 req/min por IP
- API POST: 10 req/min por IP
- Headers de respuesta:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

---

## Autenticación (Futuro)

Cuando sea multi-usuario:
- `Authorization: Bearer <jwt_token>`
- Cada gasto tendrá `user_id`
- Login endpoint: `POST /auth/login`

---

## Ejemplos Completos

### Flujo típico: Registrar gasto y ver resumen

```bash
# 1. Usuario envía mensaje por WhatsApp
# Meta lo envía a nuestro webhook
# Nosotros guardamos el gasto

# 2. Frontend pide resumen del mes
curl "http://localhost:3000/api/gastos/mes?mes=1&anio=2024"

# 3. Frontend muestra gráficos
# Usando datos de la respuesta

# 4. Usuario quiere actualizar un gasto
curl -X PUT http://localhost:3000/api/gastos/123 \
  -H "Content-Type: application/json" \
  -d '{"monto": 25000}'

# 5. Usuario quiere ver tendencia anual
curl http://localhost:3000/api/gastos/tendencia
```

---

## CORS

Configurar CORS para que solo el frontend pueda acceder:

```javascript
// En backend (Express)
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3000', 'https://expensetracker.vercel.app'],
  credentials: true
}));
```

---

## Versioning API (Futuro)

Si hay cambios breaking:
- `/api/v1/gastos` (actual)
- `/api/v2/gastos` (futuro con cambios)
- Mantener v1 por compatibilidad
