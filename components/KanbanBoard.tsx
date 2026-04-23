"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { STATUS_COLUMNS } from "@/lib/constants";
import type { Person, TaskStatus, TaskWithRelations } from "@/types/renovation";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";

function DraggableCard({
  task,
  allTasks,
  people,
  onOpenTask,
}: {
  task: TaskWithRelations;
  allTasks: TaskWithRelations[];
  people: Person[];
  onOpenTask: (task: TaskWithRelations) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      className={isDragging ? "z-20 opacity-70" : undefined}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} allTasks={allTasks} people={people} onOpen={onOpenTask} compact />
    </div>
  );
}

export function KanbanBoard({
  tasks,
  people,
  onOpenTask,
}: {
  tasks: TaskWithRelations[];
  people: Person[];
  onOpenTask: (task: TaskWithRelations) => void;
}) {
  const updateStatus = useMutation(api.tasks.updateTaskStatus);
  const [warning, setWarning] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const taskId = event.active.id.toString();
    const status = event.over?.id?.toString() as TaskStatus | undefined;
    const task = tasks.find((candidate) => candidate._id === taskId);
    if (!task || !status || task.status === status) return;

    try {
      setWarning("");
      await updateStatus({ id: task._id, status });
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Não foi possível mudar o estado da tarefa.";
      setWarning(message);
    }
  }

  return (
    <div className="space-y-3">
      {warning ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
          {warning}
        </div>
      ) : null}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column.value);
            return (
              <KanbanColumn
                key={column.value}
                status={column.value}
                label={column.label}
                tasks={columnTasks}
                allTasks={tasks}
                people={people}
                onOpenTask={onOpenTask}
              >
                {columnTasks.map((task) => (
                  <DraggableCard
                    key={task._id}
                    task={task}
                    allTasks={tasks}
                    people={people}
                    onOpenTask={onOpenTask}
                  />
                ))}
              </KanbanColumn>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}
