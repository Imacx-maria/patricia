"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { CalendarDays } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Calendar } from "@/components/Calendar";
import { TaskModal } from "@/components/TaskModal";
import { hydrateTasks } from "@/lib/taskLogic";
import type { TaskWithRelations } from "@/types/renovation";

export default function CalendarPage() {
  const tasks = useQuery(api.tasks.listTasks);
  const people = useQuery(api.people.listPeople);
  const areas = useQuery(api.areas.listAreas);
  const [selected, setSelected] = useState<TaskWithRelations | null>(null);

  const hydrated = useMemo(() => {
    if (!tasks || !people || !areas) return [];
    return hydrateTasks(tasks, people, areas);
  }, [areas, people, tasks]);

  if (!tasks || !people || !areas) {
    return <div className="rounded-2xl bg-surface p-6">A carregar calendário...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">Calendário</p>
        <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
          <CalendarDays size={26} />
          Datas da renovação
        </h1>
      </div>
      <Calendar tasks={hydrated} onOpenTask={setSelected} />
      {selected ? (
        <TaskModal
          key={selected._id}
          task={selected}
          tasks={hydrated}
          people={people}
          areas={areas}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}
