// 빌드 타임 전용 스크립트. 클라이언트 번들에는 포함되지 않음.
// 사용법: node scripts/convert-payroll.mjs
import XLSX from "xlsx";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_FILE = path.join(__dirname, "..", "..", "20260908130907.xlsx");
const OUTPUT_FILE = path.join(__dirname, "..", "src", "data", "payroll.json");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_NUM = Object.fromEntries(MONTHS.map((m, i) => [m, i + 1]));

// 헤더명 기반 컬럼 조회. 컬럼이 추가/재배치되어도 깨지지 않도록 위치가 아닌 이름으로 읽는다.
// key: JSON 저장용 짧은 키, header: 원본 엑셀 헤더명
const PAY_COMPONENTS = [
  { key: "baseSalary", header: "기본급" },
  { key: "positionAllowance", header: "직책수당" },
  { key: "weeklyRestAllowance", header: "주휴수당" },
  { key: "transportAllowance", header: "교통비" },
  { key: "incentiveAllowance", header: "기초장려수당" },
  { key: "overtimeAllowance", header: "잔업수당" },
  { key: "mealAllowance", header: "식대" },
  { key: "jobAllowance", header: "직무수당" },
];
const DEDUCTION_COMPONENT_HEADERS = [
  "소득세", "지방소득세", "건강보험", "국민연금", "고용보험", "건강보험정산분", "식대공제", "기타공제",
];

// Excel 날짜 일련번호 -> ISO 날짜 문자열 (epoch: 1899-12-30)
function excelSerialToISODate(serial) {
  const epoch = Date.UTC(1899, 11, 30);
  const ms = epoch + Number(serial) * 24 * 60 * 60 * 1000;
  return new Date(ms).toISOString().slice(0, 10);
}

const workbook = XLSX.readFile(SOURCE_FILE);
const records = [];

for (const sheetName of MONTHS) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    console.warn(`시트 없음: ${sheetName}`);
    continue;
  }
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });
  const [header, ...dataRows] = rows;

  const colIndex = (name) => {
    const idx = header.indexOf(name);
    if (idx === -1) throw new Error(`[${sheetName}] 헤더에 "${name}" 컬럼이 없습니다.`);
    return idx;
  };

  const iDepartment = colIndex("부서명");
  const iEmployeeName = colIndex("이름");
  const iPosition = colIndex("직급");
  const iHireDate = colIndex("입사일자");
  const payIdx = PAY_COMPONENTS.map((c) => colIndex(c.header));
  const deductionIdx = DEDUCTION_COMPONENT_HEADERS.map(colIndex);

  for (const row of dataRows) {
    const employeeName = row[iEmployeeName];
    // 합계(총계) 행 제외: 이름 컬럼이 비어있는 행
    if (!employeeName || String(employeeName).trim() === "") continue;

    // 지급합계/공제합계/실지급액은 원본 셀의 수식 캐시값을 쓰지 않고 구성 항목에서 직접 재계산한다.
    // (외부 도구로 저장되어 수식이 재계산되지 않은 파일에서도 항상 정확한 값을 보장하기 위함)
    const components = Object.fromEntries(
      PAY_COMPONENTS.map((c, i) => [c.key, Number(row[payIdx[i]]) || 0]),
    );
    const grossPay = Object.values(components).reduce((sum, v) => sum + v, 0);
    const totalDeduction = deductionIdx.reduce((sum, i) => sum + (Number(row[i]) || 0), 0);

    records.push({
      month: MONTH_NUM[sheetName],
      department: String(row[iDepartment]).trim(),
      employeeName: String(employeeName).trim(),
      position: String(row[iPosition] ?? "").trim(),
      hireDate: excelSerialToISODate(row[iHireDate]),
      components,
      grossPay,
      netPay: grossPay - totalDeduction,
    });
  }
}

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(records));

console.log(`변환 완료: ${records.length}건 -> ${OUTPUT_FILE}`);
