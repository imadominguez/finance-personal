# Expense Tracker - Schema PostgreSQL + Prisma

## Prisma Schema (prisma/schema.prisma)

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Expense {
  id        Int     @id @default(autoincrement())
  fecha     DateTime
  hora      String  // HH:MM:SS format
  monto     Decimal @db.Decimal(10, 2)
  concepto  String  @db.VarChar(255)
  categoria   Category @relation(fields: [categoriaId], references: [id], onDelete: Restrict)
  categoriaId Int
  descripcion String?
  mensajeId   String  @unique // Meta WhatsApp message ID
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([fecha])
  @@index([categoriaId])
  @@index([mensajeId])
  @@index([fecha, categoriaId])
}

model Category {
  id          Int       @id @default(autoincrement())
  nombre      String    @unique @db.VarChar(100)
  descripcion String?
  color       String    @db.VarChar(7)  // Hex color #RRGGBB
  icono       String?   @db.VarChar(50) // Icon name
  palabrasClave String[]  // Array of keywords
  activa      Boolean   @default(true)
  expenses    Expense[]
  createdAt   DateTime  @default(now())
}
```

---

## Tablas en SQL (Referencia)

Si necesitas ejecutar SQL directamente (menos recomendado con Prisma):

### Tabla: gastos

Almacena todos los gastos registrados del usuario.

```sql
CREATE TABLE gastos (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  concepto VARCHAR(255) NOT NULL,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
  descripcion TEXT,
  mensaje_id VARCHAR(255) UNIQUE NOT NULL,  -- ID único de Meta WhatsApp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos**:
- `id`: PK, auto-incrementado
- `fecha`: Fecha del gasto (YYYY-MM-DD)
- `hora`: Hora del gasto (HH:MM:SS)
- `monto`: Cantidad en pesos (2 decimales)
- `concepto`: Descripción breve (ej: "supermercado")
- `categoria_id`: FK a categorías
- `descripcion`: Nota adicional (opcional)
- `mensaje_id`: ID único de Meta para evitar duplicados
- `created_at`: Timestamp de creación
- `updated_at`: Timestamp de última actualización

**Restricciones**:
- `monto` > 0 (check constraint)
- `mensaje_id` UNIQUE (no duplicados)
- Cascade delete en categorías (no eliminar si hay gastos)

---

### Tabla: categorias

Almacena las categorías de gastos.

```sql
CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  color VARCHAR(7) NOT NULL,           -- Color hex (ej: #E85D24)
  icono VARCHAR(50),                   -- Nombre de icono (ej: shopping-cart)
  palabras_clave TEXT[],               -- Array PostgreSQL
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos**:
- `id`: PK, auto-incrementado
- `nombre`: Nombre único de categoría
- `descripcion`: Descripción (para dashboard)
- `color`: Color hex para gráficos
- `icono`: Nombre de icono (Lucide/Tabler)
- `palabras_clave`: Array de palabras para auto-categorizar
- `activa`: Flag para desactivar sin eliminar

**Datos iniciales**:
```sql
INSERT INTO categorias (nombre, descripcion, color, icono, palabras_clave) VALUES
('Alimentos', 'Comida y bebidas', '#E85D24', 'shopping-cart', 
 ARRAY['supermercado', 'almacén', 'verdulería', 'mercado', 'comida', 'restaurante']),

('Transporte', 'Gasolina y movilidad', '#3B8BD4', 'car', 
 ARRAY['uber', 'taxi', 'gasolina', 'estacionamiento', 'bondi', 'colectivo']),

('Vivienda', 'Alquiler y servicios', '#078D92', 'home', 
 ARRAY['alquiler', 'luz', 'agua', 'gas', 'internet', 'teléfono']),

('Servicios', 'Streaming y suscripciones', '#F2A623', 'zap', 
 ARRAY['netflix', 'spotify', 'hulu', 'subscription', 'membresía']),

('Entretenimiento', 'Ocio', '#9013FE', 'music', 
 ARRAY['cine', 'bar', 'boliche', 'concierto', 'entrada']),

('Salud', 'Farmacia y médicos', '#50E3C2', 'heart', 
 ARRAY['farmacia', 'médico', 'hospital', 'dentista', 'salud']),

('Educación', 'Cursos y libros', '#4A90E2', 'book', 
 ARRAY['curso', 'libro', 'escuela', 'universidad']),

('Ropa', 'Prendas y accesorios', '#D0021B', 'shopping-bag', 
 ARRAY['ropa', 'zapatos', 'remera', 'pantalón', 'moda']),

('Otros', 'Sin categoría', '#9CA3AF', 'help-circle', 
 ARRAY['otro', 'misc', 'varios']);
```

---

## Índices para Optimización

```sql
-- Búsquedas frecuentes por fecha
CREATE INDEX idx_gastos_fecha ON gastos(fecha DESC);

-- Búsquedas por categoría
CREATE INDEX idx_gastos_categoria_id ON gastos(categoria_id);

-- Búsquedas por mensaje_id (prevenir duplicados)
CREATE INDEX idx_gastos_mensaje_id ON gastos(mensaje_id);

-- Combinaciones frecuentes (fecha + categoría)
CREATE INDEX idx_gastos_fecha_categoria ON gastos(fecha DESC, categoria_id);

-- Búsquedas por rango de fechas (mes/año)
CREATE INDEX idx_gastos_fecha_range ON gastos(fecha) 
  WHERE fecha >= CURRENT_DATE - INTERVAL '1 year';

-- Búsquedas por rango de monto
CREATE INDEX idx_gastos_monto ON gastos(monto DESC);
```

---

## Vistas (Optional pero útil)

### Vista: resumen_diario

Resúmenes pre-calculados por día (para caché).

```sql
CREATE MATERIALIZED VIEW resumen_diario AS
SELECT 
  g.fecha,
  COUNT(*) as cantidad_transacciones,
  SUM(g.monto) as total_gastos,
  ARRAY_AGG(
    json_build_object(
      'categoria', c.nombre,
      'total', SUM(g.monto) OVER (PARTITION BY g.categoria_id)
    ) ORDER BY g.categoria_id
  ) as por_categoria
FROM gastos g
JOIN categorias c ON g.categoria_id = c.id
GROUP BY g.fecha;

CREATE INDEX idx_resumen_diario_fecha ON resumen_diario(fecha DESC);
```

### Vista: resumen_mensual

Resúmenes por mes.

```sql
CREATE MATERIALIZED VIEW resumen_mensual AS
SELECT 
  EXTRACT(YEAR FROM g.fecha) as anio,
  EXTRACT(MONTH FROM g.fecha) as mes,
  COUNT(*) as cantidad_transacciones,
  SUM(g.monto) as total_gastos,
  c.nombre as categoria,
  SUM(g.monto) FILTER (WHERE c.id = g.categoria_id) as total_categoria
FROM gastos g
JOIN categorias c ON g.categoria_id = c.id
GROUP BY anio, mes, c.nombre;

CREATE INDEX idx_resumen_mensual_anio_mes ON resumen_mensual(anio DESC, mes DESC);
```

---

## Migraciones (Para futuro)

Estructura de carpeta migrations (si usas un migration tool):

```
migrations/
├── 001_init_schema.sql
├── 002_add_indices.sql
├── 003_add_views.sql
└── 004_add_constraints.sql
```

---

## Queries Comunes

### 1. Obtener gastos de hoy

```sql
SELECT 
  c.nombre as categoria,
  c.color,
  c.icono,
  SUM(g.monto) as total,
  COUNT(*) as cantidad
FROM gastos g
JOIN categorias c ON g.categoria_id = c.id
WHERE g.fecha = CURRENT_DATE
GROUP BY c.id, c.nombre, c.color, c.icono
ORDER BY total DESC;
```

### 2. Obtener gastos de un mes específico

```sql
SELECT 
  g.fecha,
  g.hora,
  c.nombre as categoria,
  g.monto,
  g.concepto
FROM gastos g
JOIN categorias c ON g.categoria_id = c.id
WHERE EXTRACT(YEAR FROM g.fecha) = $1
  AND EXTRACT(MONTH FROM g.fecha) = $2
ORDER BY g.fecha DESC, g.hora DESC;
```

### 3. Resumen por categoría este mes

```sql
SELECT 
  c.nombre as categoria,
  c.color,
  SUM(g.monto) as total,
  COUNT(*) as cantidad,
  AVG(g.monto) as promedio
FROM gastos g
JOIN categorias c ON g.categoria_id = c.id
WHERE EXTRACT(YEAR FROM g.fecha) = $1
  AND EXTRACT(MONTH FROM g.fecha) = $2
GROUP BY c.id, c.nombre, c.color
ORDER BY total DESC;
```

### 4. Tendencia anual (gasto por mes)

```sql
SELECT 
  DATE_TRUNC('month', g.fecha)::date as mes,
  SUM(g.monto) as total,
  COUNT(*) as cantidad
FROM gastos g
WHERE g.fecha >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', g.fecha)
ORDER BY mes ASC;
```

### 5. Total acumulado en rango de fechas

```sql
SELECT 
  SUM(g.monto) as total,
  COUNT(*) as cantidad,
  MIN(g.fecha) as primera_fecha,
  MAX(g.fecha) as ultima_fecha,
  c.nombre as categoria
FROM gastos g
JOIN categorias c ON g.categoria_id = c.id
WHERE g.fecha BETWEEN $1 AND $2
GROUP BY c.id, c.nombre
ORDER BY total DESC;
```

### 6. Búsqueda avanzada (filtros)

```sql
SELECT 
  g.id,
  g.fecha,
  g.hora,
  g.monto,
  g.concepto,
  c.nombre as categoria
FROM gastos g
JOIN categorias c ON g.categoria_id = c.id
WHERE 1=1
  AND (g.fecha >= $1 OR $1 IS NULL)           -- desde
  AND (g.fecha <= $2 OR $2 IS NULL)           -- hasta
  AND (g.categoria_id = $3 OR $3 IS NULL)     -- categoría
  AND (g.monto >= $4 OR $4 IS NULL)           -- monto mín
  AND (g.monto <= $5 OR $5 IS NULL)           -- monto máx
  AND (g.concepto ILIKE '%' || $6 || '%' OR $6 IS NULL)  -- búsqueda
ORDER BY g.fecha DESC, g.hora DESC
LIMIT 100;
```

### 7. Estadísticas generales

```sql
SELECT 
  COUNT(*) as total_gastos,
  SUM(g.monto) as total_monto,
  AVG(g.monto) as promedio,
  MAX(g.monto) as maximo,
  MIN(g.monto) as minimo,
  STDDEV(g.monto) as desviacion_estandar
FROM gastos g;
```

### 8. Top 5 categorías este mes

```sql
SELECT 
  c.nombre,
  c.color,
  SUM(g.monto) as total,
  COUNT(*) as cantidad,
  ROUND(SUM(g.monto) * 100.0 / (
    SELECT SUM(monto) FROM gastos 
    WHERE EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
      AND EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
  ), 2) as porcentaje
FROM gastos g
JOIN categorias c ON g.categoria_id = c.id
WHERE EXTRACT(YEAR FROM g.fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM g.fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
GROUP BY c.id, c.nombre, c.color
ORDER BY total DESC
LIMIT 5;
```

---

## Constraints y Validaciones

```sql
-- Monto debe ser positivo
ALTER TABLE gastos
ADD CONSTRAINT check_monto_positivo CHECK (monto > 0);

-- Fecha no puede ser en el futuro
ALTER TABLE gastos
ADD CONSTRAINT check_fecha_no_futura CHECK (fecha <= CURRENT_DATE);

-- Color debe ser formato hex válido
ALTER TABLE categorias
ADD CONSTRAINT check_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$');
```

---

## Backup y Recovery

### Backup automático
```bash
# Comando para respaldar (ejecutar periódicamente)
pg_dump postgresql://user:pass@host:5432/expense_tracker > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
psql postgresql://user:pass@host:5432/expense_tracker < backup_20240115.sql
```

---

## Performance Tips

1. **Vacuum regular**: PostgreSQL limpia automáticamente, pero en producción:
   ```sql
   VACUUM ANALYZE gastos;
   ```

2. **Monitoreo de índices**: Ver índices no utilizados
   ```sql
   SELECT schemaname, tablename, indexname 
   FROM pg_indexes 
   WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
   ```

3. **EXPLAIN ANALYZE**: Analizar planes de query
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM gastos WHERE fecha = CURRENT_DATE;
   ```

4. **Connection pooling**: Usar PgBouncer si hay muchas conexiones
   - Railway lo incluye

---

## Evolución del Schema (Futuro)

Si agrego features:

1. **Multi-usuario**: Agregar `user_id` a gastos y categorías
2. **Presupuestos**: Nueva tabla `budgets` con límites por categoría/mes
3. **Etiquetas**: Tabla `tags` con relación many-to-many a gastos
4. **Recurrentes**: Tabla `gastos_recurrentes` para pagos mensuales
5. **Métodos de pago**: Tabla `payment_methods` (efectivo, tarjeta, etc)

---

## Testing de BD

### Datos de prueba (seed)

```sql
INSERT INTO gastos (fecha, hora, monto, concepto, categoria_id, mensaje_id)
VALUES 
  (CURRENT_DATE, '10:30:00', 5000, 'supermercado', 1, 'msg_001'),
  (CURRENT_DATE, '14:15:00', 2000, 'uber', 2, 'msg_002'),
  (CURRENT_DATE - INTERVAL '1 day', '09:00:00', 20000, 'alquiler', 3, 'msg_003');
```

### Limpiar datos de prueba

```sql
TRUNCATE TABLE gastos CASCADE;
```

---

## Notas Importantes

- Usar `prepared statements` en backend (prevenir SQL injection)
- Siempre validar `mensaje_id` antes de insertar (duplicados)
- Mantener `created_at` y `updated_at` sincronizados
- Borrados lógicos: NO eliminar registros, solo marcar como inactivos
- Backups diarios en producción
