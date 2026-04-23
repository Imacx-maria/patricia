export function DashboardHero({ name = "Maria" }: { name?: string }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Bom dia" : hour < 20 ? "Boa tarde" : "Boa noite";
  return (
    <header className="flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">Resumo</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
        {greet}, {name}
      </h1>
      <p className="text-sm text-ink-muted">Aqui está o estado da renovação hoje.</p>
    </header>
  );
}
