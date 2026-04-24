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
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isoToUtcTime(iso: string): number {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function daysBetweenIso(startIso: string, endIso: string): number {
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round((isoToUtcTime(endIso) - isoToUtcTime(startIso)) / dayMs));
}

export function addDaysToIso(iso: string, days: number): string {
  const date = new Date(isoToUtcTime(iso));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function groupTasksByDate(tasks: TaskWithRelations[]): Map<string, TaskWithRelations[]> {
  const map = new Map<string, TaskWithRelations[]>();
  for (const t of tasks) {
    const start = (t.startDate ?? t.dueDate)?.slice(0, 10);
    if (!start) continue;

    const end = (t.dueDate ?? t.startDate)?.slice(0, 10) ?? start;
    const duration = daysBetweenIso(start, end);

    for (let day = 0; day <= duration; day += 1) {
      const iso = addDaysToIso(start, day);
      const arr = map.get(iso) ?? [];
      arr.push(t);
      map.set(iso, arr);
    }
  }
  return map;
}
