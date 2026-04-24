"use client";

import { X, Trash2 } from "lucide-react";
import { useMutation } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AttachmentsSection } from "./AttachmentsSection";
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
  const unassignedPerson = people.find((person) => person.name === "Por atribuir");
  const defaultPerson = unassignedPerson ?? people.find((person) => person.active) ?? people[0];

  const initialState = useMemo<FormState>(
    () => ({
      title: task?.title ?? "",
      description: task?.description ?? "",
      areaId: task?.areaId ?? areas[0]?._id ?? "",
      status: task?.status ?? "todo",
      priority: task?.priority ?? "medium",
      ownerId: task?.ownerId ?? defaultPerson?._id ?? "",
      allowedPersonIds: task?.allowedPersonIds ?? [],
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

  const fieldLabel = "grid gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted";
  const fieldInput = "h-11 rounded-2xl border border-border bg-surface-raised px-3 text-sm font-normal normal-case tracking-normal text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none";
  const fieldTextarea = "min-h-24 rounded-2xl border border-border bg-surface-raised p-3 text-sm font-normal normal-case tracking-normal text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none";
  const checkRow = "flex items-center gap-2 rounded-2xl border border-border bg-surface-raised p-3 text-sm font-medium text-ink";

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink/40 p-0 backdrop-blur-sm md:items-center md:justify-center md:p-6">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-background shadow-soft md:max-w-3xl md:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">Tarefa</p>
            <h2 className="text-xl font-extrabold tracking-tight text-ink">{task ? "Editar tarefa" : "Nova tarefa"}</h2>
          </div>
          <button className="rounded-full p-2 text-ink hover:bg-background" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
          {error ? <div className="rounded-2xl bg-pastel-pink/50 p-3 text-sm font-medium text-ink">{error}</div> : null}

          <label className={fieldLabel}>
            Título
            <input className={fieldInput} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </label>

          <label className={fieldLabel}>
            Descrição
            <textarea className={fieldTextarea} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </label>

          <div className="grid gap-3 md:grid-cols-3">
            <label className={fieldLabel}>
              Área
              <select className={fieldInput} value={form.areaId} onChange={(event) => setForm({ ...form, areaId: event.target.value })}>
                {areas.map((area) => <option key={area._id} value={area._id}>{area.name}</option>)}
              </select>
            </label>
            <label className={fieldLabel}>
              Estado
              <select className={fieldInput} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as TaskStatus })}>
                {STATUS_COLUMNS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
              </select>
            </label>
            <label className={fieldLabel}>
              Prioridade
              <select className={fieldInput} value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as TaskPriority })}>
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className={fieldLabel}>
              Responsável
              <select className={fieldInput} value={form.ownerId} onChange={(event) => setForm({ ...form, ownerId: event.target.value })}>
                {people.map((person) => <option key={person._id} value={person._id}>{person.name}</option>)}
              </select>
            </label>
            <label className={fieldLabel}>
              Estimado
              <input className={fieldInput} inputMode="decimal" value={form.estimatedCost} onChange={(event) => setForm({ ...form, estimatedCost: event.target.value })} />
            </label>
            <label className={fieldLabel}>
              Real
              <input className={fieldInput} inputMode="decimal" value={form.actualCost} onChange={(event) => setForm({ ...form, actualCost: event.target.value })} />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className={fieldLabel}>
              Categoria
              <select className={fieldInput} value={form.costCategory} onChange={(event) => setForm({ ...form, costCategory: event.target.value as CostCategory })}>
                {Object.entries(COST_CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className={fieldLabel}>
              Início
              <input className={fieldInput} type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
            </label>
            <label className={fieldLabel}>
              Prazo
              <input className={fieldInput} type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <fieldset className="rounded-2xl border border-border bg-surface-raised p-4 shadow-soft">
              <legend className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Quem pode executar</legend>
              <div className="mt-2 grid gap-2">
                {people.map((person) => (
                  <label key={person._id} className="flex items-center gap-2 text-sm text-ink">
                    <input type="checkbox" checked={form.allowedPersonIds.includes(person._id)} onChange={(event) => updateArray("allowedPersonIds", person._id, event.target.checked)} />
                    {person.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="rounded-2xl border border-border bg-surface-raised p-4 shadow-soft">
              <legend className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Dependências</legend>
              <div className="mt-2 max-h-48 overflow-y-auto">
                {tasks.filter((candidate) => candidate._id !== task?._id).map((candidate) => (
                  <label key={candidate._id} className="flex items-start gap-2 py-1 text-sm text-ink">
                    <input className="mt-1" type="checkbox" checked={form.dependencyIds.includes(candidate._id)} onChange={(event) => updateArray("dependencyIds", candidate._id, event.target.checked)} />
                    <span>{candidate.title}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className={checkRow}>
              <input type="checkbox" checked={form.requiresOwnerDecision} onChange={(event) => setForm({ ...form, requiresOwnerDecision: event.target.checked })} />
              Precisa decisão da dona
            </label>
            <label className={checkRow}>
              <input type="checkbox" checked={form.ownerDecisionDone} onChange={(event) => setForm({ ...form, ownerDecisionDone: event.target.checked })} />
              Decisão tomada
            </label>
            <label className={checkRow}>
              <input type="checkbox" checked={form.materialNeeded} onChange={(event) => setForm({ ...form, materialNeeded: event.target.checked })} />
              Precisa material
            </label>
          </div>

          <label className={fieldLabel}>
            Notas de material
            <input className={fieldInput} value={form.materialNotes} onChange={(event) => setForm({ ...form, materialNotes: event.target.value })} />
          </label>
          <label className={fieldLabel}>
            Notas
            <textarea className={fieldTextarea} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </label>

          {task ? (
            <AttachmentsSection taskId={task._id} />
          ) : (
            <p className="rounded-2xl bg-surface-raised p-3 text-xs text-ink-muted">
              Guarda a tarefa para poderes adicionar fotos.
            </p>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            {task ? (
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-pastel-pink px-4 text-sm font-semibold text-ink hover:bg-pastel-pink/40"
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
              <button type="button" className="h-11 rounded-full border border-border px-4 font-semibold" onClick={onClose}>Cancelar</button>
              <button type="submit" className="h-11 rounded-full bg-ink px-5 font-semibold text-white hover:opacity-90">Guardar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
