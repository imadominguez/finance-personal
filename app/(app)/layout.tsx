import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/app-shell";
import { FinanceProvider } from "@/components/providers/finance-provider";
import { SincronizarTema } from "@/components/theme/sync-tema";
import { getCurrentUser, requireSession } from "@/lib/auth/dal";
import { getFinanceState } from "@/lib/db/finance-repository";
import { getSavedTheme } from "@/lib/db/theme";

/**
 * Zona autenticada. Lee el estado completo del usuario en el servidor y se lo
 * pasa al provider, así las vistas y toda la lógica de `lib/finance.ts` siguen
 * trabajando con la misma forma de datos que cuando esto era localStorage.
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { userId } = await requireSession();
  const [state, user, tema] = await Promise.all([
    getFinanceState(userId),
    getCurrentUser(),
    getSavedTheme(userId),
  ]);

  return (
    <FinanceProvider initialState={state}>
      {/* Trae a este equipo la apariencia guardada en la cuenta, y viceversa. */}
      <SincronizarTema tema={tema} />
      <TooltipProvider>
        <AppShell user={user}>{children}</AppShell>
      </TooltipProvider>
    </FinanceProvider>
  );
}
