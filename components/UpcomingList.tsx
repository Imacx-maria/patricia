import { dateFormatter } from "@/lib/constants";
import type { TaskWithRelations } from "@/types/renovation";

export function UpcomingList({ tasks }: { tasks: TaskWithRelations[] }) {
  if (tasks.length === 0) {
    return <p className="rounded-2xl bg-surface p-4 text-sm text-ink-muted shadow-soft">Sem tarefas com data próxima.</p>;
  }
  return (
    <ol className="grid gap-2">
      {tasks.map((t) => (
        <li key={t._id} className="flex items-center justify-between rounded-2xl bg-surface p-3 shadow-soft">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{t.title}</p>
            <p className="text-xs text-ink-muted">{t.area?.name ?? "Sem área"}</p>
          </div>
          <span className="shrink-0 rounded-full bg-pastel-yellow px-3 py-1 text-xs font-semibold text-ink">
            {t.dueDate ? dateFormatter.format(new Date(t.dueDate)) : "—"}
          </span>
        </li>
      ))}
    </ol>
  );
}
