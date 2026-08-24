"use client";

import * as React from "react";
import {
  Check,
  Download,
  HardDriveDownload,
  Loader2,
  LogOut,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";

import { deleteAccountAction, logoutAction } from "@/app/actions/auth";
import { SectionCard } from "@/components/finance/section-card";
import { InstallButton } from "@/components/pwa/install-button";
import { ThemeSettings } from "@/components/theme/theme-settings";
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
import {
  clearLegacyLocalState,
  readLegacyLocalState,
  stateToJson,
} from "@/lib/storage";

interface AjustesViewProps {
  user: { email: string; name: string } | null;
}

/** Preferencias, respaldo de datos y cuenta. */
export function AjustesView({ user }: AjustesViewProps) {
  const {
    state,
    updateSettings,
    importState,
    resetAll,
    loadSampleData,
    pending,
  } = useFinanceReady();

  const [budget, setBudget] = React.useState(
    String(state.settings.monthlyBudget || ""),
  );
  const [name, setName] = React.useState(state.settings.displayName);
  const [saved, setSaved] = React.useState(false);
  const [importError, setImportError] = React.useState<string | null>(null);
  const [importing, setImporting] = React.useState(false);
  const [confirmingReset, setConfirmingReset] = React.useState(false);
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
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

  async function runImport(json: string, onSuccess?: () => void) {
    setImporting(true);
    setImportError(null);

    const result = await importState(json);
    if (result.ok) onSuccess?.();
    else setImportError(result.error ?? "No se pudo importar el archivo");

    setImporting(false);
  }

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    await runImport(await file.text());
    // Permite volver a elegir el mismo archivo.
    event.target.value = "";
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="animate-fade-up">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Ajustes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tu presupuesto, la moneda, cómo se ve la app y tu cuenta.
        </p>
      </header>

      <LegacyImportCard onImport={runImport} importing={importing} />

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

          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="self-start"
          >
            {saved ? <Check /> : null}
            {saved ? "Guardado" : "Guardar cambios"}
          </Button>
        </form>
      </SectionCard>

      <SectionCard
        title="Apariencia"
        description="El modo, el color y los bordes de la app. Se aplica al instante."
        delay={80}
      >
        <ThemeSettings />
      </SectionCard>

      <SectionCard
        title="Instalar la app"
        description="Se abre a pantalla completa y queda con su ícono junto al resto de tus apps"
        delay={100}
      >
        <InstallButton />
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
        description="Están guardados en tu cuenta. Exportá un JSON para tener un respaldo."
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
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
            >
              {importing ? <Loader2 className="animate-spin" /> : <Upload />}
              Importar JSON
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="hidden"
            />

            <Button
              variant="outline"
              size="lg"
              disabled={pending}
              onClick={loadSampleData}
            >
              <Sparkles />
              Cargar datos de ejemplo
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Importar reemplaza todo lo que tengas cargado.
          </p>

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
        id="cuenta"
        title="Tu cuenta"
        description={user?.email ?? ""}
        delay={240}
      >
        <div className="flex flex-wrap gap-2">
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="lg">
              <LogOut />
              Cerrar sesión
            </Button>
          </form>
        </div>
      </SectionCard>

      <SectionCard
        title="Zona de riesgo"
        description="Estas acciones no se pueden deshacer"
        delay={300}
        className="border-destructive/25"
      >
        <div className="flex flex-col gap-4">
          {confirmingReset ? (
            <Confirm
              message="Se borran todos tus movimientos, fijos y cuotas. Tu cuenta sigue existiendo."
              confirmLabel="Sí, borrar mis datos"
              icon={RotateCcw}
              onConfirm={() => {
                resetAll();
                setConfirmingReset(false);
              }}
              onCancel={() => setConfirmingReset(false)}
            />
          ) : (
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => setConfirmingReset(true)}
              className="self-start"
            >
              <RotateCcw />
              Borrar todos mis datos
            </Button>
          )}

          {confirmingDelete ? (
            <form action={deleteAccountAction}>
              <div className="flex animate-fade-in flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3">
                <p className="text-sm text-destructive">
                  Se elimina tu cuenta y todo lo que tengas cargado. No hay
                  vuelta atrás.
                </p>
                <div className="flex gap-2">
                  <Button type="submit" variant="destructive">
                    <Trash2 />
                    Sí, eliminar mi cuenta
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setConfirmingDelete(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <Button
              variant="destructive"
              onClick={() => setConfirmingDelete(true)}
              className="self-start"
            >
              <Trash2 />
              Eliminar mi cuenta
            </Button>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

/**
 * Aparece solo si este navegador todavía tiene datos de la versión anterior
 * (la que guardaba en localStorage), para poder subirlos a la cuenta.
 */
function LegacyImportCard({
  onImport,
  importing,
}: {
  onImport: (json: string, onSuccess?: () => void) => Promise<void>;
  importing: boolean;
}) {
  // localStorage es una fuente externa a React y no existe en el servidor:
  // `useSyncExternalStore` la lee sin provocar un render en cascada y devuelve
  // `null` durante el render del servidor, así no hay desajuste de hidratación.
  const legacy = React.useSyncExternalStore(
    subscribeToNothing,
    readLegacyLocalState,
    () => null,
  );
  const [done, setDone] = React.useState(false);

  if (!legacy || done) return null;

  return (
    <SectionCard
      title="Tenés datos guardados en este navegador"
      description="Son de la versión anterior de la app, la que guardaba todo en este dispositivo."
      className="border-brand/40"
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Podés subirlos a tu cuenta para tenerlos en cualquier dispositivo.
          Esto reemplaza lo que tengas cargado ahora.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="lg"
            disabled={importing}
            onClick={() =>
              onImport(legacy, () => {
                clearLegacyLocalState();
                setDone(true);
              })
            }
          >
            {importing ? (
              <Loader2 className="animate-spin" />
            ) : (
              <HardDriveDownload />
            )}
            Subir esos datos a mi cuenta
          </Button>
          <Button variant="ghost" size="lg" onClick={() => setDone(true)}>
            Ahora no
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}

/** El localStorage heredado no cambia mientras la pantalla está abierta. */
function subscribeToNothing(): () => void {
  return () => {};
}

function Confirm({
  message,
  confirmLabel,
  icon: Icon,
  onConfirm,
  onCancel,
}: {
  message: string;
  confirmLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex animate-fade-in flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3">
      <p className="text-sm text-destructive">{message}</p>
      <div className="flex gap-2">
        <Button variant="destructive" onClick={onConfirm}>
          <Icon className="size-4" />
          {confirmLabel}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
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
