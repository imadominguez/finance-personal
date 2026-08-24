"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Wallet } from "lucide-react";

import { DolarBadge } from "@/components/finance/dolar-badge";
import { MainNav } from "@/components/layout/main-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { TransactionDialog } from "@/components/finance/transaction-dialog";
import { ErrorToast } from "@/components/layout/error-toast";
import { ThemeToggle } from "@/components/theme/theme-toggle";
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
  user: { email: string; name: string; image: string | null } | null;
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
      <header className="sticky top-0 z-40 border-b border-hairline bg-background/85 pt-(--safe-top) backdrop-blur-xl">
        <div className="mx-auto w-full max-w-3xl lg:max-w-5xl pr-[max(1rem,var(--safe-right))] pl-[max(1rem,var(--safe-left))]">
          <div className="flex h-14 items-center justify-between gap-3">
            <Link
              href="/hoy"
              className="group -mx-1 flex h-11 items-center gap-2 px-1 transition-opacity hover:opacity-80 sm:h-auto"
            >
              <span className="brand-gradient flex size-8 items-center justify-center rounded-lg text-primary-foreground shadow-[0_4px_16px_-6px_var(--sombra-marca)] transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100">
                <Wallet className="size-4" />
              </span>
              <span className="font-heading text-sm font-semibold tracking-tight">
                {APP_NAME}
              </span>
            </Link>

            {/* Solo aparece si se está viendo en dólares. */}
            <DolarBadge className="mr-auto" />

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
              <ThemeToggle className="hidden sm:inline-flex" />
              <UserMenu user={user} />
            </div>
          </div>

          <MainNav className="pb-2" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl lg:max-w-5xl flex-1 pt-5 pr-[max(1rem,var(--safe-right))] pb-[calc(6rem+var(--safe-bottom))] pl-[max(1rem,var(--safe-left))] sm:pb-[calc(2.5rem+var(--safe-bottom))]">
        {children}
      </main>

      <footer className="mx-auto w-full max-w-3xl lg:max-w-5xl pr-24 pb-[calc(1.5rem+var(--safe-bottom))] pl-[max(1rem,var(--safe-left))] text-center text-xs text-muted-foreground sm:pr-[max(1rem,var(--safe-right))]">
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
        className="fixed right-[calc(1.25rem+var(--safe-right))] bottom-[calc(1.25rem+var(--safe-bottom))] z-40 size-14 rounded-full shadow-[0_10px_30px_-8px_var(--sombra-marca)] transition-transform duration-200 hover:scale-105 active:scale-95 motion-reduce:hover:scale-100 sm:hidden [&_svg:not([class*='size-'])]:size-6"
      >
        <Plus />
      </Button>

      <TransactionDialog open={creating} onOpenChange={setCreating} />

      <ErrorToast />
    </div>
  );
}
