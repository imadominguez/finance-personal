# 1 · Marco de principios

Toda pantalla, hoja o modal de la app tiene que poder responder que **sí** a
estas doce preguntas antes de darse por terminada. Se usan como checklist de
diseño y como checklist de revisión.

La columna de la derecha es el aporte de esta adaptación: la misma pregunta,
hecha desde el teléfono. Es la que más veces encuentra problemas, porque es la
que nadie se hace cuando diseña en una pantalla de 27 pulgadas.

| Principio         | Pregunta rectora                           | La misma pregunta, a 360 px                                       |
| ----------------- | ------------------------------------------ | ----------------------------------------------------------------- |
| **Claridad**      | ¿Entiende dónde está?                      | ¿Se ve dónde está sin scrollear de costado?                       |
| **Propósito**     | ¿Sabe qué puede hacer?                     | ¿La acción principal está donde llega el pulgar?                  |
| **Jerarquía**     | ¿Sabe qué es lo más importante?            | ¿El dato más importante entra en la primera pantalla, sin scroll? |
| **Consistencia**  | ¿Se comporta como el resto?                | ¿El mismo gesto hace lo mismo en todas las pantallas?             |
| **Eficiencia**    | ¿Completa la tarea rápido?                 | ¿Se puede completar con una sola mano?                            |
| **Prevención**    | ¿Evitamos el error antes de que pase?      | ¿Se puede tocar por accidente algo que no se puede deshacer?      |
| **Feedback**      | ¿El sistema responde?                      | ¿La respuesta se ve sin que el teclado la tape?                   |
| **Recuperación**  | ¿Puede volver atrás?                       | ¿Se pierde lo cargado si suena el teléfono en el medio?           |
| **Accesibilidad** | ¿Lo puede usar la mayor cantidad de gente? | ¿Cada cosa tocable mide 44 px o más?                              |
| **Trazabilidad**  | ¿Sabe qué pasó y de dónde salió?           | ¿Se ve el origen de un movimiento sin abrirlo?                    |
| **Escalabilidad** | ¿Funciona con mucha información?           | ¿Sigue andando con 5.000 movimientos en un teléfono viejo?        |
| **Confianza**     | ¿Siente que tiene el control?              | ¿Puede deshacer o al menos entender qué acaba de pasar?           |

---

## Las doce preguntas valen también para lo que no es el camino feliz

No alcanza con que la pantalla "con datos y sin errores" responda que sí. Las
mismas doce preguntas se le hacen al **estado vacío**, al **estado de carga** y
al **estado de error** de cada flujo. Una app de finanzas se estrena vacía: la
pantalla vacía es la primera impresión, no un caso de borde.

## Cómo se aplica cada uno acá

**Claridad.** La pantalla actual está marcada en la navegación y el título dice
de qué período se está hablando. Nunca hay que deducir en qué mes estamos
mirando los números.

**Propósito.** Cada pantalla tiene una acción principal y una sola. En el
teléfono vive en el botón flotante de abajo a la derecha —donde cae el pulgar—,
no arriba en una barra.

**Jerarquía.** El monto grande primero, el detalle después. En un teléfono
"primero" significa literalmente _arriba de todo_: lo que queda debajo del
pliegue lo ve menos de la mitad de la gente.

**Consistencia.** Alta y edición usan el mismo formulario. Borrar pide
confirmación en todos lados igual. Los montos se formatean con la misma función
en toda la app.

**Eficiencia.** Cargar un gasto son tres toques: abrir, monto, categoría. Todo
lo demás tiene un valor por defecto razonable.

**Prevención.** Lo que no se puede deshacer se confirma antes. Lo que se puede
validar mientras se escribe, se valida mientras se escribe, no al enviar.

**Feedback.** Todo cambio se ve al instante gracias al estado optimista. Si el
servidor lo rechaza, se avisa con el motivo y el estado vuelve solo.

**Recuperación.** Un error al guardar **nunca** vacía el formulario. Los datos
cargados quedan donde estaban.

**Accesibilidad.** Contraste mínimo 4.5:1 medido, todo alcanzable con teclado,
44 px de área táctil, y respeto por `prefers-reduced-motion`.

**Trazabilidad.** Cada movimiento dice de dónde salió: cargado a mano, generado
por un gasto fijo o por una cuota. Es la versión de "quién hizo qué" que tiene
sentido en una app de una sola persona: acá el _quién_ siempre sos vos, así que
lo que importa es el _de dónde_ y el _cuándo_.

**Escalabilidad.** Los listados tienen que aguantar años de uso. Búsqueda con
retardo, filtros combinables y listas que no dibujan mil filas de una.

**Confianza.** Antes de confirmar algo grave se explica la consecuencia concreta,
no un "¿estás seguro?".
