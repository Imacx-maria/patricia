"use client";

import { X, Trash2 } from "lucide-react";
import { useMutation } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { COST_CATEGORY_LABELS, PRIORITY_LABELS, STATUS_COLUMNS } from "@/lib/constants";
import type {
  Area,
  CostCategory,
  Person,
  TaskPriority,
  TaskStatus,
  TaskWithRelations,
} from "@/types/renovation";

type FormState = {
  title: string;
  description: string;
  areaId: string;
  status: TaskStatus;
  priority: TaskPriority;
  ownerId: string;
  allowedPersonIds: string[];
  requiresOwnerDecision: boolean;
  ownerDecisionDone: boolean;
  dependencyIds: string[];
  estimatedCost: string;
  actualCost: string;
  costCategory: CostCategory;
  dueDate: string;
  startDate: string;
  notes: string;
  materialNeeded: boolean;
  materialNotes: string;
};

function numberOrNull(value: string) {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function TaskModal({
  task,
  tasks,
  people,
  areas,
  onClose,
}: {
  task: TaskWithRelations | null;
  tasks: TaskWithRelations[];
  people: Person[];
  areas: Area[];
  onClose: () => void;
}) {
  const updateTask = useMutation(api.tasks.updateTask);
  const createTask = useMutation(api.tasks.createTask);
  const deleteTask = useMutation(api.tasks.deleteTask);
  const [error, setError] = useState("");
  const defaultPerson = people.find((person) => person.active) ?? people[0];

  const initialState = useMemo<FormState>(
    () => ({
      title: task?.title ?? "",
      description: task?.description ?? "",
      areaId: task?.areaId ?? areas[0]?._id ?? "",
      status: task?.status ?? "todo",
      priority: task?.priority ?? "medium",
      ownerId: task?.ownerId ?? defaultPerson?._id ?? "",
      allowedPersonIds: task?.allowedPersonIds ?? (defaultPerson ? [defaultPerson._id] : []),
      requiresOwnerDecision: task?.requiresOwnerDecision ?? false,
      ownerDecisionDone: task?.ownerDecisionDone ?? false,
      dependencyIds: task?.dependencyIds ?? [],
      estimatedCost: task?.estimatedCost?.toString() ?? "",
      actualCost: task?.actualCost?.toString() ?? "",
      costCategory: task?.costCategory ?? "other",
      dueDate: task?.dueDate ?? "",
      startDate: task?.startDate ?? "",
      notes: task?.notes ?? "",
      materialNeeded: task?.materialNeeded ?? false,
      materialNotes: task?.materialNotes ?? "",
    }),
    [areas, defaultPerson, task],
  );

  const [form, setForm] = useState<FormState>(initialState);

  if (!task && areas.length === 0) return null;

  const updateArray = (field: "allowedPersonIds" | "dependencyIds", id: string, checked: boolean) => {
    setForm((current) => ({
      ...current,
      [field]: checked
        ? Array.from(new Set([...current[field], id]))
        : current[field].filter((value) => value !== id),
    }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!form.title.trim() || !form.areaId || !form.ownerId) {
      setError("Título, área e responsável são obrigatórios.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description,
      areaId: form.areaId as Id<"areas">,
      status: form.status,
      priority: form.priority,
      ownerId: form.ownerId as Id<"people">,
      allowedPersonIds: form.allowedPersonIds as Id<"people">[],
      requiresOwnerDecision: form.requiresOwnerDecision,
      ownerDecisionDone: form.ownerDecisionDone,
      dependencyIds: form.dependencyIds.filter((id) => id !== task?._id) as Id<"tasks">[],
      estimatedCost: numberOrNull(form.estimatedCost),
      actualCost: numberOrNull(form.actualCost),
      costCategory: form.costCategory,
      dueDate: form.dueDate || null,
      startDate: form.startDate || null,
      notes: form.notes,
      materialNeeded: form.materialNeeded,
      materialNotes: form.materialNotes,
    };

    try {
      if (task) {
        await updateTask({ id: task._id, ...payload });
      } else {
        await createTask(payload);
      }
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível guardar a tarefa.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/40 p-0 md:items-center md:justify-center md:p-6">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-xl bg-[#fffdf8] shadow-2xl md:max-w-3xl md:rounded-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#ded6c9] bg-[#fffdf8] px-4 py-3">
          <h2 className="text-lg font-semibold">{task ? "Editar tarefa" : "Nova tarefa"}</h2>
          <button className="rounded-md p-2 hover:bg-[#eee8de]" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form className="grid gap-4 p-4" onSubmit={handleSubmit}>
          {error ? <div className="rounded-md bg-red-100 p-3 text-sm text-red-800">{error}</div> : null}

          <label className="grid gap-1 text-sm font-medium">
            Título
            <input className="h-11 rounded-md border border-[#ded6c9] bg-white px-3" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </label>

          <label className="grid gap-1 text-sm font-medium">
            Descrição
            <textarea className="min-h-24 rounded-md border border-[#ded6c9] bg-white p-3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </label>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-1 text-sm font-medium">
              Área
              <select className="h-11 rounded-md border border-[#ded6c9] bg-white px-3" value={form.areaId} onChange={(event) => setForm({ ...form, areaId: event.target.value })}>
                {areas.map((area) => <option key={area._id} value={area._id}>{area.name}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Estado
              <select className="h-11 rounded-md border border-[#ded6c9] bg-white px-3" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as TaskStatus })}>
                {STATUS_COLUMNS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Prioridade
              <select className="h-11 rounded-md border border-[#ded6c9] bg-white px-3" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as TaskPriority })}>
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-1 text-sm font-medium">
              Responsável
              <select className="h-11 rounded-md border border-[#ded6c9] bg-white px-3" value={form.ownerId} onChange={(event) => setForm({ ...form, ownerId: event.target.value })}>
                {people.map((person) => <option key={person._id} value={person._id}>{person.name}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Estimado
              <input className="h-11 rounded-md border border-[#ded6c9] bg-white px-3" inputMode="decimal" value={form.estimatedCost} onChange={(event) => setForm({ ...form, estimatedCost: event.target.value })} />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Real
              <input className="h-11 rounded-md border border-[#ded6c9] bg-white px-3" inputMode="decimal" value={form.actualCost} onChange={(event) => setForm({ ...form, actualCost: event.target.value })} />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-1 text-sm font-medium">
              Categoria
              <select className="h-11 rounded-md border border-[#ded6c9] bg-white px-3" value={form.costCategory} onChange={(event) => setForm({ ...form, costCategory: event.target.value as CostCategory })}>
                {Object.entries(COST_CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Início
              <input className="h-11 rounded-md border border-[#ded6c9] bg-white px-3" type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Prazo
              <input className="h-11 rounded-md border border-[#ded6c9] bg-white px-3" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <fieldset className="rounded-md border border-[#ded6c9] bg-white p-3">
              <legend className="px-1 text-sm font-semibold">Quem pode executar</legend>
              <div className="mt-2 grid gap-2">
                {people.map((person) => (
                  <label key={person._id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.allowedPersonIds.includes(person._id)} onChange={(event) => updateArray("allowedPersonIds", person._id, event.target.checked)} />
                    {person.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="rounded-md border border-[#ded6c9] bg-white p-3">
              <legend className="px-1 text-sm font-semibold">Dependências</legend>
              <div className="mt-2 max-h-48 overflow-y-auto">
                {tasks.filter((candidate) => candidate._id !== task?._id).map((candidate) => (
                  <label key={candidate._id} className="flex items-start gap-2 py-1 text-sm">
                    <input className="mt-1" type="checkbox" checked={form.dependencyIds.includes(candidate._id)} onChange={(event) => updateArray("dependencyIds", candidate._id, event.target.checked)} />
                    <span>{candidate.title}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex items-center gap-2 rounded-md border border-[#ded6c9] bg-white p-3 text-sm font-medium">
              <input type="checkbox" checked={form.requiresOwnerDecision} onChange={(event) => setForm({ ...form, requiresOwnerDecision: event.target.checked })} />
              Precisa decisão da dona
            </label>
            <label className="flex items-center gap-2 rounded-md border border-[#ded6c9] bg-white p-3 text-sm font-medium">
              <input type="checkbox" checked={form.ownerDecisionDone} onChange={(event) => setForm({ ...form, ownerDecisionDone: event.target.checked })} />
              Decisão tomada
            </label>
            <label className="flex items-center gap-2 rounded-md border border-[#ded6c9] bg-white p-3 text-sm font-medium">
              <input type="checkbox" checked={form.materialNeeded} onChange={(event) => setForm({ ...form, materialNeeded: event.target.checked })} />
              Precisa material
            </label>
          </div>

          <label className="grid gap-1 text-sm font-medium">
            Notas de material
            <input className="h-11 rounded-md border border-[#ded6c9] bg-white px-3" value={form.materialNotes} onChange={(event) => setForm({ ...form, materialNotes: event.target.value })} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Notas
            <textarea className="min-h-24 rounded-md border border-[#ded6c9] bg-white p-3" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </label>

          <div className="flex items-center justify-between gap-3 border-t border-[#ded6c9] pt-4">
            {task ? (
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700 hover:bg-red-50"
                onClick={async () => {
                  try {
                    await deleteTask({ id: task._id });
                    onClose();
                  } catch (caught) {
                    setError(caught instanceof Error ? caught.message : "Não foi possível apagar.");
                  }
                }}
              >
                <Trash2 size={16} />
                Apagar
              </button>
            ) : <span />}
            <div className="flex gap-2">
              <button type="button" className="h-11 rounded-md border border-[#ded6c9] px-4 font-semibold" onClick={onClose}>Cancelar</button>
              <button type="submit" className="h-11 rounded-md bg-teal-700 px-4 font-semibold text-white hover:bg-teal-800">Guardar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
