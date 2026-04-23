"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { PersonRole } from "@/types/renovation";

export default function PeopleSettingsPage() {
  const people = useQuery(api.people.listPeople);
  const updatePerson = useMutation(api.people.updatePerson);
  const createPerson = useMutation(api.people.createPerson);
  const setPersonActive = useMutation(api.people.setPersonActive);
  const [newName, setNewName] = useState("");

  if (!people) return <div className="rounded-lg bg-[#fffdf8] p-6">A carregar pessoas...</div>;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-teal-700">Definições</p>
        <h1 className="text-2xl font-semibold text-slate-950">Pessoas</h1>
      </div>

      <form
        className="flex gap-2 rounded-lg border border-[#ded6c9] bg-[#fffdf8] p-3"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!newName.trim()) return;
          await createPerson({
            name: newName.trim(),
            role: "other",
            color: "#475569",
            initials: newName.trim().slice(0, 2).toUpperCase(),
          });
          setNewName("");
        }}
      >
        <input className="h-11 flex-1 rounded-md border border-[#ded6c9] bg-white px-3" placeholder="Nova pessoa" value={newName} onChange={(event) => setNewName(event.target.value)} />
        <button className="inline-flex h-11 items-center gap-2 rounded-md bg-teal-700 px-4 font-semibold text-white">
          <Plus size={17} />
          Adicionar
        </button>
      </form>

      <div className="grid gap-3">
        {people.map((person) => (
          <form
            key={person._id}
            className="grid gap-2 rounded-lg border border-[#ded6c9] bg-[#fffdf8] p-3 md:grid-cols-[1fr_150px_110px_110px_auto]"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              await updatePerson({
                id: person._id,
                name: String(form.get("name") || person.name),
                role: String(form.get("role") || person.role) as PersonRole,
                color: String(form.get("color") || person.color),
                initials: String(form.get("initials") || person.initials),
              });
            }}
          >
            <input name="name" defaultValue={person.name} className="h-11 rounded-md border border-[#ded6c9] bg-white px-3" />
            <select name="role" defaultValue={person.role} className="h-11 rounded-md border border-[#ded6c9] bg-white px-3">
              <option value="owner">Dona</option>
              <option value="worker">Trabalhador</option>
              <option value="other">Outro</option>
            </select>
            <input name="initials" defaultValue={person.initials} className="h-11 rounded-md border border-[#ded6c9] bg-white px-3" />
            <input name="color" defaultValue={person.color} type="color" className="h-11 rounded-md border border-[#ded6c9] bg-white px-2" />
            <div className="flex gap-2">
              <button type="submit" className="h-11 rounded-md bg-teal-700 px-3 text-sm font-semibold text-white">Guardar</button>
              <button
                type="button"
                className="h-11 rounded-md border border-[#ded6c9] px-3 text-sm font-semibold"
                onClick={() => void setPersonActive({ id: person._id as Id<"people">, active: !person.active })}
              >
                {person.active ? "Desativar" : "Ativar"}
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
