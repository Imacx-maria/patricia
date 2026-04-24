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
      className={`flex w-72 shrink-0 flex-col gap-3 rounded-3xl bg-surface p-4 shadow-soft ${isOver ? "ring-2 ring-ink" : ""}`}
    >
      <header className="flex items-center justify-between">
        <span className="inline-flex h-7 items-center rounded-full bg-ink px-3 text-xs font-semibold text-white">
          {label}
        </span>
        <span className="text-xs text-ink-muted">{tasks.length}</span>
      </header>
      <div className="flex flex-col gap-3">
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
