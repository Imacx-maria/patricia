import type { CostCategory, TaskStatus } from "@/types/renovation";

export const PASTEL_BY_CATEGORY: Record<CostCategory, string> = {
  materials: "bg-pastel-blue",
  labor: "bg-pastel-sage",
  tools: "bg-pastel-lavender",
  furniture: "bg-pastel-yellow",
  decoration: "bg-pastel-pink",
  other: "bg-surface-raised",
};

export const PASTEL_BY_STATUS: Record<TaskStatus, string> = {
  backlog: "bg-surface-raised",
  todo: "bg-pastel-blue",
  doing: "bg-pastel-yellow",
  blocked: "bg-pastel-pink",
  waiting_material: "bg-pastel-lavender",
  done: "bg-pastel-sage",
};

export function surfaceForCategory(category: CostCategory) {
  return PASTEL_BY_CATEGORY[category] ?? "bg-surface-raised";
}
