import { CreditCard, Home, ShoppingCart, Utensils, Zap } from "lucide-react";

/**
 * Maqueta del resumen mensual para el hero.
 *
 * Está escrita a mano con los mismos tokens del sistema en vez de ser una
 * captura: queda nítida en cualquier pantalla, pesa nada y sigue al tema
 * —modo y color— que tenga elegido quien la mira.
 */

const CATEGORIES = [
  {
    name: "Alquiler",
    icon: Home,
    color: "var(--chart-1)",
    amount: "$ 480.000",
    share: 36,
    width: 100,
  },
  {
    name: "Cuotas tarjeta",
    icon: CreditCard,
    color: "var(--chart-4)",
    amount: "$ 250.000",
    share: 19,
    width: 52,
  },
  {
    name: "Supermercado",
    icon: ShoppingCart,
    color: "var(--chart-2)",
    amount: "$ 193.400",
    share: 15,
    width: 40,
  },
  {
    name: "Servicios",
    icon: Zap,
    color: "var(--chart-5)",
    amount: "$ 138.000",
    share: 10,
    width: 29,
  },
  {
    name: "Delivery y salidas",
    icon: Utensils,
    color: "var(--chart-3)",
    amount: "$ 78.800",
    share: 6,
    width: 16,
  },
];

export function HeroPreview() {
  return (
    <div
      aria-hidden="true"
      className="surface-card relative w-full max-w-sm animate-fade-up rounded-2xl p-5 shadow-(--sombra-card)"
      style={{ animationDelay: "220ms" }}
    >
      <div className="pointer-events-none absolute -top-20 left-1/2 size-56 -translate-x-1/2 animate-glow rounded-full bg-brand/25 blur-3xl" />

      <div className="relative">
        <p className="font-heading text-base font-bold tracking-tight">
          ¿A dónde se fue tu sueldo?
        </p>
        <p className="text-xs text-muted-foreground">Agosto 2026</p>

        <p className="brand-text-gradient mt-4 text-center text-4xl font-bold tracking-tight tabular">
          $ 1.330.700
        </p>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-hairline">
          <div className="brand-gradient h-full w-[92%] rounded-full" />
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          De $ 1.450.000 te quedan{" "}
          <span className="font-medium text-foreground/80">$ 119.300</span>
        </p>

        <ul className="mt-5 flex flex-col gap-3 border-t border-hairline pt-4">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <li key={category.name} className="flex items-center gap-2.5">
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-lg border"
                  style={{
                    color: category.color,
                    backgroundColor: `color-mix(in oklch, ${category.color} 14%, transparent)`,
                    borderColor: `color-mix(in oklch, ${category.color} 26%, transparent)`,
                  }}
                >
                  <Icon className="size-3.5" strokeWidth={1.75} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[11px] text-foreground/90">
                      {category.name}
                    </span>
                    <span className="shrink-0 text-[11px] font-semibold text-brand tabular">
                      {category.amount}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="h-1 flex-1 overflow-hidden rounded-full bg-hairline">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${category.width}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground tabular">
                      {category.share}%
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
