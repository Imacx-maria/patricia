import { currencyFormatter } from "@/lib/constants";

export function CostSummary({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "good" | "bad";
}) {
  const toneClass =
    tone === "good"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : tone === "bad"
        ? "border-red-200 bg-red-50 text-red-900"
        : "border-[#ded6c9] bg-[#fffdf8] text-slate-900";

  return (
    <div className={`rounded-lg border p-4 ${toneClass}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{currencyFormatter.format(value)}</p>
    </div>
  );
}
