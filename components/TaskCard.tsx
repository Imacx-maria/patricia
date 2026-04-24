"use client";

import { CalendarDays, Check, Euro, RotateCcw } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { useRef } from "react";
import { api } from "@/convex/_generated/api";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  currencyFormatter,
  dateFormatter,
  nextPriority,
  nextStatus,
} from "@/lib/constants";
import { deriveTaskState } from "@/lib/taskLogic";
import type { Person, TaskPriority, TaskStatus, TaskWithRelations } from "@/types/renovation";
import { BlockedReasons } from "./BlockedReasons";
import { PersonIconStack } from "./PersonIconStack";
import { surfaceForCategory } from "@/lib/theme";

const statusBadgeClass: Record<TaskStatus, string> = {
  backlog: "bg-surface-raised text-ink-muted",
  todo: "bg-pastel-blue text-ink",
  doing: "bg-pastel-yellow text-ink",
  blocked: "bg-pastel-pink text-ink",
  waiting_material: "bg-pastel-lavender text-ink",
  done: "bg-pastel-sage text-ink",
};

const priorityBadgeClass: Record<TaskPriority, string> = {
  low: "bg-surface-raised text-ink-muted",
  medium: "bg-pastel-blue text-ink",
  high: "bg-pastel-yellow text-ink",
  critical: "bg-pastel-pink text-ink",
};

const LONG_PRESS_MS = 550;

function useTapHold({
  onTap,
  onHold,
  holdMs = LONG_PRESS_MS,
}: {
  onTap?: () => void;
  onHold?: () => void;
  holdMs?: number;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heldRef = useRef(false);

  const clear = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return {
    onPointerDown: (event: React.PointerEvent) => {
      event.stopPropagation();
      heldRef.current = false;
      timerRef.current = setTimeout(() => {
        heldRef.current = true;
        onHold?.();
      }, holdMs);
    },
    onPointerUp: (event: React.PointerEvent) => {
      event.stopPropagation();
      const wasHeld = heldRef.current;
      clear();
      if (!wasHeld) onTap?.();
    },
    onPointerLeave: () => clear(),
    onPointerCancel: () => clear(),
    onClick: (event: React.MouseEvent) => event.stopPropagation(),
  };
}

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
  const updateTask = useMutation(api.tasks.updateTask);
  const deleteTask = useMutation(api.tasks.deleteTask);
  const attachments = useQuery(api.attachments.listByTask, { taskId: task._id });
  const derived = deriveTaskState(task, allTasks, people);

  const assignedPeople = [task.owner, ...task.allowedPeople].reduce<Person[]>((uniquePeople, person) => {
    if (person && !uniquePeople.some((candidate) => candidate._id === person._id)) {
      uniquePeople.push(person);
    }
    return uniquePeople;
  }, []);

  const cardHold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardHeld = useRef(false);

  const mainAttachment =
    attachments?.find((a) => a.isMain) ?? attachments?.[0] ?? null;

  const statusHandlers = useTapHold({
    onTap: () => {
      void updateTask({ id: task._id, status: nextStatus(task.status) });
    },
  });

  const priorityHandlers = useTapHold({
    onTap: () => {
      void updateTask({ id: task._id, priority: nextPriority(task.priority) });
    },
    onHold: () => {
      void updateTask({ id: task._id, priority: "low" });
    },
  });

  function clearCardHold() {
    if (cardHold.current) {
      clearTimeout(cardHold.current);
      cardHold.current = null;
    }
  }

  async function handleCardHold() {
    cardHeld.current = true;
    if (typeof window !== "undefined" && window.confirm(`Apagar "${task.title}"?`)) {
      try {
        await deleteTask({ id: task._id });
      } catch (caught) {
        const message =
          caught instanceof Error ? caught.message : "Não foi possível apagar.";
        window.alert(message);
      }
    }
  }

  return (
    <article
      className={`rounded-2xl ${surfaceForCategory(task.costCategory)} p-4 shadow-soft transition hover:-translate-y-0.5 select-none`}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest("[data-badge], [data-card-skip]")) return;
        cardHeld.current = false;
        clearCardHold();
        cardHold.current = setTimeout(() => void handleCardHold(), LONG_PRESS_MS + 200);
      }}
      onPointerUp={() => clearCardHold()}
      onPointerLeave={() => clearCardHold()}
      onPointerCancel={() => clearCardHold()}
      onClick={() => {
        if (cardHeld.current) {
          cardHeld.current = false;
          return;
        }
        onOpen(task);
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold leading-5 text-ink">{task.title}</h3>
          <p className="mt-1 text-xs text-ink-muted">{task.area?.name ?? "Sem área"}</p>
        </div>
        <button
          data-card-skip
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
        <button
          type="button"
          data-badge
          {...statusHandlers}
          className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold ${statusBadgeClass[task.status]}`}
          title="Tocar para mudar estado"
        >
          {STATUS_LABELS[task.status]}
        </button>
        <button
          type="button"
          data-badge
          {...priorityHandlers}
          className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold ${priorityBadgeClass[task.priority]}`}
          title="Tocar: próxima prioridade · Manter: baixa"
        >
          {PRIORITY_LABELS[task.priority]}
        </button>
        {derived.isBlocked ? (
          <span className="inline-flex h-6 items-center rounded-full bg-white/70 px-2.5 text-[11px] font-semibold text-ink">
            Bloqueada
          </span>
        ) : null}
        {task.materialNeeded ? (
          <span className="inline-flex h-6 items-center rounded-full bg-white/70 px-2.5 text-[11px] font-semibold text-ink">
            Material
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="rounded-full bg-white/70 px-1.5 py-1" data-card-skip>
          <PersonIconStack people={assignedPeople} />
        </div>
        {!compact ? (
          <>
          {task.dueDate ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-ink">
              <CalendarDays size={12} />
              {dateFormatter.format(new Date(task.dueDate))}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-ink">
            <Euro size={12} />
            Estimado: {currencyFormatter.format(task.estimatedCost ?? 0)}
          </span>
          </>
        ) : null}
      </div>

      {!compact && derived.isBlocked ? (
        <BlockedReasons reasons={derived.blockedReasons} tasks={allTasks} />
      ) : null}

      {mainAttachment && mainAttachment.url ? (
        <div className="mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mainAttachment.url}
            alt=""
            className="h-32 w-full rounded-xl object-cover"
            loading="lazy"
          />
          {attachments && attachments.length > 1 ? (
            <p className="mt-1 text-[10px] font-medium text-ink-muted">
              +{attachments.length - 1} foto{attachments.length - 1 === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
