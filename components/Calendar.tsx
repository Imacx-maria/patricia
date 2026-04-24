"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TaskWithRelations } from "@/types/renovation";
import { groupTasksByDate, isoDay, monthGrid } from "@/lib/calendar";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export function Calendar({
  tasks,
  onOpenTask,
}: {
  tasks: TaskWithRelations[];
  onOpenTask: (task: TaskWithRelations) => void;
}) {
  const [anchor, setAnchor] = useState(() => new Date());
  const grid = useMemo(() => monthGrid(anchor), [anchor]);
  const visibleTasks = useMemo(
    () => tasks.filter((t) => t.status === "todo" || t.status === "doing"),
    [tasks],
  );
  const grouped = useMemo(() => groupTasksByDate(visibleTasks), [visibleTasks]);
  const todayIso = isoDay(new Date());
  const currentMonth = anchor.getMonth();

  return (
    <section className="rounded-3xl bg-surface p-4 shadow-soft">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-ink">
          {MONTHS[anchor.getMonth()]} {anchor.getFullYear()}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-raised text-ink hover:bg-ink hover:text-white"
            onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1))}
            aria-label="Mês anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="h-9 rounded-full bg-surface-raised px-3 text-xs font-semibold text-ink"
            onClick={() => setAnchor(new Date())}
          >
            Hoje
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-raised text-ink hover:bg-ink hover:text-white"
            onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1))}
            aria-label="Mês seguinte"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </header>

      <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-pastel-blue" />
          Por fazer
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-pastel-yellow" />
          Em curso
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2 text-xs font-semibold uppercase tracking-wide">
        {WEEKDAYS.map((d, idx) => {
          const isWeekend = idx >= 5;
          return (
            <div key={d} className={`px-2 ${isWeekend ? "text-pastel-pink" : "text-ink-muted"}`}>
              {d}
            </div>
          );
        })}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-2">
        {grid.map((d, idx) => {
          const iso = isoDay(d);
          const items = grouped.get(iso) ?? [];
          const dim = d.getMonth() !== currentMonth;
          const today = iso === todayIso;
          const weekday = idx % 7;
          const isWeekend = weekday >= 5;
          const base = isWeekend ? "bg-pastel-pink/20" : "bg-surface-raised";
          const dimmed = isWeekend ? "bg-pastel-pink/10 text-ink-muted" : "bg-surface-raised/40 text-ink-muted";
          return (
            <div
              key={iso}
              className={`min-h-24 rounded-2xl p-2 ${today ? "ring-2 ring-ink" : ""} ${dim ? dimmed : `${base} text-ink`}`}
            >
              <div className={`mb-1 text-xs font-semibold ${isWeekend && !dim ? "text-ink" : ""}`}>
                {d.getDate()}
              </div>
              <ul className="grid gap-1">
                {items.slice(0, 3).map((t) => {
                  const pill = t.status === "doing" ? "bg-pastel-yellow" : "bg-pastel-blue";
                  return (
                    <li key={t._id}>
                      <button
                        type="button"
                        className={`w-full truncate rounded-lg px-2 py-1 text-left text-[11px] font-medium text-ink hover:brightness-95 ${pill}`}
                        onClick={() => onOpenTask(t)}
                        title={t.title}
                      >
                        {t.title}
                      </button>
                    </li>
                  );
                })}
                {items.length > 3 ? (
                  <li className="text-[10px] text-ink-muted">+{items.length - 3} mais</li>
                ) : null}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
