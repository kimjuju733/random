"use client";

import { useMemo, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { KpiCard } from "@/components/KpiCard";
import { InsightPanel } from "@/components/InsightPanel";
import { DepartmentRankingChart } from "@/components/DepartmentRankingChart";
import { DepartmentDeviationChart } from "@/components/DepartmentDeviationChart";
import { TenureBandChart } from "@/components/TenureBandChart";
import { TenureHeadcountChart } from "@/components/TenureHeadcountChart";
import { DepartmentTable } from "@/components/DepartmentTable";
import { PayComponentChart } from "@/components/PayComponentChart";
import { PositionAvgChart } from "@/components/PositionAvgChart";
import { PositionComponentStackChart } from "@/components/PositionComponentStackChart";
import { MealChampionCard } from "@/components/MealChampionCard";
import {
  PAYROLL,
  DEFAULT_FILTERS,
  Filters,
  MONTH_LABELS,
  applyFilters,
  aggregateByDepartment,
  aggregateByTenureBand,
  aggregateByPosition,
  aggregateComponentAverages,
  aggregateComponentsByPosition,
  topByComponent,
  tenureYears,
  positionSortIndex,
  formatKRW,
  formatKRWCompact,
} from "@/lib/payroll";

type View = "components" | "department" | "tenure";

export default function Home() {
  const today = useMemo(() => new Date(), []);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [view, setView] = useState<View>("components");

  const allTenureBands = useMemo(
    () => aggregateByTenureBand(PAYROLL, today).map((b) => b.band),
    [today],
  );

  const allDepartments = useMemo(
    () => [...new Set(PAYROLL.map((r) => r.department))].sort((a, b) => a.localeCompare(b, "ko")),
    [],
  );

  const allPositions = useMemo(
    () =>
      [...new Set(PAYROLL.map((r) => r.position).filter(Boolean))].sort(
        (a, b) => positionSortIndex(a) - positionSortIndex(b),
      ),
    [],
  );

  const filteredRecords = useMemo(
    () => applyFilters(PAYROLL, filters, today),
    [filters, today],
  );

  const deptAgg = useMemo(() => aggregateByDepartment(filteredRecords), [filteredRecords]);

  const totalGrossAll = deptAgg.reduce((sum, d) => sum + d.totalGross, 0);
  const totalHeadcountAll = deptAgg.reduce((sum, d) => sum + d.headcount, 0);
  const companyAvgPerEmployee = totalHeadcountAll > 0 ? totalGrossAll / totalHeadcountAll : 0;

  const sortedByTotal = [...deptAgg].sort((a, b) => b.totalGross - a.totalGross);
  const deptMax = sortedByTotal[0];
  const deptMin = sortedByTotal[sortedByTotal.length - 1];
  const maxMinGap = deptMax && deptMin ? deptMax.totalGross - deptMin.totalGross : 0;

  const rankingData = useMemo(
    () =>
      sortedByTotal.map((d) => ({
        department: d.department,
        totalGross: d.totalGross,
        avgGrossPerEmployee: d.avgGrossPerEmployee,
      })),
    [sortedByTotal],
  );

  const deviationData = useMemo(() => {
    const withDeviation = deptAgg.map((d) => ({
      department: d.department,
      deviation: d.avgGrossPerEmployee - companyAvgPerEmployee,
    }));
    return withDeviation
      .sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation))
      .slice(0, 15)
      .sort((a, b) => a.deviation - b.deviation);
  }, [deptAgg, companyAvgPerEmployee]);

  const departmentInsights = useMemo(() => {
    const insights: string[] = [];
    const worstDeviation = (companyAvgPerEmployee > 0 ? [...deptAgg] : [])
      .sort(
        (a, b) =>
          Math.abs(b.avgGrossPerEmployee - companyAvgPerEmployee) -
          Math.abs(a.avgGrossPerEmployee - companyAvgPerEmployee),
      )[0];
    if (worstDeviation) {
      const pct =
        ((worstDeviation.avgGrossPerEmployee - companyAvgPerEmployee) / companyAvgPerEmployee) *
        100;
      if (Math.abs(pct) >= 15) {
        insights.push(
          `${worstDeviation.department}의 인당 평균 급여가 전사 평균 대비 ${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% 수준일 수 있습니다 — 직급 구성 확인이 필요합니다.`,
        );
      }
    }
    if (deptMax && deptMin && deptMax.department !== deptMin.department) {
      insights.push(
        `${deptMax.department}와 ${deptMin.department}의 총액 차이가 ${formatKRWCompact(maxMinGap)}로, 부서 간 격차가 가장 큰 구간일 수 있습니다.`,
      );
    }
    return insights;
  }, [deptAgg, companyAvgPerEmployee, deptMax, deptMin, maxMinGap]);

  const tenureBandAgg = useMemo(
    () => aggregateByTenureBand(filteredRecords, today),
    [filteredRecords, today],
  );

  const employeeTenures = useMemo(() => {
    const byEmployee = new Map<string, number>();
    for (const r of filteredRecords) {
      const key = `${r.employeeName}__${r.hireDate}`;
      if (!byEmployee.has(key)) byEmployee.set(key, tenureYears(r.hireDate, today));
    }
    return [...byEmployee.values()];
  }, [filteredRecords, today]);

  const avgTenure =
    employeeTenures.length > 0
      ? employeeTenures.reduce((a, b) => a + b, 0) / employeeTenures.length
      : 0;
  const maxTenure = employeeTenures.length > 0 ? Math.max(...employeeTenures) : 0;

  const tenureInsights = useMemo(() => {
    const insights: string[] = [];
    const thin = tenureBandAgg.find((b) => b.headcount > 0 && b.headcount < 5);
    if (thin) {
      insights.push(
        `근속 ${thin.band} 구간 인원이 ${thin.headcount}명으로 적어, 해당 구간 평균 급여는 소수 인원에 좌우될 수 있습니다.`,
      );
    }
    if (tenureBandAgg.length > 0) {
      const highest = [...tenureBandAgg].sort((a, b) => b.avgGross - a.avgGross)[0];
      insights.push(
        `근속 ${highest.band} 구간의 평균 급여(${formatKRWCompact(highest.avgGross)})가 가장 높을 수 있습니다 — 근속연수와 급여 수준의 관계를 점검해볼 만합니다.`,
      );
    }
    return insights;
  }, [tenureBandAgg]);

  const periodLabel =
    filters.month === "all" ? "연간 누적 (1~12월)" : `${MONTH_LABELS[filters.month - 1]}`;
  const mealPeriodLabel = filters.month === "all" ? "올해의" : `${MONTH_LABELS[filters.month - 1]}`;

  const componentAverages = useMemo(
    () => aggregateComponentAverages(filteredRecords),
    [filteredRecords],
  );
  const topComponent = [...componentAverages].sort((a, b) => b.avg - a.avg)[0];

  const positionAgg = useMemo(() => aggregateByPosition(filteredRecords), [filteredRecords]);

  const positionComponentRows = useMemo(
    () => aggregateComponentsByPosition(filteredRecords),
    [filteredRecords],
  );

  const mealChampion = useMemo(
    () => topByComponent(filteredRecords, "mealAllowance"),
    [filteredRecords],
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-4 flex items-center justify-center gap-3 rounded-xl border-2 border-amber-500/60 bg-amber-500/10 px-6 py-4 text-center">
        <span className="text-2xl">⚠️</span>
        <p className="text-xl font-bold tracking-tight text-amber-400 sm:text-2xl">
          가상 급여 데이터입니다 — 실제 임직원 정보가 아닙니다
        </p>
      </div>

      <header className="grid-glow relative mb-6 overflow-hidden rounded-xl border border-surface-border bg-surface px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-brand shadow-[0_0_12px_2px_rgba(57,135,229,0.7)]" />
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            급여대장 대시보드
          </h1>
        </div>
        <p className="mt-2 font-mono text-xs text-ink-muted">
          데이터 기준: 2025년 1~12월 (가상 데이터) · 조회 시점 {today.toLocaleDateString("ko-KR")}
        </p>
      </header>

      <div className="mb-6">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          tenureBands={allTenureBands}
          departments={allDepartments}
          positions={allPositions}
        />
      </div>

      <div className="mb-6 flex gap-2 border-b border-surface-border">
        <button
          type="button"
          onClick={() => setView("components")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            view === "components"
              ? "border-b-2 border-brand text-brand shadow-[0_1px_8px_-2px_rgba(57,135,229,0.8)]"
              : "border-b-2 border-transparent text-ink-muted hover:text-foreground"
          }`}
        >
          급여 항목 비교
        </button>
        <button
          type="button"
          onClick={() => setView("department")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            view === "department"
              ? "border-b-2 border-brand text-brand shadow-[0_1px_8px_-2px_rgba(57,135,229,0.8)]"
              : "border-b-2 border-transparent text-ink-muted hover:text-foreground"
          }`}
        >
          부서별 급여 현황
        </button>
        <button
          type="button"
          onClick={() => setView("tenure")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            view === "tenure"
              ? "border-b-2 border-brand text-brand shadow-[0_1px_8px_-2px_rgba(57,135,229,0.8)]"
              : "border-b-2 border-transparent text-ink-muted hover:text-foreground"
          }`}
        >
          근속연수별 급여 수준
        </button>
      </div>

      {view === "department" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard
              label={`전사 인건비 총액 (${periodLabel})`}
              value={formatKRW(totalGrossAll)}
              sub={`${totalHeadcountAll}명 기준`}
              source="급여대장"
            />
            <KpiCard
              label="전사 평균 급여 (인당)"
              value={formatKRW(companyAvgPerEmployee)}
              sub={periodLabel}
              source="급여대장"
            />
            <KpiCard
              label="부서 간 최대-최소 차액"
              value={formatKRWCompact(maxMinGap)}
              sub={deptMax && deptMin ? `${deptMax.department} ↔ ${deptMin.department}` : "-"}
              source="급여대장"
            />
          </div>

          <div className="rounded-xl border border-surface-border bg-surface p-4 transition-colors hover:border-brand/30">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-secondary">
              부서별 급여총액 순위 (전체 {rankingData.length}개 부서)
            </h2>
            <DepartmentRankingChart data={rankingData} />
          </div>

          <div className="rounded-xl border border-surface-border bg-surface p-4 transition-colors hover:border-brand/30">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-secondary">
              전사 평균 대비 부서별 편차 (편차 상위 15개 부서)
            </h2>
            <DepartmentDeviationChart data={deviationData} />
          </div>

          <InsightPanel insights={departmentInsights} />

          <div>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-secondary">
              전체 부서 목록 ({deptAgg.length}개)
            </h2>
            <DepartmentTable data={deptAgg} />
          </div>
        </div>
      )}

      {view === "tenure" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <KpiCard
              label="평균 근속연수"
              value={`${avgTenure.toFixed(1)}년`}
              sub={`${employeeTenures.length}명 기준`}
              source="급여대장"
            />
            <KpiCard
              label="최장 근속자 재직기간"
              value={`${maxTenure.toFixed(1)}년`}
              source="급여대장"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-surface-border bg-surface p-4 transition-colors hover:border-brand/30">
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-secondary">
                근속연수 구간별 평균 급여
              </h2>
              <TenureBandChart data={tenureBandAgg} />
            </div>
            <div className="rounded-xl border border-surface-border bg-surface p-4 transition-colors hover:border-brand/30">
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-secondary">
                근속연수 구간별 인원 분포
              </h2>
              <TenureHeadcountChart data={tenureBandAgg} />
            </div>
          </div>

          <InsightPanel insights={tenureInsights} />
        </div>
      )}

      {view === "components" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MealChampionCard champion={mealChampion} periodLabel={mealPeriodLabel} />
            {topComponent && (
              <KpiCard
                label="가장 비중 큰 지급 항목"
                value={topComponent.label}
                sub={`1인 1개월 평균 ${formatKRW(topComponent.avg)}`}
                source="급여대장"
              />
            )}
          </div>

          <div className="rounded-xl border border-surface-border bg-surface p-4 transition-colors hover:border-brand/30">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-secondary">
              급여 지급 항목별 평균 ({periodLabel})
            </h2>
            <PayComponentChart data={componentAverages} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-surface-border bg-surface p-4 transition-colors hover:border-brand/30">
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-secondary">
                직급별 평균 급여
              </h2>
              <PositionAvgChart data={positionAgg} />
            </div>
            <div className="rounded-xl border border-surface-border bg-surface p-4 transition-colors hover:border-brand/30">
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-secondary">
                직급별 급여 항목 구성 (1인 1개월 평균)
              </h2>
              <PositionComponentStackChart data={positionComponentRows} />
            </div>
          </div>
        </div>
      )}

      <footer className="mt-10 border-t border-surface-border pt-4 text-xs text-ink-muted">
        가상(샘플) 데이터이며, 2025년 1개 연도만 존재해 연도별(YoY) 추세 비교는 제공하지 않습니다.
      </footer>
    </div>
  );
}
