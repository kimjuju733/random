"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_COLORS } from "@/lib/chart-colors";
import { formatKRW, formatKRWCompact } from "@/lib/payroll";

type RankingRow = {
  department: string;
  totalGross: number;
  avgGrossPerEmployee: number;
};

function RankingTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: RankingRow }[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-md border border-surface-border bg-[#1a1a19] px-3 py-2 text-xs shadow-lg shadow-black/40">
      <div className="font-medium text-foreground">{row.department}</div>
      <div className="mt-1 tabular-nums text-ink-secondary">
        총액: {formatKRWCompact(row.totalGross)}
      </div>
      <div className="tabular-nums text-ink-secondary">
        인당 평균임금: {formatKRW(row.avgGrossPerEmployee)}
      </div>
    </div>
  );
}

// 부서 전체를 보여주는 순위 차트라 61개+ 항목도 있을 수 있음 — 행당 20px, 스크롤 없이 전부 노출.
const ROW_HEIGHT = 20;
const MIN_HEIGHT = 420;

export function DepartmentRankingChart({ data }: { data: RankingRow[] }) {
  const height = Math.max(MIN_HEIGHT, data.length * ROW_HEIGHT);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
        barCategoryGap="20%"
      >
        <CartesianGrid horizontal={false} stroke={CHART_COLORS.grid} />
        <XAxis
          type="number"
          tickFormatter={(v) => formatKRWCompact(v)}
          tick={{ fontSize: 12, fill: CHART_COLORS.axisText }}
        />
        <YAxis
          type="category"
          dataKey="department"
          width={110}
          interval={0}
          tick={{ fontSize: 11, fill: CHART_COLORS.axisText }}
        />
        <Tooltip content={<RankingTooltip />} />
        <Bar dataKey="totalGross" fill={CHART_COLORS.brand} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
