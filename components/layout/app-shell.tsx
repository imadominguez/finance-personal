"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Wallet } from "lucide-react";

import { MainNav } from "@/components/layout/main-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { TransactionDialog } from "@/components/finance/transaction-dialog";
import { ErrorToast } from "@/components/layout/error-toast";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

/**
 * Marco de la app: cabecera pegajosa, navegación y el botón de carga rápida.
 * El diálogo de alta vive acá para poder abrirse desde cualquier pantalla.
 */
export function AppShell({
  user,
  children,
}: {
  user: { email: string; name: string } | null;
  children: React.ReactNode;
}) {
  const [creating, setCreating] = React.useState(false);

  // Atajo: "n" abre el alta de movimiento (salvo mientras se escribe en un campo).
  React.useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key !== "n" || event.metaKey || event.ctrlKey || event.altKey)
        return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
        return;
      if (target?.isContentEditable) return;

      event.preventDefault();
      setCreating(true);
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-hairline bg-background/85 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-3xl px-4">
          <div className="flex h-14 items-center justify-between gap-3">
            <Link
              href="/"
              className="group flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <span className="brand-gradient flex size-8 items-center justify-center rounded-lg text-[#0a0a0a] shadow-[0_4px_16px_-6px_rgba(232,93,36,0.9)] transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100">
                <Wallet className="size-4" />
              </span>
              <span className="font-heading text-sm font-semibold tracking-tight">
                {APP_NAME}
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <Button
                size="lg"
                onClick={() => setCreating(true)}
                className="gap-1.5 transition-transform duration-200 hover:-translate-y-px active:translate-y-0 motion-reduce:hover:translate-y-0"
              >
                <Plus />
                <span className="hidden sm:inline">Nuevo movimiento</span>
                <span className="sm:hidden">Nuevo</span>
              </Button>
              <UserMenu user={user} />
            </div>
          </div>

          <MainNav className="pb-2" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-5 pb-24 sm:pb-10">
        {children}
      </main>

      <footer className="mx-auto w-full max-w-3xl px-4 pr-24 pb-6 text-center text-xs text-muted-foreground sm:pr-4">
        Tus datos están guardados en tu cuenta. Podés exportarlos desde{" "}
        <Link
          href="/ajustes"
          className="text-brand underline-offset-4 hover:underline"
        >
          Ajustes
        </Link>
        .
      </footer>

      {/* Acceso rápido en mobile, donde llega el pulgar. */}
      <Button
        size="icon-lg"
        aria-label="Nuevo movimiento"
        onClick={() => setCreating(true)}
        className="fixed right-5 bottom-5 z-40 size-14 rounded-full shadow-[0_10px_30px_-8px_rgba(232,93,36,0.9)] transition-transform duration-200 hover:scale-105 active:scale-95 motion-reduce:hover:scale-100 sm:hidden [&_svg:not([class*='size-'])]:size-6"
      >
        <Plus />
      </Button>

      <TransactionDialog open={creating} onOpenChange={setCreating} />

      <ErrorToast />
    </div>
  );
}
