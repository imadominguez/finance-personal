import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/app-shell";
import { FinanceProvider } from "@/components/providers/finance-provider";
import { getCurrentUser, requireSession } from "@/lib/auth/dal";
import { getFinanceState } from "@/lib/db/finance-repository";

/**
 * Zona autenticada. Lee el estado completo del usuario en el servidor y se lo
 * pasa al provider, así las vistas y toda la lógica de `lib/finance.ts` siguen
 * trabajando con la misma forma de datos que cuando esto era localStorage.
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { userId } = await requireSession();
  const [state, user] = await Promise.all([
    getFinanceState(userId),
    getCurrentUser(),
  ]);

  return (
    <FinanceProvider initialState={state}>
      <TooltipProvider>
        <AppShell user={user}>{children}</AppShell>
      </TooltipProvider>
    </FinanceProvider>
  );
}
