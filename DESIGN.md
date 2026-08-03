# Expense Tracker - Design System

Guía visual completa basada en la captura de diseño de referencia.

---

## 🎨 Paleta de Colores

### Colores Base

```
FONDO PRINCIPAL:
  #0A0A0A - Negro profundo (background page)
  #121212 - Negro más claro (cards)
  #1A1A1A - Gris oscuro (hover states)

ACENTOS:
  #E85D24 - Naranja/Coral (números, highlights, CTAs)
  #FF6B35 - Naranja más brillante (hover sobre naranja)
  #D64820 - Naranja más oscuro (active states)

TEXTO:
  #FFFFFF - Blanco puro (títulos principales)
  #E8E8E8 - Blanco 90% (texto secundario)
  #A8A8A8 - Gris medio (labels, hints)
  #707070 - Gris oscuro (disabled)

BORDES:
  #2A2A2A - Líneas y separadores
  #404040 - Bordes más visibles
```

### Colores por Categoría

```
Alquiler:         #E85D24 (naranja - destacado por monto alto)
Supermercado:     #FF8C42 (naranja más claro)
Delivery:         #D97634 (naranja-coral)
Cuotas tarjeta:   #C45628 (naranja oscuro)
Servicios:        #F0A070 (naranja suave)
Transporte:       #E8956B (naranja medio)

Sistema General:
  Success:        #10B981 (verde - futuro, para ahorros)
  Warning:        #F59E0B (amarillo - futuro, para alertas)
  Error:          #EF4444 (rojo - futuro, para límites)
  Info:           #3B82F6 (azul - futuro, para info)
```

### Gradientes (Opcional)

```css
/* Fondo subtle gradient */
background: linear-gradient(135deg, #0A0A0A 0%, #121212 100%);

/* Sobre números (efecto sutil) */
background: linear-gradient(135deg, #E85D24 0%, #FF6B35 100%);
```

---

## 📝 Tipografía

### Font Stack

```css
/* Principal (recomendado: usar lo que tengas en Tailwind) */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', sans-serif;

/* Alternativa: Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

### Tamaños y Pesos

| Elemento | Tamaño | Peso | Uso |
|----------|--------|------|-----|
| **H1** (Título principal) | 32px | 700 | "¿A dónde se fue tu sueldo?" |
| **H2** (Subtítulo mes) | 16px | 400 | "Marzo 2025" |
| **H3** (Monto grande) | 48px | 700 | "$241.107" |
| **Label** | 14px | 500 | "MAYORES GASTOS" |
| **Categoría** | 16px | 500 | "Alquiler" |
| **Monto** | 16px | 600 | "-$256.000" |
| **Porcentaje** | 12px | 400 | "37%" |
| **Descripción** | 12px | 400 | "De 5,80.000 es menos" |
| **Hint text** | 12px | 400 | Gris medio |

### Línea Base

```
line-height: 1.5 - Texto normal
line-height: 1.2 - Títulos
line-height: 1.7 - Párrafos largos
```

---

## 🎭 Componentes Visuales

### 1. Card Principal (Header)

```
┌─────────────────────────────────┐
│ ¿A dónde se fue tu sueldo?      │ ← H1, blanco
│ Marzo 2025                       │ ← H2, gris
│                                 │
│           $241.107              │ ← H3 naranja, bold
│                                 │
│ ▓▓▓▓▓▓░░░░░░░░░░░░░ 37%         │ ← Barra progreso
│                                 │
│ De $800.000 es menos            │ ← Hint text gris
└─────────────────────────────────┘

Padding: 24px
Border radius: 12px
Background: #121212
Box shadow: 0 4px 6px rgba(0,0,0,0.3)
Margin: 20px
```

**Especificaciones**:
- Total alineado al centro
- Barra de progreso en naranja (#E85D24)
- Barra background en #2A2A2A (gris oscuro)
- Altura barra: 6px
- Border radius: 3px

---

### 2. Fila de Categoría

```
┌─────────────────────────────────┐
│ 🏠 Alquiler          -$256.000   │
│    De 5,80.000 es menos    37%   │
└─────────────────────────────────┘

Padding: 16px 12px
Margin: 8px 0
Background: transparent (o #1A1A1A con hover)
Border bottom: 1px solid #2A2A2A
Border radius: 8px
Transition: all 0.2s ease
```

**Estructura interna**:
- Icono (24x24px) + Nombre (izquierda)
- Monto (derecha, naranja, bold)
- Descripción (16px, gris)
- Porcentaje (12px, gris más claro)

**Estados**:
- **Default**: Transparente
- **Hover**: Background #1A1A1A, cursor pointer
- **Active**: Subtle glow, border #E85D24

---

### 3. Barra de Progreso Mejorada

```css
/* Container */
.progress-bar {
  width: 100%;
  height: 6px;
  background: #2A2A2A;
  border-radius: 3px;
  overflow: hidden;
  margin: 12px 0;
}

/* Fill */
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #E85D24, #FF6B35);
  width: var(--percentage);
  transition: width 0.3s ease;
}
```

---

### 4. Icono + Etiqueta

```
Tamaño: 24x24px
Style: Outline (no filled)
Color: #E8E8E8 (blanco 90%)
Hover: #E85D24 (naranja)
Margin right: 12px
Font: Material Icons o Tabler Icons (outline)
```

**Iconos recomendados** (Tabler Icons outline):
- 🏠 Home → Alquiler
- 🛒 Shopping cart → Supermercado
- 🚗 Truck → Delivery
- 💳 Credit card → Cuotas
- ⚡ Zap → Servicios
- 🚌 Bus → Transporte

---

## 📐 Layout y Espaciado

### Escala de Espaciado

```
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 20px
2xl: 24px
3xl: 32px
4xl: 48px
```

### Grid y Contenedor

```
Ancho máximo: 600px (mobile-first, desktop se adapta)
Margin horizontal: auto (centrado)
Padding horizontal: 16px
Padding vertical: 24px

Breakpoints:
- Mobile: 0-640px (width 100%)
- Tablet: 640px-1024px (max-width 600px)
- Desktop: 1024px+ (max-width 700px)
```

### Secciones

```
HEADER (Card Principal):
  Padding: 24px
  Margin bottom: 32px

LISTA DE CATEGORÍAS:
  Padding: 16px
  Margin bottom: 16px
  Gap entre items: 8px

FOOTER (Opcional):
  Padding: 16px
  Text align: center
  Font size: 12px
```

---

## 🎨 Estilos Específicos

### Dark Mode (Default)

```css
:root {
  --bg-primary: #0A0A0A;
  --bg-secondary: #121212;
  --bg-tertiary: #1A1A1A;
  
  --text-primary: #FFFFFF;
  --text-secondary: #E8E8E8;
  --text-tertiary: #A8A8A8;
  
  --accent-primary: #E85D24;
  --accent-hover: #FF6B35;
  --accent-dark: #D64820;
  
  --border-color: #2A2A2A;
  --border-light: #404040;
}
```

**Aplicar en Tailwind**:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0A0A0A',
          800: '#121212',
          700: '#1A1A1A',
          600: '#2A2A2A',
          500: '#404040',
        },
        accent: {
          DEFAULT: '#E85D24',
          light: '#FF6B35',
          dark: '#D64820',
        }
      }
    }
  }
}
```

---

### Sombras

```css
/* Subtle shadow (cards) */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);

/* Hover effect */
box-shadow: 0 8px 12px rgba(232, 93, 36, 0.15);

/* Strong shadow (modals) */
box-shadow: 0 20px 25px rgba(0, 0, 0, 0.5);
```

---

### Transiciones

```css
/* Default transition */
transition: all 0.2s ease;

/* Color transition */
transition: color 0.2s ease, background-color 0.2s ease;

/* Transform transition (para hover) */
transition: transform 0.2s ease, box-shadow 0.2s ease;
```

---

### Efectos Hover

```css
/* Filas de categoría */
.category-row:hover {
  background: #1A1A1A;
  box-shadow: 0 8px 12px rgba(232, 93, 36, 0.15);
  transform: translateX(4px);
}

/* Botones */
.btn:hover {
  background: #FF6B35;
  box-shadow: 0 8px 12px rgba(232, 93, 36, 0.3);
  transform: scale(1.02);
}

/* Números */
.amount:hover {
  color: #FF6B35;
}
```

---

## 📱 Responsive Design

### Mobile First (< 640px)

```
- Full width
- Padding: 16px
- Font sizes reducidos en 2px
- Cards: max-width 100%
- Touch targets: min 44px height
```

```css
/* Mobile */
.card {
  padding: 20px;
  border-radius: 12px;
  margin: 16px 0;
}

@media (max-width: 640px) {
  .card {
    padding: 16px;
    margin: 12px 0;
  }
  
  h1 {
    font-size: 28px;
  }
  
  h3 {
    font-size: 40px;
  }
}
```

### Tablet (640px - 1024px)

```
- Max-width: 600px
- Padding: 20px
- Font sizes: +1px
```

### Desktop (> 1024px)

```
- Max-width: 700px
- Padding: 24px
- Font sizes normales
```

---

## 🔲 Componentes por Página

### 1. Dashboard (/dashboard)

**Header Card**:
- Título principal
- Mes selector
- Monto total
- Barra de progreso
- Hint text

**Tabs/Navegación**:
- Hoy | Este mes | Este año
- Activo subrayado en naranja

**Lista de Categorías**:
- Ícono + Nombre
- Monto en naranja
- Descripción gris
- Porcentaje pequeño

**Opcional**:
- Pie chart con colores por categoría
- Línea chart de tendencia

---

### 2. Vista Mensual (/dashboard/mes)

**Similar a Dashboard pero con**:
- Selector de mes/año más visible
- Tabla con:
  - Fecha | Categoría | Concepto | Monto | Acciones
- Paginación (si muchos items)

---

### 3. Vista Anual (/dashboard/anio)

**Tabla anual**:
- Mes | Total | Tendencia
- Bar chart comparativo

---

### 4. Transacciones (/transacciones)

**Tabla completa**:
- Fecha | Categoría | Concepto | Monto | Acciones
- Columnas alineadas
- Separadores entre filas

---

## 🎯 Elementos Especiales

### 1. Badge de Categoría

```css
.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #1A1A1A;
  border: 1px solid #2A2A2A;
  border-radius: 6px;
  font-size: 13px;
  color: #E8E8E8;
}

.category-badge.active {
  background: #E85D24;
  color: #0A0A0A;
  border-color: #FF6B35;
}
```

---

### 2. Botón CTA (Call To Action)

```css
.btn-primary {
  padding: 12px 24px;
  background: #E85D24;
  color: #0A0A0A;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #FF6B35;
  box-shadow: 0 8px 12px rgba(232, 93, 36, 0.3);
  transform: translateY(-2px);
}

.btn-primary:active {
  background: #D64820;
  transform: translateY(0);
}
```

---

### 3. Input/Formulario

```css
.input {
  width: 100%;
  padding: 12px 16px;
  background: #1A1A1A;
  border: 1px solid #2A2A2A;
  border-radius: 8px;
  color: #E8E8E8;
  font-size: 14px;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #E85D24;
  box-shadow: 0 0 0 3px rgba(232, 93, 36, 0.1);
}

.input::placeholder {
  color: #707070;
}
```

---

### 4. Modal/Dialog

```css
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background: #121212;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.5);
  border: 1px solid #2A2A2A;
}
```

---

## 🎬 Animaciones

### Fade In

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
```

### Slide Up

```css
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-up {
  animation: slideUp 0.3s ease-out;
}
```

### Pulse (para números que cambian)

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.number-pulse {
  animation: pulse 0.6s ease-in-out;
}
```

---

## 🌙 Dark Mode Considerations

- NO usar colores muy brillantes (los ojos sufren)
- Usar grises oscuros para backgrounds
- Naranja es el único color "brillante" permitido
- Texto siempre con suficiente contraste (WCAG AA mínimo)
- Sombras más prominentes en dark mode

---

## 🎨 Inspiración Visual

**Referencia**: Captura de Marzo 2025

**Estilo general**:
- Minimalista
- Dark mode por defecto
- Acentos en naranja/coral
- Tipografía limpia y clara
- Espaciado generoso
- Iconos simples

**Sentimiento**:
- Moderno y sofisticado
- Fácil de entender
- Confiable
- Professional pero accesible

---

## 📊 Paleta Resumida (Copiar/Pegar)

```css
:root {
  /* Backgrounds */
  --bg-dark-900: #0A0A0A;
  --bg-dark-800: #121212;
  --bg-dark-700: #1A1A1A;
  
  /* Borders */
  --border-dark: #2A2A2A;
  --border-light: #404040;
  
  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: #E8E8E8;
  --text-tertiary: #A8A8A8;
  --text-disabled: #707070;
  
  /* Accent (Naranja)*/
  --accent: #E85D24;
  --accent-light: #FF6B35;
  --accent-dark: #D64820;
  
  /* System Colors */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
}
```

---

## ✅ Checklist de Implementación

- [ ] Paleta de colores en Tailwind config
- [ ] Tipografía configurada (Inter o similar)
- [ ] Dark mode por defecto
- [ ] Componentes base (Button, Input, Card)
- [ ] Barra de progreso estilizada
- [ ] Filas de categoría interactivas
- [ ] Responsive en móvil/tablet/desktop
- [ ] Animaciones suaves
- [ ] Contraste WCAG AA cumplido
- [ ] Iconos importados (Tabler/Lucide)
- [ ] Sombras aplicadas
- [ ] Transiciones implementadas

---

## 📚 Recursos

- **Tabler Icons**: https://tabler-icons.io (outline)
- **Lucide Icons**: https://lucide.dev (alternative)
- **Tailwind CSS**: https://tailwindcss.com
- **WCAG Contrast**: https://webaim.org/resources/contrastchecker/

---

**Diseño final**: Minimalista, oscuro, con acentos en naranja. Professional. Listo para producción. 🎨
