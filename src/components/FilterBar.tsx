"use client";

import { DEFAULT_FILTERS, Filters, MONTH_LABELS } from "@/lib/payroll";

type FilterBarProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  tenureBands: string[];
  departments: string[];
  positions: string[];
};

const SELECT_CLASS =
  "rounded-md border border-surface-border bg-background px-2 py-1.5 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/50";

export function FilterBar({
  filters,
  onChange,
  tenureBands,
  departments,
  positions,
}: FilterBarProps) {
  const isDefault = JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTERS);

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-xl border border-surface-border bg-surface p-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium uppercase tracking-wider text-ink-muted">
          기간
        </label>
        <select
          className={SELECT_CLASS}
          value={filters.month}
          onChange={(e) =>
            onChange({
              ...filters,
              month: e.target.value === "all" ? "all" : Number(e.target.value),
            })
          }
        >
          <option value="all">연간 누적 (1~12월)</option>
          {MONTH_LABELS.map((label, i) => (
            <option key={label} value={i + 1}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium uppercase tracking-wider text-ink-muted">
          부서 선택
        </label>
        <select
          className={`w-44 ${SELECT_CLASS}`}
          value={filters.deptQuery}
          onChange={(e) => onChange({ ...filters, deptQuery: e.target.value })}
        >
          <option value="">전체 부서</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium uppercase tracking-wider text-ink-muted">
          근속연수 구간
        </label>
        <select
          className={SELECT_CLASS}
          value={filters.tenureBandFilter}
          onChange={(e) => onChange({ ...filters, tenureBandFilter: e.target.value })}
        >
          <option value="all">전체</option>
          {tenureBands.map((band) => (
            <option key={band} value={band}>
              {band}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium uppercase tracking-wider text-ink-muted">
          직급
        </label>
        <select
          className={SELECT_CLASS}
          value={filters.position}
          onChange={(e) => onChange({ ...filters, position: e.target.value })}
        >
          <option value="">전체 직급</option>
          {positions.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </select>
      </div>

      {!isDefault && (
        <button
          type="button"
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="ml-auto rounded-md border border-surface-border px-3 py-1.5 text-sm text-ink-secondary transition-colors hover:border-brand/50 hover:text-foreground"
        >
          필터 초기화
        </button>
      )}
    </div>
  );
}
