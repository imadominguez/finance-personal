# 3 · Sistema de estados

Ninguna pantalla se diseña contemplando solo su versión "con datos y sin
errores". Todo flujo tiene, como mínimo, estos seis estados, y se piensan desde
el primer boceto.

---

## 3.1 Vacío

**Cuándo.** La primera vez que se entra a una pantalla sin datos, o cuando un
filtro no devuelve nada.

**Tiene que tener** un ícono simple, un título breve, una línea que explique qué
se puede hacer ahí, y un botón con la acción principal.

**Son dos estados distintos, no uno.**

|       | Sin datos todavía                     | El filtro no encontró nada        |
| ----- | ------------------------------------- | --------------------------------- |
| Tono  | Invita a empezar                      | Informa y ofrece salir del filtro |
| Botón | La acción de alta ("Cargar un gasto") | "Limpiar filtros"                 |
| Ícono | El de la sección                      | Una lupa                          |

**Nunca parece un error.** Tono neutro, nada de rojo, nada de íconos de alerta.

**En el teléfono**: el bloque entero tiene que entrar sin scroll. Si el título,
la explicación y el botón no entran en 360×640, sobra texto.

---

## 3.2 Carga

**Cuándo.** Mientras se resuelve algo: la primera carga de un listado, abrir una
hoja con datos, guardar un formulario.

- **Listados**: esqueleto con la forma de las filas reales, no un spinner en el
  medio de la pantalla. Así la jerarquía visual ya se reconoce mientras carga.
- **Acciones puntuales** (guardar, borrar): el botón que disparó la acción pasa a
  "cargando" —spinner adentro del botón y texto en gerundio— y **se
  deshabilita**, para que no se dispare dos veces.
- Ninguna carga bloquea el resto de la pantalla, salvo que la acción sea
  bloqueante de verdad.

**En esta app hay un atajo que evita casi toda la carga**: las pantallas se
renderizan en el servidor con los datos ya adentro, y las mutaciones usan estado
optimista. La fila aparece antes de que el servidor conteste. El esqueleto queda
para lo que sí tarda: la primera pintura y la vuelta de una acción lenta.

---

## 3.3 Error

**Regla general: el error se muestra lo más cerca posible de donde ocurrió.**

| Dónde falló                          | Cómo se muestra                                                         |
| ------------------------------------ | ----------------------------------------------------------------------- |
| Un campo                             | Mensaje debajo del campo, **en el momento**, no recién al enviar        |
| La carga de un listado entero        | Bloque de error en la sección, con "Reintentar", en lugar del esqueleto |
| Guardar o enviar                     | Aviso flotante + **el formulario queda abierto con todo lo cargado**    |
| Un servicio de afuera (cotizaciones) | La app sigue andando sin eso y lo dice donde corresponde                |

Los errores del sistema **nunca** se redactan como si fueran culpa de la persona.

**En el teléfono, cuidado con el teclado**: un mensaje de error abajo de todo
queda tapado por el teclado virtual. El error de un campo va pegado al campo, y
el aviso flotante se ubica de forma que el teclado no lo esconda.

---

## 3.4 Éxito

- Para acciones de bajo y medio impacto —crear, editar, borrar— alcanza con que
  **el cambio se vea en pantalla al instante**. Esta app usa estado optimista:
  la fila aparece, desaparece o cambia sola. Ese es el feedback.
- Se agrega un aviso explícito cuando **el resultado no se ve**: porque la hoja
  que lo disparó tapa la lista, porque el cambio afecta a otra pantalla, o
  porque la acción es lo bastante importante como para merecer una confirmación
  ("Se borraron todos tus datos").
- Un aviso de éxito se descarta solo. Uno de error, no: se cierra a mano.

> **Diferencia con el documento original.** El ERP pide un aviso en cada alta,
> edición y baja. Acá eso sería ruido: la lista ya se actualizó delante de los
> ojos. Se conserva el principio —siempre hay feedback— y se cambia el medio.

---

## 3.5 Deshabilitado y acciones no disponibles

- Un control deshabilitado **no se esconde**: se muestra apagado y con una
  explicación al lado o en un tooltip. Esconderlo genera la sensación de que
  falta una función.
- Una acción que no se puede hacer por el estado del dato —borrar una categoría
  que viene con la app, borrar una que tiene movimientos— se explica **en el
  punto de fricción**, no recién en el error después de intentarlo.

---

## 3.6 Confirmaciones destructivas

**Toda acción que no se puede deshacer necesita una confirmación explícita.**
Nunca se ejecuta directo desde un botón.

La confirmación tiene que decir:

1. **Qué se va a borrar**, concreto: "este movimiento de $ 12.500", no "el ítem".
2. **Qué se pierde con eso**, cuando aplica: "los 8 movimientos de esta
   categoría van a quedar sin categoría".
3. **Que no hay vuelta atrás**, con esas palabras.

El botón que confirma dice la acción ("Sí, borrar"), no "Aceptar".

**En el teléfono**: la confirmación aparece pegada al pulgar, y el botón
destructivo **no** queda debajo del dedo que venía tocando, para no confirmar de
rebote.

**Qué es destructivo en esta app:** borrar un movimiento, una categoría, un
gasto fijo o un plan de cuotas; borrar todos los datos; eliminar la cuenta;
importar un archivo (reemplaza todo lo cargado).

Los cuatro primeros usan el mismo componente,
`components/finance/confirmar-borrado.tsx`, así el texto y el orden de los
botones son iguales en todos lados. En el teléfono "Cancelar" queda abajo, más
cerca del pulgar que venía tocando "Borrar": confirmar de rebote tiene que
costar más que arrepentirse.
