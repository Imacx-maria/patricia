"use client";

import { AREA_NAMES, STATUS_COLUMNS } from "@/lib/constants";
import type { TaskFilters } from "@/lib/taskFilters";
import type { Person } from "@/types/renovation";

export function FilterBar({
  filters,
  onChange,
  people,
  showPersonFilter = true,
}: {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  people?: Person[];
  showPersonFilter?: boolean;
}) {
  return (
    <div className={`grid gap-2 rounded-xl border border-border bg-surface p-3 ${showPersonFilter ? "md:grid-cols-5" : "md:grid-cols-4"}`}>
      <select
        className="h-9 rounded-full border border-border bg-surface px-3 text-xs font-semibold transition"
        value={filters.area}
        onChange={(event) => onChange({ ...filters, area: event.target.value })}
      >
        <option value="all">Todas as áreas</option>
        {AREA_NAMES.map((area) => (
          <option key={area} value={area}>{area}</option>
        ))}
      </select>
      {showPersonFilter ? (
        <select
          className="h-9 rounded-full border border-border bg-surface px-3 text-xs font-semibold transition"
          value={filters.personId}
          onChange={(event) => onChange({ ...filters, personId: event.target.value })}
        >
          <option value="all">Todas as pessoas</option>
          {(people ?? []).map((person) => (
            <option key={person._id} value={person._id}>{person.name}</option>
          ))}
        </select>
      ) : null}
      <select
        className="h-9 rounded-full border border-border bg-surface px-3 text-xs font-semibold transition"
        value={filters.status}
        onChange={(event) => onChange({ ...filters, status: event.target.value as TaskFilters["status"] })}
      >
        <option value="all">Todos os estados</option>
        {STATUS_COLUMNS.map((status) => (
          <option key={status.value} value={status.value}>{status.label}</option>
        ))}
      </select>
      <label className="flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-3 text-xs font-semibold transition hover:bg-surface-raised">
        <input
          type="checkbox"
          checked={filters.mine}
          onChange={(event) => onChange({ ...filters, mine: event.target.checked })}
        />
        Só minhas
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-3 text-xs font-semibold transition hover:bg-surface-raised">
          <input
            type="checkbox"
            checked={filters.blocked}
            onChange={(event) => onChange({ ...filters, blocked: event.target.checked })}
          />
          Bloq.
        </label>
        <label className="flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-3 text-xs font-semibold transition hover:bg-surface-raised">
          <input
            type="checkbox"
            checked={filters.waitingMaterial}
            onChange={(event) => onChange({ ...filters, waitingMaterial: event.target.checked })}
          />
          Material
        </label>
      </div>
    </div>
  );
}
