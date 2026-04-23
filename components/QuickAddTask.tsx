"use client";

import { Plus } from "lucide-react";
import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Area, Person } from "@/types/renovation";

export function QuickAddTask({
  areas,
  people,
  currentPersonId,
}: {
  areas: Area[];
  people: Person[];
  currentPersonId?: string;
}) {
  const createTask = useMutation(api.tasks.createTask);
  const [title, setTitle] = useState("");
  const [areaId, setAreaId] = useState<string>(areas[0]?._id ?? "");
  const activePeople = people.filter((person) => person.active);
  const unassignedPersonId = people.find((person) => person.name === "Por atribuir")?._id;
  const defaultPersonId = unassignedPersonId || currentPersonId || activePeople[0]?._id || "";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !areaId || !defaultPersonId) return;

    await createTask({
      title: title.trim(),
      description: "",
      areaId: areaId as Id<"areas">,
      status: "todo",
      priority: "medium",
      ownerId: defaultPersonId as Id<"people">,
      allowedPersonIds: [],
      requiresOwnerDecision: false,
      ownerDecisionDone: false,
      dependencyIds: [],
      costCategory: "other",
      notes: "",
      materialNeeded: false,
      materialNotes: "",
    });

    setTitle("");
  }

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={handleSubmit}
    >
      <input
        className="h-11 flex-1 rounded-full border border-border bg-surface px-4 text-sm"
        placeholder="Adicionar tarefa rápida..."
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <select
        className="h-11 rounded-full border border-border bg-surface px-3 text-sm"
        value={areaId}
        onChange={(event) => setAreaId(event.target.value)}
      >
        {areas.map((area) => (
          <option key={area._id} value={area._id}>{area.name}</option>
        ))}
      </select>
      <button
        className="h-11 rounded-full bg-ink px-5 font-semibold text-white hover:opacity-90"
        type="submit"
      >
        <Plus size={18} />
      </button>
    </form>
  );
}
