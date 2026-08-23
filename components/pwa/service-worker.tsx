"use client";

import * as React from "react";

/**
 * Registra el service worker. Va montado en el layout raíz.
 *
 * El registro se difiere hasta después de `load` para no competir por ancho de
 * banda con el primer render, y se salta en desarrollo, donde un worker cacheando
 * assets solo estorba al hot reload.
 */
export function ServiceWorkerRegistration() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator))
      return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((error) => {
          console.error("No se pudo registrar el service worker:", error);
        });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
