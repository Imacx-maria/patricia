import { currencyFormatter } from "@/lib/constants";

export function CostSummary({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "good" | "bad";
}) {
  const accent =
    tone === "good" ? "bg-pastel-sage" : tone === "bad" ? "bg-pastel-pink" : "bg-pastel-yellow";
  return (
    <div className={`flex flex-col gap-2 rounded-3xl ${accent} p-5 shadow-soft`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="text-3xl font-extrabold text-ink">{currencyFormatter.format(value)}</p>
    </div>
  );
}
