---
name: ux-auditoria
description: Audita pantallas de Mis Finanzas de mobile a desktop (360 → 390 → 768 → 1280) midiendo áreas táctiles menores a 44 px, contraste real sobre la pantalla pintada, desbordes horizontales, botones de ícono sin nombre accesible, campos sin label e imágenes sin alt. Usar cuando se pida auditar, revisar accesibilidad, verificar responsive, comprobar que algo se ve bien en el teléfono, o al terminar cualquier cambio de interfaz antes de darlo por hecho.
---

# Auditoría UX · de mobile a desktop

Mide lo que se puede medir. Lo que no —si el texto es claro, si el orden tiene
sentido, si falta un estado vacío— va con el checklist de
`docs/ux/07-checklist.md`.

**El orden de los anchos no es negociable: 360 primero.** Un hallazgo a 360 px
que no aparece a 1280 es un hallazgo real; al revés casi nunca pasa.

## Qué mide

| Chequeo             | Umbral                                                         |
| ------------------- | -------------------------------------------------------------- |
| Área táctil         | 44×44 px (se tiene en cuenta el `::after` que agranda el área) |
| Contraste de texto  | 4.5:1, o 3:1 si es texto grande                                |
| Desborde horizontal | La página no puede scrollear de costado                        |
| Nombre accesible    | Todo control sin texto necesita `aria-label` o `title`         |
| Label de campo      | Todo input/select/textarea necesita label asociado             |
| Imágenes            | Todas necesitan `alt` (vacío si son decorativas)               |

El contraste se mide pintando el color en un canvas, así que resuelve bien
`oklab()`, `color-mix()` y transparencias, que es como está escrita la paleta de
esta app.

## Cómo se corre

Hace falta el servidor levantado y, para las pantallas con sesión, un estado de
sesión guardado.

```bash
# 1. Servidor
npx next dev -p 3800 &

# 2. Sesión (una vez): ver "Sesión para las pantallas privadas"
node .claude/skills/ux-auditoria/scripts/sesion.mjs --url http://localhost:3800 --salida /tmp/sesion.json

# 3. Auditoría
node .claude/skills/ux-auditoria/scripts/auditar.mjs \
  --url http://localhost:3800 \
  --sesion /tmp/sesion.json
```

Opciones:

| Opción       | Por defecto                                                  |
| ------------ | ------------------------------------------------------------ |
| `--url`      | `http://localhost:3000`                                      |
| `--rutas`    | `/,/hoy,/mes,/anio,/movimientos,/fijos,/categorias,/ajustes` |
| `--anchos`   | `360,390,768,1280`                                           |
| `--sesion`   | sin sesión (solo rutas públicas)                             |
| `--chromium` | el Chromium preinstalado del entorno                         |

Sale con código 1 si encontró algo, así sirve en CI.

## Sesión para las pantallas privadas

En este entorno el ingreso real con Google no está disponible (el proxy bloquea
los hosts de afuera). El script `sesion.mjs` entra usando el Google falso local
que se usa en las pruebas, y guarda el `storageState` de Playwright.

Si no está levantado el Google falso, la auditoría igual sirve para `/`,
`/ingresar` y `/sin-conexion`.

## Cómo leer la salida

Se agrupa por ancho y por ruta. Ejemplo:

```
  /movimientos     7 hallazgo(s)
    · Área táctil menor a 44 px (5)
        32x32 px                 "Limpiar búsqueda"
    · Contraste por debajo del mínimo (2)
        3.91:1 (mínimo 4.5)      "3 movimientos"
```

**Prioridad para arreglar:**

1. Desborde horizontal — rompe la pantalla entera.
2. Contraste — deja texto ilegible.
3. Área táctil — hace la app frustrante de usar con el pulgar.
4. Nombre accesible y label — deja gente afuera.
5. `alt` — el más barato de arreglar.

## Qué no detecta (y hay que mirar a mano)

- Si falta un **estado vacío**, o si el de "sin resultados" es el mismo que el de
  "sin datos".
- Si una acción destructiva **no pide confirmación**.
- Si el **texto** cumple la guía de voz (para eso está la skill `ux-copy`).
- Si el **orden** de la pantalla pone lo importante arriba.
- Si el **foco** vuelve a su lugar al cerrar una hoja.

Esas cinco se revisan con `docs/ux/07-checklist.md` abierto, empezando por el
teléfono.
