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
import type { TenureBandAgg } from "@/lib/payroll";

export function TenureHeadcountChart({ data }: { data: TenureBandAgg[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
        <XAxis dataKey="band" tick={{ fontSize: 12, fill: CHART_COLORS.axisText }} />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: CHART_COLORS.axisText }}
          width={40}
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
          formatter={(value) => [`${value}명`, "인원"]}
          labelFormatter={(label) => `근속 ${label}`}
        />
        <Bar dataKey="headcount" fill={CHART_COLORS.brandSecondary} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
