"use client";

import * as React from "react";
import Link from "next/link";
import { Download, LogOut, Settings, UserRound } from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { useInstall } from "@/components/pwa/install-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  user: { email: string; name: string; image: string | null } | null;
}

/**
 * Avatar con el menú de la cuenta.
 *
 * Ojo con dos filos de Base UI, que ya rompieron esto una vez:
 *  - `DropdownMenuLabel` es la etiqueta de un grupo (`Menu.GroupLabel`) y
 *    revienta si no está dentro de un `Menu.Group`. La cabecera de acá es un
 *    div común, que además no debe recibir foco al navegar con el teclado.
 *  - Un `<form>` con submit dentro de un item no funciona: el menú se cierra al
 *    hacer clic y desmonta el formulario antes de que se envíe. Por eso el
 *    cierre de sesión llama a la Server Action desde una transición.
 */
export function UserMenu({ user }: UserMenuProps) {
  const [saliendo, startTransition] = React.useTransition();
  const { puedeInstalar, instalada, instalar } = useInstall();

  if (!user) return null;

  const nombre = user.name.trim() || user.email.split("@")[0];
  const inicial = nombre.charAt(0).toUpperCase();

  function cerrarSesion() {
    startTransition(async () => {
      await logoutAction();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Tu cuenta"
        className={cn(
          "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-hairline bg-surface-raised text-xs font-semibold transition-all duration-200 outline-none",
          "hover:border-brand/50 hover:text-brand focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "aria-expanded:border-brand/60 aria-expanded:bg-brand/10 aria-expanded:text-brand",
        )}
      >
        {user.image ? (
          // Foto de Google. Si falla la carga queda la inicial detrás.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            referrerPolicy="no-referrer"
            className="size-full rounded-full object-cover"
          />
        ) : (
          inicial
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-60 min-w-60 p-1.5"
      >
        <div className="flex items-center gap-2.5 px-1.5 py-2">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              referrerPolicy="no-referrer"
              className="size-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="brand-gradient flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-[#0a0a0a]">
              {inicial}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{nombre}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer px-2 py-2"
          render={<Link href="/ajustes#cuenta" />}
        >
          <UserRound />
          Mi cuenta
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer px-2 py-2"
          render={<Link href="/ajustes" />}
        >
          <Settings />
          Ajustes
        </DropdownMenuItem>

        {/* Solo si el navegador realmente puede instalarla acá y ahora. */}
        {puedeInstalar && !instalada ? (
          <DropdownMenuItem
            className="cursor-pointer px-2 py-2"
            closeOnClick={false}
            onClick={() => void instalar()}
          >
            <Download />
            Instalar la app
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer px-2 py-2"
          disabled={saliendo}
          // `closeOnClick={false}` evita que el menú se desmonte antes de que
          // la acción termine y el router procese la redirección.
          closeOnClick={false}
          onClick={cerrarSesion}
        >
          <LogOut />
          {saliendo ? "Cerrando sesión…" : "Cerrar sesión"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
