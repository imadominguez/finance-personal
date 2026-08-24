# 2 · Voz y tono

La voz del producto es lo que sostiene la confianza en los momentos de duda: la
pantalla vacía, la acción que falla, la confirmación de algo que no se puede
deshacer. Un mismo tono para toda la app, con matices según el estado.

Aplica a **todo el texto que escribe el sistema**: avisos, estados vacíos,
mensajes de validación, textos de ayuda y confirmaciones. No aplica a lo que
escribe la persona (la descripción de un gasto es suya, no nuestra).

## 2.1 Personalidad

**Cercana.** Se habla de vos, en segunda persona, con oraciones cortas y sin
jerga técnica. "No pudimos guardar", no "Error de persistencia".

**Empática.** Reconoce el momento sin culpar ni sonar a robot. Si algo falló del
lado nuestro, se dice; no se redacta como si la persona se hubiera equivocado.

**Informativa.** Siempre dice qué pasó, por qué y qué se puede hacer ahora.
Nunca un mensaje mudo: "Error" solo, sin salida, no es un mensaje.

**Argentina.** Voseo, y las palabras que se usan acá: _plata_, _sueldo_,
_cuotas_, _fijos_. No _dinero_, no _nómina_, no _suscripciones_.

## 2.2 Reglas de redacción

- **Verbos en infinitivo o imperativo en los botones**: "Guardar cambios",
  "Cargar datos de ejemplo". Nunca gerundio salvo para el estado cargando
  ("Guardando…").
- **Los errores explican la causa en castellano y ofrecen la salida.** Nunca un
  código pelado.
- **Las confirmaciones destructivas dicen la consecuencia concreta**, no un
  genérico "¿Estás seguro?".
- **Los estados vacíos explican qué se puede hacer ahí** y ofrecen la acción
  principal como botón, no solo un ícono decorativo.
- **Nada de humor** en errores ni en pérdida de datos. Un tono más liviano se
  reserva para confirmaciones de éxito de bajo impacto.
- **En el teléfono, más corto todavía.** Un título de estado vacío que ocupa tres
  renglones a 360 px ya es demasiado largo. Máximo una línea el título, dos la
  explicación.

## 2.3 Qué decir y qué evitar

| Estado                        | Evitar                           | Usar                                                                                                         |
| ----------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Vacío (sin movimientos)       | "No hay datos."                  | "Todavía no cargaste nada. Anotá tu primer gasto y la app arma sola el resumen del día, del mes y del año."  |
| Vacío (filtro sin resultados) | "Sin resultados."                | "Ningún movimiento coincide con lo que buscás. Probá quitar algún filtro."                                   |
| Error al guardar              | "Error 500."                     | "No pudimos guardar el cambio. Revisá tu conexión y probá de nuevo; lo que cargaste no se perdió."           |
| Validación en línea           | "Campo inválido."                | "El monto tiene que ser mayor a cero."                                                                       |
| Confirmación destructiva      | "¿Estás seguro?"                 | "Vas a borrar este movimiento de $ 12.500. No se puede deshacer."                                            |
| Éxito                         | "Operación exitosa."             | "Listo, se guardó."                                                                                          |
| Acción no disponible          | "No autorizado."                 | "Esta categoría viene con la app: se puede renombrar, pero no borrar."                                       |
| Servicio de afuera caído      | "Error al obtener cotizaciones." | "No pudimos traer las cotizaciones ahora mismo. Los montos se muestran en pesos; probá de nuevo en un rato." |

## 2.4 Las tres partes de un buen mensaje de error

1. **Qué pasó**, en términos de la persona: "No pudimos guardar el cambio".
2. **Por qué**, si se sabe y sirve: "Revisá tu conexión".
3. **Qué hacer ahora**: "Probá de nuevo" + la tranquilidad de que no se perdió
   nada.

Si falta la tercera parte, el mensaje está incompleto.

## 2.5 Números y plata

- Los montos se formatean siempre con `formatMoney`, nunca a mano.
- En una frase, el monto va con su signo de moneda: "Te quedan $ 76.900".
- Los porcentajes se redondean a entero salvo que el decimal cambie la decisión.
- Cuando se muestra algo convertido a dólares, **se dice a qué dólar**: el número
  cambia según la casa, y no decirlo es esconder la mitad del dato.
