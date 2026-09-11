"use client";

import { useState } from "react";
import { formatKRW } from "@/lib/payroll";
import type { DepartmentAgg } from "@/lib/payroll";

type SortKey = "totalGross" | "headcount" | "department" | "avgGrossPerEmployee";

export function DepartmentTable({ data }: { data: DepartmentAgg[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("totalGross");
  const [asc, setAsc] = useState(false);

  const sorted = [...data].sort((a, b) => {
    const dir = asc ? 1 : -1;
    if (sortKey === "department") return a.department.localeCompare(b.department) * dir;
    return (a[sortKey] - b[sortKey]) * dir;
  });

  function toggleSort(key: SortKey) {
    if (key === sortKey) setAsc(!asc);
    else {
      setSortKey(key);
      setAsc(false);
    }
  }

  const headers: { key: SortKey; label: string }[] = [
    { key: "department", label: "부서명" },
    { key: "headcount", label: "인원" },
    { key: "totalGross", label: "지급합계" },
    { key: "avgGrossPerEmployee", label: "인당 평균임금" },
  ];

  return (
    <div className="max-h-80 overflow-auto rounded-xl border border-surface-border bg-surface">
      <table className="w-full text-sm tabular-nums">
        <thead className="sticky top-0 bg-[#15201c]">
          <tr>
            {headers.map((h) => (
              <th
                key={h.key}
                onClick={() => toggleSort(h.key)}
                className="cursor-pointer select-none px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-ink-muted transition-colors hover:text-brand-secondary"
              >
                {h.label} {sortKey === h.key && (asc ? "▲" : "▼")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={row.department}
              className="border-t border-surface-border text-ink-secondary transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <td className="px-3 py-1.5">{row.department}</td>
              <td className="px-3 py-1.5">{row.headcount}</td>
              <td className="px-3 py-1.5">{formatKRW(row.totalGross)}</td>
              <td className="px-3 py-1.5">{formatKRW(row.avgGrossPerEmployee)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
