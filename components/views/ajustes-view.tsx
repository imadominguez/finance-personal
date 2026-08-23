"use client";

import * as React from "react";
import { Check, Download, RotateCcw, Sparkles, Upload } from "lucide-react";

import { SectionCard } from "@/components/finance/section-card";
import { useFinanceReady } from "@/components/providers/finance-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { CURRENCIES } from "@/lib/constants";
import { formatMoney, parseAmountInput } from "@/lib/format";
import { jsonToState, stateToJson } from "@/lib/storage";

/** Preferencias, respaldo de datos y borrado. */
export function AjustesView() {
  const { state, updateSettings, replaceState, resetAll, loadSampleData } =
    useFinanceReady();

  const [budget, setBudget] = React.useState(
    String(state.settings.monthlyBudget || ""),
  );
  const [name, setName] = React.useState(state.settings.displayName);
  const [saved, setSaved] = React.useState(false);
  const [importError, setImportError] = React.useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const parsedBudget = parseAmountInput(budget);

  function handleSavePreferences(event: React.FormEvent) {
    event.preventDefault();

    updateSettings({
      monthlyBudget:
        Number.isFinite(parsedBudget) && parsedBudget > 0 ? parsedBudget : 0,
      displayName: name.trim(),
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleCurrencyChange(currency: string) {
    const option = CURRENCIES.find((item) => item.value === currency);
    updateSettings({
      currency,
      locale: option?.locale ?? state.settings.locale,
    });
  }

  function handleExport() {
    const blob = new Blob([stateToJson(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `finanzas-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      replaceState(jsonToState(text));
      setImportError(null);
    } catch {
      setImportError("El archivo no tiene el formato esperado.");
    } finally {
      // Permite volver a elegir el mismo archivo.
      event.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="animate-fade-up">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Ajustes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tu presupuesto, la moneda y el respaldo de tus datos.
        </p>
      </header>

      <SectionCard
        title="Presupuesto mensual"
        description="Es la referencia de la barra de avance: tu sueldo o el tope que te querés poner"
        delay={60}
      >
        <form onSubmit={handleSavePreferences} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budget">Sueldo o tope por mes</Label>
            <Input
              id="budget"
              inputMode="decimal"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              placeholder="0"
              className="h-11 text-lg font-semibold tabular"
            />
            <p className="h-4 text-xs text-muted-foreground">
              {Number.isFinite(parsedBudget) && parsedBudget > 0
                ? formatMoney(parsedBudget, state.settings)
                : "Dejalo en blanco para no mostrar la barra de avance."}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Tu nombre (opcional)</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Para saludarte en el dashboard"
            />
          </div>

          <Button type="submit" size="lg" className="self-start">
            {saved ? <Check /> : null}
            {saved ? "Guardado" : "Guardar cambios"}
          </Button>
        </form>
      </SectionCard>

      <SectionCard
        title="Moneda"
        description="Cómo se muestran los montos"
        delay={120}
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currency">Moneda</Label>
          <NativeSelect
            id="currency"
            className="w-full sm:w-72"
            value={state.settings.currency}
            onChange={(event) => handleCurrencyChange(event.target.value)}
          >
            {CURRENCIES.map((currency) => (
              <NativeSelectOption key={currency.value} value={currency.value}>
                {currency.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <p className="mt-1 text-xs text-muted-foreground">
            Ejemplo: {formatMoney(1234567, state.settings)}
          </p>
        </div>
      </SectionCard>

      <SectionCard
        title="Tus datos"
        description="Todo se guarda en este navegador. Exportá para tener un respaldo o pasarlo a otro dispositivo."
        delay={180}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="lg" onClick={handleExport}>
              <Download />
              Exportar JSON
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload />
              Importar JSON
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImport}
              className="hidden"
            />

            <Button variant="outline" size="lg" onClick={loadSampleData}>
              <Sparkles />
              Cargar datos de ejemplo
            </Button>
          </div>

          {importError ? (
            <p className="animate-fade-in rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {importError}
            </p>
          ) : null}

          <dl className="grid grid-cols-3 gap-2 text-center">
            <DataCount label="Movimientos" value={state.transactions.length} />
            <DataCount label="Fijos" value={state.recurring.length} />
            <DataCount label="Cuotas" value={state.installments.length} />
          </dl>
        </div>
      </SectionCard>

      <SectionCard
        title="Borrar todo"
        description="Elimina movimientos, fijos, cuotas y preferencias de este dispositivo"
        delay={240}
        className="border-destructive/25"
      >
        {confirmingReset ? (
          <div className="flex animate-fade-in flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3">
            <p className="text-sm text-destructive">
              Esto no se puede deshacer. ¿Seguro que querés borrar todo?
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => {
                  resetAll();
                  setConfirmingReset(false);
                }}
              >
                <RotateCcw />
                Sí, borrar todo
              </Button>
              <Button variant="ghost" onClick={() => setConfirmingReset(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="destructive"
            onClick={() => setConfirmingReset(true)}
          >
            <RotateCcw />
            Borrar todos mis datos
          </Button>
        )}
      </SectionCard>
    </div>
  );
}

function DataCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-raised/50 p-3">
      <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-bold tabular">{value}</dd>
    </div>
  );
}
