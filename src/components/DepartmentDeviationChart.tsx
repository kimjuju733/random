"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "@/lib/chart-colors";
import { formatKRWCompact } from "@/lib/payroll";

type DeviationRow = {
  department: string;
  deviation: number; // 전사 평균 대비 편차 (부서 인당 평균 - 전사 인당 평균)
};

export function DepartmentDeviationChart({ data }: { data: DeviationRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={420}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
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
          tick={{ fontSize: 12, fill: CHART_COLORS.axisText }}
        />
        <ReferenceLine x={0} stroke={CHART_COLORS.axisText} />
        <Tooltip
          contentStyle={{
            background: CHART_COLORS.tooltipBg,
            border: `1px solid ${CHART_COLORS.tooltipBorder}`,
            borderRadius: 6,
            fontSize: 12,
          }}
          labelStyle={{ color: "#ffffff", marginBottom: 4 }}
          itemStyle={{ color: "#c3c2b7" }}
          formatter={(value) => {
            const n = Number(value);
            return [`${n >= 0 ? "+" : ""}${formatKRWCompact(n)}`, "전사 평균 대비"];
          }}
          labelFormatter={(label) => `부서: ${label}`}
        />
        <Bar dataKey="deviation" radius={[4, 4, 4, 4]}>
          {data.map((row) => (
            <Cell
              key={row.department}
              fill={row.deviation >= 0 ? CHART_COLORS.good : CHART_COLORS.bad}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
