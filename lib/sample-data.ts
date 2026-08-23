import {
  addMonthsToKey,
  currentMonthKey,
  dayInMonth,
  daysInMonthCount,
  todayKey,
} from "@/lib/date";
import { createEmptyState, createId } from "@/lib/storage";
import type { FinanceState, Transaction } from "@/lib/types";

interface Template {
  categoryId: string;
  description: string;
  min: number;
  max: number;
  /** Cuántas veces por mes aparece, aproximadamente. */
  timesPerMonth: number;
  method: Transaction["method"];
}

const EXPENSE_TEMPLATES: Template[] = [
  {
    categoryId: "cat-supermercado",
    description: "Supermercado",
    min: 18000,
    max: 62000,
    timesPerMonth: 5,
    method: "debito",
  },
  {
    categoryId: "cat-delivery",
    description: "Delivery",
    min: 7000,
    max: 24000,
    timesPerMonth: 4,
    method: "credito",
  },
  {
    categoryId: "cat-delivery",
    description: "Café",
    min: 2500,
    max: 6500,
    timesPerMonth: 6,
    method: "efectivo",
  },
  {
    categoryId: "cat-transporte",
    description: "Transporte",
    min: 1200,
    max: 9000,
    timesPerMonth: 8,
    method: "debito",
  },
  {
    categoryId: "cat-ocio",
    description: "Salida",
    min: 9000,
    max: 38000,
    timesPerMonth: 2,
    method: "credito",
  },
  {
    categoryId: "cat-salud",
    description: "Farmacia",
    min: 6000,
    max: 21000,
    timesPerMonth: 1,
    method: "debito",
  },
  {
    categoryId: "cat-ropa",
    description: "Ropa",
    min: 20000,
    max: 85000,
    timesPerMonth: 1,
    method: "credito",
  },
  {
    categoryId: "cat-otros",
    description: "Varios",
    min: 3000,
    max: 17000,
    timesPerMonth: 2,
    method: "efectivo",
  },
];

/** PRNG con semilla: los datos de ejemplo son siempre los mismos. */
function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function roundToHundred(value: number): number {
  return Math.round(value / 100) * 100;
}

/**
 * Genera 12 meses de movimientos verosímiles para poder ver la app funcionando
 * sin tener que cargar nada a mano. Se puede borrar todo desde Ajustes.
 */
export function buildSampleState(): FinanceState {
  const state = createEmptyState();
  const random = seededRandom(20260823);
  const today = todayKey();
  const thisMonth = currentMonthKey();

  state.settings = {
    ...state.settings,
    monthlyBudget: 1450000,
    displayName: "",
  };

  const transactions: Transaction[] = [];

  for (let offset = -11; offset <= 0; offset += 1) {
    const month = addMonthsToKey(thisMonth, offset);
    const totalDays = daysInMonthCount(month);

    for (const template of EXPENSE_TEMPLATES) {
      const times = Math.max(
        1,
        Math.round(template.timesPerMonth * (0.7 + random() * 0.6)),
      );

      for (let index = 0; index < times; index += 1) {
        const day = 1 + Math.floor(random() * totalDays);
        const date = dayInMonth(month, day);
        if (date > today) continue;

        transactions.push({
          id: createId("tx"),
          kind: "gasto",
          amount: roundToHundred(
            template.min + random() * (template.max - template.min),
          ),
          categoryId: template.categoryId,
          description: template.description,
          date,
          method: template.method,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Un ingreso extra cada tanto (freelance / venta suelta).
    if (random() > 0.55) {
      const date = dayInMonth(month, 5 + Math.floor(random() * 20));
      if (date <= today) {
        transactions.push({
          id: createId("tx"),
          kind: "ingreso",
          amount: roundToHundred(120000 + random() * 380000),
          categoryId: "cat-freelance",
          description: "Trabajo freelance",
          date,
          method: "transferencia",
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  state.transactions = transactions;

  const startMonth = addMonthsToKey(thisMonth, -11);
  const now = new Date().toISOString();

  state.recurring = [
    {
      id: createId("fijo"),
      kind: "ingreso",
      description: "Sueldo",
      categoryId: "cat-sueldo",
      amount: 1450000,
      dayOfMonth: 3,
      startMonth,
      endMonth: null,
      active: true,
      skipped: [],
      createdAt: now,
    },
    {
      id: createId("fijo"),
      kind: "gasto",
      description: "Alquiler",
      categoryId: "cat-alquiler",
      amount: 480000,
      dayOfMonth: 1,
      startMonth,
      endMonth: null,
      active: true,
      skipped: [],
      createdAt: now,
    },
    {
      id: createId("fijo"),
      kind: "gasto",
      description: "Luz, gas y agua",
      categoryId: "cat-servicios",
      amount: 86000,
      dayOfMonth: 12,
      startMonth,
      endMonth: null,
      active: true,
      skipped: [],
      createdAt: now,
    },
    {
      id: createId("fijo"),
      kind: "gasto",
      description: "Internet y celular",
      categoryId: "cat-servicios",
      amount: 52000,
      dayOfMonth: 18,
      startMonth,
      endMonth: null,
      active: true,
      skipped: [],
      createdAt: now,
    },
    {
      id: createId("fijo"),
      kind: "gasto",
      description: "Gimnasio",
      categoryId: "cat-ocio",
      amount: 38000,
      dayOfMonth: 8,
      startMonth,
      endMonth: null,
      active: true,
      skipped: [],
      createdAt: now,
    },
  ];

  state.installments = [
    {
      id: createId("cuota"),
      description: "Notebook",
      categoryId: "cat-cuotas",
      totalAmount: 1560000,
      installments: 12,
      firstMonth: addMonthsToKey(thisMonth, -4),
      dayOfMonth: 15,
      method: "credito",
      createdAt: now,
    },
    {
      id: createId("cuota"),
      description: "Heladera",
      categoryId: "cat-cuotas",
      totalAmount: 720000,
      installments: 6,
      firstMonth: addMonthsToKey(thisMonth, -2),
      dayOfMonth: 22,
      method: "credito",
      createdAt: now,
    },
  ];

  return state;
}
