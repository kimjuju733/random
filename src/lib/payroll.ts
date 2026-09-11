import payrollData from "@/data/payroll.json";

export type PayComponentKey =
  | "baseSalary"
  | "positionAllowance"
  | "weeklyRestAllowance"
  | "transportAllowance"
  | "incentiveAllowance"
  | "overtimeAllowance"
  | "mealAllowance"
  | "jobAllowance";

export type PayrollRecord = {
  month: number; // 1-12
  department: string;
  employeeName: string;
  position: string; // 직급 (사원/대리/과장/차장/부장/임원 등)
  hireDate: string; // ISO date
  components: Record<PayComponentKey, number>;
  grossPay: number;
  netPay: number;
};

export const PAYROLL: PayrollRecord[] = payrollData as PayrollRecord[];

// scripts/convert-payroll.mjs의 PAY_COMPONENTS와 순서·키를 동일하게 유지
export const PAY_COMPONENT_LABELS: { key: PayComponentKey; label: string }[] = [
  { key: "baseSalary", label: "기본급" },
  { key: "positionAllowance", label: "직책수당" },
  { key: "weeklyRestAllowance", label: "주휴수당" },
  { key: "transportAllowance", label: "교통비" },
  { key: "incentiveAllowance", label: "기초장려수당" },
  { key: "overtimeAllowance", label: "잔업수당" },
  { key: "mealAllowance", label: "식대" },
  { key: "jobAllowance", label: "직무수당" },
];

export const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

// 직급 표시 순서 (데이터에 없는 값이 섞여 있어도 뒤에 정렬되도록 fallback 유지)
export const POSITION_ORDER = ["사원", "대리", "과장", "차장", "부장", "임원"];

export function positionSortIndex(position: string): number {
  const idx = POSITION_ORDER.indexOf(position);
  return idx === -1 ? POSITION_ORDER.length : idx;
}

export function tenureYears(hireDate: string, asOf: Date): number {
  const hire = new Date(hireDate).getTime();
  const days = (asOf.getTime() - hire) / (1000 * 60 * 60 * 24);
  return days / 365.25;
}

const BAND_SIZE = 5;

export function tenureBand(years: number): string {
  const start = Math.floor(years / BAND_SIZE) * BAND_SIZE;
  return `${start}-${start + BAND_SIZE}년`;
}

export function tenureBandOrder(band: string): number {
  return Number(band.split("-")[0]);
}

export type Filters = {
  month: number | "all"; // "all" = 연간 누적
  deptQuery: string;
  tenureBandFilter: string | "all";
  position: string; // "" = 전체
};

export const DEFAULT_FILTERS: Filters = {
  month: "all",
  deptQuery: "",
  tenureBandFilter: "all",
  position: "",
};

/** 필터 조건에 맞는 급여 레코드를 반환한다. 근속연수/구간은 오늘 날짜 기준. */
export function applyFilters(
  records: PayrollRecord[],
  filters: Filters,
  asOf: Date,
): PayrollRecord[] {
  return records.filter((r) => {
    if (filters.month !== "all" && r.month !== filters.month) return false;
    if (
      filters.deptQuery.trim() &&
      !r.department.toLowerCase().includes(filters.deptQuery.trim().toLowerCase())
    )
      return false;
    if (filters.position && r.position !== filters.position) return false;
    if (filters.tenureBandFilter !== "all") {
      const band = tenureBand(tenureYears(r.hireDate, asOf));
      if (band !== filters.tenureBandFilter) return false;
    }
    return true;
  });
}

export type DepartmentAgg = {
  department: string;
  totalGross: number;
  totalNet: number;
  headcount: number; // 순인원(중복 제거). "인당" 계산의 분모
  avgGrossPerEmployee: number;
};

/**
 * 부서별 급여 합계 + 순인원. month="all"이면 필터링된 레코드(기본 12개월)를
 * 직원별로 합산한 뒤 부서로 묶는다 — 인당 평균이 "연간 총액/실인원"이 되도록.
 */
export function aggregateByDepartment(records: PayrollRecord[]): DepartmentAgg[] {
  const byEmployee = new Map<
    string,
    { department: string; gross: number; net: number }
  >();
  for (const r of records) {
    const key = `${r.employeeName}__${r.hireDate}`;
    const cur = byEmployee.get(key) ?? {
      department: r.department,
      gross: 0,
      net: 0,
    };
    cur.gross += r.grossPay;
    cur.net += r.netPay;
    byEmployee.set(key, cur);
  }

  const map = new Map<string, DepartmentAgg>();
  for (const emp of byEmployee.values()) {
    const cur = map.get(emp.department) ?? {
      department: emp.department,
      totalGross: 0,
      totalNet: 0,
      headcount: 0,
      avgGrossPerEmployee: 0,
    };
    cur.totalGross += emp.gross;
    cur.totalNet += emp.net;
    cur.headcount += 1;
    map.set(emp.department, cur);
  }

  return [...map.values()].map((d) => ({
    ...d,
    avgGrossPerEmployee: d.headcount > 0 ? d.totalGross / d.headcount : 0,
  }));
}

export type TenureBandAgg = {
  band: string;
  avgGross: number;
  headcount: number; // 순인원(중복 제거)
};

export function aggregateByTenureBand(
  records: PayrollRecord[],
  asOf: Date,
): TenureBandAgg[] {
  // 순인원 계산을 위해 직원별 최신 hireDate 기준 1회만 카운트
  const byEmployee = new Map<string, { band: string; gross: number[] }>();
  for (const r of records) {
    const band = tenureBand(tenureYears(r.hireDate, asOf));
    const key = `${r.employeeName}__${r.hireDate}`;
    const cur = byEmployee.get(key) ?? { band, gross: [] };
    cur.gross.push(r.grossPay);
    byEmployee.set(key, cur);
  }

  const bandMap = new Map<string, { totalAvgGross: number; headcount: number }>();
  for (const { band, gross } of byEmployee.values()) {
    const avgForEmployee = gross.reduce((a, b) => a + b, 0) / gross.length;
    const cur = bandMap.get(band) ?? { totalAvgGross: 0, headcount: 0 };
    cur.totalAvgGross += avgForEmployee;
    cur.headcount += 1;
    bandMap.set(band, cur);
  }

  return [...bandMap.entries()]
    .map(([band, v]) => ({
      band,
      avgGross: Math.round(v.totalAvgGross / v.headcount),
      headcount: v.headcount,
    }))
    .sort((a, b) => tenureBandOrder(a.band) - tenureBandOrder(b.band));
}

export type PositionAgg = {
  position: string;
  totalGross: number;
  headcount: number; // 순인원(중복 제거)
  avgGrossPerEmployee: number;
};

/** 직급별 급여 합계 + 순인원. aggregateByDepartment와 동일한 방식으로 인당 평균을 계산한다. */
export function aggregateByPosition(records: PayrollRecord[]): PositionAgg[] {
  const byEmployee = new Map<string, { position: string; gross: number }>();
  for (const r of records) {
    const key = `${r.employeeName}__${r.hireDate}`;
    const cur = byEmployee.get(key) ?? { position: r.position, gross: 0 };
    cur.gross += r.grossPay;
    byEmployee.set(key, cur);
  }

  const map = new Map<string, PositionAgg>();
  for (const emp of byEmployee.values()) {
    const cur = map.get(emp.position) ?? {
      position: emp.position,
      totalGross: 0,
      headcount: 0,
      avgGrossPerEmployee: 0,
    };
    cur.totalGross += emp.gross;
    cur.headcount += 1;
    map.set(emp.position, cur);
  }

  return [...map.values()]
    .map((p) => ({ ...p, avgGrossPerEmployee: p.headcount > 0 ? p.totalGross / p.headcount : 0 }))
    .sort((a, b) => positionSortIndex(a.position) - positionSortIndex(b.position));
}

export type ComponentAverage = { key: PayComponentKey; label: string; avg: number };

/** 급여 지급 항목별 평균 금액(1건의 급여명세 = 1인 1개월 기준 평균). */
export function aggregateComponentAverages(records: PayrollRecord[]): ComponentAverage[] {
  if (records.length === 0) return PAY_COMPONENT_LABELS.map((c) => ({ ...c, avg: 0 }));
  return PAY_COMPONENT_LABELS.map(({ key, label }) => ({
    key,
    label,
    avg: records.reduce((sum, r) => sum + r.components[key], 0) / records.length,
  }));
}

export type PositionComponentRow = { position: string } & Record<PayComponentKey, number>;

/** 직급별 급여 항목 구성(평균, 1인 1개월 기준) — 100% 누적 막대 차트용. */
export function aggregateComponentsByPosition(records: PayrollRecord[]): PositionComponentRow[] {
  const byPosition = new Map<string, PayrollRecord[]>();
  for (const r of records) {
    const list = byPosition.get(r.position) ?? [];
    list.push(r);
    byPosition.set(r.position, list);
  }

  return [...byPosition.entries()]
    .map(([position, rows]) => {
      const row = { position } as PositionComponentRow;
      for (const { key } of PAY_COMPONENT_LABELS) {
        row[key] = rows.reduce((sum, r) => sum + r.components[key], 0) / rows.length;
      }
      return row;
    })
    .sort((a, b) => positionSortIndex(a.position) - positionSortIndex(b.position));
}

export type TopByComponent = {
  employeeName: string;
  department: string;
  position: string;
  value: number;
};

/** 필터링된 기간(월 또는 연간 누적) 내에서 특정 지급 항목 합계가 가장 큰 직원. */
export function topByComponent(
  records: PayrollRecord[],
  key: PayComponentKey,
): TopByComponent | null {
  const byEmployee = new Map<string, TopByComponent>();
  for (const r of records) {
    const empKey = `${r.employeeName}__${r.hireDate}`;
    const cur = byEmployee.get(empKey) ?? {
      employeeName: r.employeeName,
      department: r.department,
      position: r.position,
      value: 0,
    };
    cur.value += r.components[key];
    byEmployee.set(empKey, cur);
  }
  const list = [...byEmployee.values()];
  if (list.length === 0) return null;
  return list.reduce((best, cur) => (cur.value > best.value ? cur : best));
}

export function formatKRW(n: number): string {
  return new Intl.NumberFormat("ko-KR").format(Math.round(n)) + "원";
}

export function formatKRWCompact(n: number): string {
  const eok = n / 100_000_000;
  if (Math.abs(eok) >= 1) return `${eok.toFixed(1)}억원`;
  const man = n / 10_000;
  return `${Math.round(man).toLocaleString("ko-KR")}만원`;
}
