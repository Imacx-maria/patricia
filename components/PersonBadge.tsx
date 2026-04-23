"use client";

import type { Person } from "@/types/renovation";

export function PersonBadge({ person }: { person?: Person }) {
  if (!person) {
    return <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">Sem pessoa</span>;
  }

  return (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-ink ring-2 ring-white"
      style={{ backgroundColor: person.color }}
    >
      {person.initials}
    </span>
  );
}
