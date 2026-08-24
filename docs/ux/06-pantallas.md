# 6 · Pantalla por pantalla

Cada pantalla se documenta con la misma estructura. Todo lo que dice "camino
feliz" está descripto **en el teléfono**; lo que cambia al haber más ancho va al
final de cada sección.

---

## 6.1 Movimientos (`/movimientos`)

Es el equivalente al módulo de catálogo del ERP: el listado con más volumen, el
que tiene que aguantar años de uso.

### Para qué existe

Encontrar un movimiento puntual entre todo lo cargado, y entender el total de lo
que se está mirando.

### Camino feliz

1. Se entra y se ve la lista completa, ordenada de más nuevo a más viejo, con el
   total de lo filtrado arriba.
2. Se busca escribiendo, o se acota con los filtros de tipo y categoría.
3. Se toca un movimiento y se abre la hoja de edición, prellenada.
4. Se guarda: la hoja se cierra y la fila se actualiza sola.

### Qué pasa si…

- **…no hay nada cargado** → estado vacío que invita a cargar el primero, con la
  acción de alta.
- **…el filtro no encuentra nada** → estado vacío **distinto**, con "Limpiar
  filtros". Nunca el de alta.
- **…hay miles de movimientos** → la lista no dibuja todo de una: crece a medida
  que se baja. La búsqueda espera a que se deje de escribir antes de filtrar.
- **…se toca un movimiento generado por un fijo o una cuota** → no se edita como
  uno común: se explica de dónde salió y se ofrece ir a la regla que lo genera.
- **…falla el guardado** → aviso con el motivo, la hoja queda abierta y los datos
  intactos.
- **…se borra un movimiento** → confirmación explícita con el monto y la
  descripción; recién ahí se borra.

### Estados

| Estado           | Qué se ve                                                                  |
| ---------------- | -------------------------------------------------------------------------- |
| Vacío            | Ícono, "Todavía no cargaste nada", explicación de una línea, botón de alta |
| Vacío por filtro | Lupa, "Ningún movimiento coincide", botón "Limpiar filtros"                |
| Carga            | Esqueleto con la forma de las filas                                        |
| Error al guardar | Aviso flotante + hoja abierta con lo cargado                               |
| Éxito            | La fila se actualiza sola (estado optimista)                               |

### Componentes

Buscador con retardo · filtros combinables · lista de movimientos · hoja de alta
y edición · confirmación de borrado · estado vacío en sus dos variantes ·
esqueleto de filas.

### Mobile → desktop

- **360 px**: el buscador queda siempre a la vista y el resto de los filtros
  —tipo, categoría, fechas— se pliega detrás de un botón que muestra cuántos hay
  puestos. Desplegados se comían la pantalla entera: había que scrollear ~900 px
  antes de ver un movimiento, que es justo lo que se vino a ver.
- En cada fila, la descripción se lleva un renglón entero y los badges (Fijo,
  Cuota 3/6, Proyectado) bajan al segundo, junto a la categoría. Compartiendo
  renglón, "Heladera" se cortaba en "Helad…".
- **≥ 640 px**: los filtros se muestran siempre, sin botón, y la descripción
  vuelve a compartir renglón con los badges.
- **≥ 1024 px**: hay lugar para mostrar más de un vistazo (método de pago, nota).

---

## 6.2 Categorías (`/categorias`)

El equivalente a datos maestros: valores propios que el resto de la app
consume.

### Para qué existe

Definir en qué se clasifica la plata. Lo que se elija acá aparece en el alta de
movimientos, en los gráficos y en los filtros.

### Camino feliz

1. Se ven las categorías separadas en gastos e ingresos, cada una con lo
   acumulado del año al lado.
2. Se toca "Nueva categoría" y se abre la hoja: nombre, tipo, color e ícono, con
   una vista previa arriba que se actualiza mientras se escribe.
3. Se guarda y aparece en la lista.

### Qué pasa si…

- **…se intenta crear una con un nombre que ya existe** → se avisa **mientras se
  escribe**, no al enviar.
- **…se intenta borrar una que viene con la app** → el botón no está, y se
  explica por qué: se puede renombrar, no borrar.
- **…se intenta borrar una que tiene movimientos** → la confirmación dice cuántos
  movimientos quedan afectados antes de seguir.
- **…no hay ninguna categoría de un tipo** → estado vacío propio de esa columna,
  distinto del de la otra.

### Mobile → desktop

- **360 px**: gastos e ingresos apilados, uno abajo del otro.
- **≥ 768 px**: dos columnas lado a lado, que es la versión chica del
  maestro-detalle del ERP.

---

## 6.3 Fijos y cuotas (`/fijos`)

El equivalente al módulo de usuarios: un ABM con estados visibles.

### Para qué existe

Cargar una vez lo que se repite —el alquiler, Netflix, las 12 cuotas de la
heladera— y que la app lo proyecte sola, mes a mes.

### Camino feliz

1. Se ven dos listas: gastos fijos y planes de cuotas, con el total mensual de
   cada uno.
2. Se da de alta desde el botón de la sección; la hoja pide monto, categoría, día
   del mes y desde cuándo.
3. Al guardar, los movimientos proyectados aparecen en el resto de las pantallas.

### Qué pasa si…

- **…un fijo está pausado** → se ve como badge en la fila, con color **e**
  ícono **y** texto, no solo color.
- **…un mes puntual no se pagó** → se puede saltear ese mes sin borrar la regla.
- **…una cuota ya terminó** → el plan se muestra terminado, no desaparece: el
  historial es parte del dato.
- **…se borra una regla** → confirmación que aclara que los movimientos
  proyectados dejan de aparecer.

### Mobile → desktop

- **360 px**: una tarjeta por regla, con el monto grande y el badge de estado
  arriba a la derecha.
- **≥ 768 px**: dos columnas.

---

## 6.4 Hoy, Mes y Año (`/hoy`, `/mes`, `/anio`)

Son pantallas de lectura, no de ABM. La tarea acá es **entender**, no operar.

### Para qué existen

Contestar tres preguntas: cuánto llevo gastado hoy, a dónde se fue el sueldo este
mes, y cómo viene el año.

### Camino feliz

1. Se entra y el número grande está arriba de todo, sin scroll.
2. Debajo, la comparación contra el período anterior y la barra de avance del
   presupuesto.
3. Más abajo, el detalle: por categoría, día por día, los movimientos.
4. El selector de período permite moverse sin salir de la pantalla.

### Qué pasa si…

- **…la cuenta está vacía** → una pantalla de bienvenida que explica qué va a
  pasar cuando haya datos y ofrece dos caminos: cargar el primer movimiento o
  ver la app con datos de ejemplo.
- **…no hay presupuesto cargado** → no se muestra la barra de avance ni un cero
  raro: simplemente no está, y Ajustes explica para qué sirve.
- **…el período elegido no tiene movimientos** → estado vacío del período, con el
  selector a mano para moverse a otro.
- **…hay movimientos proyectados a futuro** → se distinguen de los que ya
  ocurrieron (barra punteada), y se aclara en el texto.

### Mobile → desktop

- **360 px**: todo en una columna. El monto grande ocupa el ancho completo.
- **≥ 640 px**: las tarjetas de métricas pasan a dos o tres por fila.
- **≥ 1024 px**: el gráfico y su leyenda conviven lado a lado.

---

## 6.5 Ajustes (`/ajustes`)

### Para qué existe

Todo lo que se configura una vez y se olvida: presupuesto, moneda, dólar,
apariencia, respaldo y cuenta.

### Camino feliz

Secciones en tarjetas, cada una con un título que dice de qué se trata y una
línea de explicación. Los cambios de apariencia y de dólar se aplican al
instante; el presupuesto y el nombre se guardan con un botón.

### Qué pasa si…

- **…se toca "Borrar todos mis datos"** → confirmación que aclara que la cuenta
  sigue existiendo pero los movimientos no vuelven.
- **…se toca "Eliminar mi cuenta"** → confirmación reforzada: se va todo.
- **…se importa un archivo** → se avisa **antes** de que reemplaza todo lo
  cargado.
- **…no se pueden traer las cotizaciones** → la sección lo dice y los montos se
  muestran en pesos.

### Orden de las secciones

De lo más usado a lo más peligroso, y lo irreversible al final: presupuesto →
apariencia → instalar → moneda → dólar → datos → cuenta → zona de riesgo.

---

## 6.6 Landing (`/`) e ingreso (`/ingresar`)

### Para qué existen

Explicar de qué se trata la app a alguien que llegó de afuera, y dejarlo entrar
en un toque.

### Qué pasa si…

- **…se llega desde un link a una pantalla con sesión sin estar logueado** →
  se lleva a `/ingresar` recordando a dónde quería ir, y después de entrar se lo
  deja ahí.
- **…falla el ingreso con Google** → se explica en castellano qué pasó y se
  ofrece volver a intentar.

### Mobile → desktop

La landing se lee de arriba a abajo en el teléfono, con el video y las secciones
apiladas. Las animaciones atadas al scroll solo se aplican si el sistema no pidió
menos movimiento.
