---
name: ux-copy
description: Cómo escribe la app Mis Finanzas. Voz, tono y fórmulas listas para estados vacíos, mensajes de error, validaciones, confirmaciones destructivas, textos de ayuda y etiquetas de botones, en español rioplatense. Usar SIEMPRE que haya que escribir o revisar cualquier texto que muestre el sistema, incluido el de un componente nuevo, un placeholder, un tooltip o un mensaje de validación. También cuando un texto suene robótico, largo o poco claro.
---

# Cómo habla Mis Finanzas

Documento largo en `docs/ux/02-voz-y-tono.md`. Acá van las fórmulas.

## Las tres reglas

1. **De vos, corto y sin jerga.** "No pudimos guardar", no "Error de
   persistencia".
2. **Nunca un mensaje mudo.** Todo texto dice **qué pasó**, **por qué** (si se
   sabe y sirve) y **qué hacer ahora**. Si falta lo tercero, está incompleto.
3. **Argentino.** _Plata_, _sueldo_, _cuotas_, _fijos_, _anotar_. No _dinero_, no
   _nómina_, no _suscripciones_, no _registrar transacciones_.

## Fórmulas

### Estado vacío (no hay nada cargado)

> **Todavía no [verbo en pasado].**
> [Qué va a pasar cuando haya datos.]
> `[Botón: acción de alta]`

_"Todavía no cargaste nada. Anotá tu primer gasto y la app arma sola el resumen
del día, del mes y del año."_ → `+ Cargar un gasto`

### Estado vacío por filtro

> **Ningún [cosa] coincide con lo que buscás.**
> Probá quitar algún filtro.
> `[Botón: Limpiar filtros]`

Nunca ofrece la acción de alta: el problema es el filtro, no la falta de datos.

### Error al guardar

> **No pudimos [acción].** [Causa probable, en castellano.] Probá de nuevo; lo
> que cargaste no se perdió.

La última cláusula no es decorativa: es la que evita que la persona vuelva a
escribir todo por las dudas.

### Validación de un campo

Dice qué se espera, no que está mal.

| ❌                   | ✅                                       |
| -------------------- | ---------------------------------------- |
| "Campo inválido"     | "El monto tiene que ser mayor a cero."   |
| "Requerido"          | "Elegí una categoría."                   |
| "Formato incorrecto" | "La fecha va como día/mes/año."          |
| "Duplicado"          | "Ya tenés una categoría con ese nombre." |

### Confirmación destructiva

> **Vas a [acción concreta, con el dato adentro].**
> [Qué más se pierde, si algo se pierde.]
> No se puede deshacer.
> `[Cancelar]` `[Sí, borrar X]`

_"Vas a borrar este movimiento de $ 12.500 del 14 de agosto. No se puede
deshacer."_

El botón dice la acción, no "Aceptar". Nunca aparece un "¿Estás seguro?" pelado.

### Acción no disponible

Explica el motivo en el punto de fricción, sin sonar a reto.

_"Esta categoría viene con la app: se puede renombrar, pero no borrar."_

### Éxito

Solo cuando el resultado no se ve en pantalla. Corto y liviano: _"Listo, se
guardó."_

### Servicio de afuera caído

> **No pudimos traer [cosa] ahora mismo.** [Qué se muestra mientras tanto.]
> Probá de nuevo en un rato.

## Botones

- Infinitivo o imperativo: "Guardar cambios", "Cargar un gasto", "Limpiar
  filtros".
- Gerundio **solo** para el estado cargando: "Guardando…".
- El botón dice **qué hace**, no "Aceptar" ni "OK".
- En el teléfono entran ~20 caracteres cómodos. Más que eso, se corta o se apila.

## Largos máximos (a 360 px)

| Texto                       | Máximo         |
| --------------------------- | -------------- |
| Título de estado vacío      | 1 línea        |
| Explicación de estado vacío | 2 líneas       |
| Mensaje de validación       | 1 línea        |
| Etiqueta de botón           | ~20 caracteres |
| Descripción de sección      | 1 línea        |

## Prohibido

- ❌ Códigos de error crudos a la vista.
- ❌ Humor en errores o en pérdida de datos.
- ❌ "¿Estás seguro?" sin decir qué pasa.
- ❌ Culpar: "ingresaste mal el dato" → "el monto tiene que ser mayor a cero".
- ❌ Tuteo ("ingresa tu monto") — es voseo ("ingresá tu monto").
- ❌ Inglés donde hay palabra en castellano: _guardar_, no _save_.
