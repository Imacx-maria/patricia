import type { CostCategory, TaskPriority, TaskStatus } from "@/types/renovation";

export const STATUS_COLUMNS: { value: TaskStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "Por fazer" },
  { value: "doing", label: "Em curso" },
  { value: "blocked", label: "Bloqueado" },
  { value: "waiting_material", label: "À espera de material" },
  { value: "done", label: "Feito" },
];

export const STATUS_LABELS: Record<TaskStatus, string> = Object.fromEntries(
  STATUS_COLUMNS.map((status) => [status.value, status.label]),
) as Record<TaskStatus, string>;

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
};

export const COST_CATEGORY_LABELS: Record<CostCategory, string> = {
  materials: "Materiais",
  labor: "Mão de obra",
  tools: "Ferramentas",
  furniture: "Mobiliário",
  decoration: "Decoração",
  other: "Outro",
};

export const AREA_NAMES = [
  "Fase 1 - Preparação",
  "Fase 2 - Obra suja",
  "Fase 3 - Infraestruturas",
  "Fase 4 - Fechos e carpintaria base",
  "Fase 5 - Pintura",
  "Fase 6 - Chão",
  "Fase 7 - Montagens finais",
  "Fase 8 - Mobiliário e restauro",
  "Fase 9 - Exterior e extras",
] as const;

export const currencyFormatter = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  day: "2-digit",
  month: "short",
});
