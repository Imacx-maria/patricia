"use client";

import { useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "@/convex/_generated/api";
import { hydrateTasks } from "@/lib/taskLogic";
import { budgetTotals, countByStatus, nextUpcoming } from "@/lib/dashboard";
import { DashboardHero } from "@/components/DashboardHero";
import { StatusDonut } from "@/components/StatusDonut";
import { UpcomingList } from "@/components/UpcomingList";
import { RecentAttachmentsStrip } from "@/components/RecentAttachmentsStrip";
import { CostSummary } from "@/components/CostSummary";

export default function DashboardPage() {
  const tasks = useQuery(api.tasks.listTasks);
  const people = useQuery(api.people.listPeople);
  const areas = useQuery(api.areas.listAreas);

  const hydrated = useMemo(() => {
    if (!tasks || !people || !areas) return [];
    return hydrateTasks(tasks, people, areas);
  }, [areas, people, tasks]);

  if (!tasks || !people || !areas) {
    return <div className="rounded-2xl bg-surface p-6">A carregar dashboard...</div>;
  }

  const statuses = countByStatus(hydrated);
  const upcoming = nextUpcoming(hydrated, 5);
  const { estimated, actual, diff } = budgetTotals(hydrated);

  return (
    <div className="space-y-6">
      <DashboardHero />

      <div className="grid gap-4 md:grid-cols-3">
        <CostSummary label="Total estimado" value={estimated} />
        <CostSummary label="Total real" value={actual} />
        <CostSummary label="Diferença" value={diff} tone={diff <= 0 ? "good" : "bad"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section className="grid gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">Por estado</h2>
          <StatusDonut data={statuses} />
        </section>
        <section className="grid gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">Próximas</h2>
          <UpcomingList tasks={upcoming} />
        </section>
      </div>

      <section className="grid gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">Fotos recentes</h2>
        <RecentAttachmentsStrip />
      </section>
    </div>
  );
}
