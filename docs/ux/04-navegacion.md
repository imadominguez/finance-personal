# 4 · Navegación e interacción

**Directriz general: no se navega a otra página para completar una tarea.** Todo
lo que se pueda, se resuelve encima de la pantalla desde la que se partió, para
no perder de vista el contexto.

En el documento original esto se traducía en _modales_ y _side panels_. Acá el
mismo criterio, leído desde el teléfono, da otra cosa: **el side panel no existe
en un ancho de 360 px**. Lo que en escritorio es un panel lateral, en el teléfono
es una **hoja que sube desde abajo**, que es donde está el pulgar.

---

## 4.1 Qué usar y cuándo

| Patrón                           | Se usa cuando…                                   | En esta app                                                                  |
| -------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------- |
| **Hoja / modal** (`Dialog`)      | Formulario corto o de foco único; confirmaciones | Alta y edición de un movimiento, de una categoría, de un fijo o de una cuota |
| **Confirmación** (`AlertDialog`) | Hay que confirmar algo que no se deshace         | Borrar cualquier cosa; borrar todos los datos; eliminar la cuenta            |
| **Aviso flotante** (toast)       | Feedback que no interrumpe                       | Error al guardar                                                             |
| **Página completa**              | El contexto cambia de verdad                     | Las siete secciones; nunca para una tarea puntual                            |

El mismo componente `Dialog` de esta app resuelve los dos primeros casos y
**cambia de forma según el ancho**:

- **Hasta 640 px**: hoja anclada abajo, ancho completo, esquinas redondeadas
  arriba, con una manija visual. Alto máximo 88% de la pantalla, con scroll
  adentro.
- **De 640 px para arriba**: cuadro centrado clásico.

Eso ya está resuelto en `components/ui/dialog.tsx`: no hay que decidirlo de nuevo
en cada pantalla.

---

## 4.2 Reglas comunes

- El fondo se atenúa y **el foco de teclado queda atrapado** adentro hasta que se
  cierra.
- Se cierra con: el botón de cerrar, `Esc`, o tocando afuera.
- **Al cerrarse, el foco vuelve** al elemento que lo abrió.
- La lista de atrás se actualiza al confirmar, sin recargar la pantalla.
- **No se abre un modal arriba de otro modal.** Si algo adentro de una hoja
  necesita confirmación, la confirmación va por encima de la hoja, y es lo único
  que se apila.

---

## 4.3 Salir con cambios sin guardar

Si se intenta cerrar una hoja con campos modificados y sin guardar, **el cierre
se intercepta** y se pregunta antes de descartar. No se pierde lo cargado en
silencio.

En el teléfono esto importa el doble: cerrar de más es un gesto de un dedo
—tocar fuera de la hoja— y pasa por accidente todo el tiempo.

Está resuelto en `components/finance/cierre-con-cambios.tsx`, y lo usan los
cuatro formularios. Detecta que se tocó algo sin tener que enganchar cada campo:
escribir dispara `input`, y los selectores de tipo, categoría, color e ícono son
controles con `aria-pressed`.

Solo intercepta los cierres **implícitos** —tocar afuera, `Esc`, la cruz—.
"Cancelar" es una decisión explícita de descartar y sigue de largo.

---

## 4.4 Navegación entre secciones

Siete secciones no entran en una fila en un teléfono. Y el marco de la app está
limitado a 768 px —crece a 1024 recién en pantallas grandes—, así que tampoco
hay un ancho donde entren cómodas: los siete tabs piden 730 px de los 736
disponibles.

**Cómo era:** una fila que se scrolleaba de costado. Lo que quedaba fuera de la
pantalla no existía: a 360 px se veían tres secciones y media y el resto había
que descubrirlas arrastrando, sin ninguna señal de que estaban ahí.

**Cómo es:**

- **Hoy · Mes · Año** siempre a la vista. Son el corazón de la app y lo que se
  mira todos los días.
- **Más** abre una hoja con las otras cuatro —Movimientos, Fijos y cuotas,
  Categorías, Ajustes—, cada una con una línea que dice para qué sirve. Ese
  espacio no existía en un tab.
- **Igual en todos los tamaños.** No cambia el gesto entre el teléfono y la
  compu: se aprende una vez. Y Ajustes sigue estando a un toque desde el menú de
  la cuenta, en cualquier ancho.
- La sección actual siempre marcada con `aria-current="page"`, y **"Más" queda
  marcado** cuando estás en una de las que agrupa: si no, al entrar a
  Movimientos no habría nada indicando dónde estás.

En el teléfono los cuatro tabs se reparten el ancho en partes iguales; con lugar
de sobra cada uno ocupa lo suyo y quedan juntos a la izquierda.

---

## 4.5 El pulgar manda

En un teléfono agarrado con una mano, la parte cómoda de la pantalla es **el
tercio de abajo**. Lo de arriba de todo es la zona más incómoda.

De ahí:

- **La acción principal de cada pantalla va abajo**, flotando sobre el
  contenido. Es lo que ya hace el botón de "nuevo movimiento".
- **Los botones de una hoja van abajo**, fijos, visibles sin scrollear el
  formulario entero.
- Lo de arriba se reserva para lo que se **lee**, no para lo que se **toca**:
  título, monto, período.

---

## 4.6 Gestos

- **Tocar** es el único gesto obligatorio. Todo se puede hacer tocando.
- Cualquier atajo por gesto —deslizar para borrar, por ejemplo— es un extra, y
  siempre tiene que existir el camino tocando.
- No se usan gestos que compitan con los del sistema operativo (deslizar desde el
  borde es "volver atrás" en el navegador; no se pisa).
