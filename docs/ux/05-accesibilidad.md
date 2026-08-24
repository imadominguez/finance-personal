# 5 · Accesibilidad

Mínimos exigibles para toda pantalla, hoja y modal, alineados a WCAG 2.1 nivel
AA. Cada pantalla puede sumar reglas propias, nunca restar.

---

## 5.1 El dedo primero: área táctil

**Todo lo que se toca mide 44×44 px como mínimo**, con separación suficiente
entre elementos vecinos.

Esto es lo que más se rompe cuando se diseña en escritorio: un botón de ícono de
32 px se toca perfecto con el mouse y es una lotería con el pulgar.

Cómo se cumple sin agrandar todo visualmente:

```tsx
// El ícono se ve de 32 px, pero el área que responde al toque es de 44.
<button className="relative size-8 ... after:absolute after:-inset-1.5 after:content-['']">
```

El pseudo-elemento agranda el área sin mover el diseño. Ya se usa así en los
checkbox y radios de `components/ui/`.

**Con mouse el mínimo es otro.** De 700 px para arriba se asume puntero fino y
el piso baja a **24×24 px** (WCAG 2.5.8, nivel AA). Por eso los controles de la
app son de 44 px en el teléfono y vuelven a su tamaño compacto en el escritorio:
`h-11 sm:h-8`. No es una excepción, es la misma regla leída por dispositivo.

**Se mide, no se estima.** El script de auditoría (`.claude/skills/ux-auditoria`)
recorre la pantalla a 360 px y lista todo lo que quede por debajo, aplicando el
umbral que corresponde a cada ancho.

**Excepción**: un enlace adentro de una oración (WCAG 2.5.5 lo contempla)
—agrandarlo rompería el renglón—. La auditoría lo reporta aparte y no lo cuenta
como falla.

## 5.2 Contraste

- **4.5:1** entre texto y fondo. **3:1** para texto grande (24 px, o 18.66 px en
  negrita) y para elementos gráficos.
- Vale para **todos** los estados: normal, deshabilitado, badges, texto sobre
  color de marca, y en los dos modos —claro y oscuro— y con cualquier acento.
- **El color nunca es lo único que comunica.** Un gasto y un ingreso se
  distinguen por signo y por texto, no solo por rojo y verde. Un badge combina
  color + ícono o texto.
- El zoom del navegador al 200% no puede romper ni esconder nada.

El acento es configurable, así que el contraste no se verifica de a un color:
`lib/theme.ts` ajusta cualquier color elegido a mano hasta llegar a 4.5:1, y la
auditoría lo mide sobre la pantalla real.

## 5.3 Teclado

- Todo control es alcanzable y operable con `Tab` / `Shift+Tab` / `Enter` /
  `Espacio`.
- **El foco visible no se saca nunca por estética.** Si se personaliza, mantiene
  el contraste.
- El orden de tabulación sigue el orden visual.
- `Esc` cierra hojas, modales y menús. `Enter` confirma la acción principal.

En el teléfono también hay teclado: mucha gente usa uno externo, y los lectores
de pantalla navegan con la misma semántica.

## 5.4 Formularios

- **Todo campo tiene un label visible y asociado.** El placeholder no reemplaza
  al label: desaparece justo cuando se lo necesita.
- Los mensajes de validación se asocian al campo con `aria-describedby` y se
  anuncian con `aria-live` al aparecer.
- Los campos obligatorios se marcan de forma perceptible más allá del color.
- **`inputMode` correcto**: un campo de monto abre el teclado numérico
  (`inputMode="decimal"`), no el alfabético. En el teléfono esto es la diferencia
  entre tres toques y diez.

## 5.5 Componentes dinámicos

- Hojas y modales usan `role="dialog"` y `aria-modal="true"`, con foco inicial y
  foco atrapado. Lo resuelve Base UI, pero se verifica.
- Los avisos flotantes se anuncian con `role="alert"` (errores) o una región
  `aria-live="polite"` (el resto).
- **Los botones que son solo un ícono llevan `aria-label`.** Sin excepción.

## 5.6 Listas y tablas

- Las listas de movimientos usan marcado de lista (`ul`/`li`), no un montón de
  divs.
- Cuando hay una tabla de verdad, los encabezados se asocian a las celdas.
- Las acciones por fila anuncian **sobre qué** actúan: "Editar movimiento:
  Supermercado", no solo "Editar".

## 5.7 Movimiento

Toda animación respeta `prefers-reduced-motion`. Ya está resuelto de forma
global en `app/globals.css`; lo que se agregue nuevo tiene que seguir la regla, y
las animaciones atadas al scroll de la landing solo se aplican si la preferencia
lo permite.

## 5.8 Zonas seguras del dispositivo

La app se instala y corre a pantalla completa. El contenido nunca queda debajo de
la barra de estado, de la barra de gestos ni de la muesca: se usan las variables
`--safe-top`, `--safe-bottom`, `--safe-left` y `--safe-right`, nunca `env()`
suelto (así se pueden simular en las pruebas).
