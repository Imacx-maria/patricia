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
      className="rounded-lg border border-[#ded6c9] bg-[#fffdf8] p-3 shadow-sm transition hover:border-teal-300 hover:shadow-md"
      onClick={() => onOpen(task)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-5 text-slate-950">{task.title}</h3>
          <p className="mt-1 text-xs text-slate-500">{task.area?.name ?? "Sem área"}</p>
        </div>
        <button
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#ded6c9] bg-white text-slate-700 hover:bg-[#eee8de]"
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
          <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
            Bloqueada
          </span>
        ) : null}
        {task.materialNeeded ? (
          <span className="rounded bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-800">
            Material
          </span>
        ) : null}
      </div>

      {!compact ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <PersonBadge person={task.owner} />
          {task.dueDate ? (
            <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
              <CalendarDays size={13} />
              {dateFormatter.format(new Date(task.dueDate))}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
            <Euro size={13} />
            {currencyFormatter.format(task.estimatedCost ?? 0)} /{" "}
            {currencyFormatter.format(task.actualCost ?? 0)}
          </span>
        </div>
      ) : null}

      {!compact && derived.isBlocked ? (
        <div className="mt-3">
          <BlockedReasons reasons={derived.blockedReasons} tasks={allTasks} />
        </div>
      ) : null}
    </article>
  );
}
