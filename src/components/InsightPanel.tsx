export function InsightPanel({ insights }: { insights: string[] }) {
  if (insights.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-panel-border bg-panel p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-secondary/10 blur-3xl"
      />
      <div className="relative mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
        <span className="text-brand-secondary">◆</span> 살펴볼 지점 (AI 제안)
      </div>
      <ul className="relative space-y-1.5">
        {insights.slice(0, 3).map((text, i) => (
          <li key={i} className="text-sm leading-relaxed text-ink-secondary">
            · {text}
          </li>
        ))}
      </ul>
    </div>
  );
}
