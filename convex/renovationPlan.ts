import { v } from "convex/values";
import { mutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

type PersonName = "Patrícia" | "Obras" | "Sandra";
type TaskSeed = {
  key: string;
  area: string;
  title: string;
  owner: PersonName;
  people: PersonName[];
  priority: "low" | "medium" | "high" | "critical";
  costCategory: "materials" | "labor" | "tools" | "furniture" | "decoration" | "other";
  startDate: string;
  dueDate: string;
  notes: string;
  requiresOwnerDecision?: boolean;
  materialNeeded?: boolean;
  deps?: string[];
};

const planTasks: TaskSeed[] = [
  { key: "empty-house", area: "Fase 1 - Preparação", title: "Limpar e esvaziar casa completamente", owner: "Patrícia", people: ["Patrícia", "Sandra"], priority: "critical", costCategory: "other", startDate: "2026-04-24", dueDate: "2026-05-08", notes: "Mês 1 · Semana 1-2 · Objetivo: deixar a casa pronta para obra a sério." },
  { key: "protect-furniture", area: "Fase 1 - Preparação", title: "Retirar móveis ou proteger bem", owner: "Patrícia", people: ["Patrícia", "Sandra"], priority: "high", costCategory: "other", startDate: "2026-04-24", dueDate: "2026-05-08", notes: "Proteções iniciais antes de pó, roços e obra suja." },
  { key: "decide-stone", area: "Fase 1 - Preparação", title: "Decidir pedra da sala: fica ou mexe", owner: "Patrícia", people: ["Patrícia"], priority: "critical", costCategory: "other", startDate: "2026-04-24", dueDate: "2026-05-08", notes: "Decisão crítica. Se ficar por decidir, bloqueia parede de pedra e escolhas posteriores.", requiresOwnerDecision: true },
  { key: "decide-island", area: "Fase 1 - Preparação", title: "Decidir ilha da cozinha: sim/não e como", owner: "Patrícia", people: ["Patrícia"], priority: "critical", costCategory: "other", startDate: "2026-04-24", dueDate: "2026-05-08", notes: "Decisão crítica. Não decidir tarde: bloqueia estrutura da ilha e montagem.", requiresOwnerDecision: true },
  { key: "decide-hot-water", area: "Fase 1 - Preparação", title: "Decidir sistema de água quente", owner: "Patrícia", people: ["Patrícia", "Obras"], priority: "high", costCategory: "materials", startDate: "2026-04-24", dueDate: "2026-05-08", notes: "Decisão crítica para canalização, águas e equipamentos.", requiresOwnerDecision: true, materialNeeded: true },
  { key: "buy-switches", area: "Fase 1 - Preparação", title: "Comprar tomadas e interruptores", owner: "Patrícia", people: ["Patrícia", "Obras"], priority: "high", costCategory: "materials", startDate: "2026-04-24", dueDate: "2026-05-08", notes: "Comprar cedo para não atrasar eletricidade.", materialNeeded: true },
  { key: "buy-basic-materials", area: "Fase 1 - Preparação", title: "Comprar materiais básicos: tintas, massas e consumíveis", owner: "Patrícia", people: ["Patrícia", "Sandra"], priority: "high", costCategory: "materials", startDate: "2026-04-24", dueDate: "2026-05-08", notes: "Lista base para preparação, massa, pintura e consumíveis.", materialNeeded: true },

  { key: "electric-grooves", area: "Fase 2 - Obra suja", title: "Fazer roços para eletricidade na casa toda", owner: "Obras", people: ["Obras"], priority: "critical", costCategory: "labor", startDate: "2026-05-08", dueDate: "2026-05-22", notes: "Mês 1 · Semana 2-4 · Tudo o que faz pó, barulho e destruição.", deps: ["empty-house", "protect-furniture"] },
  { key: "plumbing-adjustments", area: "Fase 2 - Obra suja", title: "Fazer ajustes de canalização na cozinha e WC", owner: "Obras", people: ["Obras"], priority: "critical", costCategory: "labor", startDate: "2026-05-08", dueDate: "2026-05-22", notes: "Obra suja antes de fechar paredes e antes de qualquer pintura.", deps: ["empty-house", "decide-hot-water"] },
  { key: "cover-kitchen-tiles", area: "Fase 2 - Obra suja", title: "Tapar azulejos da cozinha", owner: "Obras", people: ["Obras"], priority: "high", costCategory: "materials", startDate: "2026-05-08", dueDate: "2026-05-22", notes: "Preparação da cozinha durante obra suja.", materialNeeded: true, deps: ["empty-house"] },
  { key: "repair-walls", area: "Fase 2 - Obra suja", title: "Reparar paredes", owner: "Obras", people: ["Obras"], priority: "high", costCategory: "labor", startDate: "2026-05-08", dueDate: "2026-05-22", notes: "Reparações base antes de massas finais e pintura.", deps: ["empty-house"] },
  { key: "stone-wall", area: "Fase 2 - Obra suja", title: "Intervir na parede de pedra se for mexer", owner: "Obras", people: ["Obras", "Patrícia"], priority: "high", costCategory: "labor", startDate: "2026-05-08", dueDate: "2026-05-22", notes: "Só avança depois da decisão da pedra da sala.", deps: ["decide-stone"] },
  { key: "doors-openings", area: "Fase 2 - Obra suja", title: "Fazer intervenções em portas e aberturas", owner: "Obras", people: ["Obras"], priority: "medium", costCategory: "labor", startDate: "2026-05-08", dueDate: "2026-05-22", notes: "Trabalho destrutivo antes de fechos e pintura.", deps: ["empty-house"] },
  { key: "clean-exterior", area: "Fase 2 - Obra suja", title: "Limpar terreno exterior", owner: "Obras", people: ["Obras", "Patrícia"], priority: "high", costCategory: "other", startDate: "2026-05-08", dueDate: "2026-05-22", notes: "Exterior: limpeza base para portões, refeições exteriores e jardim." },
  { key: "repair-gates", area: "Fase 2 - Obra suja", title: "Reparar portões", owner: "Obras", people: ["Obras"], priority: "medium", costCategory: "labor", startDate: "2026-05-08", dueDate: "2026-05-22", notes: "Exterior durante obra suja.", deps: ["clean-exterior"] },

  { key: "electric-cables", area: "Fase 3 - Infraestruturas", title: "Passar cabos elétricos", owner: "Obras", people: ["Obras"], priority: "critical", costCategory: "labor", startDate: "2026-05-22", dueDate: "2026-06-05", notes: "Mês 2 · Semana 5-6 · Não fechar paredes sem passar eletricidade.", deps: ["electric-grooves"] },
  { key: "base-boxes-switches", area: "Fase 3 - Infraestruturas", title: "Instalar caixas, tomadas e interruptores de base", owner: "Obras", people: ["Obras"], priority: "high", costCategory: "tools", startDate: "2026-05-22", dueDate: "2026-06-05", notes: "Base elétrica antes de fechar roços.", materialNeeded: true, deps: ["electric-cables", "buy-switches"] },
  { key: "ceiling-lighting-prep", area: "Fase 3 - Infraestruturas", title: "Preparar iluminação nos tetos", owner: "Obras", people: ["Obras"], priority: "high", costCategory: "tools", startDate: "2026-05-22", dueDate: "2026-06-05", notes: "Pré-instalação de iluminação para montagem final.", deps: ["electric-cables"] },
  { key: "sink-water", area: "Fase 3 - Infraestruturas", title: "Preparar água do lava-loiça", owner: "Obras", people: ["Obras"], priority: "high", costCategory: "labor", startDate: "2026-06-05", dueDate: "2026-06-19", notes: "Mês 2 · Semana 6-8 · Águas cozinha.", deps: ["plumbing-adjustments", "decide-hot-water"] },
  { key: "shower-water", area: "Fase 3 - Infraestruturas", title: "Preparar água dos chuveiros", owner: "Obras", people: ["Obras"], priority: "high", costCategory: "labor", startDate: "2026-06-05", dueDate: "2026-06-19", notes: "Mês 2 · Semana 6-8 · Águas WC.", deps: ["plumbing-adjustments", "decide-hot-water"] },
  { key: "window-blackout-seal", area: "Fase 3 - Infraestruturas", title: "Preparar veda-luz / vedação das janelas", owner: "Obras", people: ["Obras"], priority: "medium", costCategory: "materials", startDate: "2026-06-05", dueDate: "2026-06-19", notes: "Isolamentos antes de acabamentos.", materialNeeded: true },
  { key: "support-cleaning", area: "Fase 3 - Infraestruturas", title: "Limpeza e apoio durante infraestruturas", owner: "Patrícia", people: ["Patrícia", "Sandra"], priority: "medium", costCategory: "other", startDate: "2026-06-05", dueDate: "2026-06-19", notes: "Apoio Tu + Sandra durante Mês 2.", deps: ["electric-cables"] },

  { key: "close-grooves", area: "Fase 4 - Fechos e carpintaria base", title: "Tapar roços", owner: "Obras", people: ["Obras"], priority: "critical", costCategory: "labor", startDate: "2026-06-19", dueDate: "2026-07-03", notes: "Mês 3 · Semana 9-10 · Só depois de eletricidade e águas.", deps: ["base-boxes-switches", "sink-water", "shower-water"] },
  { key: "wall-putty", area: "Fase 4 - Fechos e carpintaria base", title: "Aplicar massa nas paredes", owner: "Obras", people: ["Obras"], priority: "high", costCategory: "labor", startDate: "2026-06-19", dueDate: "2026-07-03", notes: "Preparação para lixar e pintar.", deps: ["close-grooves", "repair-walls"] },
  { key: "built-in-niches", area: "Fase 4 - Fechos e carpintaria base", title: "Fazer nichos / prateleiras embutidas", owner: "Obras", people: ["Obras"], priority: "medium", costCategory: "materials", startDate: "2026-07-03", dueDate: "2026-07-17", notes: "Mês 3 · Semana 10-12 · Carpintaria base.", materialNeeded: true, deps: ["close-grooves"] },
  { key: "mdf-wc-doors", area: "Fase 4 - Fechos e carpintaria base", title: "Fazer portas MDF do WC", owner: "Obras", people: ["Obras"], priority: "medium", costCategory: "materials", startDate: "2026-07-03", dueDate: "2026-07-17", notes: "Carpintaria base WC.", materialNeeded: true, deps: ["close-grooves"] },
  { key: "wc-boiserie", area: "Fase 4 - Fechos e carpintaria base", title: "Fazer boiserie do WC social", owner: "Obras", people: ["Obras"], priority: "medium", costCategory: "decoration", startDate: "2026-07-03", dueDate: "2026-07-17", notes: "Acabamento base antes de pintura.", materialNeeded: true, deps: ["wall-putty"] },
  { key: "island-structure", area: "Fase 4 - Fechos e carpintaria base", title: "Fazer estrutura da ilha da cozinha", owner: "Obras", people: ["Obras"], priority: "high", costCategory: "materials", startDate: "2026-07-03", dueDate: "2026-07-17", notes: "Bloqueado pela decisão da ilha.", materialNeeded: true, deps: ["decide-island", "close-grooves"] },
  { key: "fixed-shelves", area: "Fase 4 - Fechos e carpintaria base", title: "Fazer estantes fixas", owner: "Obras", people: ["Obras"], priority: "medium", costCategory: "materials", startDate: "2026-07-03", dueDate: "2026-07-17", notes: "Estruturas fixas antes da pintura final.", materialNeeded: true, deps: ["wall-putty"] },
  { key: "sand-walls", area: "Fase 4 - Fechos e carpintaria base", title: "Lixar paredes", owner: "Patrícia", people: ["Patrícia", "Sandra"], priority: "high", costCategory: "labor", startDate: "2026-07-03", dueDate: "2026-07-17", notes: "Tu + Sandra. Se saltares isto, a pintura fica horrível.", deps: ["wall-putty"] },

  { key: "paint-ceilings", area: "Fase 5 - Pintura", title: "Pintar tetos primeiro", owner: "Patrícia", people: ["Patrícia", "Sandra"], priority: "high", costCategory: "labor", startDate: "2026-07-17", dueDate: "2026-08-14", notes: "Mês 4 · Semana 13-16 · Não pintar antes de roços fechados.", deps: ["sand-walls"] },
  { key: "paint-walls", area: "Fase 5 - Pintura", title: "Pintar paredes de todas as divisões", owner: "Patrícia", people: ["Patrícia", "Sandra"], priority: "high", costCategory: "labor", startDate: "2026-07-17", dueDate: "2026-08-14", notes: "Pintura pesada antes de chão.", deps: ["paint-ceilings"] },
  { key: "paint-windows-doors", area: "Fase 5 - Pintura", title: "Pintar janelas e portas", owner: "Patrícia", people: ["Patrícia", "Sandra"], priority: "medium", costCategory: "labor", startDate: "2026-07-17", dueDate: "2026-08-14", notes: "Pintura de caixilharias e portas.", deps: ["paint-walls"] },
  { key: "paint-interior-doors", area: "Fase 5 - Pintura", title: "Pintar interior das portas (ex: verde corredor)", owner: "Patrícia", people: ["Patrícia", "Sandra"], priority: "medium", costCategory: "labor", startDate: "2026-07-17", dueDate: "2026-08-14", notes: "Detalhe de pintura depois da base.", deps: ["paint-windows-doors"] },
  { key: "paint-exterior", area: "Fase 5 - Pintura", title: "Pintar exterior se estiver pronto", owner: "Obras", people: ["Obras", "Patrícia"], priority: "low", costCategory: "labor", startDate: "2026-07-17", dueDate: "2026-08-14", notes: "Só se o exterior estiver preparado.", deps: ["clean-exterior"] },
  { key: "painting-adjustments", area: "Fase 5 - Pintura", title: "Ajustes finais de pintura", owner: "Obras", people: ["Obras", "Patrícia"], priority: "medium", costCategory: "labor", startDate: "2026-07-17", dueDate: "2026-08-14", notes: "Ajustes finais depois de paredes e portas.", deps: ["paint-walls"] },

  { key: "new-floor", area: "Fase 6 - Chão", title: "Aplicar chão novo", owner: "Obras", people: ["Obras"], priority: "critical", costCategory: "labor", startDate: "2026-08-14", dueDate: "2026-08-28", notes: "Mês 5 · Semana 17-18 · Chão depois da pintura pesada.", materialNeeded: true, deps: ["paint-walls"] },
  { key: "baseboards", area: "Fase 6 - Chão", title: "Colocar rodapés, incluindo WC suite/social", owner: "Obras", people: ["Obras"], priority: "high", costCategory: "labor", startDate: "2026-08-14", dueDate: "2026-08-28", notes: "Rodapés depois do chão.", materialNeeded: true, deps: ["new-floor"] },

  { key: "kitchen-assembly", area: "Fase 7 - Montagens finais", title: "Montar cozinha", owner: "Obras", people: ["Obras"], priority: "critical", costCategory: "labor", startDate: "2026-08-28", dueDate: "2026-09-11", notes: "Mês 5 · Semana 18-20 · Não montar cozinha antes de pintar e chão.", materialNeeded: true, deps: ["new-floor", "paint-walls"] },
  { key: "countertop", area: "Fase 7 - Montagens finais", title: "Montar bancada", owner: "Obras", people: ["Obras"], priority: "high", costCategory: "materials", startDate: "2026-08-28", dueDate: "2026-09-11", notes: "Depois da montagem base da cozinha.", materialNeeded: true, deps: ["kitchen-assembly"] },
  { key: "sink-faucet", area: "Fase 7 - Montagens finais", title: "Instalar lava-loiça e torneira", owner: "Obras", people: ["Obras"], priority: "high", costCategory: "tools", startDate: "2026-08-28", dueDate: "2026-09-11", notes: "Depois da bancada e águas preparadas.", materialNeeded: true, deps: ["countertop", "sink-water"] },
  { key: "appliances", area: "Fase 7 - Montagens finais", title: "Instalar eletrodomésticos", owner: "Obras", people: ["Obras"], priority: "high", costCategory: "tools", startDate: "2026-08-28", dueDate: "2026-09-11", notes: "Depois da cozinha montada.", materialNeeded: true, deps: ["kitchen-assembly", "base-boxes-switches"] },
  { key: "island-assembly", area: "Fase 7 - Montagens finais", title: "Montar ilha", owner: "Obras", people: ["Obras"], priority: "high", costCategory: "materials", startDate: "2026-08-28", dueDate: "2026-09-11", notes: "Depois da estrutura e chão.", materialNeeded: true, deps: ["island-structure", "new-floor"] },
  { key: "island-stools", area: "Fase 7 - Montagens finais", title: "Comprar ou colocar bancos da ilha", owner: "Patrícia", people: ["Patrícia", "Sandra"], priority: "medium", costCategory: "furniture", startDate: "2026-08-28", dueDate: "2026-09-11", notes: "Depois da decisão e montagem da ilha.", materialNeeded: true, deps: ["island-assembly"] },
  { key: "shower-install", area: "Fase 7 - Montagens finais", title: "Montar chuveiro", owner: "Obras", people: ["Obras"], priority: "high", costCategory: "tools", startDate: "2026-08-28", dueDate: "2026-09-11", notes: "WC funcional depois das águas.", materialNeeded: true, deps: ["shower-water"] },
  { key: "mirror-install", area: "Fase 7 - Montagens finais", title: "Pendurar espelho", owner: "Obras", people: ["Obras", "Patrícia"], priority: "medium", costCategory: "decoration", startDate: "2026-08-28", dueDate: "2026-09-11", notes: "Montagens finais WC.", materialNeeded: true, deps: ["paint-walls"] },
  { key: "towel-rails", area: "Fase 7 - Montagens finais", title: "Instalar toalheiros", owner: "Obras", people: ["Obras"], priority: "medium", costCategory: "decoration", startDate: "2026-08-28", dueDate: "2026-09-11", notes: "Montagens finais WC.", materialNeeded: true, deps: ["paint-walls"] },
  { key: "lighting-final", area: "Fase 7 - Montagens finais", title: "Instalar candeeiros todos", owner: "Obras", people: ["Obras", "Patrícia"], priority: "high", costCategory: "tools", startDate: "2026-08-28", dueDate: "2026-09-11", notes: "Iluminação final: Obra + Tu.", materialNeeded: true, deps: ["ceiling-lighting-prep", "paint-ceilings"] },
  { key: "doors-final", area: "Fase 7 - Montagens finais", title: "Montar portas, incluindo porta de correr", owner: "Obras", people: ["Obras"], priority: "medium", costCategory: "materials", startDate: "2026-08-28", dueDate: "2026-09-11", notes: "Montagens finais depois de pintura e chão.", materialNeeded: true, deps: ["new-floor", "paint-windows-doors"] },
  { key: "handrail-or-shelf", area: "Fase 7 - Montagens finais", title: "Resolver corrimão ou fazer estante", owner: "Patrícia", people: ["Patrícia", "Obras"], priority: "medium", costCategory: "materials", startDate: "2026-08-28", dueDate: "2026-09-11", notes: "Decisão e execução final.", requiresOwnerDecision: true, deps: ["new-floor"] },
  { key: "final-shelves", area: "Fase 7 - Montagens finais", title: "Instalar prateleiras finais", owner: "Obras", people: ["Obras"], priority: "medium", costCategory: "materials", startDate: "2026-08-28", dueDate: "2026-09-11", notes: "Arrumações finais.", materialNeeded: true, deps: ["paint-walls"] },

  { key: "restore-furniture", area: "Fase 8 - Mobiliário e restauro", title: "Restaurar móveis: lixar, tratar, colar e reparar", owner: "Patrícia", people: ["Patrícia", "Sandra"], priority: "medium", costCategory: "furniture", startDate: "2026-09-11", dueDate: "2026-09-25", notes: "Final · Tu + Sandra · Casa habitável.", deps: ["new-floor"] },
  { key: "sofa", area: "Fase 8 - Mobiliário e restauro", title: "Colocar sofá", owner: "Patrícia", people: ["Patrícia", "Sandra"], priority: "medium", costCategory: "furniture", startDate: "2026-09-11", dueDate: "2026-09-25", notes: "Mobilar depois do chão e pintura.", materialNeeded: true, deps: ["new-floor"] },
  { key: "bed", area: "Fase 8 - Mobiliário e restauro", title: "Montar cama", owner: "Patrícia", people: ["Patrícia", "Sandra"], priority: "medium", costCategory: "furniture", startDate: "2026-09-11", dueDate: "2026-09-25", notes: "Mobilar depois do chão e pintura.", materialNeeded: true, deps: ["new-floor"] },
  { key: "headboard", area: "Fase 8 - Mobiliário e restauro", title: "Fazer ou colocar cabeceira", owner: "Patrícia", people: ["Patrícia", "Sandra"], priority: "low", costCategory: "decoration", startDate: "2026-09-11", dueDate: "2026-09-25", notes: "Decoração final.", materialNeeded: true, deps: ["bed"] },
  { key: "dresser", area: "Fase 8 - Mobiliário e restauro", title: "Colocar cómoda", owner: "Patrícia", people: ["Patrícia", "Sandra"], priority: "low", costCategory: "furniture", startDate: "2026-09-11", dueDate: "2026-09-25", notes: "Mobilar depois do chão e pintura.", deps: ["new-floor"] },
  { key: "final-decoration", area: "Fase 8 - Mobiliário e restauro", title: "Decoração final", owner: "Patrícia", people: ["Patrícia", "Sandra"], priority: "low", costCategory: "decoration", startDate: "2026-09-11", dueDate: "2026-09-25", notes: "Últimos dias: decoração e detalhes.", deps: ["sofa", "bed"] },

  { key: "garden-design", area: "Fase 9 - Exterior e extras", title: "Projetar jardim", owner: "Patrícia", people: ["Patrícia"], priority: "low", costCategory: "decoration", startDate: "2026-09-11", dueDate: "2026-09-25", notes: "Upgrade final exterior.", requiresOwnerDecision: true, deps: ["clean-exterior"] },
  { key: "level-exterior", area: "Fase 9 - Exterior e extras", title: "Nivelar terreno exterior", owner: "Obras", people: ["Obras"], priority: "medium", costCategory: "labor", startDate: "2026-09-11", dueDate: "2026-09-25", notes: "Exterior + extras.", deps: ["clean-exterior"] },
  { key: "outdoor-dining", area: "Fase 9 - Exterior e extras", title: "Preparar zona de refeições exterior", owner: "Obras", people: ["Obras", "Patrícia"], priority: "low", costCategory: "materials", startDate: "2026-09-11", dueDate: "2026-09-25", notes: "Zona de refeições exterior.", materialNeeded: true, deps: ["level-exterior"] },
  { key: "decide-pool", area: "Fase 9 - Exterior e extras", title: "Decidir piscina", owner: "Patrícia", people: ["Patrícia"], priority: "low", costCategory: "other", startDate: "2026-09-11", dueDate: "2026-09-25", notes: "Decisão final: piscina avança ou não.", requiresOwnerDecision: true, deps: ["garden-design"] },
  { key: "pool-if-approved", area: "Fase 9 - Exterior e extras", title: "Piscina, se avançar", owner: "Obras", people: ["Obras", "Patrícia"], priority: "low", costCategory: "other", startDate: "2026-09-11", dueDate: "2026-09-25", notes: "Só executar se a decisão for avançar.", deps: ["decide-pool", "level-exterior"] },
];

function findByName<T extends { name: string }>(items: T[], name: string) {
  const item = items.find((candidate) => candidate.name === name);
  if (!item) throw new Error(`Não encontrei "${name}".`);
  return item;
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
}

export const importRenovationPlan = mutation({
  args: {
    resetTasks: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.resetTasks) {
      await clearTaskContent(ctx);
    }

    const people = await ctx.db.query("people").collect();
    const areas = await ctx.db.query("areas").collect();
    const peopleByName = new Map<PersonName, Doc<"people">>([
      ["Patrícia", findByName(people, "Patrícia")],
      ["Obras", findByName(people, "Obras")],
      ["Sandra", findByName(people, "Sandra")],
    ]);

    const existingTasks = await ctx.db.query("tasks").collect();
    const existingTitles = new Set(existingTasks.map((task) => task.title));
    const taskIds = new Map<string, Id<"tasks">>();
    const now = Date.now();

    for (const task of planTasks) {
      if (existingTitles.has(task.title)) continue;

      const area = findByName(areas, task.area);
      const owner = peopleByName.get(task.owner)!;
      const allowedPersonIds = task.people.map((personName) => peopleByName.get(personName)!._id);
      const id = await ctx.db.insert("tasks", {
        title: task.title,
        description: "",
        areaId: area._id,
        status: "todo",
        priority: task.priority,
        ownerId: owner._id,
        allowedPersonIds: Array.from(new Set(allowedPersonIds)),
        requiresOwnerDecision: task.requiresOwnerDecision ?? false,
        ownerDecisionDone: false,
        dependencyIds: [],
        estimatedCost: null,
        actualCost: null,
        costCategory: task.costCategory,
        dueDate: task.dueDate,
        startDate: task.startDate,
        completedAt: null,
        notes: task.notes,
        materialNeeded: task.materialNeeded ?? false,
        materialNotes: task.materialNeeded ? "Confirmar material/preço antes de começar." : "",
        createdAt: now,
        updatedAt: now,
      });
      taskIds.set(task.key, id);
      await ctx.db.insert("activityLog", {
        taskId: id,
        actionType: "imported",
        newValue: task.title,
        timestamp: now,
      });
    }

    for (const task of planTasks) {
      const id = taskIds.get(task.key);
      if (!id || !task.deps) continue;
      const dependencyIds = task.deps
        .map((dependencyKey) => taskIds.get(dependencyKey))
        .filter((dependencyId): dependencyId is Id<"tasks"> => Boolean(dependencyId));
      await ctx.db.patch(id, { dependencyIds, updatedAt: Date.now() });
    }

    const tasks = await ctx.db.query("tasks").collect();
    return {
      imported: taskIds.size,
      totalTasks: tasks.length,
      areas: areas.length,
      people: people.length,
    };
  },
});
