"use client";

import { useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { AreaSection } from "@/components/AreaSection";
import { FilterBar } from "@/components/FilterBar";
import { TaskModal } from "@/components/TaskModal";
import { filterTasks, readSavedTaskFilters } from "@/lib/taskFilters";
import { hydrateTasks } from "@/lib/taskLogic";
import type { Person, TaskWithRelations } from "@/types/renovation";

const FILTER_STORAGE_KEY = "patricia.filters";

function PersonChips({
  people,
  selectedPersonId,
  onSelect,
}: {
  people: Person[];
  selectedPersonId: string;
  onSelect: (personId: string) => void;
}) {
  const visiblePeople = people
    .filter((person) => person.active && person.name !== "Por atribuir")
    .slice(0, 3);

  return (
    <div className="flex items-center gap-2">
      {visiblePeople.map((person) => {
        const selected = selectedPersonId === person._id;
        return (
          <button
            key={person._id}
            type="button"
            aria-label={`Ver como ${person.name}`}
            title={person.name}
            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-extrabold shadow-soft transition hover:-translate-y-0.5 ${
              selected ? "border-ink ring-2 ring-ink/20" : "border-white"
            }`}
            style={{ backgroundColor: person.color, color: "#141417" }}
            onClick={() => onSelect(person._id)}
          >
            {person.initials}
          </button>
        );
      })}
    </div>
  );
}

export default function MobilePage() {
  const tasks = useQuery(api.tasks.listTasks);
  const people = useQuery(api.people.listPeople);
  const areas = useQuery(api.areas.listAreas);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [creating, setCreating] = useState(false);
  const [me, setMe] = useState(() =>
    typeof window === "undefined" ? "" : (window.localStorage.getItem("patricia.me") ?? ""),
  );
  const [filters, setFilters] = useState(() => readSavedTaskFilters(FILTER_STORAGE_KEY));

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

  if (!tasks || !people || !areas) {
    return <div className="rounded-lg bg-surface p-6">A carregar renovação...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">Checklist mobile</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">Tarefas por área</h1>
        </div>
        <div className="grid gap-2">
          <span className="text-sm font-medium">Ver como</span>
          <PersonChips people={people} selectedPersonId={me} onSelect={setMe} />
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
