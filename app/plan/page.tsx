"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { FilterBar } from "@/components/FilterBar";
import { PersonSelectorChips } from "@/components/PersonSelectorChips";
import { TaskCard } from "@/components/TaskCard";
import { TaskModal } from "@/components/TaskModal";
import { PRIORITY_CYCLE, PRIORITY_LABELS } from "@/lib/constants";
import { filterTasks, readSavedTaskFilters } from "@/lib/taskFilters";
import { hydrateTasks } from "@/lib/taskLogic";
import type { Area, Person, TaskPriority, TaskWithRelations } from "@/types/renovation";

const FILTER_STORAGE_KEY = "patricia.plan.filters";

function DroppablePriorityLane({
  areaId,
  priority,
  tasks,
  allTasks,
  people,
  onOpenTask,
}: {
  areaId: string;
  priority: TaskPriority;
  tasks: TaskWithRelations[];
  allTasks: TaskWithRelations[];
  people: Person[];
  onOpenTask: (task: TaskWithRelations) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${areaId}:${priority}` });

  return (
    <section
      ref={setNodeRef}
      className={`min-h-32 rounded-2xl border border-border bg-surface-raised p-3 transition ${
        isOver ? "ring-2 ring-ink" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink-muted">
          {PRIORITY_LABELS[priority]}
        </h3>
        <span className="rounded-full bg-surface px-2 py-1 text-[11px] font-semibold text-ink-muted">
          {tasks.length}
        </span>
      </div>
      <div className="grid gap-2">
        {tasks.map((task) => (
          <DraggablePlanTask
            key={task._id}
            task={task}
            allTasks={allTasks}
            people={people}
            onOpenTask={onOpenTask}
          />
        ))}
        {tasks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-3 text-xs text-ink-muted">
            Arrasta para aqui.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function DraggablePlanTask({
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

function PlanAreaSection({
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
    <section className="space-y-3 rounded-3xl bg-surface p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-ink">{area.name}</h2>
        <span className="rounded-full bg-surface-raised px-3 py-1 text-xs font-semibold text-ink-muted">
          {tasks.length}
        </span>
      </div>
      <div className="grid gap-3 xl:grid-cols-4">
        {PRIORITY_CYCLE.map((priority) => (
          <DroppablePriorityLane
            key={priority}
            areaId={area._id}
            priority={priority}
            tasks={tasks.filter((task) => task.priority === priority)}
            allTasks={allTasks}
            people={people}
            onOpenTask={onOpenTask}
          />
        ))}
      </div>
    </section>
  );
}

export default function PlanPage() {
  const tasks = useQuery(api.tasks.listTasks);
  const people = useQuery(api.people.listPeople);
  const areas = useQuery(api.areas.listAreas);
  const updateTask = useMutation(api.tasks.updateTask);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [creating, setCreating] = useState(false);
  const [warning, setWarning] = useState("");
  const [me, setMe] = useState(() =>
    typeof window === "undefined" ? "" : (window.localStorage.getItem("patricia.me") ?? ""),
  );
  const [filters, setFilters] = useState(() => readSavedTaskFilters(FILTER_STORAGE_KEY));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  useEffect(() => {
    if (me) window.localStorage.setItem("patricia.me", me);
  }, [me]);

  useEffect(() => {
    window.localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const hydrated = useMemo(() => {
    if (!tasks || !people || !areas) return [];
    return hydrateTasks(tasks, people, areas);
  }, [areas, people, tasks]);

  const filtered = useMemo(() => {
    if (!people) return [];
    return filterTasks({ tasks: hydrated, filters, people, currentPersonId: me });
  }, [filters, hydrated, me, people]);

  async function handleDragEnd(event: DragEndEvent) {
    const taskId = event.active.id.toString();
    const overId = event.over?.id?.toString();
    if (!overId) return;

    const [, priority] = overId.split(":") as [string, TaskPriority];
    if (!PRIORITY_CYCLE.includes(priority)) return;

    const task = hydrated.find((candidate) => candidate._id === taskId);
    if (!task || task.priority === priority) return;

    try {
      setWarning("");
      await updateTask({ id: task._id, priority });
    } catch (caught) {
      setWarning(caught instanceof Error ? caught.message : "Não foi possível mudar a prioridade.");
    }
  }

  if (!tasks || !people || !areas) {
    return <div className="rounded-lg bg-surface p-6">A calcular plano...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">Próximas ações</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">Plano de ataque</h1>
        </div>
        <div className="grid gap-2">
          <span className="text-sm font-medium">Ver como</span>
          <PersonSelectorChips people={people} selectedPersonId={me} onSelect={setMe} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
          <input
            className="h-14 w-full rounded-full border border-border bg-surface pl-11 pr-4 text-sm shadow-soft"
            placeholder="Pesquisar tarefa..."
            value={filters.search}
            onChange={(event) => setFilters({ ...filters, search: event.target.value })}
          />
        </label>
        <button
          type="button"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink text-white shadow-soft hover:opacity-90"
          aria-label="Adicionar tarefa"
          onClick={() => setCreating(true)}
        >
          <Plus size={22} />
        </button>
      </div>

      <FilterBar filters={filters} onChange={setFilters} showPersonFilter={false} />

      {warning ? (
        <div className="rounded-2xl bg-pastel-pink/50 p-3 text-sm font-medium text-ink">
          {warning}
        </div>
      ) : null}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid gap-4">
          {areas.map((area) => (
            <PlanAreaSection
              key={area._id}
              area={area}
              tasks={filtered.filter((task) => task.areaId === area._id)}
              allTasks={filtered}
              people={people}
              onOpenTask={setSelectedTask}
            />
          ))}
        </div>
      </DndContext>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-[#ded6c9] bg-[#fffdf8] p-6 text-center text-slate-600">
          Sem tarefas para estes filtros.
        </div>
      ) : null}

      {(selectedTask || creating) ? (
        <TaskModal
          key={selectedTask?._id ?? "new"}
          task={selectedTask}
          tasks={hydrated}
          people={people}
          areas={areas}
          onClose={() => {
            setSelectedTask(null);
            setCreating(false);
          }}
        />
      ) : null}
    </div>
  );
}
