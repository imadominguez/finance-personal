# 7 · Checklist antes de dar algo por terminado

Se aplica a cada pantalla o flujo que se toca. Sirve para quien construye y para
quien revisa.

**Regla de oro: si no se abrió a 360 px, no está probado.**

---

## 7.0 Mobile primero

- [ ] ¿Se miró la pantalla a **360 px** antes que en cualquier otro ancho?
- [ ] ¿El dato más importante entra **sin scroll** en 360×640?
- [ ] ¿La acción principal cae donde llega el pulgar (tercio de abajo)?
- [ ] ¿Se puede completar la tarea con **una sola mano**?
- [ ] ¿Nada se corta ni desborda de costado? (la página nunca scrollea en
      horizontal)
- [ ] ¿Se probó después a 768 y a 1280, **en ese orden**?

## 7.1 Estados

- [ ] ¿Está el estado **vacío**, y por separado el de **filtro sin resultados**
      cuando corresponde?
- [ ] ¿Está el estado de **carga**? (esqueleto en listados, spinner adentro del
      botón en acciones)
- [ ] ¿Está definido el **mensaje de error** de cada punto de falla, redactado
      según la guía de voz?
- [ ] ¿Está claro cómo se comunica el **éxito**? (el cambio visible alcanza, o
      hace falta un aviso)

## 7.2 Interacción

- [ ] ¿El flujo se resuelve en una hoja o modal, **sin navegar a otra página**?
- [ ] ¿Está contemplado el **cierre con cambios sin guardar**?
- [ ] ¿El **foco vuelve** al elemento que abrió la hoja al cerrarla?
- [ ] ¿`Esc` cierra y no se apilan modales sobre modales?

## 7.3 Prevención y recuperación

- [ ] ¿Las validaciones importantes ocurren **mientras se escribe**, no al
      enviar?
- [ ] ¿Toda acción irreversible tiene **confirmación con la consecuencia
      concreta** escrita?
- [ ] ¿Un error al guardar **preserva** lo que ya se había cargado?
- [ ] ¿Se puede disparar la misma acción dos veces por doble toque?

## 7.4 Accesibilidad

- [ ] ¿Todo lo tocable mide **44×44 px** o más, medido a 360 px?
- [ ] ¿El contraste llega a **4.5:1** en todos los estados, en los dos modos y
      con cualquier acento?
- [ ] ¿Se puede recorrer todo el flujo **solo con teclado**?
- [ ] ¿Los botones de solo ícono tienen **`aria-label`**?
- [ ] ¿Los errores y avisos se anuncian con **`role="alert"` o `aria-live`**?
- [ ] ¿Los campos tienen **label visible**, y `inputMode` correcto?
- [ ] ¿El color **no** es lo único que distingue un estado?

## 7.5 Trazabilidad y confianza

- [ ] ¿Se ve **de dónde salió** cada dato? (manual, fijo, cuota)
- [ ] ¿Se puede anticipar el efecto de una acción **antes** de confirmarla?
- [ ] ¿Se ve **cuándo** se creó o modificó, donde importa?

## 7.6 Escalabilidad

- [ ] ¿Sigue siendo usable con **miles** de movimientos?
- [ ] ¿La búsqueda espera a que se termine de escribir?
- [ ] ¿La lista evita dibujar todo de una?

---

## Cómo se verifica

No a ojo. Hay una skill que lo automatiza:

```
/ux-auditoria            # audita la app entera, de 360 a 1280
/ux-auditoria /movimientos   # una sola pantalla
```

Mide áreas táctiles, contraste real sobre la pantalla pintada, desbordes
horizontales, `aria-label` faltantes y orden de foco. Lo que no se puede medir
—si el texto es claro, si el orden tiene sentido— se revisa con este checklist en
la mano.
