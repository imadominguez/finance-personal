"use client";

import * as React from "react";
import { Play } from "lucide-react";

import { cn } from "@/lib/utils";

/** Lo que se ve en cada tramo. Sirve de alternativa textual y de índice. */
const CAPITULOS = [
  {
    t: "0:00",
    titulo: "El problema",
    detalle: "Cobrás, gastás todo el mes y a fin de mes no sabés en qué.",
  },
  {
    t: "0:09",
    titulo: "Cómo se usa",
    detalle: "Anotás el monto, elegís la categoría y listo.",
  },
  {
    t: "0:15",
    titulo: "Tu día",
    detalle: "Cuánto llevás gastado hoy y cuánto te queda por día.",
  },
  {
    t: "0:21",
    titulo: "Tu mes",
    detalle: "En qué se te fue, categoría por categoría.",
  },
  {
    t: "0:27",
    titulo: "Tu año",
    detalle: "La foto completa de los doce meses.",
  },
  {
    t: "0:31",
    titulo: "Fijos y cuotas",
    detalle: "Se cargan una vez y aparecen solos cada mes.",
  },
];

/**
 * Video introductorio de la landing.
 *
 * Arranca con el póster y `preload="none"`: quien entra a leer no se baja un
 * mega de video sin haberlo pedido. Al tocar reproducir se carga y se muestran
 * los controles nativos, que ya vienen accesibles y traducidos por el navegador.
 *
 * No tiene audio, así que no lleva subtítulos; la alternativa textual es la
 * lista de capítulos, que además sirve para saltar a un tramo.
 */
export function IntroVideo({ className }: { className?: string }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [iniciado, setIniciado] = React.useState(false);

  function reproducir(segundos = 0) {
    const video = videoRef.current;
    if (!video) return;

    setIniciado(true);
    if (segundos > 0) video.currentTime = segundos;
    // Puede fallar si el navegador bloquea la reproducción: no es motivo de error.
    void video.play().catch(() => undefined);
  }

  return (
    <div className={cn("flex flex-col gap-6 lg:flex-row lg:gap-8", className)}>
      <figure className="min-w-0 flex-1">
        <div className="surface-card revelar relative overflow-hidden rounded-2xl">
          <video
            ref={videoRef}
            className="aspect-video w-full bg-surface"
            poster="/video/poster.jpg"
            preload="none"
            controls={iniciado}
            playsInline
            muted
            aria-label="Video introductorio de Mis Finanzas: qué es, para qué sirve y cómo se usa"
            onPlay={() => setIniciado(true)}
          >
            {/* WebM primero: pesa menos donde se soporta. MP4 cubre el resto. */}
            <source src="/video/intro.webm" type="video/webm" />
            <source src="/video/intro.mp4" type="video/mp4" />
            Tu navegador no puede reproducir el video. Abajo está el mismo
            recorrido en texto.
          </video>

          {!iniciado ? (
            <button
              type="button"
              onClick={() => reproducir()}
              aria-label="Reproducir el video introductorio"
              className="group absolute inset-0 flex items-center justify-center bg-background/25 transition-colors duration-300 hover:bg-background/10"
            >
              <span className="brand-gradient flex size-16 items-center justify-center rounded-full text-[#0a0a0a] shadow-[0_10px_40px_-8px_rgba(232,93,36,0.9)] transition-transform duration-300 group-hover:scale-110 motion-reduce:group-hover:scale-100">
                <Play className="size-7 translate-x-0.5 fill-current" />
              </span>
            </button>
          ) : null}
        </div>

        <figcaption className="mt-3 text-xs text-muted-foreground">
          39 segundos, sin sonido. Mostrado con datos de ejemplo.
        </figcaption>
      </figure>

      {/* Índice: alternativa textual y atajo para saltar a un tramo */}
      <ol className="revelar-hijos flex shrink-0 flex-col gap-1 lg:w-72">
        {CAPITULOS.map((capitulo) => {
          const [minutos, segundos] = capitulo.t.split(":").map(Number);
          return (
            <li key={capitulo.t}>
              <button
                type="button"
                onClick={() => reproducir(minutos * 60 + segundos)}
                className="group flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors duration-200 hover:bg-surface-raised"
              >
                <span className="mt-0.5 shrink-0 text-xs tabular text-muted-foreground transition-colors group-hover:text-brand">
                  {capitulo.t}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">
                    {capitulo.titulo}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                    {capitulo.detalle}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
