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
import { useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import { STATUS_COLUMNS } from "@/lib/constants";
import type { Area, Person, TaskStatus, TaskWithRelations } from "@/types/renovation";
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
  areas,
  onOpenTask,
}: {
  tasks: TaskWithRelations[];
  people: Person[];
  areas: Area[];
  onOpenTask: (task: TaskWithRelations) => void;
}) {
  const updateStatus = useMutation(api.tasks.updateTaskStatus);
  const [warning, setWarning] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const filtered = useMemo(
    () =>
      tasks.filter((task) => {
        if (areaFilter !== "all" && task.areaId !== areaFilter) return false;
        if (ownerFilter !== "all" && task.ownerId !== ownerFilter) return false;
        return true;
      }),
    [tasks, areaFilter, ownerFilter],
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
      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-surface p-3 shadow-soft">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Filtros
        </span>
        <select
          className="h-9 rounded-full border border-border bg-surface-raised px-3 text-xs font-semibold text-ink"
          value={areaFilter}
          onChange={(event) => setAreaFilter(event.target.value)}
        >
          <option value="all">Todas as fases</option>
          {areas.map((area) => (
            <option key={area._id} value={area._id}>
              {area.name}
            </option>
          ))}
        </select>
        <select
          className="h-9 rounded-full border border-border bg-surface-raised px-3 text-xs font-semibold text-ink"
          value={ownerFilter}
          onChange={(event) => setOwnerFilter(event.target.value)}
        >
          <option value="all">Quem faz: todos</option>
          {people.map((person) => (
            <option key={person._id} value={person._id}>
              {person.name}
            </option>
          ))}
        </select>
        {(areaFilter !== "all" || ownerFilter !== "all") ? (
          <button
            type="button"
            className="h-9 rounded-full border border-border bg-surface-raised px-3 text-xs font-semibold text-ink-muted hover:text-ink"
            onClick={() => {
              setAreaFilter("all");
              setOwnerFilter("all");
            }}
          >
            Limpar
          </button>
        ) : null}
      </div>

      {warning ? (
        <div className="rounded-2xl bg-pastel-pink/50 p-3 text-sm font-medium text-ink">
          {warning}
        </div>
      ) : null}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((column) => {
            const columnTasks = filtered.filter((task) => task.status === column.value);
            return (
              <KanbanColumn
                key={column.value}
                status={column.value}
                label={column.label}
                tasks={columnTasks}
                allTasks={filtered}
                people={people}
                onOpenTask={onOpenTask}
              >
                {columnTasks.map((task) => (
                  <DraggableCard
                    key={task._id}
                    task={task}
                    allTasks={filtered}
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
