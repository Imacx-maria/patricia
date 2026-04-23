"use client";

import { CalendarDays, Check, Euro, RotateCcw } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { currencyFormatter, dateFormatter } from "@/lib/constants";
import { deriveTaskState } from "@/lib/taskLogic";
import type { Person, TaskWithRelations } from "@/types/renovation";
import { BlockedReasons } from "./BlockedReasons";
import { PersonBadge } from "./PersonBadge";
import { PriorityBadge, StatusBadge } from "./Badges";
import { surfaceForCategory } from "@/lib/theme";

export function TaskCard({
  task,
  allTasks,
  people,
  onOpen,
  compact = false,
}: {
  task: TaskWithRelations;
  allTasks: TaskWithRelations[];
  people: Person[];
  onOpen: (task: TaskWithRelations) => void;
  compact?: boolean;
}) {
  const toggleDone = useMutation(api.tasks.toggleDone);
  const derived = deriveTaskState(task, allTasks, people);

  return (
    <article
      className={`rounded-2xl ${surfaceForCategory(task.costCategory)} p-4 shadow-soft transition hover:-translate-y-0.5`}
      onClick={() => onOpen(task)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold leading-5 text-ink">{task.title}</h3>
          <p className="mt-1 text-xs text-ink-muted">{task.area?.name ?? "Sem área"}</p>
        </div>
        <button
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-ink hover:bg-ink hover:text-white"
          title={task.status === "done" ? "Reabrir" : "Marcar como feito"}
          onClick={(event) => {
            event.stopPropagation();
            void toggleDone({ id: task._id, done: task.status !== "done" });
          }}
        >
          {task.status === "done" ? <RotateCcw size={16} /> : <Check size={17} />}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
        {derived.isBlocked ? (
          <span className="inline-flex h-6 items-center rounded-full bg-white/70 px-2.5 text-[11px] font-semibold text-ink">Bloqueada</span>
        ) : null}
        {task.materialNeeded ? (
          <span className="inline-flex h-6 items-center rounded-full bg-white/70 px-2.5 text-[11px] font-semibold text-ink">Material</span>
        ) : null}
      </div>

      {!compact ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <PersonBadge person={task.owner} />
          {task.dueDate ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-ink">
              <CalendarDays size={12} />
              {dateFormatter.format(new Date(task.dueDate))}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-ink">
            <Euro size={12} />
            {currencyFormatter.format(task.estimatedCost ?? 0)} / {currencyFormatter.format(task.actualCost ?? 0)}
          </span>
        </div>
      ) : null}

      {!compact && derived.isBlocked ? <BlockedReasons reasons={derived.blockedReasons} tasks={allTasks} /> : null}
    </article>
  );
}
