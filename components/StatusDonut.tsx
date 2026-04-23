const COLORS: Record<string, string> = {
  backlog: "#e7e0d0",
  todo: "#c9dafb",
  doing: "#f7e26c",
  blocked: "#f9c6d1",
  waiting_material: "#d6c7f2",
  done: "#c8d89b",
};

export function StatusDonut({
  data,
}: {
  data: { status: string; label: string; count: number }[];
}) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  let offset = 0;
  const radius = 60;
  const circ = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-5 rounded-3xl bg-surface p-5 shadow-soft">
      <svg width="160" height="160" viewBox="0 0 160 160" className="shrink-0">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#f6f1e6" strokeWidth="22" />
        {data.map((d) => {
          const frac = d.count / total;
          const dash = frac * circ;
          const el = (
            <circle
              key={d.status}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={COLORS[d.status] ?? "#141417"}
              strokeWidth="22"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 80 80)"
            />
          );
          offset += dash;
          return el;
        })}
        <text x="80" y="86" textAnchor="middle" className="fill-ink font-extrabold" fontSize="26">
          {total}
        </text>
      </svg>
      <ul className="grid flex-1 grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {data.map((d) => (
          <li key={d.status} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[d.status] }} />
            <span className="text-ink-muted">{d.label}</span>
            <span className="ml-auto font-semibold text-ink">{d.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
