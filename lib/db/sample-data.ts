import "server-only";

import {
  addMonthsToKey,
  currentMonthKey,
  dayInMonth,
  daysInMonthCount,
  todayKey,
} from "@/lib/date";
import { keyToDate } from "@/lib/db/mappers";
import type { MovementKind, PaymentMethod } from "@/lib/types";

/**
 * Datos de ejemplo generados del lado del servidor. A diferencia de la versión
 * de localStorage, las categorías se resuelven por nombre contra las que el
 * usuario tiene realmente en la base.
 */

interface Template {
  category: string;
  description: string;
  min: number;
  max: number;
  timesPerMonth: number;
  method: PaymentMethod;
}

const EXPENSE_TEMPLATES: Template[] = [
  {
    category: "Supermercado",
    description: "Supermercado",
    min: 18000,
    max: 62000,
    timesPerMonth: 5,
    method: "debito",
  },
  {
    category: "Delivery y salidas",
    description: "Delivery",
    min: 7000,
    max: 24000,
    timesPerMonth: 4,
    method: "credito",
  },
  {
    category: "Delivery y salidas",
    description: "Café",
    min: 2500,
    max: 6500,
    timesPerMonth: 6,
    method: "efectivo",
  },
  {
    category: "Transporte",
    description: "Transporte",
    min: 1200,
    max: 9000,
    timesPerMonth: 8,
    method: "debito",
  },
  {
    category: "Ocio",
    description: "Salida",
    min: 9000,
    max: 38000,
    timesPerMonth: 2,
    method: "credito",
  },
  {
    category: "Salud",
    description: "Farmacia",
    min: 6000,
    max: 21000,
    timesPerMonth: 1,
    method: "debito",
  },
  {
    category: "Ropa",
    description: "Ropa",
    min: 20000,
    max: 85000,
    timesPerMonth: 1,
    method: "credito",
  },
  {
    category: "Otros",
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

export interface SampleData {
  transactions: {
    userId: string;
    kind: MovementKind;
    amount: number;
    categoryId: string;
    description: string;
    date: Date;
    method: PaymentMethod;
  }[];
  recurring: {
    userId: string;
    kind: MovementKind;
    description: string;
    categoryId: string;
    amount: number;
    dayOfMonth: number;
    startMonth: string;
    endMonth: string | null;
    active: boolean;
    skipped: string[];
  }[];
  installments: {
    userId: string;
    description: string;
    categoryId: string;
    totalAmount: number;
    installments: number;
    firstMonth: string;
    dayOfMonth: number;
    method: PaymentMethod;
  }[];
  monthlyBudget: number;
}

/**
 * @param categoryIdByName mapa nombre → id de las categorías del usuario.
 *   Las plantillas cuya categoría no exista simplemente se omiten.
 */
export function buildSampleData(
  userId: string,
  categoryIdByName: Map<string, string>,
): SampleData {
  const random = seededRandom(20260823);
  const today = todayKey();
  const thisMonth = currentMonthKey();

  const data: SampleData = {
    transactions: [],
    recurring: [],
    installments: [],
    monthlyBudget: 1450000,
  };

  for (let offset = -11; offset <= 0; offset += 1) {
    const month = addMonthsToKey(thisMonth, offset);
    const totalDays = daysInMonthCount(month);

    for (const template of EXPENSE_TEMPLATES) {
      const categoryId = categoryIdByName.get(template.category);
      if (!categoryId) continue;

      const times = Math.max(
        1,
        Math.round(template.timesPerMonth * (0.7 + random() * 0.6)),
      );

      for (let index = 0; index < times; index += 1) {
        const date = dayInMonth(month, 1 + Math.floor(random() * totalDays));
        if (date > today) continue;

        data.transactions.push({
          userId,
          kind: "gasto",
          amount: roundToHundred(
            template.min + random() * (template.max - template.min),
          ),
          categoryId,
          description: template.description,
          date: keyToDate(date),
          method: template.method,
        });
      }
    }

    const freelanceId = categoryIdByName.get("Freelance");
    if (freelanceId && random() > 0.55) {
      const date = dayInMonth(month, 5 + Math.floor(random() * 20));
      if (date <= today) {
        data.transactions.push({
          userId,
          kind: "ingreso",
          amount: roundToHundred(120000 + random() * 380000),
          categoryId: freelanceId,
          description: "Trabajo freelance",
          date: keyToDate(date),
          method: "transferencia",
        });
      }
    }
  }

  const startMonth = addMonthsToKey(thisMonth, -11);

  const recurringTemplates: {
    kind: MovementKind;
    description: string;
    category: string;
    amount: number;
    dayOfMonth: number;
  }[] = [
    {
      kind: "ingreso",
      description: "Sueldo",
      category: "Sueldo",
      amount: 1450000,
      dayOfMonth: 3,
    },
    {
      kind: "gasto",
      description: "Alquiler",
      category: "Alquiler",
      amount: 480000,
      dayOfMonth: 1,
    },
    {
      kind: "gasto",
      description: "Luz, gas y agua",
      category: "Servicios",
      amount: 86000,
      dayOfMonth: 12,
    },
    {
      kind: "gasto",
      description: "Internet y celular",
      category: "Servicios",
      amount: 52000,
      dayOfMonth: 18,
    },
    {
      kind: "gasto",
      description: "Gimnasio",
      category: "Ocio",
      amount: 38000,
      dayOfMonth: 8,
    },
  ];

  for (const template of recurringTemplates) {
    const categoryId = categoryIdByName.get(template.category);
    if (!categoryId) continue;

    data.recurring.push({
      userId,
      kind: template.kind,
      description: template.description,
      categoryId,
      amount: template.amount,
      dayOfMonth: template.dayOfMonth,
      startMonth,
      endMonth: null,
      active: true,
      skipped: [],
    });
  }

  const cuotasId = categoryIdByName.get("Cuotas tarjeta");
  if (cuotasId) {
    data.installments.push(
      {
        userId,
        description: "Notebook",
        categoryId: cuotasId,
        totalAmount: 1560000,
        installments: 12,
        firstMonth: addMonthsToKey(thisMonth, -4),
        dayOfMonth: 15,
        method: "credito",
      },
      {
        userId,
        description: "Heladera",
        categoryId: cuotasId,
        totalAmount: 720000,
        installments: 6,
        firstMonth: addMonthsToKey(thisMonth, -2),
        dayOfMonth: 22,
        method: "credito",
      },
    );
  }

  return data;
}
