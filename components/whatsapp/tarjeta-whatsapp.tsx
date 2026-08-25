"use client";

import * as React from "react";
import { Check, Copy, Loader2, MessageCircle, Unplug } from "lucide-react";

import {
  desvincularAction,
  generarCodigoAction,
  type CodigoGenerado,
} from "@/app/actions/whatsapp";
import { ConfirmarBorrado } from "@/components/finance/confirmar-borrado";
import { Button } from "@/components/ui/button";
import { enmascararTelefono } from "@/lib/whatsapp/telefono";

/**
 * Conectar WhatsApp desde Ajustes.
 *
 * El código se muestra acá y se manda **desde el teléfono**: es lo único que
 * prueba que ese número es de quien dice serlo. Escribirlo en un formulario no
 * probaría nada.
 */
export function TarjetaWhatsapp({
  telefono,
  numeroDelBot,
}: {
  telefono: string | null;
  /** Número del bot en E.164. Sin esto, el módulo no está configurado. */
  numeroDelBot: string | null;
}) {
  const [codigo, setCodigo] = React.useState<CodigoGenerado | null>(null);
  const [generando, setGenerando] = React.useState(false);
  const [copiado, setCopiado] = React.useState(false);
  const [confirmando, setConfirmando] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!numeroDelBot) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no está configurado el número del bot. Cuando lo esté, vas a
        poder cargar gastos escribiéndole por WhatsApp.
      </p>
    );
  }

  if (telefono) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 px-3 py-3">
          <Check className="size-4 shrink-0 text-success" />
          <div className="min-w-0 text-sm">
            <p className="font-medium">Conectado</p>
            <p className="truncate text-xs text-muted-foreground">
              {enmascararTelefono(telefono)}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Mandale un mensaje al bot y lo cargo: «gasté $20000 en supermercado».
          Respondé BORRAR si me equivoco.
        </p>

        <Button
          variant="outline"
          onClick={() => setConfirmando(true)}
          className="self-start"
        >
          <Unplug />
          Desconectar
        </Button>

        <ConfirmarBorrado
          abierto={confirmando}
          onOpenChange={setConfirmando}
          que="la conexión con WhatsApp"
          consecuencia="Vas a dejar de poder cargar gastos por mensaje. Tus movimientos quedan como están."
          etiqueta="Sí, desconectar"
          onConfirmar={() => void desvincularAction()}
        />
      </div>
    );
  }

  async function conectar() {
    setGenerando(true);
    setError(null);
    try {
      setCodigo(await generarCodigoAction());
    } catch {
      setError("No pudimos generar el código. Probá de nuevo.");
    }
    setGenerando(false);
  }

  const enlace = codigo
    ? `https://wa.me/${numeroDelBot.replace(/\D/g, "")}?text=${encodeURIComponent(`VINCULAR ${codigo.code}`)}`
    : null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Le mandás «gasté $20000 en supermercado» y lo cargo por vos.
      </p>

      {codigo ? (
        <div className="flex animate-fade-in flex-col gap-3">
          <div className="flex flex-col gap-2 rounded-xl border border-brand/30 bg-brand/10 p-4 text-center">
            <span className="text-xs text-muted-foreground">
              Mandale este código al bot
            </span>
            <span className="font-heading text-3xl font-bold tracking-[0.2em] text-brand-realce tabular">
              {codigo.code}
            </span>
            <span className="text-xs text-muted-foreground">
              Vence en 10 minutos
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/*
              Desde el teléfono es un toque: abre el chat con el mensaje ya
              escrito. En la compu el enlace igual sirve con WhatsApp Web.
            */}
            <Button
              size="lg"
              render={
                <a href={enlace ?? "#"} target="_blank" rel="noreferrer" />
              }
            >
              <MessageCircle />
              Abrir WhatsApp
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                void navigator.clipboard?.writeText(codigo.code);
                setCopiado(true);
                window.setTimeout(() => setCopiado(false), 2000);
              }}
            >
              {copiado ? <Check /> : <Copy />}
              {copiado ? "Copiado" : "Copiar el código"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Cuando lo mandes, el bot te confirma y esta pantalla queda
            conectada. Si no pasa nada, recargá.
          </p>
        </div>
      ) : (
        <Button
          size="lg"
          onClick={() => void conectar()}
          disabled={generando}
          className="self-start"
        >
          {generando ? <Loader2 className="animate-spin" /> : <MessageCircle />}
          {generando ? "Generando…" : "Conectar WhatsApp"}
        </Button>
      )}

      {error ? (
        <p className="animate-fade-in rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
