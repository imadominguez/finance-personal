"use client";

import * as React from "react";

/** Evento no estándar, todavía sin tipos en lib.dom. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type Plataforma = "ios" | "android" | "escritorio";

interface InstallContextValue {
  /** El navegador ofreció instalar: se puede abrir el instalador nativo. */
  puedeInstalar: boolean;
  /** Ya está corriendo instalada, o se instaló en esta sesión. */
  instalada: boolean;
  plataforma: Plataforma;
  /** Abre el instalador del navegador. Devuelve si la persona aceptó. */
  instalar: () => Promise<boolean>;
}

const InstallContext = React.createContext<InstallContextValue | null>(null);

function detectarPlataforma(): Plataforma {
  if (typeof navigator === "undefined") return "escritorio";
  const agente = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(agente)) return "ios";
  if (/android/i.test(agente)) return "android";
  return "escritorio";
}

function yaInstalada(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && Boolean(window.navigator.standalone))
  );
}

/**
 * Captura `beforeinstallprompt` una sola vez, a nivel de aplicación.
 *
 * El navegador lo dispara temprano y una sola vez por carga: si cada botón
 * intentara escucharlo por su cuenta, el que se montara después nunca se
 * enteraría. Guardándolo acá, cualquier pantalla puede ofrecer la instalación.
 */
export function InstallProvider({ children }: { children: React.ReactNode }) {
  const [evento, setEvento] = React.useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [instaladaEnSesion, setInstaladaEnSesion] = React.useState(false);

  const plataforma = React.useSyncExternalStore(
    () => () => {},
    detectarPlataforma,
    (): Plataforma => "escritorio",
  );

  const standalone = React.useSyncExternalStore(
    () => () => {},
    yaInstalada,
    () => false,
  );

  React.useEffect(() => {
    const alPreguntar = (event: Event) => {
      // Se cancela el aviso propio del navegador para ofrecerlo desde el diseño.
      event.preventDefault();
      setEvento(event as BeforeInstallPromptEvent);
    };

    const alInstalar = () => {
      setInstaladaEnSesion(true);
      setEvento(null);
    };

    window.addEventListener("beforeinstallprompt", alPreguntar);
    window.addEventListener("appinstalled", alInstalar);

    return () => {
      window.removeEventListener("beforeinstallprompt", alPreguntar);
      window.removeEventListener("appinstalled", alInstalar);
    };
  }, []);

  const instalar = React.useCallback(async () => {
    if (!evento) return false;

    await evento.prompt();
    const { outcome } = await evento.userChoice;

    // El evento no se puede reutilizar: el navegador manda uno nuevo si aplica.
    setEvento(null);
    return outcome === "accepted";
  }, [evento]);

  const value = React.useMemo<InstallContextValue>(
    () => ({
      puedeInstalar: evento !== null,
      instalada: standalone || instaladaEnSesion,
      plataforma,
      instalar,
    }),
    [evento, standalone, instaladaEnSesion, plataforma, instalar],
  );

  return (
    <InstallContext.Provider value={value}>{children}</InstallContext.Provider>
  );
}

export function useInstall(): InstallContextValue {
  const context = React.useContext(InstallContext);
  if (!context) {
    throw new Error("useInstall debe usarse dentro de <InstallProvider />");
  }
  return context;
}
