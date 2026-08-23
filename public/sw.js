/*
 * Service worker de Mis Finanzas.
 *
 * REGLA IMPORTANTE: no se cachea NINGÚN HTML de la zona autenticada.
 * Las pantallas de la app llevan los movimientos de una persona; guardarlas en
 * el disco del navegador haría que, en un dispositivo compartido, la siguiente
 * persona pudiera ver los números de la anterior desde la caché. Solo se
 * guardan recursos estáticos (que son iguales para todos) y la pantalla de
 * "sin conexión".
 */

const VERSION = "v1";
const STATIC_CACHE = `estaticos-${VERSION}`;
const OFFLINE_URL = "/sin-conexion";

/** Lo mínimo para que algo se pueda mostrar sin red. */
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      // Si algo del precache falla, el service worker igual se instala:
      // es preferible una app sin pantalla offline que una app sin worker.
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/** Los assets con hash de Next son inmutables: se pueden cachear sin miedo. */
function isImmutableAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest"
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Solo GET: nunca interceptar Server Actions ni envíos de formularios.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navegación: siempre a la red. Si no hay, se muestra la pantalla offline.
  // Nunca se guarda la respuesta: es HTML con datos de una cuenta.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(OFFLINE_URL);
        return (
          cached ??
          new Response("Sin conexión", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          })
        );
      })
    );
    return;
  }

  // Estáticos: primero caché, y si no está se busca y se guarda.
  if (isImmutableAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
  }

  // Todo lo demás (datos, RSC) va a la red sin tocar la caché.
});

/** Permite activar una versión nueva sin esperar a que se cierren las pestañas. */
self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});
