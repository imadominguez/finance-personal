import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { InstallProvider } from "@/components/pwa/install-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeScript } from "@/components/theme/theme-script";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker";
import { APP_NAME } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${APP_NAME} · Gastos del día, del mes y del año`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "Registrá tus gastos e ingresos y mirá en qué se te va la plata día a día, mes a mes y año a año.",
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    // El fondo de la app ya es negro: así la barra de estado se funde con él.
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: {
    // Los montos con puntos no son números de teléfono, iOS.
    telephone: false,
  },
  other: {
    // Next emite `mobile-web-app-capable`, que es el estándar. iOS anteriores
    // a 15.4 solo entienden esta variante con prefijo.
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  /*
   * El tema por defecto de la app. Cuando alguien elige otro, el script de
   * `ThemeScript` reescribe este meta antes del primer pintado y el provider
   * lo mantiene al día, así la barra del navegador acompaña a la pantalla.
   */
  themeColor: "#0a0a0a",
  // Para que la app instalada use toda la pantalla, incluido el notch.
  viewportFit: "cover",
  initialScale: 1,
  width: "device-width",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      /*
       * Oscuro es el tema original de la app y lo que se renderiza en el
       * servidor, que no sabe qué eligió esta persona. `ThemeScript` corrige
       * la clase durante el parseo del <head>, antes de que se pinte nada, y
       * `suppressHydrationWarning` le dice a React que el DOM manda.
       */
      className={`dark ${sans.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full">
        {/*
         * Franja bajo la barra de estado en iOS instalado. Su texto es blanco
         * y no se puede cambiar en caliente, así que en modo claro se pinta el
         * fondo. Donde no hay muesca mide 0 y no se ve.
         */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-50 h-(--safe-top) bg-(--franja-estado)"
        />
        <ThemeProvider>
          <InstallProvider>{children}</InstallProvider>
        </ThemeProvider>
        <ServiceWorkerRegistration />
        <Analytics />
      </body>
    </html>
  );
}
