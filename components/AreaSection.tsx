"use client";

import type { Area, Person, TaskWithRelations } from "@/types/renovation";
import { TaskCard } from "./TaskCard";

export function AreaSection({
  area,
  tasks,
  allTasks,
  people,
  onOpenTask,
}: {
  area: Area;
  tasks: TaskWithRelations[];
  allTasks: TaskWithRelations[];
  people: Person[];
  onOpenTask: (task: TaskWithRelations) => void;
}) {
  if (tasks.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-950">{area.name}</h2>
        <span className="rounded bg-[#eee8de] px-2 py-1 text-xs font-medium text-slate-700">
          {tasks.length}
        </span>
      </div>
      <div className="grid gap-3">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            allTasks={allTasks}
            people={people}
            onOpen={onOpenTask}
          />
        ))}
      </div>
    </section>
  );
}
