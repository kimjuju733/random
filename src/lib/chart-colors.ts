// 검증된 카테고리컬 팔레트(dataviz 스킬, dark surface #1a1a19에서 CVD/명암 통과).
// 순서 유지 필수(색맹 안전성이 순서에 의존) — 부분 사용(brand/brandSecondary/aqua)과
// 8슬롯 전체 사용(CATEGORICAL_8, 급여 항목 구성 차트)을 모두 이 순서에서 가져온다.
export const CATEGORICAL_8 = [
  "#3987e5", // 1 blue
  "#d95926", // 2 orange
  "#199e70", // 3 aqua
  "#c98500", // 4 yellow
  "#d55181", // 5 magenta
  "#008300", // 6 green
  "#9085e9", // 7 violet
  "#e66767", // 8 red
] as const;

export const CHART_COLORS = {
  brand: CATEGORICAL_8[0],
  brandSecondary: CATEGORICAL_8[1],
  aqua: CATEGORICAL_8[2],
  good: "#0ca30c", // status-good
  bad: "#d03b3b", // status-critical
  grid: "#2c2c2a",
  axisText: "#898781",
  tooltipBg: "#1a1a19",
  tooltipBorder: "rgba(255,255,255,0.12)",
} as const;
