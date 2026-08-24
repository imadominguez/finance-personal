---
name: ux-mobile-first
description: Criterios de UX/UI mobile-first para construir o modificar cualquier pantalla, hoja, formulario o componente de Mis Finanzas. Cubre el orden de trabajo (360 px primero, escritorio después), áreas táctiles de 44 px, los seis estados obligatorios (vacío, carga, error, éxito, deshabilitado, destructivo), cuándo usar hoja o confirmación, y qué NO hacer. Usar SIEMPRE antes de tocar archivos en app/, components/ o de agregar una pantalla, un diálogo, un listado, un filtro, un formulario o un botón. También al revisar, mejorar o "hacer más lindo" algo existente.
---

# UX mobile-first · Mis Finanzas

La documentación completa está en `docs/ux/`. Esta skill es lo que hay que tener
en la cabeza **mientras se escribe el código**.

## La regla que ordena todo

**Se resuelve a 360 px de ancho primero. El escritorio es la ampliación.**

Esta app se usa parado en una fila, con una mano, mientras alguien espera. No
sentado frente a un monitor.

Al escribir Tailwind eso significa: **las clases sin prefijo son las del
teléfono**, y `sm:` / `md:` / `lg:` agregan lo que sobra de lugar.

```tsx
// Bien: base = teléfono, el ancho suma
<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

// Mal: base = escritorio, se achica con max-*
<div className="grid grid-cols-3 max-sm:grid-cols-1">
```

## Antes de escribir una línea

1. **Leé la pantalla en `docs/ux/06-pantallas.md`** si ya está documentada.
2. Preguntate las tres del teléfono:
   - ¿Qué es lo más importante y entra sin scroll en 360×640?
   - ¿Dónde cae el pulgar? Ahí va la acción principal.
   - ¿Se puede hacer con una mano?
3. Enumerá los estados **antes** del camino feliz. Si no sabés qué muestra la
   pantalla vacía, todavía no sabés qué estás construyendo.

## Los seis estados, siempre

Ninguna pantalla está terminada con solo el caso "hay datos y todo anda".

| Estado               | Cómo se resuelve acá                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Vacío**            | `<EmptyState>` con ícono, título de una línea, explicación y la acción principal                                |
| **Vacío por filtro** | **Otro** `<EmptyState>`, con "Limpiar filtros". Nunca el de alta                                                |
| **Carga**            | Esqueleto con la forma de las filas (`.skeleton-shimmer`); en un botón, spinner adentro + `disabled`            |
| **Error**            | Cerca de donde pasó: en el campo si es del campo; aviso flotante si es al guardar, **sin vaciar el formulario** |
| **Éxito**            | El estado optimista ya actualiza la pantalla: eso es el feedback. Aviso explícito solo si el resultado no se ve |
| **Destructivo**      | Confirmación con la consecuencia concreta escrita. Nunca borrar directo desde un botón                          |

## Áreas táctiles: 44 px, medidos

Todo lo que se toca mide **44×44 px** como mínimo. Un botón de ícono de 32 px se
toca perfecto con el mouse y es una lotería con el pulgar.

Para no agrandar el diseño, se agranda solo el área:

```tsx
// Se ve de 32 px, responde en 44.
<button className="relative size-8 after:absolute after:-inset-1.5 after:content-['']">
```

Es el mismo truco que ya usan el checkbox y el radio de `components/ui/`.

## Formularios

- **Label visible y asociado.** El placeholder no reemplaza al label: se va justo
  cuando hace falta.
- **`inputMode` correcto**: monto → `inputMode="decimal"`. En el teléfono es la
  diferencia entre tres toques y diez.
- **Validar mientras se escribe** (o al salir del campo), no al enviar.
- **Los botones del formulario van abajo y fijos**, alcanzables sin scrollear.
- Un error al guardar **jamás** vacía lo cargado.

## Hojas y confirmaciones

- Todo formulario va en `<Dialog>`: ya es hoja desde abajo en el teléfono y
  cuadro centrado de 640 px para arriba. No hay que decidirlo de nuevo.
- Toda confirmación destructiva va en `<AlertDialog>`, encima de la hoja si hace
  falta. **No se apilan dos hojas.**
- Cerrar con cambios sin guardar pregunta antes de descartar.

## Copy

Voseo argentino, oraciones cortas, y todo mensaje dice qué pasó, por qué y qué
hacer. Detalle en `docs/ux/02-voz-y-tono.md` o en la skill `ux-copy`.

## Accesibilidad que no se negocia

- `aria-label` en todo botón que es solo un ícono.
- Contraste 4.5:1 (3:1 para texto grande), en los dos modos y con cualquier
  acento.
- El color nunca es lo único que comunica: badge = color **+** ícono o texto.
- `role="alert"` para errores; `aria-live="polite"` para el resto.
- Zonas seguras con `--safe-top` y compañía, nunca `env()` suelto.

## Qué NO hacer

- ❌ Diseñar en ancho y después achicar.
- ❌ Navegar a otra página para una tarea puntual.
- ❌ Borrar sin confirmar.
- ❌ Un `<div>` con `onClick` en vez de un `<button>`.
- ❌ Un hex o un `rgba()` a mano: se usan los tokens (`bg-brand`, `text-brand`,
  `border-hairline`, `shadow-(--sombra-card)`), o se rompe al cambiar de acento.
- ❌ Un spinner tapando la pantalla entera.
- ❌ Texto de estado vacío de tres renglones a 360 px.

## Al terminar

Corré la auditoría antes de dar algo por hecho:

```
/ux-auditoria            # toda la app, de 360 a 1280
/ux-auditoria /movimientos
```

Y pasá el checklist de `docs/ux/07-checklist.md` para lo que no se puede medir.
