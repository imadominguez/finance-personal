import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { APP_NAME } from "@/lib/constants";
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
  title: {
    default: `${APP_NAME} · Gastos del día, del mes y del año`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "Registrá tus gastos e ingresos y mirá en qué se te va la plata día a día, mes a mes y año a año.",
  applicationName: APP_NAME,
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
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
      <body className="min-h-full">{children}</body>
    </html>
  );
}
