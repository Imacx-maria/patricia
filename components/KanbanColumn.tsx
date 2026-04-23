"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Person, TaskStatus, TaskWithRelations } from "@/types/renovation";
import { TaskCard } from "./TaskCard";

export function KanbanColumn({
  status,
  label,
  tasks,
  allTasks,
  people,
  onOpenTask,
  children,
}: {
  status: TaskStatus;
  label: string;
  tasks: TaskWithRelations[];
  allTasks: TaskWithRelations[];
  people: Person[];
  onOpenTask: (task: TaskWithRelations) => void;
  children?: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={`min-h-[72vh] w-[19rem] shrink-0 rounded-lg border p-3 transition ${
        isOver ? "border-teal-500 bg-teal-50" : "border-[#ded6c9] bg-[#eee8de]/60"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">{label}</h2>
        <span className="rounded bg-white px-2 py-1 text-xs font-semibold text-slate-600">
          {tasks.length}
        </span>
      </div>
      <div className="grid gap-3">
        {children ??
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              allTasks={allTasks}
              people={people}
              onOpen={onOpenTask}
              compact
            />
          ))}
      </div>
    </section>
  );
}
