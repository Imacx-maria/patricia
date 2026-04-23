"use client";

import { useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import { KanbanBoard } from "@/components/KanbanBoard";
import { TaskModal } from "@/components/TaskModal";
import { hydrateTasks } from "@/lib/taskLogic";
import type { TaskWithRelations } from "@/types/renovation";

export default function KanbanPage() {
  const tasks = useQuery(api.tasks.listTasks);
  const people = useQuery(api.people.listPeople);
  const areas = useQuery(api.areas.listAreas);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);

  const hydrated = useMemo(() => {
    if (!tasks || !people || !areas) return [];
    return hydrateTasks(tasks, people, areas);
  }, [areas, people, tasks]);

  if (!tasks || !people || !areas) {
    return <div className="rounded-lg bg-surface p-6">A carregar kanban...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">Planeamento desktop</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">Kanban da renovação</h1>
      </div>
      <KanbanBoard tasks={hydrated} people={people} onOpenTask={setSelectedTask} />
      {selectedTask ? (
        <TaskModal
          key={selectedTask._id}
          task={selectedTask}
          tasks={hydrated}
          people={people}
          areas={areas}
          onClose={() => setSelectedTask(null)}
        />
      ) : null}
    </div>
  );
}
