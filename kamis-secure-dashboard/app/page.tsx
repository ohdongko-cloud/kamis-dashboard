// 핵심 수정 요약
// 1. DailyRow / MonthlyRow 타입 추가
// 2. normalize 함수에서 price를 무조건 number로 변환
// 3. MOCK 데이터 타입 맞춤

type DailyRow = {
  regday: string;
  price: number;
  itemname: string;
  kindname: string;
  countyname: string;
  marketname: string;
  yyyy: string;
};

type MonthlyRow = {
  month: string;
  price: number;
  yyyy: string;
  caption: string;
};

function cleanNumber(value: unknown) {
  if (value === null || value === undefined) return 0;
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function normalizeDailyResponse(json: any): DailyRow[] {
  const root = json?.data ?? json?.price ?? json;
  const items = root?.item ?? root ?? [];
  const arr = Array.isArray(items) ? items : [items];

  return arr
    .filter(Boolean)
    .map((row: any) => ({
      regday: row.regday ?? row.date ?? "",
      price: cleanNumber(row.price),
      itemname: row.itemname ?? "",
      kindname: row.kindname ?? "",
      countyname: row.countyname ?? row.marketname ?? "",
      marketname: row.marketname ?? "",
      yyyy: row.yyyy ?? "",
    }))
    .filter((row) => row.regday);
}

function normalizeMonthlyResponse(json: any): MonthlyRow[] {
  const root = json?.price ?? json?.data ?? json;
  const items = root?.item ?? root ?? [];
  const arr = Array.isArray(items) ? items : [items];

  return arr.flatMap((row: any) => {
    return Array.from({ length: 12 }, (_, i) => {
      const idx = i + 1;
      return {
        month: `${idx}월`,
        price: cleanNumber(row[`m${idx}`]),
        yyyy: row.yyyy ?? "",
        caption: row.caption ?? "",
      };
    });
  });
}

const DAILY_MOCK: DailyRow[] = [
  {
    regday: "2026-03-24",
    price: 4620,
    itemname: "쌀",
    kindname: "일반계",
    countyname: "서울",
    marketname: "",
    yyyy: "2026",
  },
];

const MONTHLY_MOCK: MonthlyRow[] = [
  { month: "1월", price: 4350, yyyy: "2026", caption: "" },
];

const [dailyRows, setDailyRows] = useState<DailyRow[]>(DAILY_MOCK);
const [monthlyRows, setMonthlyRows] = useState<MonthlyRow[]>(MONTHLY_MOCK);
