import Link from "next/link";
import { Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4">
        <Link href="/" className="group flex items-center gap-2">
          <span className="brand-gradient flex size-8 items-center justify-center rounded-lg text-[#0a0a0a] shadow-[0_4px_16px_-6px_rgba(232,93,36,0.9)] transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100">
            <Wallet className="size-4" />
          </span>
          <span className="font-heading text-sm font-semibold tracking-tight">
            {APP_NAME}
          </span>
        </Link>

        <nav className="flex items-center gap-1.5">
          <Button variant="ghost" size="lg" render={<Link href="/ingresar" />}>
            Ingresar
          </Button>
          <Button size="lg" render={<Link href="/crear-cuenta" />}>
            Crear cuenta
          </Button>
        </nav>
      </div>
    </header>
  );
}
