# Video introductorio, hecho con HTML

El video de la landing no se grabó con una cámara ni se editó en un programa de
video: es **HTML y CSS animados, capturados cuadro por cuadro**. La fuente vive
acá y se puede versionar, revisar en un diff y regenerar.

## Por qué así

Un explicativo de producto es, en el fondo, la interfaz moviéndose con texto
encima. Hacerlo en HTML tiene tres ventajas concretas:

- **Usa el diseño real**: los mismos colores, la misma tipografía y las mismas
  proporciones que la app. No se desincroniza con capturas viejas.
- **Se edita como código**: cambiar una frase es cambiar una línea, no volver a
  grabar y re-editar.
- **Sale nítido**: el texto se rasteriza a la resolución de salida, no se
  reescala desde una captura.

## Cómo funciona

El punto importante es **no depender de un grabador de pantalla**. Grabar la
pantalla mientras corren animaciones CSS pierde cuadros y el resultado depende
de lo rápido que vaya la máquina.

En vez de eso, `storyboard.js` no anima nada por su cuenta: expone una función
`seek(t)` que dibuja el estado exacto del video en el segundo `t`. El grabador
pide `seek(0)`, saca una foto, pide `seek(1/30)`, saca otra, y así. El resultado
son 30 cuadros por segundo exactos y reproducibles: dos corridas dan el mismo
archivo.

Los PNG van **por tubería directa a ffmpeg**, sin pasar por disco: 1170 cuadros
en disco serían cientos de megas.

```
storyboard.html + storyboard.js
        │  (Chromium, seek(t) + screenshot)
        ▼
   cuadros PNG ──tubería──▶ ffmpeg ──▶ master.mp4 (CRF 18)
                                          │
                        ┌─────────────────┼─────────────────┐
                        ▼                 ▼                 ▼
                   intro.mp4         intro.webm         poster.jpg
                  (H.264, iOS)      (VP9, liviano)    (antes de tocar play)
```

## Regenerarlo

Hace falta `ffmpeg` con `libx264` y `libvpx-vp9`, y `playwright-core` con un
Chromium disponible.

```bash
node scripts/video/grabar.mjs scripts/video /tmp/master.mp4 public/video
```

Deja `intro.mp4`, `intro.webm` y `poster.jpg` en `public/video/`.

## Editar el contenido

- **Los textos y las escenas** están en `storyboard.html`.
- **Los tiempos** están en el objeto `ESCENAS` de `storyboard.js`. Cambiar la
  duración total es cambiar `DURACION`.
- **Las animaciones** se calculan en `seek(t)` con `p(t, desde, hasta)` para el
  progreso y `easeOut` / `easeInOut` para la curva.

Si cambiás los tiempos, actualizá también la lista de capítulos en
`components/marketing/intro-video.tsx`, que es la alternativa textual del video
y el índice para saltar de tramo.

`inter.woff2` es la misma tipografía que usa la app, copiada de lo que genera
`next/font`, para que el video se vea idéntico a la interfaz.
