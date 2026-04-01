'use client';

import React, { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Search,
  BarChart3,
  CalendarDays,
  KeyRound,
  AlertCircle,
  Database,
  Fish,
  Info,
  CheckCircle2,
  Save,
  MapPinned,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const STORAGE_KEYS = {
  certKey: "kamis_cert_key",
  certId: "kamis_cert_id",
  useMock: "kamis_use_mock",
  presets: "kamis_user_presets",
};

const VERSION_LABEL = "2026년 04월 01일 11시 업데이트된 버전";

const REGION_OPTIONS = [
  { label: "전체지역", value: "" },
  { label: "서울", value: "1101" },
  { label: "부산", value: "2100" },
  { label: "대구", value: "2200" },
  { label: "광주", value: "2401" },
  { label: "대전", value: "2501" },
  { label: "울산", value: "2601" },
  { label: "세종", value: "3611" },
  { label: "경기", value: "3111" },
  { label: "강원", value: "3201" },
  { label: "충북", value: "3301" },
  { label: "충남", value: "3401" },
  { label: "전북", value: "3501" },
  { label: "전남", value: "3601" },
  { label: "경북", value: "3701" },
  { label: "경남", value: "3801" },
  { label: "제주", value: "3901" },
];

const MAP_REGIONS = [
  { key: "서울", x: 41, y: 22, label: "서울" },
  { key: "인천", x: 26, y: 25, label: "인천" },
  { key: "경기", x: 39, y: 33, label: "경기" },
  { key: "강원", x: 63, y: 22, label: "강원" },
  { key: "충북", x: 51, y: 45, label: "충북" },
  { key: "충남", x: 30, y: 49, label: "충남" },
  { key: "대전", x: 40, y: 53, label: "대전" },
  { key: "세종", x: 36, y: 49, label: "세종" },
  { key: "전북", x: 33, y: 65, label: "전북" },
  { key: "광주", x: 28, y: 78, label: "광주" },
  { key: "전남", x: 22, y: 86, label: "전남" },
  { key: "경북", x: 63, y: 55, label: "경북" },
  { key: "대구", x: 58, y: 63, label: "대구" },
  { key: "경남", x: 55, y: 77, label: "경남" },
  { key: "울산", x: 69, y: 70, label: "울산" },
  { key: "부산", x: 66, y: 79, label: "부산" },
  { key: "제주", x: 19, y: 112, label: "제주" },
];

const CATEGORY_LABELS: Record<string, string> = {
  "100": "식량작물",
  "200": "채소류",
  "300": "특용작물",
  "400": "과일류",
  "500": "축산물",
  "600": "수산물",
};

const WHOLESALE_RANK_OPTIONS = [
  { value: "01", label: "01 · 상품" },
  { value: "02", label: "02 · 중품" },
  { value: "03", label: "03 · 하품" },
  { value: "04", label: "04 · 기타/중품" },
];

const MONTHLY_GRADE_OPTIONS = [
  { value: "1", label: "1 · 상품" },
  { value: "2", label: "2 · 중품" },
  { value: "3", label: "3 · 하품" },
  { value: "01", label: "01 · 상품" },
  { value: "02", label: "02 · 중품" },
  { value: "03", label: "03 · 하품" },
];

const BUILTIN_PRESETS = [
  {
    label: "수산물 · 기본",
    itemCategoryCode: "600",
    itemCode: "",
    kindCode: "",
    productRankCode: "01",
    gradeRank: "1",
    source: "기본",
  },
  {
    label: "채소류 · 기본",
    itemCategoryCode: "200",
    itemCode: "",
    kindCode: "",
    productRankCode: "01",
    gradeRank: "1",
    source: "기본",
  },
  {
    label: "축산물 · 기본",
    itemCategoryCode: "500",
    itemCode: "",
    kindCode: "",
    productRankCode: "01",
    gradeRank: "1",
    source: "기본",
  },
];

type ProductInfoRow = {
  itemcategorycode: string;
  itemcategoryname: string;
  itemcode: string;
  itemname: string;
  kindcode: string;
  kindname: string;
};

type PresetRow = {
  label: string;
  itemCategoryCode: string;
  itemCode: string;
  kindCode: string;
  productRankCode: string;
  gradeRank: string;
  source: string;
};

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

type MapPriceRow = {
  region: string;
  latestPrice: number;
  latestDate: string;
};

type DailyCompareRow = DailyRow & {
  compareDate: string;
  priorPrice: number | null;
  changeRate: number | null;
};

type MonthlyCompareRow = MonthlyRow & {
  priorYear: string;
  priorPrice: number | null;
  changeRate: number | null;
};

const DAILY_MOCK: DailyRow[] = [
  { regday: "2026-03-24", price: 4620, itemname: "오징어", kindname: "냉동", countyname: "서울", marketname: "가락시장", yyyy: "2026" },
  { regday: "2026-03-25", price: 4680, itemname: "오징어", kindname: "냉동", countyname: "서울", marketname: "가락시장", yyyy: "2026" },
  { regday: "2026-03-26", price: 4710, itemname: "오징어", kindname: "냉동", countyname: "서울", marketname: "가락시장", yyyy: "2026" },
  { regday: "2026-03-27", price: 4690, itemname: "오징어", kindname: "냉동", countyname: "서울", marketname: "가락시장", yyyy: "2026" },
  { regday: "2026-03-28", price: 4740, itemname: "오징어", kindname: "냉동", countyname: "서울", marketname: "가락시장", yyyy: "2026" },
  { regday: "2026-03-29", price: 4760, itemname: "오징어", kindname: "냉동", countyname: "서울", marketname: "가락시장", yyyy: "2026" },
  { regday: "2026-03-30", price: 4780, itemname: "오징어", kindname: "냉동", countyname: "서울", marketname: "가락시장", yyyy: "2026" },
];

const MONTHLY_MOCK: MonthlyRow[] = [
  { month: "1월", price: 4350, yyyy: "2026", caption: "" },
  { month: "2월", price: 4420, yyyy: "2026", caption: "" },
  { month: "3월", price: 4510, yyyy: "2026", caption: "" },
  { month: "4월", price: 4470, yyyy: "2026", caption: "" },
  { month: "5월", price: 4590, yyyy: "2026", caption: "" },
  { month: "6월", price: 4630, yyyy: "2026", caption: "" },
  { month: "7월", price: 4570, yyyy: "2026", caption: "" },
  { month: "8월", price: 4650, yyyy: "2026", caption: "" },
  { month: "9월", price: 4700, yyyy: "2026", caption: "" },
  { month: "10월", price: 4730, yyyy: "2026", caption: "" },
  { month: "11월", price: 4680, yyyy: "2026", caption: "" },
  { month: "12월", price: 4760, yyyy: "2026", caption: "" },
];

const MAP_MOCK: MapPriceRow[] = [
  { region: "서울", latestPrice: 14600, latestDate: "2026-03-30" },
  { region: "부산", latestPrice: 13200, latestDate: "2026-03-30" },
  { region: "경기", latestPrice: 12800, latestDate: "2026-03-30" },
  { region: "강원", latestPrice: 13700, latestDate: "2026-03-30" },
  { region: "충남", latestPrice: 12500, latestDate: "2026-03-30" },
  { region: "전남", latestPrice: 11800, latestDate: "2026-03-30" },
  { region: "경남", latestPrice: 12100, latestDate: "2026-03-30" },
  { region: "제주", latestPrice: 15400, latestDate: "2026-03-30" },
];

function cleanNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function formatWon(value: unknown) {
  const n = cleanNumber(value);
  return `${n.toLocaleString("ko-KR")}원`;
}

function formatRate(value: number | null) {
  if (value === null || Number.isNaN(value)) return "";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function buildQuery(params: Record<string, string | number | null | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  return search.toString();
}

function shiftDate(dateStr: string, days: number) {
  if (!dateStr) return "";
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function normalizeDailyResponse(json: any): DailyRow[] {
  const root = json?.data ?? json?.price ?? json;
  const items = root?.item ?? root ?? [];
  const arr = Array.isArray(items) ? items : [items];

  return arr
    .filter(Boolean)
    .map((row: any) => ({
      regday: String(row?.regday ?? row?.date ?? ""),
      price: cleanNumber(row?.price),
      itemname: String(row?.itemname ?? ""),
      kindname: String(row?.kindname ?? ""),
      countyname: String(row?.countyname ?? row?.marketname ?? ""),
      marketname: String(row?.marketname ?? ""),
      yyyy: String(row?.yyyy ?? ""),
    }))
    .filter((row) => Boolean(row.regday));
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
        price: cleanNumber(row?.[`m${idx}`]),
        yyyy: String(row?.yyyy ?? ""),
        caption: String(row?.caption ?? ""),
      };
    });
  });
}

function normalizeProductInfoResponse(json: any): ProductInfoRow[] {
  const root =
    json?.info ??
    json?.price ??
    json?.data?.item ??
    json?.data ??
    json?.item ??
    json;

  const arr = Array.isArray(root) ? root : [root];

  return arr
    .filter(Boolean)
    .map((row: any) => ({
      itemcategorycode: String(row?.itemcategorycode ?? "").trim(),
      itemcategoryname: String(
        row?.itemcategoryname ??
          CATEGORY_LABELS[String(row?.itemcategorycode ?? "")] ??
          ""
      ).trim(),
      itemcode: String(row?.itemcode ?? "").trim(),
      itemname: String(row?.itemname ?? "").trim(),
      kindcode: String(row?.kindcode ?? "00").trim(),
      kindname: String(row?.kindname ?? "기본품종").trim(),
    }))
    .filter((row) => Boolean(row.itemcategorycode && row.itemcode && row.itemname));
}

function getRegionKeyFromName(name: string) {
  if (!name) return "";
  const base = String(name).replace(/광역시|특별시|특별자치시|특별자치도|도/g, "").trim();

  if (base.includes("서울")) return "서울";
  if (base.includes("부산")) return "부산";
  if (base.includes("대구")) return "대구";
  if (base.includes("광주")) return "광주";
  if (base.includes("대전")) return "대전";
  if (base.includes("울산")) return "울산";
  if (base.includes("세종")) return "세종";
  if (base.includes("인천")) return "인천";
  if (base.includes("경기")) return "경기";
  if (base.includes("강원")) return "강원";
  if (base.includes("충북")) return "충북";
  if (base.includes("충남")) return "충남";
  if (base.includes("전북")) return "전북";
  if (base.includes("전남")) return "전남";
  if (base.includes("경북")) return "경북";
  if (base.includes("경남")) return "경남";
  if (base.includes("제주")) return "제주";

  return base;
}

function cardStyle() {
  return "rounded-3xl border border-slate-200 bg-white shadow-sm";
}

function inputStyle() {
  return "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-slate-500";
}

function labelStyle() {
  return "mb-2 block text-sm font-semibold text-slate-800";
}

function primaryButtonStyle(disabled = false) {
  return `inline-flex items-center justify-center rounded-2xl px-4 py-3 font-semibold transition ${
    disabled
      ? "cursor-not-allowed bg-slate-300 text-white"
      : "bg-slate-950 text-white hover:bg-slate-800"
  }`;
}

function secondaryButtonStyle() {
  return "inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900 hover:bg-slate-50";
}

function CodeHint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
      <span className="font-semibold">{label}</span>
      <span className="ml-2">{value || "-"}</span>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className={cardStyle()}>
      <div className="p-5">
        <div className="text-sm text-slate-500">{title}</div>
        <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      </div>
    </div>
  );
}

function PopupModal({
  open,
  title,
  description,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{description}</p>
        <div className="mt-6 flex justify-end">
          <button className={primaryButtonStyle(false)} onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

function KoreaPriceMap({
  data,
  productLabel,
}: {
  data: MapPriceRow[];
  productLabel: string;
}) {
  const prices = data.map((d) => d.latestPrice).filter((v) => v > 0);
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 0;

  const colorForPrice = (price?: number) => {
    if (!price || !prices.length || min === max) return "#e5e7eb";
    const ratio = (price - min) / (max - min);
    if (ratio < 0.2) return "#dcfce7";
    if (ratio < 0.4) return "#bbf7d0";
    if (ratio < 0.6) return "#fde68a";
    if (ratio < 0.8) return "#fdba74";
    return "#fca5a5";
  };

  const joined = MAP_REGIONS.map((region) => ({
    ...region,
    data: data.find((d) => d.region === region.key),
  }));

  const cheapest = data.length ? [...data].sort((a, b) => a.latestPrice - b.latestPrice)[0] : null;
  const highest = data.length ? [...data].sort((a, b) => b.latestPrice - a.latestPrice)[0] : null;

  return (
    <div className={cardStyle()}>
      <div className="border-b border-slate-200 p-6">
        <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <MapPinned className="h-5 w-5" />
          산지/지역 최신 가격 지도
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          {productLabel ? `${productLabel} 기준 최신 가격 분포` : "선택한 품목 기준 최신 가격 분포"}
        </p>
      </div>

      <div className="space-y-4 p-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4">
          <svg viewBox="0 0 100 125" className="mx-auto w-full max-w-3xl">
            <path
              d="M42 6 L54 6 L62 12 L70 24 L76 34 L78 49 L76 62 L72 77 L65 90 L56 100 L48 106 L36 104 L28 96 L23 85 L20 72 L20 57 L24 44 L31 32 L37 20 Z"
              fill="#f8fafc"
              stroke="#cbd5e1"
              strokeWidth="1.2"
            />
            <ellipse cx="19" cy="113" rx="10" ry="5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
            {joined.map((region) => (
              <g key={region.key}>
                <circle
                  cx={region.x}
                  cy={region.y}
                  r="7.2"
                  fill={colorForPrice(region.data?.latestPrice)}
                  stroke="#334155"
                  strokeWidth="0.7"
                />
                <text x={region.x} y={region.y - 10} textAnchor="middle" fontSize="3.3" fill="#0f172a">
                  {region.label}
                </text>
                <text x={region.x} y={region.y + 1.3} textAnchor="middle" fontSize="2.9" fill="#0f172a">
                  {region.data?.latestPrice ? `${Math.round(region.data.latestPrice).toLocaleString()}` : "-"}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <CodeHint
            label="가장 저렴한 지역"
            value={cheapest ? `${cheapest.region} · ${formatWon(cheapest.latestPrice)}` : "-"}
          />
          <CodeHint
            label="가장 비싼 지역"
            value={highest ? `${highest.region} · ${formatWon(highest.latestPrice)}` : "-"}
          />
          <CodeHint label="가격 표시 기준" value={prices.length ? "지역별 최신가" : "표시할 데이터 없음"} />
        </div>
      </div>
    </div>
  );
}

export default function KamisPriceDashboard() {
  const [mode, setMode] = useState<"daily" | "monthly">("daily");
  const [certKey, setCertKey] = useState("");
  const [certId, setCertId] = useState("");
  const [useMock, setUseMock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("Mock 데이터가 켜져 있어서 현재는 예시 데이터를 보여주고 있습니다.");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [productKeyword, setProductKeyword] = useState("");
  const [productOptions, setProductOptions] = useState<ProductInfoRow[]>([]);
  const [userPresets, setUserPresets] = useState<PresetRow[]>([]);
  const [newPresetName, setNewPresetName] = useState("");
  const [popup, setPopup] = useState({ open: false, title: "", description: "" });
  const [mapPriceData, setMapPriceData] = useState<MapPriceRow[]>(MAP_MOCK);
  const [dailyRows, setDailyRows] = useState<DailyRow[]>(DAILY_MOCK);
  const [previousYearDailyRows, setPreviousYearDailyRows] = useState<DailyRow[]>([]);
  const [monthlyRows, setMonthlyRows] = useState<MonthlyRow[]>(MONTHLY_MOCK);
  const [previousYearMonthlyRows, setPreviousYearMonthlyRows] = useState<MonthlyRow[]>([]);

  const DASHBOARD_PASSWORD = "kims6801!";

  const [dailyForm, setDailyForm] = useState({
    startDay: "2026-03-24",
    endDay: "2026-03-30",
    countryCode: "1101",
    itemCategoryCode: "600",
    itemCode: "",
    kindCode: "",
    productRankCode: "01",
    convertKgYn: "Y",
  });

  const [monthlyForm, setMonthlyForm] = useState({
    yyyy: "2026",
    period: "3",
    countyCode: "1101",
    itemCategoryCode: "600",
    itemCode: "",
    kindCode: "",
    gradeRank: "1",
    convertKgYn: "N",
  });

  const allPresets = useMemo(() => [...BUILTIN_PRESETS, ...userPresets], [userPresets]);

  const filteredProductOptions = useMemo(() => {
    const keyword = productKeyword.trim().toLowerCase();
    if (!keyword) return productOptions;
    return productOptions.filter((item) =>
      `${item.itemcategoryname} ${item.itemname} ${item.kindname}`.toLowerCase().includes(keyword)
    );
  }, [productOptions, productKeyword]);

  const selectedProductInfo = useMemo(() => {
    return productOptions.find(
      (item) =>
        item.itemcategorycode === dailyForm.itemCategoryCode &&
        item.itemcode === dailyForm.itemCode &&
        item.kindcode === dailyForm.kindCode
    );
  }, [productOptions, dailyForm]);

  const selectedProductLabel = useMemo(() => {
    if (!selectedProductInfo) return "";
    return `${selectedProductInfo.itemcategoryname} · ${selectedProductInfo.itemname}${selectedProductInfo.kindname ? ` · ${selectedProductInfo.kindname}` : ""}`;
  }, [selectedProductInfo]);

  const categoryOptions = useMemo(() => {
    const map = new Map<string, { value: string; label: string }>();
    productOptions.forEach((item) => {
      if (!map.has(item.itemcategorycode)) {
        map.set(item.itemcategorycode, {
          value: item.itemcategorycode,
          label: `${item.itemcategorycode} · ${item.itemcategoryname || CATEGORY_LABELS[item.itemcategorycode] || "미확인"}`,
        });
      }
    });

    const merged = [
      ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
        value,
        label: `${value} · ${label}`,
      })),
      ...Array.from(map.values()),
    ];

    const dedup = new Map<string, { value: string; label: string }>();
    merged.forEach((item) => dedup.set(item.value, item));
    return Array.from(dedup.values()).sort((a, b) => a.value.localeCompare(b.value));
  }, [productOptions]);

  const itemOptions = useMemo(() => {
    const source = filteredProductOptions.length || productKeyword.trim() ? filteredProductOptions : productOptions;
    const map = new Map<string, { value: string; label: string }>();
    source
      .filter((item) => item.itemcategorycode === dailyForm.itemCategoryCode)
      .forEach((item) => {
        if (!map.has(item.itemcode)) {
          map.set(item.itemcode, {
            value: item.itemcode,
            label: `${item.itemcode} · ${item.itemname}`,
          });
        }
      });
    return Array.from(map.values()).sort((a, b) => a.value.localeCompare(b.value));
  }, [filteredProductOptions, productOptions, productKeyword, dailyForm.itemCategoryCode]);

  const kindOptions = useMemo(() => {
    const source = filteredProductOptions.length || productKeyword.trim() ? filteredProductOptions : productOptions;
    const map = new Map<string, { value: string; label: string }>();
    source
      .filter(
        (item) =>
          item.itemcategorycode === dailyForm.itemCategoryCode &&
          item.itemcode === dailyForm.itemCode
      )
      .forEach((item) => {
        if (!map.has(item.kindcode)) {
          map.set(item.kindcode, {
            value: item.kindcode,
            label: `${item.kindcode || "00"} · ${item.kindname || "기본품종"}`,
          });
        }
      });
    return Array.from(map.values()).sort((a, b) => a.value.localeCompare(b.value));
  }, [filteredProductOptions, productOptions, productKeyword, dailyForm.itemCategoryCode, dailyForm.itemCode]);

  const dailySummary = useMemo(() => {
    const prices = dailyRows.map((d) => d.price).filter((v) => v > 0);
    if (!prices.length) return null;
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      latest: prices[prices.length - 1],
    };
  }, [dailyRows]);

  const monthlySummary = useMemo(() => {
    const prices = monthlyRows.map((d) => d.price).filter((v) => v > 0);
    if (!prices.length) return null;
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      latest: prices[prices.length - 1],
    };
  }, [monthlyRows]);

  const dailyComparisonRows = useMemo<DailyCompareRow[]>(() => {
    const priorMap = new Map(previousYearDailyRows.map((row) => [row.regday, row.price]));
    return dailyRows.map((row) => {
      const compareDate = shiftDate(row.regday, -364);
      const priorPrice = compareDate && priorMap.has(compareDate) ? priorMap.get(compareDate) ?? null : null;
      const changeRate =
        priorPrice && priorPrice > 0 ? ((row.price - priorPrice) / priorPrice) * 100 : null;
      return {
        ...row,
        compareDate,
        priorPrice,
        changeRate,
      };
    });
  }, [dailyRows, previousYearDailyRows]);

  const monthlyComparisonRows = useMemo<MonthlyCompareRow[]>(() => {
    const priorMap = new Map(previousYearMonthlyRows.map((row) => [row.month, row.price]));
    return monthlyRows.map((row) => {
      const priorPrice = priorMap.has(row.month) ? priorMap.get(row.month) ?? null : null;
      const changeRate =
        priorPrice && priorPrice > 0 ? ((row.price - priorPrice) / priorPrice) * 100 : null;
      return {
        ...row,
        priorYear: String(Number(row.yyyy || monthlyForm.yyyy || "0") - 1),
        priorPrice,
        changeRate,
      };
    });
  }, [monthlyRows, previousYearMonthlyRows, monthlyForm.yyyy]);

  function openPopup(title: string, description: string) {
    setPopup({ open: true, title, description });
  }

  function handleUnlock() {
    if (password === DASHBOARD_PASSWORD) {
      setIsUnlocked(true);
      setPasswordError("");
      return;
    }
    setPasswordError("비밀번호가 올바르지 않습니다.");
  }

  function syncFormsFromSelection(categoryCode: string, itemCode: string, kindCode: string) {
    setDailyForm((prev) => ({ ...prev, itemCategoryCode: categoryCode, itemCode, kindCode }));
    setMonthlyForm((prev) => ({ ...prev, itemCategoryCode: categoryCode, itemCode, kindCode }));
  }

  function applyPreset(label: string) {
    const preset = allPresets.find((p) => p.label === label);
    if (!preset) return;

    setDailyForm((prev) => ({
      ...prev,
      itemCategoryCode: preset.itemCategoryCode,
      itemCode: preset.itemCode,
      kindCode: preset.kindCode,
      productRankCode: preset.productRankCode,
    }));

    setMonthlyForm((prev) => ({
      ...prev,
      itemCategoryCode: preset.itemCategoryCode,
      itemCode: preset.itemCode,
      kindCode: preset.kindCode,
      gradeRank: preset.gradeRank,
    }));

    setStatusMessage(`${label} 프리셋을 적용했습니다.`);
  }

  function saveCredentials() {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(STORAGE_KEYS.certKey, certKey);
      localStorage.setItem(STORAGE_KEYS.certId, certId);
      localStorage.setItem(STORAGE_KEYS.useMock, JSON.stringify(useMock));
      openPopup("저장 완료", "인증 Key와 ID를 이 브라우저에 저장했습니다. 다음 접속 때 자동으로 채워집니다.");
    } catch {
      openPopup("저장 실패", "브라우저 저장소에 인증 정보를 저장하지 못했습니다.");
    }
  }

  function saveCurrentPreset() {
    const label = newPresetName.trim();
    if (!label) {
      openPopup("프리셋 이름 필요", "자주 쓰는 프리셋 이름을 먼저 입력해주세요.");
      return;
    }

    const preset: PresetRow = {
      label,
      itemCategoryCode: dailyForm.itemCategoryCode,
      itemCode: dailyForm.itemCode,
      kindCode: dailyForm.kindCode,
      productRankCode: dailyForm.productRankCode,
      gradeRank: monthlyForm.gradeRank,
      source: "내 저장",
    };

    const next = [...userPresets.filter((p) => p.label !== label), preset];
    setUserPresets(next);
    setNewPresetName("");
    openPopup("프리셋 저장 완료", `${label} 프리셋을 저장했습니다.`);
  }

  

  async function loadRegionalLatestPrices() {
    setLoadingMap(true);

    try {
      if (useMock) {
        setMapPriceData(MAP_MOCK);
        return;
      }

      const today = new Date();
      const end = today.toISOString().slice(0, 10);
      const start = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 14).toISOString().slice(0, 10);

      const results = await Promise.all(
        REGION_OPTIONS.filter((r) => r.value).map(async (region) => {
          const query = buildQuery({
            action: "periodWholesaleProductList",
            p_cert_key: certKey,
            p_cert_id: certId,
            p_returntype: "json",
            p_startday: start,
            p_endday: end,
            p_countrycode: region.value,
            p_itemcategorycode: dailyForm.itemCategoryCode,
            p_itemcode: dailyForm.itemCode,
            p_kindcode: dailyForm.kindCode,
            p_productrankcode: dailyForm.productRankCode,
            p_convert_kg_yn: dailyForm.convertKgYn,
          });

          const response = await fetch(`/api/kamis?${query}`);
          if (!response.ok) return null;

          const json = await response.json();
          console.log("productInfo raw response:", json);
          console.log("normalized product rows:", normalized.length, normalized.slice(0, 5));
          const rows = normalizeDailyResponse(json).filter((row) => row.price > 0);
          if (!rows.length) return null;

          const latest = rows[rows.length - 1];
          return {
            region: getRegionKeyFromName(region.label),
            latestPrice: latest.price,
            latestDate: latest.regday,
          };
        })
      );

      const filtered = results.filter(Boolean) as MapPriceRow[];
      if (filtered.length) {
        setMapPriceData(filtered);
      } else {
        setMapPriceData(MAP_MOCK);
      }
    } catch {
      setMapPriceData(MAP_MOCK);
    } finally {
      setLoadingMap(false);
    }
  }

  async function loadDaily() {
    setLoading(true);
    setError("");

    try {
      if (useMock) {
        const currentRows = DAILY_MOCK.map((row) => ({
          ...row,
          itemname: selectedProductInfo?.itemname || row.itemname,
          kindname: selectedProductInfo?.kindname || row.kindname,
        }));
        const priorRows = currentRows.map((row) => ({
          ...row,
          regday: shiftDate(row.regday, -364),
          price: Math.round(row.price * 0.93),
          yyyy: String(Number(row.yyyy) - 1),
        }));

        setDailyRows(currentRows);
        setPreviousYearDailyRows(priorRows);
        setStatusMessage("일별 조회 버튼이 정상 작동했습니다. 현재는 Mock 모드라 예시 일별/전년 동요일 데이터를 다시 불러왔습니다.");
        await loadRegionalLatestPrices();
        return;
      }

      const currentQuery = buildQuery({
        action: "periodWholesaleProductList",
        p_cert_key: certKey,
        p_cert_id: certId,
        p_returntype: "json",
        p_startday: dailyForm.startDay,
        p_endday: dailyForm.endDay,
        p_countrycode: dailyForm.countryCode,
        p_itemcategorycode: dailyForm.itemCategoryCode,
        p_itemcode: dailyForm.itemCode,
        p_kindcode: dailyForm.kindCode,
        p_productrankcode: dailyForm.productRankCode,
        p_convert_kg_yn: dailyForm.convertKgYn,
      });

      const priorStart = shiftDate(dailyForm.startDay, -364);
      const priorEnd = shiftDate(dailyForm.endDay, -364);

      const priorQuery = buildQuery({
        action: "periodWholesaleProductList",
        p_cert_key: certKey,
        p_cert_id: certId,
        p_returntype: "json",
        p_startday: priorStart,
        p_endday: priorEnd,
        p_countrycode: dailyForm.countryCode,
        p_itemcategorycode: dailyForm.itemCategoryCode,
        p_itemcode: dailyForm.itemCode,
        p_kindcode: dailyForm.kindCode,
        p_productrankcode: dailyForm.productRankCode,
        p_convert_kg_yn: dailyForm.convertKgYn,
      });

      const [currentResponse, priorResponse] = await Promise.all([
        fetch(`/api/kamis?${currentQuery}`),
        fetch(`/api/kamis?${priorQuery}`),
      ]);

      if (!currentResponse.ok) throw new Error(`HTTP ${currentResponse.status}`);

      const currentJson = await currentResponse.json();
      const currentNormalized = normalizeDailyResponse(currentJson);

      const priorJson = priorResponse.ok ? await priorResponse.json() : null;
      const priorNormalized = priorJson ? normalizeDailyResponse(priorJson) : [];

      if (!currentNormalized.length) {
        openPopup("조회 결과 없음", "일별 시세 조회 결과가 없습니다. 조건을 다시 선택해주세요.");
        return;
      }

      setDailyRows(currentNormalized);
      setPreviousYearDailyRows(priorNormalized);
      setStatusMessage(`일별 도매 시세 ${currentNormalized.length}건과 전년 동요일 비교 데이터를 불러왔습니다.`);
      await loadRegionalLatestPrices();
    } catch (e) {
      const message =
        e instanceof Error
          ? `${e.message} — 일별 시세 조회에 실패했습니다. 인증값과 선택한 조건을 확인해주세요.`
          : "조회 중 오류가 발생했습니다.";
      setError(message);
      openPopup("일별 시세 조회 오류", message);
    } finally {
      setLoading(false);
    }
  }

async function searchProducts() {
  setLoadingProducts(true);
  setError("");

  try {
    if (useMock) {
      const mockProducts: ProductInfoRow[] = [
        { itemcategorycode: "100", itemcategoryname: "식량작물", itemcode: "111", itemname: "쌀", kindcode: "01", kindname: "일반계" },
        { itemcategorycode: "200", itemcategoryname: "채소류", itemcode: "211", itemname: "배추", kindcode: "00", kindname: "기본품종" },
        { itemcategorycode: "200", itemcategoryname: "채소류", itemcode: "231", itemname: "무", kindcode: "00", kindname: "기본품종" },
        { itemcategorycode: "300", itemcategoryname: "특용작물", itemcode: "311", itemname: "참깨", kindcode: "00", kindname: "기본품종" },
        { itemcategorycode: "400", itemcategoryname: "과일류", itemcode: "411", itemname: "사과", kindcode: "01", kindname: "후지" },
        { itemcategorycode: "500", itemcategoryname: "축산물", itemcode: "511", itemname: "한우등심", kindcode: "01", kindname: "1등급" },
        { itemcategorycode: "600", itemcategoryname: "수산물", itemcode: "611", itemname: "고등어", kindcode: "00", kindname: "기본품종" },
        { itemcategorycode: "600", itemcategoryname: "수산물", itemcode: "619", itemname: "물오징어", kindcode: "01", kindname: "생선" },
        { itemcategorycode: "600", itemcategoryname: "수산물", itemcode: "619", itemname: "물오징어", kindcode: "02", kindname: "냉동" },
      ];

      setProductOptions(mockProducts);
      setStatusMessage(`Mock 품목 ${mockProducts.length}건을 불러왔습니다.`);
      return;
    }

    const query = buildQuery({
      action: "productInfo",
      p_returntype: "json",
    });

    const response = await fetch(`/api/kamis?${query}`, {
      method: "GET",
      cache: "no-store",
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(
        json?.error ||
          json?.message ||
          `전체 품목 조회 실패 (${response.status})`
      );
    }

    const normalized = normalizeProductInfoResponse(json);

    if (!normalized.length) {
      openPopup(
        "품목 불러오기 실패",
        "KAMIS에서 품목코드 데이터를 받지 못했습니다. 인증값과 응답 구조를 확인해주세요."
      );
      return;
    }

    const dedupMap = new Map<string, ProductInfoRow>();

    normalized.forEach((row) => {
      const key = [
        row.itemcategorycode,
        row.itemcode,
        row.kindcode || "00",
      ].join("_");

      if (!dedupMap.has(key)) {
        dedupMap.set(key, {
          ...row,
          itemcategoryname:
            row.itemcategoryname ||
            CATEGORY_LABELS[row.itemcategorycode] ||
            "",
          kindcode: row.kindcode || "00",
          kindname: row.kindname || "기본품종",
        });
      }
    });

    const deduped = Array.from(dedupMap.values()).sort((a, b) => {
      const c1 = a.itemcategorycode.localeCompare(b.itemcategorycode);
      if (c1 !== 0) return c1;

      const c2 = a.itemcode.localeCompare(b.itemcode);
      if (c2 !== 0) return c2;

      return (a.kindcode || "").localeCompare(b.kindcode || "");
    });

    setProductOptions(deduped);
    setStatusMessage(`전체 품목 ${deduped.length}건을 불러왔습니다.`);
  } catch (e) {
    const message =
      e instanceof Error
        ? `${e.message} — 전체 품목 불러오기에 실패했습니다.`
        : "전체 품목 불러오기 중 오류가 발생했습니다.";

    setError(message);
    openPopup("품목 불러오기 오류", message);
  } finally {
    setLoadingProducts(false);
  }
}

  
  async function loadMonthly() {
    setLoading(true);
    setError("");

    try {
      if (useMock) {
        setMonthlyRows(MONTHLY_MOCK);
        setPreviousYearMonthlyRows(
          MONTHLY_MOCK.map((row) => ({
            ...row,
            price: Math.round(row.price * 0.95),
            yyyy: String(Number(row.yyyy) - 1),
          }))
        );
        setStatusMessage("월별 조회 버튼이 정상 작동했습니다. 현재는 Mock 모드라 예시 월별/전년 동월 데이터를 다시 불러왔습니다.");
        return;
      }

      const currentQuery = buildQuery({
        action: "monthlySalesList",
        p_cert_key: certKey,
        p_cert_id: certId,
        p_returntype: "json",
        p_yyyy: monthlyForm.yyyy,
        p_period: monthlyForm.period,
        p_countycode: monthlyForm.countyCode,
        p_itemcategorycode: monthlyForm.itemCategoryCode,
        p_itemcode: monthlyForm.itemCode,
        p_kindcode: monthlyForm.kindCode,
        p_graderank: monthlyForm.gradeRank,
        p_convert_kg_yn: monthlyForm.convertKgYn,
      });

      const previousYear = String(Number(monthlyForm.yyyy || "0") - 1);
      const priorQuery = buildQuery({
        action: "monthlySalesList",
        p_cert_key: certKey,
        p_cert_id: certId,
        p_returntype: "json",
        p_yyyy: previousYear,
        p_period: monthlyForm.period,
        p_countycode: monthlyForm.countyCode,
        p_itemcategorycode: monthlyForm.itemCategoryCode,
        p_itemcode: monthlyForm.itemCode,
        p_kindcode: monthlyForm.kindCode,
        p_graderank: monthlyForm.gradeRank,
        p_convert_kg_yn: monthlyForm.convertKgYn,
      });

      const [currentResponse, priorResponse] = await Promise.all([
        fetch(`/api/kamis?${currentQuery}`),
        fetch(`/api/kamis?${priorQuery}`),
      ]);

      if (!currentResponse.ok) throw new Error(`HTTP ${currentResponse.status}`);

      const currentJson = await currentResponse.json();
      const currentNormalized = normalizeMonthlyResponse(currentJson);

      const priorJson = priorResponse.ok ? await priorResponse.json() : null;
      const priorNormalized = priorJson ? normalizeMonthlyResponse(priorJson) : [];

      if (!currentNormalized.length) {
        openPopup("조회 결과 없음", "월별 시세 조회 결과가 없습니다. 조건을 다시 선택해주세요.");
        return;
      }

      setMonthlyRows(currentNormalized);
      setPreviousYearMonthlyRows(priorNormalized);
      setStatusMessage(`월별 시세 ${currentNormalized.length}건과 전년 동월 비교 데이터를 불러왔습니다.`);
    } catch (e) {
      const message =
        e instanceof Error
          ? `${e.message} — 월별 시세 조회에 실패했습니다. 인증값과 선택한 조건을 확인해주세요.`
          : "조회 중 오류가 발생했습니다.";
      setError(message);
      openPopup("월별 시세 조회 오류", message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const savedKey = localStorage.getItem(STORAGE_KEYS.certKey) ?? "";
      const savedId = localStorage.getItem(STORAGE_KEYS.certId) ?? "";
      const savedUseMock = localStorage.getItem(STORAGE_KEYS.useMock);
      const savedPresets = localStorage.getItem(STORAGE_KEYS.presets);

      setCertKey(savedKey);
      setCertId(savedId);
      setUseMock(savedUseMock ? JSON.parse(savedUseMock) : true);
      setUserPresets(savedPresets ? JSON.parse(savedPresets) : []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(STORAGE_KEYS.presets, JSON.stringify(userPresets));
    } catch {
      // ignore
    }
  }, [userPresets]);



  useEffect(() => {
    if (!productOptions.length) return;
    const source = filteredProductOptions.length || productKeyword.trim() ? filteredProductOptions : productOptions;
    const firstInCategory = source.find((item) => item.itemcategorycode === dailyForm.itemCategoryCode);

    if (!firstInCategory) {
      setDailyForm((prev) => ({ ...prev, itemCode: "", kindCode: "" }));
      setMonthlyForm((prev) => ({ ...prev, itemCode: "", kindCode: "" }));
      return;
    }

    if (!source.some((item) => item.itemcategorycode === dailyForm.itemCategoryCode && item.itemcode === dailyForm.itemCode)) {
      setDailyForm((prev) => ({ ...prev, itemCode: firstInCategory.itemcode, kindCode: firstInCategory.kindcode }));
      setMonthlyForm((prev) => ({ ...prev, itemCode: firstInCategory.itemcode, kindCode: firstInCategory.kindcode }));
    }
  }, [productOptions, filteredProductOptions, productKeyword, dailyForm.itemCategoryCode, dailyForm.itemCode]);

  useEffect(() => {
    const source = filteredProductOptions.length || productKeyword.trim() ? filteredProductOptions : productOptions;
    const firstKind = source.find(
      (item) =>
        item.itemcategorycode === dailyForm.itemCategoryCode &&
        item.itemcode === dailyForm.itemCode
    );

    if (!firstKind) return;

    if (
      !source.some(
        (item) =>
          item.itemcategorycode === dailyForm.itemCategoryCode &&
          item.itemcode === dailyForm.itemCode &&
          item.kindcode === dailyForm.kindCode
      )
    ) {
      setDailyForm((prev) => ({ ...prev, kindCode: firstKind.kindcode }));
      setMonthlyForm((prev) => ({ ...prev, kindCode: firstKind.kindcode }));
    }
  }, [filteredProductOptions, productOptions, productKeyword, dailyForm.itemCategoryCode, dailyForm.itemCode, dailyForm.kindCode]);

  const activeChartData =
    mode === "daily"
      ? dailyComparisonRows.map((row) => ({
          label: row.regday.slice(5),
          price: row.price,
          priorPrice: row.priorPrice ?? undefined,
        }))
      : monthlyComparisonRows.map((row) => ({
          label: row.month,
          price: row.price,
          priorPrice: row.priorPrice ?? undefined,
        }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PopupModal
        open={popup.open}
        title={popup.title}
        description={popup.description}
        onClose={() => setPopup({ open: false, title: "", description: "" })}
      />

      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs font-semibold tracking-wide text-slate-500">{VERSION_LABEL}</div>
              <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold tracking-tight">
                <Fish className="h-7 w-7" />
                KAMIS API 통합 가격 대시보드
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                농산물 · 축산물 · 수산물 전체 품목 드롭다운 조회 · 전년 동월/동요일 비교 · 등락률까지 포함
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                className={mode === "daily" ? primaryButtonStyle(false) : secondaryButtonStyle()}
                onClick={() => setMode("daily")}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                일별
              </button>
              <button
                className={mode === "monthly" ? primaryButtonStyle(false) : secondaryButtonStyle()}
                onClick={() => setMode("monthly")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                월별
              </button>
              <button
                className={useMock ? secondaryButtonStyle() : primaryButtonStyle(false)}
                onClick={() => setUseMock((prev) => !prev)}
              >
                <Database className="mr-2 h-4 w-4" />
                {useMock ? "Mock ON" : "실데이터 ON"}
              </button>
            </div>
          </div>
        </div>

        {!isUnlocked ? (
          <div className="mx-auto max-w-xl">
            <div className={cardStyle()}>
              <div className="border-b border-slate-200 p-6">
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <KeyRound className="h-5 w-5" />
                  대시보드 잠금 해제
                </h2>
                <p className="mt-2 text-sm text-slate-600">접속 비밀번호를 입력하면 전체 기능이 열립니다.</p>
              </div>
              <div className="space-y-4 p-6">
                <div>
                  <label className={labelStyle()}>비밀번호</label>
                  <input
                    type="password"
                    className={inputStyle()}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호 입력"
                  />
                </div>
                {passwordError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {passwordError}
                  </div>
                ) : null}
                <button className={primaryButtonStyle(false)} onClick={handleUnlock}>
                  접속하기
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.1fr_1.9fr]">
              <div className={cardStyle()}>
                <div className="border-b border-slate-200 p-6">
                  <h2 className="flex items-center gap-2 text-xl font-bold">
                    <KeyRound className="h-5 w-5" />
                    API / 조회 설정
                  </h2>
                </div>

                <div className="space-y-5 p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelStyle()}>KAMIS Cert Key</label>
                      <input
                        className={inputStyle()}
                        value={certKey}
                        onChange={(e) => setCertKey(e.target.value)}
                        placeholder="실데이터 사용 시 입력"
                      />
                    </div>
                    <div>
                      <label className={labelStyle()}>KAMIS Cert ID</label>
                      <input
                        className={inputStyle()}
                        value={certId}
                        onChange={(e) => setCertId(e.target.value)}
                        placeholder="실데이터 사용 시 입력"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button className={secondaryButtonStyle()} onClick={saveCredentials}>
                      <Save className="mr-2 h-4 w-4" />
                      인증값 저장
                    </button>
                    <button className={secondaryButtonStyle()} onClick={searchProducts} disabled={loadingProducts}>
                      {loadingProducts ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      전체 품목 불러오기
                    </button>
                  </div>

                  <div>
                    <label className={labelStyle()}>품목 필터 키워드</label>
                    <div className="flex gap-3">
                      <input
                        className={inputStyle()}
                        value={productKeyword}
                        onChange={(e) => setProductKeyword(e.target.value)}
                        placeholder="예: 오징어, 배추, 사과, 한우"
                      />
                      <button className={primaryButtonStyle(false)} onClick={() => setProductKeyword(productKeyword)}>
                        <Search className="mr-2 h-4 w-4" />
                        필터
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className={labelStyle()}>부류코드</label>
                      <select
                        className={inputStyle()}
                        value={dailyForm.itemCategoryCode}
                        onChange={(e) => {
                          setDailyForm((prev) => ({ ...prev, itemCategoryCode: e.target.value, itemCode: "", kindCode: "" }));
                          setMonthlyForm((prev) => ({ ...prev, itemCategoryCode: e.target.value, itemCode: "", kindCode: "" }));
                        }}
                      >
                        {categoryOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelStyle()}>품목코드</label>
                      <select
                        className={inputStyle()}
                        value={dailyForm.itemCode}
                        onChange={(e) => syncFormsFromSelection(dailyForm.itemCategoryCode, e.target.value, "")}
                      >
                        <option value="">선택</option>
                        {itemOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelStyle()}>품종코드</label>
                      <select
                        className={inputStyle()}
                        value={dailyForm.kindCode}
                        onChange={(e) => syncFormsFromSelection(dailyForm.itemCategoryCode, dailyForm.itemCode, e.target.value)}
                      >
                        <option value="">선택</option>
                        {kindOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <CodeHint label="선택 품목" value={selectedProductLabel || "-"} />
                    <CodeHint label="데이터 모드" value={useMock ? "Mock 데이터" : "실제 KAMIS API"} />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelStyle()}>프리셋 불러오기</label>
                      <select className={inputStyle()} defaultValue="" onChange={(e) => applyPreset(e.target.value)}>
                        <option value="">선택</option>
                        {allPresets.map((preset) => (
                          <option key={`${preset.source}-${preset.label}`} value={preset.label}>
                            {preset.label} ({preset.source})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelStyle()}>현재 조건 저장 이름</label>
                      <div className="flex gap-3">
                        <input
                          className={inputStyle()}
                          value={newPresetName}
                          onChange={(e) => setNewPresetName(e.target.value)}
                          placeholder="예: 채소류 서울 상품"
                        />
                        <button className={secondaryButtonStyle()} onClick={saveCurrentPreset}>
                          저장
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={cardStyle()}>
                <div className="border-b border-slate-200 p-6">
                  <h2 className="flex items-center gap-2 text-xl font-bold">
                    <Info className="h-5 w-5" />
                    조회 조건
                  </h2>
                </div>

                <div className="space-y-6 p-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <label className={labelStyle()}>시작일</label>
                      <input
                        type="date"
                        className={inputStyle()}
                        value={dailyForm.startDay}
                        onChange={(e) => setDailyForm((prev) => ({ ...prev, startDay: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className={labelStyle()}>종료일</label>
                      <input
                        type="date"
                        className={inputStyle()}
                        value={dailyForm.endDay}
                        onChange={(e) => setDailyForm((prev) => ({ ...prev, endDay: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className={labelStyle()}>지역</label>
                      <select
                        className={inputStyle()}
                        value={dailyForm.countryCode}
                        onChange={(e) => {
                          setDailyForm((prev) => ({ ...prev, countryCode: e.target.value }));
                          setMonthlyForm((prev) => ({ ...prev, countyCode: e.target.value }));
                        }}
                      >
                        {REGION_OPTIONS.map((option) => (
                          <option key={option.value || "all"} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelStyle()}>등급</label>
                      <select
                        className={inputStyle()}
                        value={dailyForm.productRankCode}
                        onChange={(e) => setDailyForm((prev) => ({ ...prev, productRankCode: e.target.value }))}
                      >
                        {WHOLESALE_RANK_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className={labelStyle()}>월별 연도</label>
                      <input
                        className={inputStyle()}
                        value={monthlyForm.yyyy}
                        onChange={(e) => setMonthlyForm((prev) => ({ ...prev, yyyy: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className={labelStyle()}>월별 기간 타입</label>
                      <select
                        className={inputStyle()}
                        value={monthlyForm.period}
                        onChange={(e) => setMonthlyForm((prev) => ({ ...prev, period: e.target.value }))}
                      >
                        <option value="1">1 · 소매</option>
                        <option value="2">2 · 도매</option>
                        <option value="3">3 · 도매시장</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelStyle()}>월별 등급</label>
                      <select
                        className={inputStyle()}
                        value={monthlyForm.gradeRank}
                        onChange={(e) => setMonthlyForm((prev) => ({ ...prev, gradeRank: e.target.value }))}
                      >
                        {MONTHLY_GRADE_OPTIONS.map((option) => (
                          <option key={`${option.value}-${option.label}`} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button className={primaryButtonStyle(loading)} onClick={loadDaily} disabled={loading}>
                      {loading && mode === "daily" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CalendarDays className="mr-2 h-4 w-4" />
                      )}
                      일별 조회
                    </button>
                    <button className={primaryButtonStyle(loading)} onClick={loadMonthly} disabled={loading}>
                      {loading && mode === "monthly" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <BarChart3 className="mr-2 h-4 w-4" />
                      )}
                      월별 조회
                    </button>
                    <button className={secondaryButtonStyle()} onClick={loadRegionalLatestPrices} disabled={loadingMap}>
                      {loadingMap ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <MapPinned className="mr-2 h-4 w-4" />
                      )}
                      지도 갱신
                    </button>
                  </div>

                  <div
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      error
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {error ? <AlertCircle className="mt-0.5 h-4 w-4" /> : <CheckCircle2 className="mt-0.5 h-4 w-4" />}
                      <span>{error || statusMessage}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title={mode === "daily" ? "최신 일별 가격" : "최신 월별 가격"}
                value={formatWon(mode === "daily" ? dailySummary?.latest ?? 0 : monthlySummary?.latest ?? 0)}
              />
              <StatCard
                title={mode === "daily" ? "평균 일별 가격" : "평균 월별 가격"}
                value={formatWon(mode === "daily" ? dailySummary?.avg ?? 0 : monthlySummary?.avg ?? 0)}
              />
              <StatCard
                title={mode === "daily" ? "최저 가격" : "최저 월별 가격"}
                value={formatWon(mode === "daily" ? dailySummary?.min ?? 0 : monthlySummary?.min ?? 0)}
              />
              <StatCard
                title={mode === "daily" ? "최고 가격" : "최고 월별 가격"}
                value={formatWon(mode === "daily" ? dailySummary?.max ?? 0 : monthlySummary?.max ?? 0)}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
              <div className={cardStyle()}>
                <div className="border-b border-slate-200 p-6">
                  <h3 className="text-xl font-bold">가격 추이 차트</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {selectedProductLabel || "선택 품목"} · {mode === "daily" ? "현재년도 vs 전년 동요일" : "현재년도 vs 전년 동월"}
                  </p>
                </div>

                <div className="h-[360px] p-4 md:p-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activeChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          value ? formatWon(value) : "",
                          name === "price" ? "현재년도" : mode === "daily" ? "전년 동요일" : "전년 동월",
                        ]}
                      />
                      <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={3} dot />
                      <Line type="monotone" dataKey="priorPrice" stroke="#f97316" strokeWidth={3} dot connectNulls={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={cardStyle()}>
                <div className="border-b border-slate-200 p-6">
                  <h3 className="text-xl font-bold">상세 데이터</h3>
                </div>

                <div className="max-h-[420px] overflow-auto p-4">
                  {mode === "daily" ? (
                    <table className="min-w-full text-sm">
                      <thead className="sticky top-0 bg-white">
                        <tr className="border-b border-slate-200 text-left text-slate-500">
                          <th className="px-3 py-2">일자</th>
                          <th className="px-3 py-2">품목</th>
                          <th className="px-3 py-2">지역</th>
                          <th className="px-3 py-2">가격</th>
                          <th className="px-3 py-2">전년 동요일</th>
                          <th className="px-3 py-2">전년 가격</th>
                          <th className="px-3 py-2">등락률</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyComparisonRows.map((row, index) => (
                          <tr key={`${row.regday}-${index}`} className="border-b border-slate-100">
                            <td className="px-3 py-2">{row.regday}</td>
                            <td className="px-3 py-2">
                              {row.itemname} {row.kindname ? `· ${row.kindname}` : ""}
                            </td>
                            <td className="px-3 py-2">{row.countyname || row.marketname || "-"}</td>
                            <td className="px-3 py-2 font-semibold">{formatWon(row.price)}</td>
                            <td className="px-3 py-2">{row.priorPrice === null ? "" : row.compareDate}</td>
                            <td className="px-3 py-2">{row.priorPrice === null ? "" : formatWon(row.priorPrice)}</td>
                            <td className={`px-3 py-2 font-semibold ${row.changeRate !== null && row.changeRate > 0 ? "text-rose-600" : row.changeRate !== null && row.changeRate < 0 ? "text-blue-600" : ""}`}>
                              {formatRate(row.changeRate)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="min-w-full text-sm">
                      <thead className="sticky top-0 bg-white">
                        <tr className="border-b border-slate-200 text-left text-slate-500">
                          <th className="px-3 py-2">월</th>
                          <th className="px-3 py-2">가격</th>
                          <th className="px-3 py-2">전년</th>
                          <th className="px-3 py-2">전년 동월 가격</th>
                          <th className="px-3 py-2">등락률</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyComparisonRows.map((row, index) => (
                          <tr key={`${row.month}-${index}`} className="border-b border-slate-100">
                            <td className="px-3 py-2">{row.month}</td>
                            <td className="px-3 py-2 font-semibold">{formatWon(row.price)}</td>
                            <td className="px-3 py-2">{row.priorPrice === null ? "" : row.priorYear}</td>
                            <td className="px-3 py-2">{row.priorPrice === null ? "" : formatWon(row.priorPrice)}</td>
                            <td className={`px-3 py-2 font-semibold ${row.changeRate !== null && row.changeRate > 0 ? "text-rose-600" : row.changeRate !== null && row.changeRate < 0 ? "text-blue-600" : ""}`}>
                              {formatRate(row.changeRate)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            <KoreaPriceMap data={mapPriceData} productLabel={selectedProductLabel} />
          </div>
        )}
      </div>
    </div>
  );
}
