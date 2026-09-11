import { formatKRW } from "@/lib/payroll";
import type { TopByComponent } from "@/lib/payroll";

type MealChampionCardProps = {
  champion: TopByComponent | null;
  periodLabel: string; // "이번 달" | "올해"
};

export function MealChampionCard({ champion, periodLabel }: MealChampionCardProps) {
  if (!champion) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-500/25 bg-surface p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-400/10 blur-2xl"
      />
      <div className="relative text-xs font-medium uppercase tracking-wider text-ink-muted">
        🍚 {periodLabel} 대식가
      </div>
      <div className="relative mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {champion.employeeName}
        <span className="ml-2 text-sm font-normal text-ink-secondary">
          {champion.department} · {champion.position}
        </span>
      </div>
      <div className="relative mt-1 tabular-nums text-sm text-amber-400">
        식대 {formatKRW(champion.value)}
      </div>
      <div className="relative mt-2 text-[11px] text-ink-muted">
        재미로 보는 지표입니다 — 식대는 직책/직무 수당 산정 방식에 따라 달라질 수 있습니다.
      </div>
    </div>
  );
}
