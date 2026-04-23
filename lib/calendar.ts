import type { TaskWithRelations } from "@/types/renovation";

export function startOfMonthGrid(anchor: Date): Date {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const weekday = (first.getDay() + 6) % 7; // Monday = 0
  first.setDate(first.getDate() - weekday);
  return first;
}

export function monthGrid(anchor: Date): Date[] {
  const start = startOfMonthGrid(anchor);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function groupTasksByDate(tasks: TaskWithRelations[]): Map<string, TaskWithRelations[]> {
  const map = new Map<string, TaskWithRelations[]>();
  for (const t of tasks) {
    const key = t.dueDate ?? t.startDate;
    if (!key) continue;
    const iso = key.slice(0, 10);
    const arr = map.get(iso) ?? [];
    arr.push(t);
    map.set(iso, arr);
  }
  return map;
}
