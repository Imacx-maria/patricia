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
  const defaultPersonId = currentPersonId || activePeople[0]?._id || "";

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
      allowedPersonIds: [defaultPersonId as Id<"people">],
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
      className="grid gap-2 rounded-lg border border-[#ded6c9] bg-[#fffdf8] p-3 md:grid-cols-[1fr_220px_auto]"
      onSubmit={handleSubmit}
    >
      <input
        className="h-12 rounded-md border border-[#ded6c9] bg-white px-3 text-base"
        placeholder="Adicionar tarefa rápida..."
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <select
        className="h-12 rounded-md border border-[#ded6c9] bg-white px-3 text-sm"
        value={areaId}
        onChange={(event) => setAreaId(event.target.value)}
      >
        {areas.map((area) => (
          <option key={area._id} value={area._id}>{area.name}</option>
        ))}
      </select>
      <button
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-teal-700 px-4 font-semibold text-white hover:bg-teal-800"
        type="submit"
      >
        <Plus size={18} />
        Adicionar
      </button>
    </form>
  );
}
