"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/convex/_generated/api";

export default function AreasSettingsPage() {
  const areas = useQuery(api.areas.listAreas);
  const createArea = useMutation(api.areas.createArea);
  const updateArea = useMutation(api.areas.updateArea);
  const deleteArea = useMutation(api.areas.deleteArea);
  const [newArea, setNewArea] = useState("");
  const [error, setError] = useState("");

  if (!areas) return <div className="rounded-lg bg-[#fffdf8] p-6">A carregar áreas...</div>;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-teal-700">Definições</p>
        <h1 className="text-2xl font-semibold text-slate-950">Áreas</h1>
      </div>
      {error ? <div className="rounded-md bg-red-100 p-3 text-sm text-red-800">{error}</div> : null}

      <form
        className="flex gap-2 rounded-lg border border-[#ded6c9] bg-[#fffdf8] p-3"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!newArea.trim()) return;
          await createArea({ name: newArea.trim(), order: areas.length });
          setNewArea("");
        }}
      >
        <input className="h-11 flex-1 rounded-md border border-[#ded6c9] bg-white px-3" placeholder="Nova área" value={newArea} onChange={(event) => setNewArea(event.target.value)} />
        <button className="inline-flex h-11 items-center gap-2 rounded-md bg-teal-700 px-4 font-semibold text-white">
          <Plus size={17} />
          Adicionar
        </button>
      </form>

      <div className="grid gap-3">
        {areas.map((area) => (
          <form
            key={area._id}
            className="grid gap-2 rounded-lg border border-[#ded6c9] bg-[#fffdf8] p-3 md:grid-cols-[1fr_120px_auto]"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              await updateArea({
                id: area._id,
                name: String(form.get("name") || area.name),
                order: Number(form.get("order") || area.order),
              });
            }}
          >
            <input name="name" defaultValue={area.name} className="h-11 rounded-md border border-[#ded6c9] bg-white px-3" />
            <input name="order" type="number" defaultValue={area.order} className="h-11 rounded-md border border-[#ded6c9] bg-white px-3" />
            <div className="flex gap-2">
              <button type="submit" className="h-11 rounded-md bg-teal-700 px-3 text-sm font-semibold text-white">Guardar</button>
              <button
                type="button"
                className="inline-flex h-11 items-center rounded-md border border-red-200 px-3 text-red-700"
                onClick={async () => {
                  try {
                    setError("");
                    await deleteArea({ id: area._id });
                  } catch (caught) {
                    setError(caught instanceof Error ? caught.message : "Não foi possível apagar a área.");
                  }
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
