import type { Category, PaymentMethod, Settings } from "@/lib/types";

export const STORAGE_KEY = "finanzas-personales:v1";
export const STATE_VERSION = 1;

export const APP_NAME = "Mis Finanzas";

export const DEFAULT_SETTINGS: Settings = {
  monthlyBudget: 0,
  currency: "ARS",
  locale: "es-AR",
  displayName: "",
};

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "efectivo", label: "Efectivo" },
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
  { value: "transferencia", label: "Transferencia" },
  { value: "otro", label: "Otro" },
];

export const CURRENCIES = [
  { value: "ARS", label: "Peso argentino (ARS)", locale: "es-AR" },
  { value: "USD", label: "Dólar (USD)", locale: "en-US" },
  { value: "EUR", label: "Euro (EUR)", locale: "es-ES" },
  { value: "CLP", label: "Peso chileno (CLP)", locale: "es-CL" },
  { value: "COP", label: "Peso colombiano (COP)", locale: "es-CO" },
  { value: "MXN", label: "Peso mexicano (MXN)", locale: "es-MX" },
  { value: "UYU", label: "Peso uruguayo (UYU)", locale: "es-UY" },
  { value: "PEN", label: "Sol peruano (PEN)", locale: "es-PE" },
  { value: "BRL", label: "Real (BRL)", locale: "pt-BR" },
];

/** Íconos disponibles al crear/editar una categoría. */
export const CATEGORY_ICONS = [
  "Home",
  "ShoppingCart",
  "Utensils",
  "Truck",
  "CreditCard",
  "Zap",
  "Bus",
  "Car",
  "Fuel",
  "Stethoscope",
  "HeartPulse",
  "Popcorn",
  "Gamepad2",
  "Music",
  "Shirt",
  "Scissors",
  "GraduationCap",
  "BookOpen",
  "Dumbbell",
  "PawPrint",
  "Baby",
  "Coffee",
  "Wifi",
  "Smartphone",
  "Laptop",
  "Plane",
  "Gift",
  "Hammer",
  "Umbrella",
  "PiggyBank",
  "Landmark",
  "Briefcase",
  "Banknote",
  "TrendingUp",
  "Sprout",
  "Star",
  "Receipt",
  "MoreHorizontal",
] as const;

/** Paleta para categorías nuevas (naranjas del sistema + neutros de apoyo). */
export const CATEGORY_COLORS = [
  "#e85d24",
  "#ff8c42",
  "#d97634",
  "#c45628",
  "#f0a070",
  "#e8956b",
  "#ffb27a",
  "#b34a1f",
  "#10b981",
  "#3b82f6",
  "#a855f7",
  "#ef4444",
  "#f59e0b",
  "#14b8a6",
];

/**
 * Categorías con las que arranca la app. Salen de DESIGN.md y cubren el uso
 * típico del día a día; el usuario puede editarlas o agregar las suyas.
 */
export const SEED_CATEGORIES: Category[] = [
  {
    id: "cat-alquiler",
    name: "Alquiler",
    kind: "gasto",
    color: "#e85d24",
    icon: "Home",
    system: true,
  },
  {
    id: "cat-supermercado",
    name: "Supermercado",
    kind: "gasto",
    color: "#ff8c42",
    icon: "ShoppingCart",
    system: true,
  },
  {
    id: "cat-delivery",
    name: "Delivery y salidas",
    kind: "gasto",
    color: "#d97634",
    icon: "Utensils",
    system: true,
  },
  {
    id: "cat-cuotas",
    name: "Cuotas tarjeta",
    kind: "gasto",
    color: "#c45628",
    icon: "CreditCard",
    system: true,
  },
  {
    id: "cat-servicios",
    name: "Servicios",
    kind: "gasto",
    color: "#f0a070",
    icon: "Zap",
    system: true,
  },
  {
    id: "cat-transporte",
    name: "Transporte",
    kind: "gasto",
    color: "#e8956b",
    icon: "Bus",
    system: true,
  },
  {
    id: "cat-salud",
    name: "Salud",
    kind: "gasto",
    color: "#14b8a6",
    icon: "Stethoscope",
  },
  {
    id: "cat-ocio",
    name: "Ocio",
    kind: "gasto",
    color: "#a855f7",
    icon: "Popcorn",
  },
  {
    id: "cat-ropa",
    name: "Ropa",
    kind: "gasto",
    color: "#3b82f6",
    icon: "Shirt",
  },
  {
    id: "cat-educacion",
    name: "Educación",
    kind: "gasto",
    color: "#f59e0b",
    icon: "GraduationCap",
  },
  {
    id: "cat-otros",
    name: "Otros",
    kind: "gasto",
    color: "#a8a8a8",
    icon: "MoreHorizontal",
    system: true,
  },
  {
    id: "cat-sueldo",
    name: "Sueldo",
    kind: "ingreso",
    color: "#10b981",
    icon: "Banknote",
    system: true,
  },
  {
    id: "cat-freelance",
    name: "Freelance",
    kind: "ingreso",
    color: "#34d399",
    icon: "Briefcase",
  },
  {
    id: "cat-extras",
    name: "Extras",
    kind: "ingreso",
    color: "#6ee7b7",
    icon: "Gift",
    system: true,
  },
];

export const FALLBACK_CATEGORY_COLOR = "#a8a8a8";
