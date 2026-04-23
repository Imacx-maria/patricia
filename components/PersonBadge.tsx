"use client";

import type { Person } from "@/types/renovation";

export function PersonBadge({ person }: { person?: Person }) {
  if (!person) {
    return <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">Sem pessoa</span>;
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded bg-white px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
      <span
        className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white"
        style={{ backgroundColor: person.color }}
      >
        {person.initials}
      </span>
      {person.name}
    </span>
  );
}
