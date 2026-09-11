"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CATEGORICAL_8, CHART_COLORS } from "@/lib/chart-colors";
import { formatKRW, formatKRWCompact, PAY_COMPONENT_LABELS } from "@/lib/payroll";
import type { PositionComponentRow } from "@/lib/payroll";

export function PositionComponentStackChart({ data }: { data: PositionComponentRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={340}>
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
          formatter={(value) => formatKRW(Number(value))}
          labelFormatter={(label) => `직급: ${label}`}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "#c3c2b7" }}
          formatter={(value) => <span style={{ color: "#c3c2b7" }}>{value}</span>}
        />
        {PAY_COMPONENT_LABELS.map(({ key, label }, i) => (
          <Bar key={key} dataKey={key} name={label} stackId="a" fill={CATEGORICAL_8[i]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
