"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMutation } from "convex/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { TaskWithRelations } from "@/types/renovation";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { addDaysToIso, daysBetweenIso, groupTasksByDate, isoDay, monthGrid } from "@/lib/calendar";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const TEAM_COLORS = {
  obras: "#2563eb",
  patricia: "#a809b3",
  sandra: "#86efac",
  patriciaSandra: "linear-gradient(90deg, #a809b3 0%, #c84ed2 45%, #86efac 100%)",
  mixed: "#0f766e",
  fallback: "#64748b",
};
type CalendarTeam = keyof typeof TEAM_COLORS;

function taskTeam(task: TaskWithRelations): CalendarTeam {
  const names = task.allowedPeople.map((person) => person.name.toLowerCase());
  const hasObras = names.some((name) => name.includes("obras"));
  const hasPatricia = names.some((name) => name.includes("patrícia") || name.includes("patricia"));
  const hasSandra = names.some((name) => name.includes("sandra"));

  if (hasObras) return "obras";
  if (hasPatricia && hasSandra) return "patriciaSandra";
  if (hasPatricia) return "patricia";
  if (hasSandra) return "sandra";
  return names.length > 1 ? "mixed" : "fallback";
}

function taskLineStyle(task: TaskWithRelations): CSSProperties {
  const team = taskTeam(task);
  const background = TEAM_COLORS[team];
  return background.startsWith("linear-gradient")
    ? { background }
    : { backgroundColor: background };
}

function taskColorClass(task: TaskWithRelations) {
  const team = taskTeam(task);
  if (team === "obras") return "border-blue-600 bg-blue-50";
  if (team === "patricia") return "border-[#a809b3] bg-fuchsia-50";
  if (team === "sandra") return "border-[#86efac] bg-green-50";
  if (team === "patriciaSandra") return "border-[#a809b3] bg-gradient-to-r from-fuchsia-50 to-green-50";
  return "border-teal-600 bg-teal-50";
}

function taskStart(task: TaskWithRelations) {
  return (task.startDate ?? task.dueDate)?.slice(0, 10) ?? null;
}

function taskEnd(task: TaskWithRelations) {
  return (task.dueDate ?? task.startDate)?.slice(0, 10) ?? null;
}

function maxIso(a: string, b: string) {
  return a > b ? a : b;
}

function minIso(a: string, b: string) {
  return a < b ? a : b;
}

function DroppableDay({
  iso,
  className,
  onOpenDay,
  children,
}: {
  iso: string;
  className: string;
  onOpenDay: () => void;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: iso });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? "ring-2 ring-ink" : ""}`}
      role="button"
      tabIndex={0}
      onClick={onOpenDay}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDay();
        }
      }}
    >
      {children}
    </div>
  );
}

function DraggableCalendarBar({
  task,
  className,
  style,
  onOpenTask,
}: {
  task: TaskWithRelations;
  className: string;
  style?: CSSProperties;
  onOpenTask: (task: TaskWithRelations) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={{
        ...style,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      className={`${className} ${isDragging ? "z-20 opacity-70" : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        onOpenTask(task);
      }}
      title={task.title}
      aria-label={task.title}
      {...attributes}
      {...listeners}
    />
  );
}

export function Calendar({
  tasks,
  onOpenTask,
}: {
  tasks: TaskWithRelations[];
  onOpenTask: (task: TaskWithRelations) => void;
}) {
  const updateTask = useMutation(api.tasks.updateTask);
  const [anchor, setAnchor] = useState(() => new Date());
  const [warning, setWarning] = useState("");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );
  const grid = useMemo(() => monthGrid(anchor), [anchor]);
  const visibleTasks = useMemo(
    () => tasks.filter((t) => t.status === "todo" || t.status === "doing"),
    [tasks],
  );
  const grouped = useMemo(() => groupTasksByDate(visibleTasks), [visibleTasks]);
  const weeks = useMemo(
    () => Array.from({ length: 6 }, (_, weekIndex) => grid.slice(weekIndex * 7, weekIndex * 7 + 7)),
    [grid],
  );
  const taskLanes = useMemo(() => {
    const sorted = [...visibleTasks].sort((a, b) => {
      const startDiff = (taskStart(a) ?? "").localeCompare(taskStart(b) ?? "");
      if (startDiff) return startDiff;
      return a.title.localeCompare(b.title);
    });
    return new Map(sorted.map((task, index) => [task._id, index]));
  }, [visibleTasks]);
  const todayIso = isoDay(new Date());
  const currentMonth = anchor.getMonth();
  const selectedTasks = selectedDay ? (grouped.get(selectedDay) ?? []) : [];

  async function handleDragEnd(event: DragEndEvent) {
    const taskId = event.active.id.toString();
    const targetDate = event.over?.id?.toString();
    const task = tasks.find((candidate) => candidate._id === taskId);
    if (!task || !targetDate) return;

    const currentStart = task.startDate ?? task.dueDate;
    if (currentStart === targetDate) return;

    const duration = task.startDate && task.dueDate ? daysBetweenIso(task.startDate, task.dueDate) : 0;
    const nextPatch = task.startDate
      ? { startDate: targetDate, dueDate: addDaysToIso(targetDate, duration) }
      : { dueDate: targetDate };

    try {
      setWarning("");
      await updateTask({ id: task._id, ...nextPatch });
    } catch (caught) {
      setWarning(caught instanceof Error ? caught.message : "Não foi possível mudar a data.");
    }
  }

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
          <span className="h-2.5 w-5 rounded-full" style={{ backgroundColor: TEAM_COLORS.obras }} />
          Obras
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-full" style={{ backgroundColor: TEAM_COLORS.patricia }} />
          Patrícia
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-full" style={{ backgroundColor: TEAM_COLORS.sandra }} />
          Sandra
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-full" style={{ background: TEAM_COLORS.patriciaSandra }} />
          Patrícia + Sandra
        </span>
      </div>

      {warning ? (
        <div className="mb-3 rounded-2xl bg-pastel-pink/50 p-3 text-sm font-medium text-ink">
          {warning}
        </div>
      ) : null}

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

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="mt-1 grid gap-2">
          {weeks.map((week, weekIndex) => {
            const weekStart = isoDay(week[0]);
            const weekEnd = isoDay(week[6]);
            const segments = visibleTasks
              .map((task) => {
                const start = taskStart(task);
                const end = taskEnd(task);
                if (!start || !end || end < weekStart || start > weekEnd) return null;
                const segmentStart = maxIso(start, weekStart);
                const segmentEnd = minIso(end, weekEnd);
                const columnStart = daysBetweenIso(weekStart, segmentStart) + 1;
                const columnEnd = daysBetweenIso(weekStart, segmentEnd) + 2;
                return {
                  task,
                  columnStart,
                  columnEnd,
                  lane: taskLanes.get(task._id) ?? 0,
                };
              })
              .filter(Boolean)
              .slice(0, 12);

            return (
              <div key={weekStart} className="relative grid min-h-28 grid-cols-7 gap-2">
                {week.map((d, idx) => {
                  const iso = isoDay(d);
                  const dim = d.getMonth() !== currentMonth;
                  const today = iso === todayIso;
                  const isWeekend = idx >= 5;
                  const base = isWeekend ? "bg-pastel-pink/20" : "bg-surface-raised";
                  const dimmed = isWeekend ? "bg-pastel-pink/10 text-ink-muted" : "bg-surface-raised/40 text-ink-muted";
                  return (
                    <DroppableDay
                      key={iso}
                      iso={iso}
                      onOpenDay={() => setSelectedDay(iso)}
                      className={`min-h-28 cursor-pointer rounded-2xl p-2 transition hover:ring-2 hover:ring-ink/30 ${today ? "ring-2 ring-ink" : ""} ${dim ? dimmed : `${base} text-ink`}`}
                    >
                      <div className={`text-xs font-semibold ${isWeekend && !dim ? "text-ink" : ""}`}>
                        {d.getDate()}
                      </div>
                    </DroppableDay>
                  );
                })}

                <div className="pointer-events-none absolute inset-x-0 top-8 grid grid-cols-7 gap-2">
                  {segments.map((segment) => {
                    if (!segment) return null;
                    const top = (segment.lane % 9) * 9;
                    return (
                      <DraggableCalendarBar
                        key={`${segment.task._id}-${weekIndex}`}
                        task={segment.task}
                        onOpenTask={onOpenTask}
                        className="pointer-events-auto h-1.5 rounded-full hover:h-2.5 hover:brightness-95 focus-visible:h-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                        style={{
                          ...taskLineStyle(segment.task),
                          gridColumn: `${segment.columnStart} / ${segment.columnEnd}`,
                          marginTop: top,
                        }}
                      />
                    );
                  })}
                  {visibleTasks.length > segments.length && weekIndex === 0 ? (
                    <span className="sr-only">Há mais tarefas neste calendário.</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </DndContext>

      {selectedDay ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-3 sm:items-center sm:justify-center" onClick={() => setSelectedDay(null)}>
          <div className="max-h-[85vh] w-full overflow-hidden rounded-3xl bg-surface shadow-soft sm:max-w-2xl" onClick={(event) => event.stopPropagation()}>
            <header className="flex items-start justify-between gap-4 border-b border-line p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">Dia</p>
                <h3 className="text-2xl font-black text-ink">{selectedDay}</h3>
                <p className="mt-1 text-sm text-ink-muted">{selectedTasks.length} tarefa{selectedTasks.length === 1 ? "" : "s"}</p>
              </div>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-raised text-ink hover:bg-ink hover:text-white"
                onClick={() => setSelectedDay(null)}
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </header>

            <div className="max-h-[65vh] overflow-y-auto p-5">
              {selectedTasks.length ? (
                <div className="grid gap-2">
                  {selectedTasks.map((task) => (
                    <button
                      key={task._id}
                      type="button"
                      className={`border-l-4 p-3 text-left transition hover:translate-x-0.5 ${taskColorClass(task)}`}
                      onClick={() => {
                        setSelectedDay(null);
                        onOpenTask(task);
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-extrabold text-ink">{task.title}</p>
                          <p className="mt-1 text-xs font-medium text-ink-muted">
                            {task.area?.name ?? "Sem área"} · {STATUS_LABELS[task.status]} · {PRIORITY_LABELS[task.priority]}
                          </p>
                        </div>
                        <div className="flex shrink-0 -space-x-1">
                          {task.allowedPeople.map((person) => (
                            <span
                              key={person._id}
                              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-black text-ink"
                              style={{ backgroundColor: person.color }}
                              title={person.name}
                            >
                              {person.initials}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl bg-surface-raised p-4 text-sm font-medium text-ink-muted">Sem tarefas neste dia.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
