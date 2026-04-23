import { AlertTriangle, CheckCircle2, Clock, Hammer, Package, PauseCircle } from "lucide-react";
import type { ComponentType } from "react";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import type { TaskPriority, TaskStatus } from "@/types/renovation";

const statusStyles: Record<TaskStatus, string> = {
  backlog: "bg-slate-100 text-slate-700",
  todo: "bg-blue-100 text-blue-800",
  doing: "bg-amber-100 text-amber-900",
  blocked: "bg-red-100 text-red-800",
  waiting_material: "bg-orange-100 text-orange-800",
  done: "bg-emerald-100 text-emerald-800",
};

const priorityStyles: Record<TaskPriority, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-sky-100 text-sky-800",
  high: "bg-amber-100 text-amber-900",
  critical: "bg-red-100 text-red-800",
};

const statusIcons: Record<TaskStatus, ComponentType<{ size?: number }>> = {
  backlog: PauseCircle,
  todo: Clock,
  doing: Hammer,
  blocked: AlertTriangle,
  waiting_material: Package,
  done: CheckCircle2,
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const Icon = statusIcons[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${statusStyles[status]}`}>
      <Icon size={13} />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-semibold ${priorityStyles[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
