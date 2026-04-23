"use client";

import { useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "@/convex/_generated/api";
import { CostSummary } from "@/components/CostSummary";
import { COST_CATEGORY_LABELS, STATUS_LABELS, currencyFormatter } from "@/lib/constants";
import { hydrateTasks } from "@/lib/taskLogic";

type CostRow = { label: string; estimated: number; actual: number };

function total(values: Array<number | null | undefined>) {
  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

function CostTable({ title, rows }: { title: string; rows: CostRow[] }) {
  return (
    <section className="rounded-lg border border-[#ded6c9] bg-[#fffdf8] p-4">
      <h2 className="mb-3 font-semibold">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2">Item</th>
              <th className="py-2 text-right">Estimado</th>
              <th className="py-2 text-right">Real</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-[#ded6c9]">
                <td className="py-2">{row.label}</td>
                <td className="py-2 text-right">{currencyFormatter.format(row.estimated)}</td>
                <td className="py-2 text-right">{currencyFormatter.format(row.actual)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function CostsPage() {
  const tasks = useQuery(api.tasks.listTasks);
  const people = useQuery(api.people.listPeople);
  const areas = useQuery(api.areas.listAreas);

  const hydrated = useMemo(() => {
    if (!tasks || !people || !areas) return [];
    return hydrateTasks(tasks, people, areas);
  }, [areas, people, tasks]);

  if (!tasks || !people || !areas) {
    return <div className="rounded-lg bg-surface p-6">A carregar custos...</div>;
  }

  const estimated = total(hydrated.map((task) => task.estimatedCost));
  const actual = total(hydrated.map((task) => task.actualCost));
  const diff = actual - estimated;
  const missingCost = hydrated.filter((task) => task.estimatedCost == null || task.actualCost == null);
  const overBudget = hydrated.filter((task) => (task.actualCost ?? 0) > (task.estimatedCost ?? Number.POSITIVE_INFINITY));
  const byArea = areas.map((area) => ({
    label: area.name,
    estimated: total(hydrated.filter((task) => task.areaId === area._id).map((task) => task.estimatedCost)),
    actual: total(hydrated.filter((task) => task.areaId === area._id).map((task) => task.actualCost)),
  }));
  const byCategory = Object.entries(COST_CATEGORY_LABELS).map(([category, label]) => ({
    label,
    estimated: total(hydrated.filter((task) => task.costCategory === category).map((task) => task.estimatedCost)),
    actual: total(hydrated.filter((task) => task.costCategory === category).map((task) => task.actualCost)),
  }));
  const byStatus = Object.entries(STATUS_LABELS).map(([status, label]) => ({
    label,
    estimated: total(hydrated.filter((task) => task.status === status).map((task) => task.estimatedCost)),
    actual: total(hydrated.filter((task) => task.status === status).map((task) => task.actualCost)),
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">Custos</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">Resumo financeiro</h1>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <CostSummary label="Total estimado" value={estimated} />
        <CostSummary label="Total real" value={actual} />
        <CostSummary label="Diferença" value={diff} tone={diff <= 0 ? "good" : "bad"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <CostTable title="Por área" rows={byArea} />
        <CostTable title="Por categoria" rows={byCategory} />
        <CostTable title="Por estado" rows={byStatus} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-[#ded6c9] bg-[#fffdf8] p-4">
          <h2 className="mb-3 font-semibold">Tarefas sem custo preenchido</h2>
          <div className="grid gap-2">
            {missingCost.slice(0, 20).map((task) => (
              <div key={task._id} className="rounded border border-[#ded6c9] bg-white p-3 text-sm">
                <p className="font-medium">{task.title}</p>
                <p className="text-slate-500">{task.area?.name}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-[#ded6c9] bg-[#fffdf8] p-4">
          <h2 className="mb-3 font-semibold">Acima do orçamento</h2>
          <div className="grid gap-2">
            {overBudget.map((task) => (
              <div key={task._id} className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                <p className="font-medium">{task.title}</p>
                <p>
                  {currencyFormatter.format(task.estimatedCost ?? 0)} →{" "}
                  {currencyFormatter.format(task.actualCost ?? 0)}
                </p>
              </div>
            ))}
            {overBudget.length === 0 ? <p className="text-sm text-slate-500">Sem desvios registados.</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
