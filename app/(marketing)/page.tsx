import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  CreditCard,
  Download,
  Lock,
  PieChart,
  Repeat,
  Smartphone,
  Sun,
  Target,
} from "lucide-react";

import { HeroPreview } from "@/components/marketing/hero-preview";
import { IntroVideo } from "@/components/marketing/intro-video";
import { MarketingHeader } from "@/components/marketing/site-header";
import {
  Faq,
  FeatureCard,
  Section,
  Step,
  Steps,
} from "@/components/marketing/sections";
import { InstallButton } from "@/components/pwa/install-button";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

const DESCRIPTION =
  "Registrá tus gastos e ingresos y mirá en qué se te va la plata día a día, mes a mes y año a año. Gastos fijos, cuotas y presupuesto, en una app que se instala en tu teléfono.";

export const metadata: Metadata = {
  // La landing es la portada del producto: no lleva el sufijo del template.
  title: { absolute: `${APP_NAME} · Llevá tus finanzas del día a día` },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: APP_NAME,
    title: `${APP_NAME} · Llevá tus finanzas del día a día`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: DESCRIPTION,
  },
};

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto w-full max-w-5xl px-4 pt-12 pb-14 sm:pt-16 sm:pb-16">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
            <div className="max-w-xl text-center lg:text-left">
              <p className="inline-flex animate-fade-down items-center gap-2 rounded-full border border-brand/25 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                <Smartphone className="size-3.5" />
                Se instala en tu teléfono
              </p>

              <h1
                className="mt-5 animate-fade-up font-heading text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl"
                style={{ animationDelay: "60ms" }}
              >
                ¿A dónde se fue{" "}
                <span className="brand-text-gradient">tu sueldo</span>?
              </h1>

              <p
                className="mt-5 animate-fade-up text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg"
                style={{ animationDelay: "120ms" }}
              >
                Anotá lo que gastás en dos toques y {APP_NAME} arma solo el
                resumen de tu día, de tu mes y de tu año. Sin planillas, sin
                cuentas raras.
              </p>

              <div
                className="mt-8 flex animate-fade-up flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
                style={{ animationDelay: "180ms" }}
              >
                <Button
                  size="lg"
                  className="h-11 px-5 text-[0.95rem]"
                  render={<Link href="/ingresar" />}
                >
                  Empezar gratis
                  <ArrowRight />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 px-5 text-[0.95rem]"
                  render={<Link href="/ingresar" />}
                >
                  Ya tengo cuenta
                </Button>
              </div>

              <p
                className="mt-4 animate-fade-up text-xs text-muted-foreground"
                style={{ animationDelay: "240ms" }}
              >
                Gratis, sin tarjeta. Tus datos son tuyos y te los podés llevar
                cuando quieras.
              </p>
            </div>

            <div className="flex w-full justify-center lg:w-auto">
              <HeroPreview />
            </div>
          </div>
        </section>

        {/* Video introductorio */}
        <Section
          id="video"
          eyebrow="En 39 segundos"
          title="Mirá de qué se trata"
          description="Qué problema resuelve, cómo se carga un gasto y qué vas a ver en el día, en el mes y en el año."
        >
          <IntroVideo />
        </Section>

        {/* Qué hace */}
        <Section
          id="funciones"
          parallax="lento"
          eyebrow="Qué podés hacer"
          title="Todo lo que necesitás para saber en qué gastás"
          description="Nada de funciones de banco. Lo que sirve para el día a día, bien hecho."
        >
          <div className="revelar-hijos grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={Sun} title="El día, sin abrir nada más">
              Cuánto llevás gastado hoy, comparado con tu promedio y con ayer. Y
              cuánto te queda por día para llegar a fin de mes.
            </FeatureCard>

            <FeatureCard
              icon={PieChart}
              title="El mes, categoría por categoría"
            >
              El total, el avance contra tu sueldo, el ranking de categorías y
              el gasto día por día. La respuesta a “¿en qué se me fue?”.
            </FeatureCard>

            <FeatureCard icon={CalendarRange} title="El año completo">
              La tendencia mes a mes, tu mes más caro y el más barato, el
              promedio mensual y el peso de cada categoría en el año.
            </FeatureCard>

            <FeatureCard icon={Repeat} title="Gastos fijos">
              Cargás el alquiler o los servicios una sola vez y aparecen solos
              todos los meses. Si un mes no lo pagaste, lo salteás y listo.
            </FeatureCard>

            <FeatureCard icon={CreditCard} title="Compras en cuotas">
              Anotás el total y en cuántas cuotas. La app las reparte mes a mes
              y te muestra cuántas te quedan por pagar.
            </FeatureCard>

            <FeatureCard icon={Target} title="Tu presupuesto">
              Definís tu sueldo o el tope que te querés poner y una barra te
              muestra si vas adelantado o tranquilo para el mes.
            </FeatureCard>
          </div>
        </Section>

        {/* Cómo funciona */}
        <Section
          id="como-funciona"
          parallax="contrario"
          eyebrow="Cómo funciona"
          title="Tres pasos y ya estás viendo tus números"
        >
          <Steps>
            <Step number={1} title="Creá tu cuenta">
              Email y contraseña. Nada más. Arrancás con las categorías más
              usadas ya cargadas.
            </Step>
            <Step number={2} title="Anotá lo que gastás">
              Monto, categoría y listo. Los gastos fijos y las cuotas se cargan
              una sola vez y después se imputan solos.
            </Step>
            <Step number={3} title="Mirá los resúmenes">
              El día, el mes y el año se arman solos. Con gráficos,
              comparaciones contra el período anterior y una proyección de
              cierre de mes.
            </Step>
          </Steps>
        </Section>

        {/* Confianza */}
        <Section
          id="tus-datos"
          parallax="lento"
          eyebrow="Tus datos"
          title="Son tuyos, y te los podés llevar"
          description="Una app de finanzas ve cosas privadas. Estas son las reglas."
        >
          <div className="revelar-hijos grid gap-4 sm:grid-cols-3">
            <FeatureCard icon={Lock} title="Solo vos los ves">
              Cada cuenta está aislada: tus movimientos no se cruzan con los de
              nadie. Las contraseñas se guardan con hash, nunca en texto plano.
            </FeatureCard>

            <FeatureCard icon={Download} title="Exportables cuando quieras">
              Un botón te baja todo en un archivo JSON. Sin pedir permiso, sin
              trámites y sin quedarte atado a la app.
            </FeatureCard>

            <FeatureCard icon={Smartphone} title="En todos tus dispositivos">
              Entrás con tu cuenta desde el teléfono o la computadora y ves lo
              mismo. Se instala como app y se abre a pantalla completa.
            </FeatureCard>
          </div>

          <div className="mt-8 flex flex-col items-start gap-3">
            <InstallButton />
            <p className="text-xs text-muted-foreground">
              También podés usarla desde el navegador, sin instalar nada.
            </p>
          </div>

          <InstallPrompt className="mt-6 max-w-md" />
        </Section>

        {/* Preguntas */}
        <Section
          id="preguntas"
          eyebrow="Preguntas"
          title="Lo que se suele preguntar"
        >
          <div className="revelar-hijos flex max-w-3xl flex-col gap-3">
            <Faq question="¿Cuánto cuesta?">
              Nada. No hay plan pago, ni prueba que vence, ni tarjeta.
            </Faq>
            <Faq question="¿Se conecta con mi banco?">
              No, y es a propósito: no te pedimos claves de home banking ni
              acceso a tus cuentas. Los movimientos los cargás vos, que es lo
              que hace que después los números te cierren.
            </Faq>
            <Faq question="¿Puedo usarla en otra moneda?">
              Sí. En Ajustes elegís la moneda y todos los montos se muestran con
              el formato que corresponde.
            </Faq>
            <Faq question="¿Qué pasa si me quedo sin internet?">
              La app avisa que no hay conexión y se recupera sola cuando vuelve.
              Para cargar y ver movimientos necesita red, porque tus datos viven
              en tu cuenta y no en el teléfono.
            </Faq>
            <Faq question="¿Puedo borrar todo?">
              Sí. Podés borrar tus movimientos y dejar la cuenta vacía, o
              eliminar la cuenta entera. En ese caso no queda nada guardado.
            </Faq>
          </div>
        </Section>

        {/* Cierre */}
        <section className="mx-auto w-full max-w-5xl px-4 pb-20">
          <div className="surface-card revelar relative overflow-hidden rounded-3xl px-6 py-14 text-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 animate-glow rounded-full bg-brand/25 blur-3xl"
            />
            <div className="relative">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                Empezá hoy y en un mes vas a saber en qué se te va
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Se tarda menos en crear la cuenta que en abrir una planilla.
              </p>
              <Button
                size="lg"
                className="mt-7 h-11 px-6 text-[0.95rem]"
                render={<Link href="/ingresar" />}
              >
                Crear mi cuenta
                <ArrowRight />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-4 py-8 text-xs text-muted-foreground sm:flex-row">
          <p>
            {APP_NAME} · Hecho para llevar las cuentas del día a día sin
            complicarse.
          </p>
          <nav className="flex items-center gap-4">
            <Link
              href="#funciones"
              className="transition-colors hover:text-brand"
            >
              Funciones
            </Link>
            <Link
              href="#preguntas"
              className="transition-colors hover:text-brand"
            >
              Preguntas
            </Link>
            <Link
              href="/ingresar"
              className="transition-colors hover:text-brand"
            >
              Ingresar
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
