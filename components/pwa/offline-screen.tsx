"use client";

import * as React from "react";
import { CloudOff, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export function OfflineScreen() {
  const [retrying, setRetrying] = React.useState(false);

  React.useEffect(() => {
    // Si vuelve la red, se recarga sola: no hace falta que nadie toque nada.
    const onOnline = () => window.location.reload();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  function retry() {
    setRetrying(true);
    window.location.reload();
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="flex size-16 animate-float items-center justify-center rounded-2xl border border-brand/25 bg-brand/10 text-brand">
        <CloudOff className="size-7" />
      </span>

      <h1 className="mt-5 font-heading text-xl font-bold tracking-tight">
        Te quedaste sin conexión
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {APP_NAME} necesita internet para traer tus movimientos. En cuanto
        vuelva la red, esta pantalla se actualiza sola.
      </p>

      <Button size="lg" onClick={retry} disabled={retrying} className="mt-6">
        <RotateCw className={retrying ? "animate-spin" : undefined} />
        {retrying ? "Reintentando…" : "Reintentar"}
      </Button>
    </div>
  );
}
