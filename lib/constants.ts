import type { CostCategory, TaskPriority, TaskStatus } from "@/types/renovation";

export const STATUS_COLUMNS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "Por fazer" },
  { value: "doing", label: "Em curso" },
  { value: "done", label: "Feito" },
];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "Por fazer",
  doing: "Em curso",
  blocked: "Bloqueado",
  waiting_material: "À espera de material",
  done: "Feito",
};

export const STATUS_CYCLE: TaskStatus[] = ["todo", "doing", "done"];

export function nextStatus(current: TaskStatus): TaskStatus {
  const index = STATUS_CYCLE.indexOf(current);
  if (index === -1) return "todo";
  return STATUS_CYCLE[(index + 1) % STATUS_CYCLE.length];
}

export const PRIORITY_CYCLE: TaskPriority[] = ["low", "medium", "high", "critical"];

export function nextPriority(current: TaskPriority): TaskPriority {
  const index = PRIORITY_CYCLE.indexOf(current);
  if (index === -1) return "low";
  return PRIORITY_CYCLE[(index + 1) % PRIORITY_CYCLE.length];
}

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
