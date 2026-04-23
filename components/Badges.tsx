import type { TaskPriority, TaskStatus } from "@/types/renovation";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";

const statusClass: Record<TaskStatus, string> = {
  backlog: "bg-surface-raised text-ink-muted",
  todo: "bg-pastel-blue text-ink",
  doing: "bg-pastel-yellow text-ink",
  blocked: "bg-pastel-pink text-ink",
  waiting_material: "bg-pastel-lavender text-ink",
  done: "bg-pastel-sage text-ink",
};

const priorityClass: Record<TaskPriority, string> = {
  low: "bg-surface-raised text-ink-muted",
  medium: "bg-pastel-blue text-ink",
  high: "bg-pastel-yellow text-ink",
  critical: "bg-pastel-pink text-ink",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold ${statusClass[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold ${priorityClass[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
