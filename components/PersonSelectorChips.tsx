"use client";

import { Hammer, Sparkles, UserRound } from "lucide-react";
import type { Person } from "@/types/renovation";

function iconForPerson(person: Person) {
  if (person.role === "owner") return UserRound;
  if (person.role === "worker") return Hammer;
  return Sparkles;
}

export function PersonSelectorChips({
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
        const Icon = iconForPerson(person);
        return (
          <button
            key={person._id}
            type="button"
            aria-label={`Ver como ${person.name}`}
            title={person.name}
            className={`group flex h-14 w-14 flex-col items-center justify-center rounded-full border-2 shadow-soft transition hover:-translate-y-0.5 ${
              selected ? "border-ink ring-2 ring-ink/20" : "border-white"
            }`}
            style={{ backgroundColor: person.color, color: "#141417" }}
            onClick={() => onSelect(person._id)}
          >
            <Icon size={18} strokeWidth={2.4} />
            <span className="mt-0.5 text-[10px] font-extrabold leading-none">{person.initials}</span>
          </button>
        );
      })}
    </div>
  );
}
