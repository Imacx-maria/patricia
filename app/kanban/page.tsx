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
    return <div className="rounded-lg bg-[#fffdf8] p-6">A carregar kanban...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-teal-700">
          Planeamento desktop
        </p>
        <h1 className="text-2xl font-semibold text-slate-950">Kanban da renovação</h1>
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
