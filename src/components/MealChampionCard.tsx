import { formatKRW } from "@/lib/payroll";
import type { TopByComponent } from "@/lib/payroll";

type MealChampionCardProps = {
  champion: TopByComponent | null;
  periodLabel: string; // "이번 달" | "올해"
  mode?: "max" | "min"; // "max" = 대식가, "min" = 소식가
};

export function MealChampionCard({
  champion,
  periodLabel,
  mode = "max",
}: MealChampionCardProps) {
  if (!champion) return null;

  const isMax = mode === "max";
  const label = isMax ? "대식가" : "소식가";
  const emoji = isMax ? "🍚" : "🥄";
  const accentBorder = isMax ? "border-amber-500/25" : "border-sky-500/25";
  const accentGlow = isMax ? "bg-amber-400/10" : "bg-sky-400/10";
  const accentText = isMax ? "text-amber-400" : "text-sky-400";

  return (
    <div className={`relative overflow-hidden rounded-xl border ${accentBorder} bg-surface p-4`}>
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${accentGlow} blur-2xl`}
      />
      <div className="relative text-xs font-medium uppercase tracking-wider text-ink-muted">
        {emoji} {periodLabel} {label}
      </div>
      <div className="relative mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {champion.employeeName}
        <span className="ml-2 text-sm font-normal text-ink-secondary">
          {champion.department} · {champion.position}
        </span>
      </div>
      <div className={`relative mt-1 tabular-nums text-sm ${accentText}`}>
        식대 {formatKRW(champion.value)}
      </div>
      <div className="relative mt-2 text-[11px] text-ink-muted">
        재미로 보는 지표입니다 — 식대는 직책/직무 수당 산정 방식에 따라 달라질 수 있습니다.
      </div>
    </div>
  );
}
