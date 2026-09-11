type KpiCardProps = {
  label: string;
  value: string;
  sub?: string;
  source?: string;
};

export function KpiCard({ label, value, sub, source }: KpiCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-surface-border bg-surface p-4 transition-colors hover:border-brand/50">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-60"
      />
      <div className="relative text-xs font-medium uppercase tracking-wider text-ink-muted">
        {label}
      </div>
      <div className="relative mt-2 tabular-nums text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </div>
      {sub && <div className="relative mt-1 text-xs text-ink-secondary">{sub}</div>}
      {source && (
        <div className="relative mt-2 border-t border-surface-border pt-1 text-[11px] text-ink-muted">
          출처: {source}
        </div>
      )}
    </div>
  );
}
