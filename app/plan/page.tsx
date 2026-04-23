"use client";

import { useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import { TaskCard } from "@/components/TaskCard";
import { TaskModal } from "@/components/TaskModal";
import { deriveTaskState, hydrateTasks } from "@/lib/taskLogic";
import type { Person, TaskWithRelations } from "@/types/renovation";

function PlanSection({
  title,
  tasks,
  allTasks,
  people,
  onOpenTask,
}: {
  title: string;
  tasks: TaskWithRelations[];
  allTasks: TaskWithRelations[];
  people: Person[];
  onOpenTask: (task: TaskWithRelations) => void;
}) {
  return (
    <section className="rounded-lg border border-[#ded6c9] bg-[#fffdf8] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-slate-950">{title}</h2>
        <span className="rounded bg-[#eee8de] px-2 py-1 text-xs font-semibold">{tasks.length}</span>
      </div>
      <div className="grid gap-3">
        {tasks.slice(0, 8).map((task) => (
          <TaskCard key={task._id} task={task} allTasks={allTasks} people={people} onOpen={onOpenTask} compact />
        ))}
        {tasks.length === 0 ? <p className="text-sm text-slate-500">Nada nesta lista.</p> : null}
      </div>
    </section>
  );
}

export default function PlanPage() {
  const tasks = useQuery(api.tasks.listTasks);
  const people = useQuery(api.people.listPeople);
  const areas = useQuery(api.areas.listAreas);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);

  const hydrated = useMemo(() => {
    if (!tasks || !people || !areas) return [];
    return hydrateTasks(tasks, people, areas);
  }, [areas, people, tasks]);

  if (!tasks || !people || !areas) {
    return <div className="rounded-lg bg-[#fffdf8] p-6">A calcular plano...</div>;
  }

  const activePeople = people.filter((person) => person.active);
  const ready = hydrated.filter((task) => deriveTaskState(task, hydrated, people).canStart);
  const ownerOnly = hydrated.filter((task) => {
    const derived = deriveTaskState(task, hydrated, people);
    return task.status !== "done" && (derived.isOwnerOnly || task.requiresOwnerDecision);
  });
  const anyPerson = ready.filter((task) => task.allowedPersonIds.length >= 2);
  const byPerson = activePeople.map((person) => ({
    person,
    tasks: ready.filter((task) => task.allowedPersonIds.includes(person._id)),
  }));
  const blockedByDecision = hydrated.filter((task) =>
    deriveTaskState(task, hydrated, people).blockedReasons.some((reason) => reason.type === "owner_decision"),
  );
  const blockedByMaterial = hydrated.filter((task) =>
    deriveTaskState(task, hydrated, people).blockedReasons.some((reason) => reason.type === "material"),
  );
  const blockedByDependencies = hydrated.filter((task) =>
    deriveTaskState(task, hydrated, people).blockedReasons.some((reason) => reason.type === "dependency"),
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-teal-700">
          Próximas ações
        </p>
        <h1 className="text-2xl font-semibold text-slate-950">Plano de ataque</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PlanSection title="Prontas para começar" tasks={ready} allTasks={hydrated} people={people} onOpenTask={setSelectedTask} />
        <PlanSection title="Só a dona pode fazer/decidir" tasks={ownerOnly} allTasks={hydrated} people={people} onOpenTask={setSelectedTask} />
        {byPerson.map(({ person, tasks: personTasks }) => (
          <PlanSection key={person._id} title={person.name} tasks={personTasks} allTasks={hydrated} people={people} onOpenTask={setSelectedTask} />
        ))}
        <PlanSection title="Qualquer pessoa" tasks={anyPerson} allTasks={hydrated} people={people} onOpenTask={setSelectedTask} />
        <PlanSection title="Bloqueadas por decisões" tasks={blockedByDecision} allTasks={hydrated} people={people} onOpenTask={setSelectedTask} />
        <PlanSection title="Bloqueadas por material" tasks={blockedByMaterial} allTasks={hydrated} people={people} onOpenTask={setSelectedTask} />
        <PlanSection title="Bloqueadas por dependências" tasks={blockedByDependencies} allTasks={hydrated} people={people} onOpenTask={setSelectedTask} />
      </div>

      {selectedTask ? (
        <TaskModal key={selectedTask._id} task={selectedTask} tasks={hydrated} people={people} areas={areas} onClose={() => setSelectedTask(null)} />
      ) : null}
    </div>
  );
}
