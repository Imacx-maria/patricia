"use client";

import { useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { AreaSection } from "@/components/AreaSection";
import { FilterBar, type TaskFilters } from "@/components/FilterBar";
import { QuickAddTask } from "@/components/QuickAddTask";
import { TaskModal } from "@/components/TaskModal";
import type { Id } from "@/convex/_generated/dataModel";
import { deriveTaskState, hydrateTasks } from "@/lib/taskLogic";
import type { TaskWithRelations } from "@/types/renovation";

export default function MobilePage() {
  const tasks = useQuery(api.tasks.listTasks);
  const people = useQuery(api.people.listPeople);
  const areas = useQuery(api.areas.listAreas);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [creating, setCreating] = useState(false);
  const [me, setMe] = useState(() =>
    typeof window === "undefined" ? "" : (window.localStorage.getItem("patricia.me") ?? ""),
  );
  const [filters, setFilters] = useState<TaskFilters>({
    area: "all",
    personId: "all",
    status: "all",
    mine: false,
    blocked: false,
    waitingMaterial: false,
  });

  useEffect(() => {
    if (me) window.localStorage.setItem("patricia.me", me);
  }, [me]);

  const hydrated = useMemo(() => {
    if (!tasks || !people || !areas) return [];
    return hydrateTasks(tasks, people, areas);
  }, [areas, people, tasks]);

  const filtered = useMemo(() => {
    if (!people) return [];
    return hydrated.filter((task) => {
      const derived = deriveTaskState(task, hydrated, people);
      if (filters.area !== "all" && task.area?.name !== filters.area) return false;
      if (filters.personId !== "all" && task.ownerId !== filters.personId && !task.allowedPersonIds.includes(filters.personId as Id<"people">)) return false;
      if (filters.status !== "all" && task.status !== filters.status) return false;
      if (filters.mine && me && task.ownerId !== me && !task.allowedPersonIds.includes(me as Id<"people">)) return false;
      if (filters.blocked && !derived.isBlocked) return false;
      if (filters.waitingMaterial && !task.materialNeeded && task.status !== "waiting_material") return false;
      return true;
    });
  }, [filters, hydrated, me, people]);

  if (!tasks || !people || !areas) {
    return <div className="rounded-lg bg-[#fffdf8] p-6">A carregar renovação...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-teal-700">
            Checklist mobile
          </p>
          <h1 className="text-2xl font-semibold text-slate-950">Tarefas por área</h1>
        </div>
        <div className="grid gap-2 md:w-72">
          <label className="text-sm font-medium">Ver como</label>
          <select
            className="h-11 rounded-md border border-[#ded6c9] bg-white px-3"
            value={me}
            onChange={(event) => setMe(event.target.value)}
          >
            <option value="">Escolher pessoa</option>
            {people.map((person) => (
              <option key={person._id} value={person._id}>{person.name}</option>
            ))}
          </select>
        </div>
      </div>

      <QuickAddTask areas={areas} people={people} currentPersonId={me} />
      <FilterBar filters={filters} onChange={setFilters} people={people} />

      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-teal-500 bg-teal-50 px-4 py-3 font-semibold text-teal-800 md:hidden"
        onClick={() => setCreating(true)}
      >
        <Plus size={18} />
        Nova tarefa completa
      </button>

      <div className="grid gap-6">
        {areas.map((area) => (
          <AreaSection
            key={area._id}
            area={area}
            tasks={filtered.filter((task) => task.areaId === area._id)}
            allTasks={hydrated}
            people={people}
            onOpenTask={setSelectedTask}
          />
        ))}
      </div>

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
