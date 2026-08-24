# Documentación UX · Mis Finanzas

Flujos, estados, componentes y criterios de interacción.

Este material es una **adaptación** de la documentación UX de un ERP (catálogo y
stock, solicitudes, datos maestros, usuarios y notificaciones) al producto que
tenemos: una app de finanzas personales. Se conserva el marco —los doce
principios, la guía de voz, el sistema de estados, los patrones y el checklist—
y se traduce a nuestras pantallas y a nuestra realidad de uso.

Hay una diferencia de fondo con el documento original, y ordena todo lo demás:

> **Aquel ERP se usa sentado frente a una computadora. Esta app se usa parado en
> la fila de un supermercado, con una mano, mientras alguien espera.**

De ahí sale la regla que atraviesa cada página de esta carpeta.

---

## La regla: mobile primero, siempre

**Se diseña, se escribe y se prueba a 360 px de ancho. El escritorio es la
ampliación de eso, nunca el punto de partida.**

En la práctica:

|                      | Se hace así                                                                 | No se hace así                                     |
| -------------------- | --------------------------------------------------------------------------- | -------------------------------------------------- |
| Al diseñar           | Se resuelve la pantalla angosta y después se agrega lo que sobra de lugar   | Se diseña en ancho y después se "achica"           |
| Al escribir CSS      | Clases base para el teléfono, `sm:` / `md:` / `lg:` para agrandar           | Clases base para escritorio y `max-*` para achicar |
| Al probar            | 360 → 390 → 768 → 1280, en ese orden                                        | Se abre en la notebook y listo                     |
| Al decidir qué entra | Lo que no entra en el teléfono probablemente tampoco haga falta en la compu | Se agrega en la compu y se esconde en el teléfono  |

Un cambio no está terminado hasta que fue mirado a 360 px. Si nunca se abrió en
un ancho de teléfono, no está probado.

## Alcance

Las siete pantallas de la app con sesión, más la landing y el ingreso:

| Pantalla       | Qué resuelve                                           |
| -------------- | ------------------------------------------------------ |
| `/hoy`         | Cuánto va gastado hoy                                  |
| `/mes`         | A dónde se fue el sueldo este mes                      |
| `/anio`        | Tendencia mes a mes                                    |
| `/movimientos` | El historial completo, con búsqueda y filtros          |
| `/fijos`       | Gastos fijos y compras en cuotas                       |
| `/categorias`  | Las categorías propias                                 |
| `/ajustes`     | Presupuesto, moneda, dólar, apariencia, datos y cuenta |
| `/`            | Landing institucional                                  |
| `/ingresar`    | Entrar con Google                                      |

## Qué NO define este documento

Cómo se calculan los números (eso es `lib/finance.ts`), el modelo de datos (eso
es `prisma/schema.prisma`) ni la paleta y la tipografía (eso es `DESIGN.md` y
`docs/ux/05-accesibilidad.md` para los mínimos de contraste). Acá se define
**cómo se comporta la interfaz**: qué ve la persona, en qué orden, qué pasa
cuando algo sale mal y con qué componente se resuelve cada necesidad.

## El supuesto que más pesa: la app arranca vacía

Una cuenta recién creada no tiene un solo movimiento. Eso convierte los estados
vacíos, los de carga y los mensajes de confirmación en **la primera experiencia
real** de la persona con cada pantalla, no en un detalle para el final. Por eso
cada pantalla documenta explícitamente su estado vacío, su estado de carga y su
feedback, además del camino feliz.

## Índice

| Archivo                                      | Contenido                                              |
| -------------------------------------------- | ------------------------------------------------------ |
| [`01-principios.md`](01-principios.md)       | Los doce principios y su pregunta mobile-first         |
| [`02-voz-y-tono.md`](02-voz-y-tono.md)       | Cómo habla la app                                      |
| [`03-estados.md`](03-estados.md)             | Vacío, carga, error, éxito, deshabilitado, destructivo |
| [`04-navegacion.md`](04-navegacion.md)       | Hoja, modal, popover: qué usar y cuándo                |
| [`05-accesibilidad.md`](05-accesibilidad.md) | Mínimos exigibles, con foco en el dedo                 |
| [`06-pantallas.md`](06-pantallas.md)         | Pantalla por pantalla                                  |
| [`07-checklist.md`](07-checklist.md)         | Qué verificar antes de dar algo por terminado          |

## Cómo se lee cada pantalla

Todas las pantallas de [`06-pantallas.md`](06-pantallas.md) siguen la misma
estructura, para que sea predecible:

1. **Para qué existe** — qué pregunta contesta.
2. **Camino feliz** — el flujo principal, en el teléfono.
3. **Qué pasa si…** — bordes, errores y casos raros previstos.
4. **Estados** — vacío, carga, error, éxito.
5. **Componentes** — con qué se resuelve.
6. **Mobile → desktop** — qué cambia al haber más ancho.

## Este documento se mantiene

Es un asset vivo. Cuando aparece una casuística nueva al construir o al probar,
se agrega acá, no en un comentario suelto. Las decisiones que van más allá de lo
que se pidió originalmente se marcan como **mejora propuesta**, para
distinguirlas de lo que es requisito.
