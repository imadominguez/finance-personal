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

Siete secciones. En el teléfono no entran en una fila.

**Cómo está hoy:** una fila que se scrollea de costado.

**Problema:** lo que queda fuera de la pantalla no existe. A 360 px se ven tres
secciones y media; las otras hay que descubrirlas arrastrando, sin ninguna señal
de que están ahí.

**Criterio para resolverlo** (ver [`06-pantallas.md`](06-pantallas.md)):

- Las tres vistas de período —Hoy, Mes, Año— son el corazón de la app y tienen
  que estar **siempre visibles**, sin scroll.
- El resto —Movimientos, Fijos, Categorías, Ajustes— son secundarias y pueden
  vivir detrás de un acceso único.
- La sección actual siempre marcada, con `aria-current="page"`.

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
