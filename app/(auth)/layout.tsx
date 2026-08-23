import Link from "next/link";
import { Wallet } from "lucide-react";

import { APP_NAME } from "@/lib/constants";

/** Marco de las pantallas públicas: una tarjeta centrada, sin navegación. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Link
        href="/"
        className="group mb-6 flex animate-fade-down items-center gap-2.5 transition-opacity hover:opacity-80"
      >
        <span className="brand-gradient flex size-10 items-center justify-center rounded-xl text-[#0a0a0a] shadow-[0_6px_20px_-6px_rgba(232,93,36,0.9)] transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100">
          <Wallet className="size-5" />
        </span>
        <span className="font-heading text-lg font-semibold tracking-tight">
          {APP_NAME}
        </span>
      </Link>

      <main className="w-full max-w-sm">{children}</main>

      <p className="mt-6 max-w-sm text-center text-xs text-muted-foreground">
        Tus movimientos quedan guardados en tu cuenta. Solo vos podés verlos.
      </p>
    </div>
  );
}
