# Bot de WhatsApp

Puente entre WhatsApp y Mis Finanzas. **No forma parte de la app**: es un
proceso aparte con sus propias dependencias.

## Por qué vive afuera de Vercel

[open-wa](https://www.open-wa.org/) maneja una sesión de WhatsApp Web con un
Chromium: necesita un proceso prendido las 24 horas sosteniendo esa sesión.
Vercel es serverless —cada request es un proceso que muere al terminar—, así que
esto va en Railway, Fly, un VPS o cualquier máquina que quede encendida.

## Qué hace (y qué no)

Recibe un mensaje, se lo manda a la app y contesta lo que la app le diga. **No
sabe nada de finanzas**: no interpreta montos, no toca la base, no decide nada.

Eso es a propósito. Si el número se cae o mañana se migra a la API oficial de
Meta, se reemplaza este proceso y el resto queda igual.

## Levantarlo

```bash
cd bot
npm install
APP_URL="https://tu-app.vercel.app" \
WHATSAPP_BOT_TOKEN="el-mismo-secreto-que-en-la-app" \
npm start
```

La primera vez muestra un QR en la terminal: se escanea desde WhatsApp →
Dispositivos vinculados. La sesión queda en `./sesion`.

| Variable | Qué es |
|---|---|
| `APP_URL` | De dónde cuelga la app, sin barra final |
| `WHATSAPP_BOT_TOKEN` | El secreto compartido. **Tiene que ser idéntico** al de la app |
| `SESSION_PATH` | Dónde guardar la sesión. Por defecto `./sesion` |

En un servidor, `SESSION_PATH` tiene que apuntar a un volumen que sobreviva a
los despliegues. Si se pierde, hay que escanear el QR de nuevo a mano.

## Cuidar el número

open-wa no es oficial: va contra los términos de WhatsApp y el número puede
terminar baneado. El código está escrito para reducir ese riesgo:

- **Nunca** manda un mensaje que nadie pidió. Solo responde.
- Una respuesta por mensaje entrante, como mucho.
- Ignora grupos, estados y todo lo que no sea texto en un chat uno a uno.
- El tope por número lo aplica la app (30 mensajes por hora): pasado eso avisa
  una vez y se calla.

Si el número cae, la app sigue funcionando igual: se cargan los gastos a mano
como siempre. Solo se pierde este atajo.

## Un número para todos

Hay un solo bot para todos los usuarios; cada persona se identifica por su
teléfono, que vincula desde Ajustes → *Cargar gastos por WhatsApp*. Si el bot se
cae, se cae para todos a la vez.
