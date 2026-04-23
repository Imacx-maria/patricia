import { v } from "convex/values";
import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

type SeedTask = {
  area: string;
  title: string;
  priority?: "low" | "medium" | "high" | "critical";
  status?: "backlog" | "todo" | "doing" | "blocked" | "waiting_material" | "done";
  costCategory?: "materials" | "labor" | "tools" | "furniture" | "decoration" | "other";
  requiresOwnerDecision?: boolean;
  materialNeeded?: boolean;
  dueDate?: string;
};

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

const taskSeeds: SeedTask[] = [
  { area: "Fase 1 - Preparação", title: "Proteger ou reparar telhado", priority: "critical", status: "todo", costCategory: "labor" },
  { area: "Fase 1 - Preparação", title: "Limpar e esvaziar casa completamente", status: "todo", priority: "high", costCategory: "other" },
  { area: "Fase 1 - Preparação", title: "Retirar móveis ou proteger bem", status: "todo", costCategory: "other" },
  { area: "Fase 1 - Preparação", title: "Decidir se a pedra da sala fica ou se se mexe", priority: "high", requiresOwnerDecision: true, costCategory: "other" },
  { area: "Fase 1 - Preparação", title: "Decidir ilha da cozinha: sim/não e como", priority: "high", requiresOwnerDecision: true, costCategory: "other" },
  { area: "Fase 1 - Preparação", title: "Decidir sistema de água quente", priority: "high", requiresOwnerDecision: true, costCategory: "materials" },
  { area: "Fase 1 - Preparação", title: "Escolher chão de madeira: espessura, tipo, transições e alturas de portas", priority: "high", requiresOwnerDecision: true, costCategory: "materials" },
  { area: "Fase 1 - Preparação", title: "Escolher tijoleira da cozinha e confirmar se é chão ou parede", priority: "high", requiresOwnerDecision: true, costCategory: "materials" },
  { area: "Fase 1 - Preparação", title: "Comprar tomadas e interruptores", priority: "high", materialNeeded: true, costCategory: "materials" },
  { area: "Fase 1 - Preparação", title: "Comprar materiais básicos: tintas, massas e consumíveis", materialNeeded: true, costCategory: "materials" },

  { area: "Fase 2 - Obra suja", title: "Fazer roços para eletricidade na casa toda", priority: "high", costCategory: "labor" },
  { area: "Fase 2 - Obra suja", title: "Fazer ajustes de canalização na cozinha e WC", priority: "high", costCategory: "labor" },
  { area: "Fase 2 - Obra suja", title: "Tapar azulejos da cozinha", materialNeeded: true, costCategory: "materials" },
  { area: "Fase 2 - Obra suja", title: "Reparar paredes", costCategory: "labor" },
  { area: "Fase 2 - Obra suja", title: "Intervir na parede de pedra se a decisão for mexer", requiresOwnerDecision: true, costCategory: "labor" },
  { area: "Fase 2 - Obra suja", title: "Fazer intervenções em portas e aberturas", costCategory: "labor" },
  { area: "Fase 2 - Obra suja", title: "Limpar terreno", priority: "high", dueDate: "2026-05-31", costCategory: "other" },
  { area: "Fase 2 - Obra suja", title: "Reparar portões", costCategory: "labor" },

  { area: "Fase 3 - Infraestruturas", title: "Passar cabos elétricos", priority: "high", costCategory: "labor" },
  { area: "Fase 3 - Infraestruturas", title: "Instalar caixas, tomadas e interruptores de base", materialNeeded: true, costCategory: "tools" },
  { area: "Fase 3 - Infraestruturas", title: "Preparar iluminação nos tetos", costCategory: "tools" },
  { area: "Fase 3 - Infraestruturas", title: "Rever pressão, tubos e ligações de canalização", priority: "high", costCategory: "labor" },
  { area: "Fase 3 - Infraestruturas", title: "Preparar água do lava-loiça", costCategory: "labor" },
  { area: "Fase 3 - Infraestruturas", title: "Preparar água dos chuveiros", costCategory: "labor" },
  { area: "Fase 3 - Infraestruturas", title: "Substituir ou preparar isolamento veda-luz das janelas", materialNeeded: true, costCategory: "materials" },

  { area: "Fase 4 - Fechos e carpintaria base", title: "Tapar roços", priority: "high", costCategory: "labor" },
  { area: "Fase 4 - Fechos e carpintaria base", title: "Fazer nichos ou prateleiras embutidas", materialNeeded: true, costCategory: "materials" },
  { area: "Fase 4 - Fechos e carpintaria base", title: "Fazer portas MDF do WC", materialNeeded: true, costCategory: "materials" },
  { area: "Fase 4 - Fechos e carpintaria base", title: "Fazer boiserie do WC social", materialNeeded: true, costCategory: "decoration" },
  { area: "Fase 4 - Fechos e carpintaria base", title: "Fazer estrutura da ilha da cozinha", materialNeeded: true, costCategory: "materials" },
  { area: "Fase 4 - Fechos e carpintaria base", title: "Fazer estantes fixas", materialNeeded: true, costCategory: "materials" },
  { area: "Fase 4 - Fechos e carpintaria base", title: "Preparar paredes para pintura: lixar e aplicar massa", priority: "high", costCategory: "labor" },
  { area: "Fase 4 - Fechos e carpintaria base", title: "Comprar chão de madeira e tijoleira final antes de aplicar", priority: "high", materialNeeded: true, costCategory: "materials" },

  { area: "Fase 5 - Pintura", title: "Pintar tetos primeiro", priority: "high", costCategory: "labor" },
  { area: "Fase 5 - Pintura", title: "Pintar paredes de todas as divisões", priority: "high", costCategory: "labor" },
  { area: "Fase 5 - Pintura", title: "Pintar janelas e portas", costCategory: "labor" },
  { area: "Fase 5 - Pintura", title: "Pintar interior da porta da rua em verde", costCategory: "labor" },
  { area: "Fase 5 - Pintura", title: "Pintar exterior se a preparação exterior estiver pronta", costCategory: "labor" },

  { area: "Fase 6 - Chão", title: "Aplicar chão novo", priority: "high", materialNeeded: true, costCategory: "labor" },
  { area: "Fase 6 - Chão", title: "Aplicar tijoleira de chão da cozinha, se for chão", materialNeeded: true, costCategory: "labor" },
  { area: "Fase 6 - Chão", title: "Colocar rodapés, incluindo WC suite e WC social", materialNeeded: true, costCategory: "labor" },

  { area: "Fase 7 - Montagens finais", title: "Montar cozinha", priority: "high", materialNeeded: true, costCategory: "labor" },
  { area: "Fase 7 - Montagens finais", title: "Montar bancada", materialNeeded: true, costCategory: "materials" },
  { area: "Fase 7 - Montagens finais", title: "Instalar lava-loiça e torneira", materialNeeded: true, costCategory: "tools" },
  { area: "Fase 7 - Montagens finais", title: "Instalar eletrodomésticos", materialNeeded: true, costCategory: "tools" },
  { area: "Fase 7 - Montagens finais", title: "Montar ilha", materialNeeded: true, costCategory: "materials" },
  { area: "Fase 7 - Montagens finais", title: "Comprar ou colocar bancos da ilha", materialNeeded: true, costCategory: "furniture" },
  { area: "Fase 7 - Montagens finais", title: "Montar chuveiro", materialNeeded: true, costCategory: "tools" },
  { area: "Fase 7 - Montagens finais", title: "Pendurar espelho", materialNeeded: true, costCategory: "decoration" },
  { area: "Fase 7 - Montagens finais", title: "Instalar toalheiros", materialNeeded: true, costCategory: "decoration" },
  { area: "Fase 7 - Montagens finais", title: "Instalar candeeiros todos", materialNeeded: true, costCategory: "tools" },
  { area: "Fase 7 - Montagens finais", title: "Montar portas, incluindo porta de correr", materialNeeded: true, costCategory: "materials" },
  { area: "Fase 7 - Montagens finais", title: "Resolver corrimão ou fazer estante", requiresOwnerDecision: true, costCategory: "materials" },
  { area: "Fase 7 - Montagens finais", title: "Instalar prateleiras finais", materialNeeded: true, costCategory: "materials" },
  { area: "Fase 7 - Montagens finais", title: "Aplicar tijoleira de parede da cozinha, se for backsplash", materialNeeded: true, costCategory: "materials" },

  { area: "Fase 8 - Mobiliário e restauro", title: "Restaurar móveis: lixar, tratar, colar e reparar", costCategory: "furniture" },
  { area: "Fase 8 - Mobiliário e restauro", title: "Colocar sofá", materialNeeded: true, costCategory: "furniture" },
  { area: "Fase 8 - Mobiliário e restauro", title: "Montar cama", materialNeeded: true, costCategory: "furniture" },
  { area: "Fase 8 - Mobiliário e restauro", title: "Fazer ou colocar cabeceira", materialNeeded: true, costCategory: "decoration" },
  { area: "Fase 8 - Mobiliário e restauro", title: "Colocar cómoda", costCategory: "furniture" },

  { area: "Fase 9 - Exterior e extras", title: "Projetar jardim", requiresOwnerDecision: true, costCategory: "decoration" },
  { area: "Fase 9 - Exterior e extras", title: "Nivelar terreno exterior", costCategory: "labor" },
  { area: "Fase 9 - Exterior e extras", title: "Preparar zona de refeições exterior", materialNeeded: true, costCategory: "materials" },
  { area: "Fase 9 - Exterior e extras", title: "Decidir piscina", requiresOwnerDecision: true, costCategory: "other" },
];

function key(area: string, title: string) {
  return `${area}::${title}`;
}

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

  return {
    owner: owner!._id,
    unassigned: unassigned!._id,
    all: Array.from(new Set([...existing.map((person) => person._id), owner!._id, unassigned!._id])),
  };
}

function allowedPeopleForTask(
  task: SeedTask,
  people: { owner: Id<"people">; unassigned: Id<"people">; all: Id<"people">[] },
) {
  return task.requiresOwnerDecision ? [people.owner] : [];
}

export const seedInitialData = mutation({
  args: {
    resetTasks: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const people = await ensurePeople(ctx);
    const existingAreas = await ctx.db.query("areas").collect();
    const areaIds = new Map<string, Id<"areas">>();

    for (const [index, area] of areas.entries()) {
      const existing = existingAreas.find((candidate) => candidate.name === area);
      if (existing) {
        areaIds.set(area, existing._id);
        await ctx.db.patch(existing._id, { order: index });
      } else {
        const id = await ctx.db.insert("areas", { name: area, order: index });
        areaIds.set(area, id);
      }
    }

    if (args.resetTasks) {
      const existingTasks = await ctx.db.query("tasks").collect();
      for (const task of existingTasks) {
        await ctx.db.patch(task._id, { dependencyIds: [] });
      }
      for (const task of existingTasks) {
        await ctx.db.delete(task._id);
      }
    }

    const refreshedAreas = await ctx.db.query("areas").collect();
    const existingTasks = await ctx.db.query("tasks").collect();
    const tasksByKey = new Map<string, Id<"tasks">>();
    for (const task of existingTasks) {
      const area = refreshedAreas.find((candidate) => candidate._id === task.areaId);
      if (area) tasksByKey.set(key(area.name, task.title), task._id);
    }

    const now = Date.now();
    for (const task of taskSeeds) {
      const areaId = areaIds.get(task.area);
      if (!areaId) continue;
      const taskKey = key(task.area, task.title);
      if (tasksByKey.has(taskKey)) continue;

      const id = await ctx.db.insert("tasks", {
        title: task.title,
        description: "",
        areaId,
        status: task.status ?? "backlog",
        priority: task.priority ?? "medium",
        ownerId: people.unassigned,
        allowedPersonIds: allowedPeopleForTask(task, people),
        requiresOwnerDecision: task.requiresOwnerDecision ?? false,
        ownerDecisionDone: false,
        dependencyIds: [],
        costCategory: task.costCategory ?? "other",
        dueDate: task.dueDate ?? null,
        startDate: null,
        completedAt: null,
        notes: "",
        materialNeeded: task.materialNeeded ?? false,
        materialNotes: task.materialNeeded ? "Confirmar material antes de começar." : "",
        createdAt: now,
        updatedAt: now,
      });
      tasksByKey.set(taskKey, id);
    }

    const idFor = (area: string, title: string) => tasksByKey.get(key(area, title));
    const addDeps = async (area: string, title: string, deps: [string, string][]) => {
      const taskId = idFor(area, title);
      if (!taskId) return;
      const dependencyIds = deps
        .map(([depArea, depTitle]) => idFor(depArea, depTitle))
        .filter((id): id is Id<"tasks"> => Boolean(id));
      const task = await ctx.db.get(taskId);
      if (!task) return;
      await ctx.db.patch(taskId, {
        dependencyIds: Array.from(new Set([...task.dependencyIds, ...dependencyIds])),
        updatedAt: Date.now(),
      });
    };

    const prepDone: [string, string][] = [
      ["Fase 1 - Preparação", "Proteger ou reparar telhado"],
      ["Fase 1 - Preparação", "Limpar e esvaziar casa completamente"],
      ["Fase 1 - Preparação", "Retirar móveis ou proteger bem"],
    ];
    const decisions: [string, string][] = [
      ["Fase 1 - Preparação", "Decidir se a pedra da sala fica ou se se mexe"],
      ["Fase 1 - Preparação", "Decidir ilha da cozinha: sim/não e como"],
      ["Fase 1 - Preparação", "Decidir sistema de água quente"],
      ["Fase 1 - Preparação", "Escolher chão de madeira: espessura, tipo, transições e alturas de portas"],
      ["Fase 1 - Preparação", "Escolher tijoleira da cozinha e confirmar se é chão ou parede"],
    ];
    const dirtyWork: [string, string][] = [
      ["Fase 2 - Obra suja", "Fazer roços para eletricidade na casa toda"],
      ["Fase 2 - Obra suja", "Fazer ajustes de canalização na cozinha e WC"],
      ["Fase 2 - Obra suja", "Reparar paredes"],
    ];
    const infrastructure: [string, string][] = [
      ["Fase 3 - Infraestruturas", "Passar cabos elétricos"],
      ["Fase 3 - Infraestruturas", "Rever pressão, tubos e ligações de canalização"],
    ];
    const closedWalls: [string, string][] = [
      ["Fase 4 - Fechos e carpintaria base", "Tapar roços"],
      ["Fase 4 - Fechos e carpintaria base", "Preparar paredes para pintura: lixar e aplicar massa"],
    ];
    const painted: [string, string][] = [
      ["Fase 5 - Pintura", "Pintar tetos primeiro"],
      ["Fase 5 - Pintura", "Pintar paredes de todas as divisões"],
    ];
    const floorDone: [string, string][] = [
      ["Fase 6 - Chão", "Aplicar chão novo"],
      ["Fase 6 - Chão", "Colocar rodapés, incluindo WC suite e WC social"],
    ];

    for (const task of taskSeeds.filter((task) => task.area === "Fase 2 - Obra suja")) {
      await addDeps(task.area, task.title, prepDone);
    }
    for (const task of taskSeeds.filter((task) => task.area === "Fase 3 - Infraestruturas")) {
      await addDeps(task.area, task.title, dirtyWork);
    }
    for (const task of taskSeeds.filter((task) => task.area === "Fase 4 - Fechos e carpintaria base")) {
      await addDeps(task.area, task.title, [...dirtyWork, ...infrastructure]);
    }
    for (const task of taskSeeds.filter((task) => task.area === "Fase 5 - Pintura")) {
      await addDeps(task.area, task.title, [...closedWalls]);
    }
    for (const task of taskSeeds.filter((task) => task.area === "Fase 6 - Chão")) {
      await addDeps(task.area, task.title, [
        ...painted,
        ["Fase 4 - Fechos e carpintaria base", "Comprar chão de madeira e tijoleira final antes de aplicar"],
      ]);
    }
    for (const task of taskSeeds.filter((task) => task.area === "Fase 7 - Montagens finais")) {
      await addDeps(task.area, task.title, floorDone);
    }
    for (const task of taskSeeds.filter((task) => task.area === "Fase 8 - Mobiliário e restauro")) {
      await addDeps(task.area, task.title, floorDone);
    }
    for (const task of taskSeeds.filter((task) => task.area === "Fase 9 - Exterior e extras")) {
      await addDeps(task.area, task.title, [["Fase 2 - Obra suja", "Limpar terreno"]]);
    }

    await addDeps("Fase 2 - Obra suja", "Intervir na parede de pedra se a decisão for mexer", [
      ["Fase 1 - Preparação", "Decidir se a pedra da sala fica ou se se mexe"],
    ]);
    await addDeps("Fase 4 - Fechos e carpintaria base", "Fazer estrutura da ilha da cozinha", [
      ["Fase 1 - Preparação", "Decidir ilha da cozinha: sim/não e como"],
    ]);
    await addDeps("Fase 4 - Fechos e carpintaria base", "Comprar chão de madeira e tijoleira final antes de aplicar", decisions);
    await addDeps("Fase 7 - Montagens finais", "Resolver corrimão ou fazer estante", [
      ["Fase 1 - Preparação", "Decidir se a pedra da sala fica ou se se mexe"],
    ]);
    await addDeps("Fase 7 - Montagens finais", "Aplicar tijoleira de parede da cozinha, se for backsplash", [
      ["Fase 7 - Montagens finais", "Montar cozinha"],
    ]);

    return {
      people: people.all.length,
      areas: areas.length,
      tasks: taskSeeds.length,
    };
  },
});
