import Link from "next/link";
import { Wallet } from "lucide-react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background/85 pt-(--safe-top) backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 pr-[max(1rem,var(--safe-right))] pl-[max(1rem,var(--safe-left))]">
        <Link href="/" className="group flex items-center gap-2">
          <span className="brand-gradient flex size-8 items-center justify-center rounded-lg text-primary-foreground shadow-[0_4px_16px_-6px_var(--sombra-marca)] transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100">
            <Wallet className="size-4" />
          </span>
          <span className="font-heading text-sm font-semibold tracking-tight">
            {APP_NAME}
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <ThemeToggle />
          {/* Un solo camino: entrar con Google crea la cuenta si no existe. */}
          <Button size="lg" render={<Link href="/ingresar" />}>
            Entrar
          </Button>
        </nav>
      </div>

      {/*
        Avance de lectura. Va atado al scroll del documento con CSS puro; sin
        soporte queda en scaleX(0), o sea invisible, que es la degradación
        correcta para un adorno.
      */}
      <span
        aria-hidden="true"
        className="avance-lectura absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-brand to-brand-light"
        style={{ transform: "scaleX(0)" }}
      />
    </header>
  );
}
