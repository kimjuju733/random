"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "@/lib/chart-colors";
import { formatKRWCompact } from "@/lib/payroll";
import type { PositionAgg } from "@/lib/payroll";

export function PositionAvgChart({ data }: { data: PositionAgg[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
        <XAxis dataKey="position" tick={{ fontSize: 12, fill: CHART_COLORS.axisText }} />
        <YAxis
          tickFormatter={(v) => formatKRWCompact(v)}
          tick={{ fontSize: 12, fill: CHART_COLORS.axisText }}
          width={70}
        />
        <Tooltip
          contentStyle={{
            background: CHART_COLORS.tooltipBg,
            border: `1px solid ${CHART_COLORS.tooltipBorder}`,
            borderRadius: 6,
            fontSize: 12,
          }}
          labelStyle={{ color: "#ffffff", marginBottom: 4 }}
          itemStyle={{ color: "#c3c2b7" }}
          formatter={(value) => [formatKRWCompact(Number(value)), "인당 평균 급여"]}
          labelFormatter={(label) => `직급: ${label}`}
        />
        <Bar dataKey="avgGrossPerEmployee" fill={CHART_COLORS.aqua} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
