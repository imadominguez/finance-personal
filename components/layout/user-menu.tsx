"use client";

import * as React from "react";
import { LogOut, User } from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  user: { email: string; name: string } | null;
}

export function UserMenu({ user }: UserMenuProps) {
  if (!user) return null;

  const initial = (user.name || user.email).charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Tu cuenta"
            className="rounded-full border border-hairline"
          />
        }
      >
        <span className="text-xs font-semibold">{initial}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">
            {user.name || "Tu cuenta"}
          </span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <form action={logoutAction}>
          <DropdownMenuItem
            render={
              <button
                type="submit"
                className="w-full cursor-pointer text-left"
              />
            }
          >
            <LogOut />
            Cerrar sesión
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { User };
