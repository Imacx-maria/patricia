import type { TaskStatus, TaskWithRelations } from "@/types/renovation";
import { STATUS_COLUMNS } from "./constants";

export function countByStatus(tasks: TaskWithRelations[]) {
  const out: Record<TaskStatus, number> = {
    backlog: 0, todo: 0, doing: 0, blocked: 0, waiting_material: 0, done: 0,
  };
  for (const t of tasks) out[t.status]++;
  return STATUS_COLUMNS.map((s) => ({ status: s.value, label: s.label, count: out[s.value] }));
}

export function nextUpcoming(tasks: TaskWithRelations[], limit = 5) {
  return [...tasks]
    .filter((t) => t.dueDate && t.status !== "done")
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
    .slice(0, limit);
}

export function budgetTotals(tasks: TaskWithRelations[]) {
  let estimated = 0;
  let actual = 0;
  for (const t of tasks) {
    estimated += t.estimatedCost ?? 0;
    actual += t.actualCost ?? 0;
  }
  return { estimated, actual, diff: actual - estimated };
}
