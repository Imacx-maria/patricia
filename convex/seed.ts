import { v } from "convex/values";
import { mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";

const areas = [
  "Fase 1 - Preparação",
  "Fase 2 - Obra suja",
  "Fase 3 - Infraestruturas",
  "Fase 4 - Fechos e carpintaria base",
  "Fase 5 - Pintura",
  "Fase 6 - Chão",
  "Fase 7 - Montagens finais",
  "Fase 8 - Mobiliário e restauro",
  "Fase 9 - Exterior e extras",
];

async function ensurePeople(ctx: MutationCtx) {
  const existing = await ctx.db.query("people").collect();
  let unassigned = existing.find((person) => person.name === "Por atribuir");
  if (!unassigned) {
    const id = await ctx.db.insert("people", {
      name: "Por atribuir",
      role: "other",
      color: "#64748b",
      initials: "PA",
      active: true,
    });
    unassigned = await ctx.db.get(id) ?? undefined;
  }

  let owner = existing.find((person) => person.role === "owner");
  if (!owner) {
    const id = await ctx.db.insert("people", {
      name: "Dona / Responsável principal",
      role: "owner",
      color: "#b45309",
      initials: "D",
      active: true,
    });
    owner = await ctx.db.get(id) ?? undefined;
  }

  return Array.from(new Set([...existing.map((person) => person._id), owner!._id, unassigned!._id]));
}

async function ensureAreas(ctx: MutationCtx) {
  const existingAreas = await ctx.db.query("areas").collect();

  for (const [index, area] of areas.entries()) {
    const existing = existingAreas.find((candidate) => candidate.name === area);
    if (existing) {
      await ctx.db.patch(existing._id, { order: index });
    } else {
      await ctx.db.insert("areas", { name: area, order: index });
    }
  }
}

async function clearTaskContent(ctx: MutationCtx) {
  const attachments = await ctx.db.query("attachments").collect();
  for (const attachment of attachments) {
    await ctx.storage.delete(attachment.storageId);
    await ctx.db.delete(attachment._id);
  }

  const activity = await ctx.db.query("activityLog").collect();
  for (const entry of activity) {
    await ctx.db.delete(entry._id);
  }

  const tasks = await ctx.db.query("tasks").collect();
  for (const task of tasks) {
    await ctx.db.patch(task._id, { dependencyIds: [] });
  }
  for (const task of tasks) {
    await ctx.db.delete(task._id);
  }

  return tasks.length;
}

export const seedInitialData = mutation({
  args: {
    resetTasks: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const people = await ensurePeople(ctx);
    await ensureAreas(ctx);

    const removedTasks = args.resetTasks ? await clearTaskContent(ctx) : 0;
    const currentTasks = await ctx.db.query("tasks").collect();

    return {
      people: people.length,
      areas: areas.length,
      tasks: currentTasks.length,
      removedTasks,
    };
  },
});
