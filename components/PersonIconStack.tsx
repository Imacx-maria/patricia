"use client";

import type { Person } from "@/types/renovation";

export function PersonIconStack({
  people,
  size = "sm",
}: {
  people: Person[];
  size?: "sm" | "md";
}) {
  const visiblePeople = people.slice(0, 4);
  const dimension = size === "md" ? "h-8 w-8 text-[11px]" : "h-7 w-7 text-[10px]";

  if (visiblePeople.length === 0) {
    return (
      <span className={`flex ${dimension} items-center justify-center rounded-full bg-white/70 font-extrabold text-ink`}>
        ?
      </span>
    );
  }

  return (
    <div className="flex items-center">
      {visiblePeople.map((person, index) => (
        <span
          key={person._id}
          className={`flex ${dimension} items-center justify-center rounded-full border-2 border-white font-extrabold text-ink shadow-soft ${
            index > 0 ? "-ml-2" : ""
          }`}
          style={{ backgroundColor: person.color }}
          title={person.name}
        >
          {person.initials}
        </span>
      ))}
      {people.length > visiblePeople.length ? (
        <span className={`-ml-2 flex ${dimension} items-center justify-center rounded-full border-2 border-white bg-ink font-extrabold text-white shadow-soft`}>
          +{people.length - visiblePeople.length}
        </span>
      ) : null}
    </div>
  );
}
