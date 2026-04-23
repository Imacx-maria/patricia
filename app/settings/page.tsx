import Link from "next/link";
import { Map, Users } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-teal-700">Definições</p>
        <h1 className="text-2xl font-semibold text-slate-950">Organização da obra</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/settings/people" className="rounded-lg border border-[#ded6c9] bg-[#fffdf8] p-5 transition hover:border-teal-400">
          <Users className="mb-3 text-teal-700" />
          <h2 className="font-semibold">Pessoas</h2>
          <p className="mt-1 text-sm text-slate-600">Editar nomes, papéis, cores e disponibilidade.</p>
        </Link>
        <Link href="/settings/areas" className="rounded-lg border border-[#ded6c9] bg-[#fffdf8] p-5 transition hover:border-teal-400">
          <Map className="mb-3 text-teal-700" />
          <h2 className="font-semibold">Áreas</h2>
          <p className="mt-1 text-sm text-slate-600">Gerir divisões e ordem de apresentação.</p>
        </Link>
      </div>
    </div>
  );
}
