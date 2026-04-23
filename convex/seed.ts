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
  ownerOnly?: boolean;
  requiresOwnerDecision?: boolean;
  materialNeeded?: boolean;
  dueDate?: string;
};

const areas = [
  "Geral",
  "Hall",
  "Cozinha",
  "Sala",
  "WC Social",
  "WC Suite",
  "Quarto",
  "Corredor / Despensa",
  "Exterior",
];

const taskSeeds: SeedTask[] = [
  { area: "Geral", title: "Proteger ou reparar telhado", priority: "critical", status: "todo" },
  { area: "Geral", title: "Limpar e arrumar casa", status: "todo" },
  { area: "Geral", title: "Retirar tudo da casa para abrir roços e aplicar chão", status: "todo" },
  { area: "Geral", title: "Escolher e comprar chão de madeira para a casa", ownerOnly: true, requiresOwnerDecision: true, costCategory: "materials" },
  { area: "Geral", title: "Escolher e comprar tijoleira para a cozinha", ownerOnly: true, requiresOwnerDecision: true, costCategory: "materials" },
  { area: "Geral", title: "Comprar tomadas e interruptores", ownerOnly: true, costCategory: "materials" },
  { area: "Geral", title: "Fazer roços para eletricidade", priority: "high", costCategory: "labor" },
  { area: "Geral", title: "Fazer reforços para canalização", priority: "high", costCategory: "labor" },
  { area: "Geral", title: "Comprar sistema de aquecimento de água: bomba de calor ou termoacumulador", ownerOnly: true, requiresOwnerDecision: true, costCategory: "materials" },
  { area: "Geral", title: "Pintar exterior", costCategory: "labor" },
  { area: "Geral", title: "Limpar terreno até 31 de Maio", status: "todo", priority: "high", dueDate: "2026-05-31" },
  { area: "Geral", title: "Reparar portões", costCategory: "labor" },
  { area: "Geral", title: "Projetar jardim", ownerOnly: true, requiresOwnerDecision: true, costCategory: "decoration" },
  { area: "Geral", title: "Piscina", ownerOnly: true, requiresOwnerDecision: true, costCategory: "other" },
  { area: "Geral", title: "Nivelar terreno exterior para zona de refeições", costCategory: "labor" },

  { area: "Hall", title: "Reparar paredes e pintar", costCategory: "labor" },
  { area: "Hall", title: "Pintar porta e colocar vidro novo", costCategory: "labor", materialNeeded: true },
  { area: "Hall", title: "Aplicar chão novo", costCategory: "labor", materialNeeded: true },
  { area: "Hall", title: "Trocar candeeiro", costCategory: "tools", materialNeeded: true },
  { area: "Hall", title: "Decorar", ownerOnly: true, requiresOwnerDecision: true, costCategory: "decoration" },

  { area: "WC Social", title: "Terminar pintura de rodapés, paredes e janela", costCategory: "labor" },
  { area: "WC Social", title: "Mudar vidro da janela", costCategory: "labor", materialNeeded: true },
  { area: "WC Social", title: "Fazer prateleira ou nicho em madeira", costCategory: "materials", materialNeeded: true },
  { area: "WC Social", title: "Fazer boiserie", costCategory: "decoration", materialNeeded: true },
  { area: "WC Social", title: "Comprar saboneteira", ownerOnly: true, costCategory: "decoration" },
  { area: "WC Social", title: "Trocar candeeiro", costCategory: "tools", materialNeeded: true },
  { area: "WC Social", title: "Fazer porta com painéis MDF 60x90", costCategory: "materials", materialNeeded: true },
  { area: "WC Social", title: "Pintar e cortar porta", costCategory: "labor" },
  { area: "WC Social", title: "Aplicar chão depois do novo chão estar colocado", costCategory: "labor", materialNeeded: true },

  { area: "WC Suite", title: "Fazer rodapé da zona de duche", costCategory: "materials", materialNeeded: true },
  { area: "WC Suite", title: "Pintar janela e arranjar porta", costCategory: "labor" },
  { area: "WC Suite", title: "Montar chuveiro", costCategory: "tools", materialNeeded: true },
  { area: "WC Suite", title: "Proteger parede da zona de duche", costCategory: "materials", materialNeeded: true },
  { area: "WC Suite", title: "Criar cesto ou prateleira para shampoo", costCategory: "decoration", materialNeeded: true },
  { area: "WC Suite", title: "Instalar candeeiro", costCategory: "tools", materialNeeded: true },
  { area: "WC Suite", title: "Tapar tubo do lavatório", costCategory: "labor" },
  { area: "WC Suite", title: "Pendurar espelho", costCategory: "decoration", materialNeeded: true },
  { area: "WC Suite", title: "Instalar toalheiros", costCategory: "decoration", materialNeeded: true },
  { area: "WC Suite", title: "Retocar pintura", costCategory: "labor" },
  { area: "WC Suite", title: "Fazer prateleiras de arrumação", costCategory: "materials", materialNeeded: true },
  { area: "WC Suite", title: "Comprar cestos para lavatório", ownerOnly: true, costCategory: "decoration" },
  { area: "WC Suite", title: "Comprar cesto WC e piaçaba", ownerOnly: true, costCategory: "decoration" },
  { area: "WC Suite", title: "Fazer porta WC com calha tipo celeiro", costCategory: "materials", materialNeeded: true },

  { area: "Cozinha", title: "Pintar cozinha", costCategory: "labor" },
  { area: "Cozinha", title: "Tapar azulejos", costCategory: "materials", materialNeeded: true },
  { area: "Cozinha", title: "Retirar portas e reparar armários", costCategory: "labor" },
  { area: "Cozinha", title: "Configurar cozinha nova", ownerOnly: true, requiresOwnerDecision: true, costCategory: "other" },
  { area: "Cozinha", title: "Procurar e comprar máquina de lavar loiça", ownerOnly: true, requiresOwnerDecision: true, costCategory: "tools" },
  { area: "Cozinha", title: "Procurar e comprar exaustor ou sistema de ventilação", ownerOnly: true, requiresOwnerDecision: true, costCategory: "tools" },
  { area: "Cozinha", title: "Procurar e comprar placa", ownerOnly: true, requiresOwnerDecision: true, costCategory: "tools" },
  { area: "Cozinha", title: "Comprar bancada de madeira", ownerOnly: true, costCategory: "materials" },
  { area: "Cozinha", title: "Trocar lava-loiça e torneira", costCategory: "tools", materialNeeded: true },
  { area: "Cozinha", title: "Fazer prateleiras de madeira", costCategory: "materials", materialNeeded: true },
  { area: "Cozinha", title: "Fazer ilha", costCategory: "materials", materialNeeded: true },
  { area: "Cozinha", title: "Comprar tampo para ilha", ownerOnly: true, costCategory: "materials" },
  { area: "Cozinha", title: "Resolver pernas ou base da ilha", ownerOnly: true, requiresOwnerDecision: true, costCategory: "materials" },
  { area: "Cozinha", title: "Avaliar se se pinta o frigorífico", ownerOnly: true, requiresOwnerDecision: true, costCategory: "other" },
  { area: "Cozinha", title: "Fazer bancada estreita junto ao frigorífico", costCategory: "materials", materialNeeded: true },
  { area: "Cozinha", title: "Arranjar candeeiros para teto", ownerOnly: true, costCategory: "tools" },
  { area: "Cozinha", title: "Terminar pintura do teto", costCategory: "labor" },
  { area: "Cozinha", title: "Fazer cortinas para armários", costCategory: "decoration", materialNeeded: true },
  { area: "Cozinha", title: "Comprar suportes para candeeiros de parede", ownerOnly: true, costCategory: "tools" },
  { area: "Cozinha", title: "Fazer roços para eletricidade", costCategory: "labor", priority: "high" },
  { area: "Cozinha", title: "Comprar dois bancos para ilha", ownerOnly: true, costCategory: "furniture" },

  { area: "Sala", title: "Terminar pintura", costCategory: "labor" },
  { area: "Sala", title: "Decidir candeeiros", ownerOnly: true, requiresOwnerDecision: true, costCategory: "tools" },
  { area: "Sala", title: "Terminar pintura das janelas", costCategory: "labor" },
  { area: "Sala", title: "Tratar móvel louceiro contra bicho, colar e lixar", costCategory: "furniture" },
  { area: "Sala", title: "Lixar cadeiras", costCategory: "furniture" },
  { area: "Sala", title: "Tratar mesa", costCategory: "furniture" },
  { area: "Sala", title: "Tratar cadeira de baloiço", costCategory: "furniture" },
  { area: "Sala", title: "Comprar sofá", ownerOnly: true, costCategory: "furniture" },
  { area: "Sala", title: "Decidir se a pedra da sala fica ou se se retira estrutura", ownerOnly: true, requiresOwnerDecision: true, costCategory: "other" },
  { area: "Sala", title: "Se não retirar estrutura, fazer tampo de madeira", costCategory: "materials", materialNeeded: true },
  { area: "Sala", title: "Pintar corrimão", costCategory: "labor" },
  { area: "Sala", title: "Retirar corrimão e fazer estante", ownerOnly: true, requiresOwnerDecision: true, costCategory: "materials" },

  { area: "Quarto", title: "Pintar quarto", costCategory: "labor" },
  { area: "Quarto", title: "Levar cómoda", costCategory: "furniture" },
  { area: "Quarto", title: "Fazer prateleiras no armário e abrir portas", costCategory: "materials", materialNeeded: true },
  { area: "Quarto", title: "Lavar colchão", costCategory: "other" },
  { area: "Quarto", title: "Montar cama", costCategory: "furniture" },
  { area: "Quarto", title: "Criar cabeceira da cama", costCategory: "decoration", materialNeeded: true },
  { area: "Quarto", title: "Instalar candeeiro de teto", costCategory: "tools", materialNeeded: true },
  { area: "Quarto", title: "Instalar candeeiros de mesa de cabeceira", costCategory: "tools", materialNeeded: true },
  { area: "Quarto", title: "Terminar remate da janela", costCategory: "labor" },
  { area: "Quarto", title: "Avaliar cortinas", ownerOnly: true, requiresOwnerDecision: true, costCategory: "decoration" },
  { area: "Quarto", title: "Substituir isolamento da janela veda-luz", costCategory: "materials", materialNeeded: true },
  { area: "Quarto", title: "Pintar e fazer porta", costCategory: "labor" },

  { area: "Corredor / Despensa", title: "Instalar dois candeeiros", costCategory: "tools", materialNeeded: true },
  { area: "Corredor / Despensa", title: "Fazer porta de correr tipo celeiro", costCategory: "materials", materialNeeded: true },
  { area: "Corredor / Despensa", title: "Fazer estantes para despensa", costCategory: "materials", materialNeeded: true },
  { area: "Corredor / Despensa", title: "Arrumar despensa", costCategory: "other" },
  { area: "Corredor / Despensa", title: "Pintar interior da porta da rua em verde", costCategory: "labor" },

  { area: "Exterior", title: "Pintar exterior", costCategory: "labor" },
  { area: "Exterior", title: "Limpar terreno até 31 de Maio", status: "todo", priority: "high", dueDate: "2026-05-31" },
  { area: "Exterior", title: "Reparar portões", costCategory: "labor" },
  { area: "Exterior", title: "Comprar sistema de aquecimento de água", ownerOnly: true, requiresOwnerDecision: true, costCategory: "materials" },
  { area: "Exterior", title: "Projetar jardim", ownerOnly: true, requiresOwnerDecision: true, costCategory: "decoration" },
  { area: "Exterior", title: "Piscina", ownerOnly: true, requiresOwnerDecision: true, costCategory: "other" },
  { area: "Exterior", title: "Nivelar terreno exterior para área de refeições", costCategory: "labor" },
];

function key(area: string, title: string) {
  return `${area}::${title}`;
}

async function ensurePeople(ctx: MutationCtx) {
  const existing = await ctx.db.query("people").collect();
  if (existing.length >= 3) {
    const owner = existing.find((person) => person.role === "owner") ?? existing[0];
    const workers = existing.filter((person) => person.role === "worker");
    return {
      owner: owner._id,
      worker1: workers[0]?._id ?? existing[1]._id,
      worker2: workers[1]?._id ?? existing[2]._id,
      all: existing.map((person) => person._id),
    };
  }

  const owner = await ctx.db.insert("people", {
    name: "Dona / Responsável principal",
    role: "owner",
    color: "#b45309",
    initials: "D",
    active: true,
  });
  const worker1 = await ctx.db.insert("people", {
    name: "Trabalhador 1",
    role: "worker",
    color: "#2563eb",
    initials: "T1",
    active: true,
  });
  const worker2 = await ctx.db.insert("people", {
    name: "Trabalhador 2",
    role: "worker",
    color: "#059669",
    initials: "T2",
    active: true,
  });

  return { owner, worker1, worker2, all: [owner, worker1, worker2] };
}

function inferAllowedPeople(
  task: SeedTask,
  people: { owner: Id<"people">; worker1: Id<"people">; worker2: Id<"people">; all: Id<"people">[] },
) {
  if (task.ownerOnly) return [people.owner];
  if (task.title.startsWith("Comprar") || task.title.startsWith("Escolher") || task.title.startsWith("Procurar") || task.title.startsWith("Decidir") || task.title.startsWith("Avaliar") || task.title.startsWith("Projetar") || task.title === "Piscina") {
    return [people.owner];
  }
  return [people.worker1, people.worker2];
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
      } else {
        const id = await ctx.db.insert("areas", { name: area, order: index });
        areaIds.set(area, id);
      }
    }

    if (args.resetTasks) {
      const existingTasks = await ctx.db.query("tasks").collect();
      for (const task of existingTasks) {
        await ctx.db.delete(task._id);
      }
    }

    const existingTasks = await ctx.db.query("tasks").collect();
    const tasksByKey = new Map<string, Id<"tasks">>();
    for (const task of existingTasks) {
      const area = existingAreas.find((candidate) => candidate._id === task.areaId);
      if (area) tasksByKey.set(key(area.name, task.title), task._id);
    }

    const now = Date.now();
    for (const task of taskSeeds) {
      const areaId = areaIds.get(task.area);
      if (!areaId) continue;
      const taskKey = key(task.area, task.title);
      if (tasksByKey.has(taskKey)) continue;

      const ownerId = inferAllowedPeople(task, people)[0];
      const allowedPersonIds = inferAllowedPeople(task, people);
      const id = await ctx.db.insert("tasks", {
        title: task.title,
        description: "",
        areaId,
        status: task.status ?? "backlog",
        priority: task.priority ?? "medium",
        ownerId,
        allowedPersonIds,
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
      const merged = Array.from(new Set([...task.dependencyIds, ...dependencyIds]));
      await ctx.db.patch(taskId, { dependencyIds: merged, updatedAt: Date.now() });
    };

    const dirtyWorks: [string, string][] = [
      ["Geral", "Proteger ou reparar telhado"],
      ["Geral", "Retirar tudo da casa para abrir roços e aplicar chão"],
      ["Geral", "Fazer roços para eletricidade"],
    ];
    const plumbing: [string, string][] = [["Geral", "Fazer reforços para canalização"]];
    const floorChoice: [string, string][] = [["Geral", "Escolher e comprar chão de madeira para a casa"]];
    const kitchenTileChoice: [string, string][] = [["Geral", "Escolher e comprar tijoleira para a cozinha"]];
    const kitchenElectric: [string, string][] = [["Cozinha", "Fazer roços para eletricidade"]];

    await addDeps("Hall", "Reparar paredes e pintar", dirtyWorks);
    await addDeps("Hall", "Aplicar chão novo", [...dirtyWorks, ...floorChoice]);
    await addDeps("Hall", "Trocar candeeiro", [["Geral", "Comprar tomadas e interruptores"], ["Hall", "Reparar paredes e pintar"]]);
    await addDeps("Hall", "Decorar", [["Hall", "Reparar paredes e pintar"], ["Hall", "Aplicar chão novo"]]);

    for (const title of [
      "Terminar pintura de rodapés, paredes e janela",
      "Pintar janela e arranjar porta",
      "Pintar cozinha",
      "Terminar pintura do teto",
      "Terminar pintura",
      "Terminar pintura das janelas",
      "Pintar quarto",
      "Terminar remate da janela",
      "Pintar interior da porta da rua em verde",
    ]) {
      const area = taskSeeds.find((task) => task.title === title)?.area;
      if (area) await addDeps(area, title, dirtyWorks);
    }

    await addDeps("WC Social", "Mudar vidro da janela", [["WC Social", "Terminar pintura de rodapés, paredes e janela"]]);
    await addDeps("WC Social", "Trocar candeeiro", [["WC Social", "Terminar pintura de rodapés, paredes e janela"], ["Geral", "Comprar tomadas e interruptores"]]);
    await addDeps("WC Social", "Aplicar chão depois do novo chão estar colocado", [...dirtyWorks, ...floorChoice, ["WC Social", "Terminar pintura de rodapés, paredes e janela"]]);
    await addDeps("WC Social", "Comprar saboneteira", [["WC Social", "Terminar pintura de rodapés, paredes e janela"]]);
    await addDeps("WC Social", "Pintar e cortar porta", [["WC Social", "Fazer porta com painéis MDF 60x90"]]);

    for (const title of ["Montar chuveiro", "Tapar tubo do lavatório", "Instalar toalheiros", "Fazer rodapé da zona de duche", "Proteger parede da zona de duche"]) {
      await addDeps("WC Suite", title, [...plumbing, ["WC Suite", "Pintar janela e arranjar porta"]]);
    }
    await addDeps("WC Suite", "Instalar candeeiro", [["Geral", "Comprar tomadas e interruptores"], ["WC Suite", "Pintar janela e arranjar porta"]]);
    await addDeps("WC Suite", "Retocar pintura", [["WC Suite", "Montar chuveiro"], ["WC Suite", "Proteger parede da zona de duche"]]);

    await addDeps("Cozinha", "Pintar cozinha", [["Cozinha", "Fazer roços para eletricidade"], ...dirtyWorks]);
    await addDeps("Cozinha", "Tapar azulejos", [...kitchenTileChoice, ["Cozinha", "Pintar cozinha"]]);
    await addDeps("Cozinha", "Trocar lava-loiça e torneira", [...plumbing, ["Cozinha", "Pintar cozinha"]]);
    await addDeps("Cozinha", "Fazer prateleiras de madeira", [["Cozinha", "Pintar cozinha"]]);
    await addDeps("Cozinha", "Fazer ilha", [["Cozinha", "Configurar cozinha nova"], ["Cozinha", "Comprar bancada de madeira"], ["Cozinha", "Comprar tampo para ilha"], ["Cozinha", "Resolver pernas ou base da ilha"]]);
    await addDeps("Cozinha", "Fazer bancada estreita junto ao frigorífico", [["Cozinha", "Comprar bancada de madeira"], ["Cozinha", "Pintar cozinha"]]);
    await addDeps("Cozinha", "Terminar pintura do teto", [["Cozinha", "Fazer roços para eletricidade"]]);
    await addDeps("Cozinha", "Arranjar candeeiros para teto", [...kitchenElectric, ["Geral", "Comprar tomadas e interruptores"]]);

    await addDeps("Sala", "Se não retirar estrutura, fazer tampo de madeira", [["Sala", "Decidir se a pedra da sala fica ou se se retira estrutura"]]);
    await addDeps("Sala", "Pintar corrimão", [["Sala", "Terminar pintura"]]);
    await addDeps("Sala", "Retirar corrimão e fazer estante", [["Sala", "Decidir se a pedra da sala fica ou se se retira estrutura"]]);

    for (const title of ["Montar cama", "Criar cabeceira da cama", "Instalar candeeiro de teto", "Instalar candeeiros de mesa de cabeceira"]) {
      await addDeps("Quarto", title, [["Quarto", "Pintar quarto"]]);
    }
    await addDeps("Quarto", "Pintar e fazer porta", [["Quarto", "Pintar quarto"]]);

    await addDeps("Corredor / Despensa", "Instalar dois candeeiros", [["Geral", "Comprar tomadas e interruptores"], ["Geral", "Fazer roços para eletricidade"]]);
    await addDeps("Corredor / Despensa", "Fazer estantes para despensa", [["Corredor / Despensa", "Arrumar despensa"]]);

    await addDeps("Geral", "Projetar jardim", [["Geral", "Limpar terreno até 31 de Maio"]]);
    await addDeps("Geral", "Nivelar terreno exterior para zona de refeições", [["Geral", "Limpar terreno até 31 de Maio"]]);
    await addDeps("Exterior", "Projetar jardim", [["Exterior", "Limpar terreno até 31 de Maio"]]);
    await addDeps("Exterior", "Nivelar terreno exterior para área de refeições", [["Exterior", "Limpar terreno até 31 de Maio"]]);
    await addDeps("Exterior", "Pintar exterior", [["Exterior", "Limpar terreno até 31 de Maio"]]);

    return {
      people: people.all.length,
      areas: areas.length,
      tasks: taskSeeds.length,
    };
  },
});
