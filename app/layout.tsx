import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { InstallProvider } from "@/components/pwa/install-provider";
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
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  // Para que la app instalada use toda la pantalla, incluido el notch.
  viewportFit: "cover",
  initialScale: 1,
  width: "device-width",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      // La app es dark por diseño (ver DESIGN.md); la clase mantiene activas
      // las variantes dark: de los componentes de shadcn.
      className={`dark ${sans.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <InstallProvider>{children}</InstallProvider>
        <ServiceWorkerRegistration />
        <Analytics />
      </body>
    </html>
  );
}
