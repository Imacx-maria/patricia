import { AlertTriangle } from "lucide-react";
import type { BlockedReason, Task } from "@/types/renovation";

export function BlockedReasons({
  reasons,
  tasks,
}: {
  reasons: BlockedReason[];
  tasks: Task[];
}) {
  if (reasons.length === 0) return null;

  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
      <div className="mb-1 flex items-center gap-2 font-semibold">
        <AlertTriangle size={16} />
        Bloqueios
      </div>
      <ul className="space-y-1">
        {reasons.map((reason, index) => {
          const names = tasks
            .filter((task) => reason.taskIds?.includes(task._id))
            .map((task) => task.title);
          return (
            <li key={`${reason.type}-${index}`}>
              {reason.label}
              {names.length > 0 ? `: ${names.join(", ")}` : ""}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
