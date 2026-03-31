"use client";
const VERSION_LABEL = "2026년 04월 01일 08시 업데이트된 버전";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    label: "쌀 · 일반계(중품)",
    itemCategoryCode: "100",
    itemCode: "111",
    kindCode: "01",
    productRankCode: "04",
    gradeRank: "2",
    source: "기본",
  },
  {
    label: "배추 · 상품",
    itemCategoryCode: "200",
    itemCode: "211",
    kindCode: "00",
    productRankCode: "01",
    gradeRank: "1",
    source: "기본",
  },
  {
    label: "무 · 상품",
    itemCategoryCode: "200",
    itemCode: "231",
    kindCode: "00",
    productRankCode: "01",
    gradeRank: "1",
    source: "기본",
  },
];

const DAILY_MOCK = [
  { regday: "2026-03-24", price: 4620, itemname: "쌀", kindname: "일반계", countyname: "서울" },
  { regday: "2026-03-25", price: 4680, itemname: "쌀", kindname: "일반계", countyname: "서울" },
  { regday: "2026-03-26", price: 4710, itemname: "쌀", kindname: "일반계", countyname: "서울" },
  { regday: "2026-03-27", price: 4690, itemname: "쌀", kindname: "일반계", countyname: "서울" },
  { regday: "2026-03-28", price: 4740, itemname: "쌀", kindname: "일반계", countyname: "서울" },
  { regday: "2026-03-29", price: 4760, itemname: "쌀", kindname: "일반계", countyname: "서울" },
  { regday: "2026-03-30", price: 4780, itemname: "쌀", kindname: "일반계", countyname: "서울" },
];

const MONTHLY_MOCK = [
  { month: "1월", price: 4350 },
  { month: "2월", price: 4420 },
  { month: "3월", price: 4510 },
  { month: "4월", price: 4470 },
  { month: "5월", price: 4590 },
  { month: "6월", price: 4630 },
  { month: "7월", price: 4570 },
  { month: "8월", price: 4650 },
  { month: "9월", price: 4700 },
  { month: "10월", price: 4730 },
  { month: "11월", price: 4680 },
  { month: "12월", price: 4760 },
];

const MAP_MOCK = [
  { region: "서울", latestPrice: 14600, latestDate: "2026-03-30" },
  { region: "부산", latestPrice: 13200, latestDate: "2026-03-30" },
  { region: "경기", latestPrice: 12800, latestDate: "2026-03-30" },
  { region: "강원", latestPrice: 13700, latestDate: "2026-03-30" },
  { region: "충남", latestPrice: 12500, latestDate: "2026-03-30" },
  { region: "전남", latestPrice: 11800, latestDate: "2026-03-30" },
  { region: "경남", latestPrice: 12100, latestDate: "2026-03-30" },
  { region: "제주", latestPrice: 15400, latestDate: "2026-03-30" },
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

function cleanNumber(value: unknown) {
  if (value === null || value === undefined) return null;
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function formatWon(value: unknown) {
  const n = cleanNumber(value);
  if (n === null) return "-";
  return `${n.toLocaleString("ko-KR")}원`;
}

function buildQuery(params: Record<string, string | number | null | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) search.set(key, String(value));
  });
  return search.toString();
}

function normalizeDailyResponse(json: any) {
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
    .filter((row) => row.regday || row.price !== null);
}

function normalizeMonthlyResponse(json: any) {
  const root = json?.price ?? json?.data ?? json;
  const items = root?.item ?? root ?? [];
  const arr = Array.isArray(items) ? items : [items];

  return arr.flatMap((row: any) => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const idx = i + 1;
      return {
        month: `${idx}월`,
        price: cleanNumber(row[`m${idx}`]),
        yyyy: row.yyyy ?? "",
        caption: row.caption ?? "",
      };
    });

    return months.filter((m) => m.price !== null);
  });
}

function normalizeProductInfoResponse(json: any): ProductInfoRow[] {
  const root = json?.price ?? json?.data ?? json;
  const items = root?.item ?? root ?? [];
  const arr = Array.isArray(items) ? items : [items];

  return arr
    .filter(Boolean)
    .map((row: any) => ({
      itemcategorycode: row.itemcategorycode ?? "",
      itemcategoryname: row.itemcategoryname ?? CATEGORY_LABELS[row.itemcategorycode] ?? "",
      itemcode: row.itemcode ?? "",
      itemname: row.itemname ?? "",
      kindcode: row.kindcode ?? "",
      kindname: row.kindname ?? "",
    }));
}

function getRegionLabel(value: string) {
  return REGION_OPTIONS.find((r) => r.value === value)?.label ?? "전체지역";
}

function getRegionKeyFromName(name: string) {
  if (!name) return "";
  const base = String(name)
    .replace(/광역시|특별시|특별자치시|특별자치도|도/g, "")
    .trim();

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

function CodeHint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-slate-50 px-3 py-2 text-sm text-slate-700">
      <span className="font-medium">{label}</span>
      <span className="ml-2">{value || "-"}</span>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-5">
        <div className="text-sm text-slate-500">{title}</div>
        <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

function KoreaPriceMap({
  data,
  productLabel,
}: {
  data: { region: string; latestPrice: number; latestDate: string }[];
  productLabel: string;
}) {
  const prices = data.map((d) => d.latestPrice).filter((v) => v !== null && v !== undefined);
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
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPinned className="h-5 w-5" />
          산지/지역 최신 가격 지도
        </CardTitle>
        <CardDescription>
          {productLabel ? `${productLabel} 기준 최신 가격 분포` : "선택한 품목 기준 최신 가격 분포"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-2xl border bg-white p-4">
          <svg viewBox="0 0 100 125" className="mx-auto w-full max-w-3xl">
            <path
              d="M42 6 L54 6 L62 12 L70 24 L76 34 L78 49 L76 62 L72 77 L65 90 L56 100 L48 106 L36 104 L28 96 L23 85 L20 72 L20 57 L24 44 L31 32 L37 20 Z"
              fill="#f8fafc"
              stroke="#cbd5e1"
              strokeWidth="1.2"
            />
            <ellipse
              cx="19"
              cy="113"
              rx="10"
              ry="5"
              fill="#f8fafc"
              stroke="#cbd5e1"
              strokeWidth="1.2"
            />
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
                <text
                  x={region.x}
                  y={region.y - 10}
                  textAnchor="middle"
                  fontSize="3.3"
                  fill="#0f172a"
                >
                  {region.label}
                </text>
                <text
                  x={region.x}
                  y={region.y + 1.3}
                  textAnchor="middle"
                  fontSize="2.9"
                  fill="#0f172a"
                >
                  {region.data?.latestPrice ? `${Math.round(region.data.latestPrice).toLocaleString()}` : "-"}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
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
      </CardContent>
    </Card>
  );
}

export default function KamisPriceDashboard() {
  const [mode, setMode] = useState("daily");
  const [certKey, setCertKey] = useState("");
  const [certId, setCertId] = useState("");
  const [useMock, setUseMock] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    "Mock 데이터가 켜져 있어서 현재는 예시 데이터를 보여주고 있습니다."
  );
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [productKeyword, setProductKeyword] = useState("수산");
  const [productOptions, setProductOptions] = useState<ProductInfoRow[]>([]);
  const [userPresets, setUserPresets] = useState<PresetRow[]>([]);
  const [newPresetName, setNewPresetName] = useState("");
  const [popup, setPopup] = useState({ open: false, title: "", description: "" });
  const [mapPriceData, setMapPriceData] = useState(MAP_MOCK);

  const DASHBOARD_PASSWORD = "kims6801!";

  const [dailyForm, setDailyForm] = useState({
    startDay: "2026-03-24",
    endDay: "2026-03-30",
    countryCode: "1101",
    itemCategoryCode: "100",
    itemCode: "111",
    kindCode: "01",
    productRankCode: "04",
    convertKgYn: "Y",
  });

  const [monthlyForm, setMonthlyForm] = useState({
    yyyy: "2026",
    period: "3",
    countyCode: "1101",
    itemCategoryCode: "100",
    itemCode: "111",
    kindCode: "01",
    gradeRank: "2",
    convertKgYn: "N",
  });

  const [dailyRows, setDailyRows] = useState(DAILY_MOCK);
  const [monthlyRows, setMonthlyRows] = useState(MONTHLY_MOCK);

  const allPresets = useMemo(() => [...BUILTIN_PRESETS, ...userPresets], [userPresets]);

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
    return `${selectedProductInfo.itemname}${selectedProductInfo.kindname ? ` · ${selectedProductInfo.kindname}` : ""}`;
  }, [selectedProductInfo]);

  const categoryOptions = useMemo(() => {
    const map = new Map<string, { value: string; label: string }>();
    productOptions.forEach((item) => {
      if (!map.has(item.itemcategorycode)) {
        map.set(item.itemcategorycode, {
          value: item.itemcategorycode,
          label: `${item.itemcategorycode} · ${
            item.itemcategoryname || CATEGORY_LABELS[item.itemcategorycode] || "미확인"
          }`,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.value.localeCompare(b.value));
  }, [productOptions]);

  const itemOptions = useMemo(() => {
    const map = new Map<string, { value: string; label: string }>();
    productOptions
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
  }, [productOptions, dailyForm.itemCategoryCode]);

  const kindOptions = useMemo(() => {
    const map = new Map<string, { value: string; label: string }>();
    productOptions
      .filter(
        (item) =>
          item.itemcategorycode === dailyForm.itemCategoryCode &&
          item.itemcode === dailyForm.itemCode
      )
      .forEach((item) => {
        if (!map.has(item.kindcode)) {
          map.set(item.kindcode, {
            value: item.kindcode,
            label: `${item.kindcode} · ${item.kindname || "기본품종"}`,
          });
        }
      });
    return Array.from(map.values()).sort((a, b) => a.value.localeCompare(b.value));
  }, [productOptions, dailyForm.itemCategoryCode, dailyForm.itemCode]);

  const dailySummary = useMemo(() => {
    const prices = dailyRows.map((d) => d.price).filter((v) => v !== null) as number[];
    if (!prices.length) return null;
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      latest: prices[prices.length - 1],
    };
  }, [dailyRows]);

  const monthlySummary = useMemo(() => {
    const prices = monthlyRows.map((d) => d.price).filter((v) => v !== null) as number[];
    if (!prices.length) return null;
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      latest: prices[prices.length - 1],
    };
  }, [monthlyRows]);

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

  async function searchProducts() {
    setLoadingProducts(true);
    setError("");

    try {
      const query = buildQuery({
        action: "productInfo",
        p_cert_key: certKey,
        p_cert_id: certId,
        p_returntype: "json",
      });

      const response = await fetch(`/api/kamis?${query}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const json = await response.json();
      const normalized = normalizeProductInfoResponse(json);
      const keyword = productKeyword.trim().toLowerCase();

      const filtered = normalized.filter((item) =>
        `${item.itemcategoryname} ${item.itemname} ${item.kindname}`.toLowerCase().includes(keyword)
      );

      setProductOptions(filtered.slice(0, 300));
      setStatusMessage(`품목 코드표에서 ${filtered.length}건을 찾았습니다. 드롭다운에서 바로 선택할 수 있습니다.`);

      if (filtered.length > 0) {
        const first = filtered[0];
        syncFormsFromSelection(first.itemcategorycode, first.itemcode, first.kindcode);
      } else {
        openPopup("품목 검색 결과 없음", `"${productKeyword}" 키워드로 찾은 품목이 없습니다.`);
      }
    } catch (e) {
      const message =
        e instanceof Error
          ? `${e.message} — 품목 코드표 조회에 실패했습니다.`
          : "품목 코드표 조회 중 오류가 발생했습니다.";
      setError(message);
      openPopup("품목 코드 조회 오류", message);
    } finally {
      setLoadingProducts(false);
    }
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
      const start = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 14)
        .toISOString()
        .slice(0, 10);

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
          const rows = normalizeDailyResponse(json).filter((row) => row.price !== null);
          if (!rows.length) return null;

          const latest = rows[rows.length - 1];
          return {
            region: getRegionKeyFromName(region.label),
            latestPrice: latest.price as number,
            latestDate: latest.regday,
          };
        })
      );

      const filtered = results.filter(Boolean) as { region: string; latestPrice: number; latestDate: string }[];
      if (filtered.length) setMapPriceData(filtered);
    } catch {
      // 지도 실패는 메인 조회를 막지 않음
    } finally {
      setLoadingMap(false);
    }
  }

  async function loadDaily() {
    setLoading(true);
    setError("");

    try {
      if (useMock) {
        setDailyRows(DAILY_MOCK);
        setStatusMessage("일별 조회 버튼이 정상 작동했습니다. 현재는 Mock 모드라 예시 일별 데이터를 다시 불러왔습니다.");
        openPopup("Mock 데이터 안내", "현재 Mock 모드가 켜져 있어서 실제 KAMIS가 아니라 예시 일별 데이터를 보여주고 있습니다.");
        await loadRegionalLatestPrices();
        return;
      }

      const query = buildQuery({
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

      const response = await fetch(`/api/kamis?${query}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const json = await response.json();
      const normalized = normalizeDailyResponse(json);

      if (!normalized.length) {
        openPopup("조회 결과 없음", "일별 시세 조회 결과가 없습니다. 조건을 다시 선택해주세요.");
        return;
      }

      setDailyRows(normalized);
      setStatusMessage(`일별 도매 시세 ${normalized.length}건을 불러왔습니다.`);
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

  async function loadMonthly() {
    setLoading(true);
    setError("");

    try {
      if (useMock) {
        setMonthlyRows(MONTHLY_MOCK);
        setStatusMessage("월별 조회 버튼이 정상 작동했습니다. 현재는 Mock 모드라 예시 월별 데이터를 다시 불러왔습니다.");
        openPopup("Mock 데이터 안내", "현재 Mock 모드가 켜져 있어서 실제 KAMIS가 아니라 예시 월별 데이터를 보여주고 있습니다.");
        return;
      }

      const query = buildQuery({
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

      const response = await fetch(`/api/kamis?${query}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const json = await response.json();
      const normalized = normalizeMonthlyResponse(json);

      if (!normalized.length) {
        openPopup("조회 결과 없음", "월별 시세 조회 결과가 없습니다. 품목이나 등급 조건을 다른 값으로 선택해보세요.");
        return;
      }

      setMonthlyRows(normalized);
      setStatusMessage(`월별 시세 ${normalized.length}건을 불러왔습니다.`);
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
    if (typeof window === "undefined") return;

    const savedKey = localStorage.getItem(STORAGE_KEYS.certKey) || "";
    const savedId = localStorage.getItem(STORAGE_KEYS.certId) || "";
    const savedUseMock = localStorage.getItem(STORAGE_KEYS.useMock);
    const savedPresets = localStorage.getItem(STORAGE_KEYS.presets);

    if (savedKey) setCertKey(savedKey);
    if (savedId) setCertId(savedId);
    if (savedUseMock !== null) setUseMock(JSON.parse(savedUseMock));
    if (savedPresets) {
      try {
        setUserPresets(JSON.parse(savedPresets));
      } catch {
        // ignore malformed localStorage
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.presets, JSON.stringify(userPresets));
  }, [userPresets]);

  useEffect(() => {
    if (isUnlocked && productOptions.length === 0 && certKey && certId) {
      searchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnlocked]);

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10">
        <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
          <Card className="w-full rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">KAMIS 대시보드 접근</CardTitle>
              <CardDescription>비밀번호를 입력해야 대시보드를 확인할 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>비밀번호</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUnlock();
                  }}
                  placeholder="비밀번호 입력"
                />
              </div>
              {passwordError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {passwordError}
                </div>
              ) : null}
              <Button className="w-full rounded-xl" onClick={handleUnlock}>
                대시보드 열기
              </Button>
              <div className="text-xs text-slate-500">
                참고: 이 방식은 화면 접근용 간단 잠금으로, 민감한 정보를 보호하는 정식 보안 인증 수단은 아닙니다.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <Dialog
        open={popup.open}
        onOpenChange={(open) => setPopup((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{popup.title}</DialogTitle>
            <DialogDescription>{popup.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setPopup((prev) => ({ ...prev, open: false }))}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900">
          본 페이지는 보안이 확보되지 않았으니 내부 정보를 업로드하거나 가공하지 말고 대시보드 내용만 확인해주세요
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm shadow-sm">
              <Database className="h-4 w-4" />
              KAMIS 오픈 API 도매 시세 대시보드
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">일별 · 월별 도매 시세 조회 페이지</h1>
              <p className="mt-2 text-sm text-slate-600">
                인증키 저장, 자주쓰는 품목 프리셋 저장, 지역별 최신 가격 지도까지 넣은 버전입니다.
              </p>
            </div>
          </div>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <KeyRound className="h-5 w-5" />
                API 연결 설정
              </CardTitle>
              <CardDescription>
                한 번 저장한 인증 정보는 이 브라우저에 남아 다음 접속 때 자동으로 채워집니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between rounded-xl border bg-slate-50 px-4 py-3">
                  <div>
                    <div className="font-medium">Mock 데이터 사용</div>
                    <div className="text-xs text-slate-500">켜져 있으면 인증값 없이도 미리보기 가능</div>
                  </div>
                  <Switch
                    checked={useMock}
                    onCheckedChange={(checked) => {
                      setUseMock(checked);
                      setStatusMessage(checked ? "Mock 모드가 켜졌습니다." : "실제 KAMIS API 모드로 전환했습니다.");
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>p_cert_key</Label>
                <Input
                  value={certKey}
                  onChange={(e) => setCertKey(e.target.value)}
                  placeholder="발급받은 인증Key"
                />
              </div>

              <div className="space-y-2">
                <Label>p_cert_id</Label>
                <Input
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  placeholder="발급받은 요청자ID"
                />
              </div>

              <div className="md:col-span-2">
                <Button className="w-full rounded-xl" variant="outline" onClick={saveCredentials}>
                  <Save className="mr-2 h-4 w-4" />
                  인증 정보 이 브라우저에 저장
                </Button>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>빠른 품목 선택</Label>
                <Select onValueChange={applyPreset}>
                  <SelectTrigger>
                    <SelectValue placeholder="자주 쓰는 품목 프리셋 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {allPresets.map((preset) => (
                      <SelectItem key={`${preset.source}-${preset.label}`} value={preset.label}>
                        {`${preset.label}${preset.source === "내 저장" ? " · 내 저장" : ""}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>현재 선택을 자주쓰는 프리셋으로 저장</Label>
                <div className="flex gap-2">
                  <Input
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="예: 오징어 · 서울 · 상품"
                  />
                  <Button onClick={saveCurrentPreset} className="rounded-xl">
                    <Save className="mr-2 h-4 w-4" />
                    저장
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Fish className="h-5 w-5" />
              품목 코드 찾기
            </CardTitle>
            <CardDescription>
              수산, 오징어, 고등어, 김, 굴, 전복처럼 한글 키워드로 찾고, 드롭다운으로 바로 고릅니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <Input
                value={productKeyword}
                onChange={(e) => setProductKeyword(e.target.value)}
                placeholder="예: 수산, 오징어, 고등어, 김, 굴, 전복"
              />
              <Button onClick={searchProducts} disabled={loadingProducts} className="rounded-xl">
                {loadingProducts ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                코드 찾기
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>부류 선택</Label>
                <Select
                  value={dailyForm.itemCategoryCode}
                  onValueChange={(value) => {
                    const nextItems = productOptions.filter((item) => item.itemcategorycode === value);
                    const firstItem = nextItems[0];
                    if (!firstItem) return;
                    syncFormsFromSelection(value, firstItem.itemcode, firstItem.kindcode);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="부류 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>품목 선택</Label>
                <Select
                  value={dailyForm.itemCode}
                  onValueChange={(value) => {
                    const nextKinds = productOptions.filter(
                      (item) =>
                        item.itemcategorycode === dailyForm.itemCategoryCode && item.itemcode === value
                    );
                    const firstKind = nextKinds[0];
                    if (!firstKind) return;
                    syncFormsFromSelection(dailyForm.itemCategoryCode, value, firstKind.kindcode);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="품목 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {itemOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>품종 선택</Label>
                <Select
                  value={dailyForm.kindCode}
                  onValueChange={(value) =>
                    syncFormsFromSelection(dailyForm.itemCategoryCode, dailyForm.itemCode, value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="품종 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {kindOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <CodeHint
                label="선택된 부류"
                value={`${dailyForm.itemCategoryCode} · ${
                  CATEGORY_LABELS[dailyForm.itemCategoryCode] ??
                  selectedProductInfo?.itemcategoryname ??
                  "미확인"
                }`}
              />
              <CodeHint
                label="선택된 품목"
                value={`${dailyForm.itemCode} · ${selectedProductInfo?.itemname || "미확인"}`}
              />
              <CodeHint
                label="선택된 품종"
                value={`${dailyForm.kindCode} · ${selectedProductInfo?.kindname || "기본품종"}`}
              />
              <CodeHint
                label="선택된 지역"
                value={`${dailyForm.countryCode || "전체"} · ${getRegionLabel(dailyForm.countryCode)}`}
              />
            </div>
          </CardContent>
        </Card>

        {statusMessage && (
          <Alert className="border-emerald-200 bg-emerald-50">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>상태 안내</AlertTitle>
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>연결 안내</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={mode} onValueChange={setMode} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-white p-1 shadow-sm">
            <TabsTrigger value="daily" className="rounded-xl">
              <CalendarDays className="mr-2 h-4 w-4" />
              일별 도매 시세
            </TabsTrigger>
            <TabsTrigger value="monthly" className="rounded-xl">
              <BarChart3 className="mr-2 h-4 w-4" />
              월별 시세 흐름
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>일별 조회 조건</CardTitle>
                  <CardDescription>드롭다운 선택 방식</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>시작일</Label>
                      <Input
                        type="date"
                        value={dailyForm.startDay}
                        onChange={(e) => setDailyForm({ ...dailyForm, startDay: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>종료일</Label>
                      <Input
                        type="date"
                        value={dailyForm.endDay}
                        onChange={(e) => setDailyForm({ ...dailyForm, endDay: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>지역코드</Label>
                    <Select
                      value={dailyForm.countryCode}
                      onValueChange={(v) => setDailyForm({ ...dailyForm, countryCode: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REGION_OPTIONS.map((r) => (
                          <SelectItem key={r.label + r.value} value={r.value}>
                            {r.label || "전체지역"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>등급코드 선택</Label>
                    <Select
                      value={dailyForm.productRankCode}
                      onValueChange={(v) => setDailyForm({ ...dailyForm, productRankCode: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WHOLESALE_RANK_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <CodeHint
                      label="부류코드 한글"
                      value={
                        CATEGORY_LABELS[dailyForm.itemCategoryCode] ??
                        selectedProductInfo?.itemcategoryname ??
                        "미확인"
                      }
                    />
                    <CodeHint label="품목코드 한글" value={selectedProductInfo?.itemname || "미확인"} />
                    <CodeHint label="품종코드 한글" value={selectedProductInfo?.kindname || "기본품종"} />
                    <CodeHint
                      label="등급코드 한글"
                      value={
                        WHOLESALE_RANK_OPTIONS.find((o) => o.value === dailyForm.productRankCode)?.label ||
                        "미확인"
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>kg 환산 여부</Label>
                    <Select
                      value={dailyForm.convertKgYn}
                      onValueChange={(v) => setDailyForm({ ...dailyForm, convertKgYn: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Y">Y</SelectItem>
                        <SelectItem value="N">N</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full rounded-xl" onClick={loadDaily} disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="mr-2 h-4 w-4" />
                    )}
                    일별 시세 조회
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <StatCard title="최신가" value={dailySummary ? formatWon(dailySummary.latest) : "-"} />
                  <StatCard title="평균가" value={dailySummary ? formatWon(dailySummary.avg) : "-"} />
                  <StatCard title="최저가" value={dailySummary ? formatWon(dailySummary.min) : "-"} />
                  <StatCard title="최고가" value={dailySummary ? formatWon(dailySummary.max) : "-"} />
                </div>

                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle>일별 가격 추이</CardTitle>
                    <CardDescription>조회 기간 내 도매가격 흐름</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[320px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dailyRows}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="regday" />
                          <YAxis />
                          <Tooltip formatter={(v) => formatWon(v)} />
                          <Line type="monotone" dataKey="price" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle>일별 데이터 테이블</CardTitle>
                    <CardDescription>실무 확인용</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>날짜</TableHead>
                            <TableHead>품목</TableHead>
                            <TableHead>품종</TableHead>
                            <TableHead>지역</TableHead>
                            <TableHead className="text-right">가격</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dailyRows.map((row, idx) => (
                            <TableRow key={`${row.regday}-${idx}`}>
                              <TableCell>{row.regday}</TableCell>
                              <TableCell>{row.itemname || "-"}</TableCell>
                              <TableCell>{row.kindname || "-"}</TableCell>
                              <TableCell>{row.countyname || row.marketname || "-"}</TableCell>
                              <TableCell className="text-right font-medium">{formatWon(row.price)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>월별 조회 조건</CardTitle>
                  <CardDescription>드롭다운 선택 방식</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>기준연도</Label>
                      <Input
                        value={monthlyForm.yyyy}
                        onChange={(e) => setMonthlyForm({ ...monthlyForm, yyyy: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>조회기간(년)</Label>
                      <Input
                        value={monthlyForm.period}
                        onChange={(e) => setMonthlyForm({ ...monthlyForm, period: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>지역코드</Label>
                    <Select
                      value={monthlyForm.countyCode}
                      onValueChange={(v) => setMonthlyForm({ ...monthlyForm, countyCode: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REGION_OPTIONS.map((r) => (
                          <SelectItem key={r.label + r.value + "m"} value={r.value}>
                            {r.label || "전체지역"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>등급값 선택</Label>
                    <Select
                      value={monthlyForm.gradeRank}
                      onValueChange={(v) => setMonthlyForm({ ...monthlyForm, gradeRank: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHLY_GRADE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <CodeHint
                      label="부류코드 한글"
                      value={
                        CATEGORY_LABELS[monthlyForm.itemCategoryCode] ??
                        selectedProductInfo?.itemcategoryname ??
                        "미확인"
                      }
                    />
                    <CodeHint label="품목코드 한글" value={selectedProductInfo?.itemname || "미확인"} />
                    <CodeHint label="품종코드 한글" value={selectedProductInfo?.kindname || "기본품종"} />
                    <CodeHint
                      label="등급값 한글"
                      value={
                        MONTHLY_GRADE_OPTIONS.find((o) => o.value === monthlyForm.gradeRank)?.label ||
                        "미확인"
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>kg 환산 여부</Label>
                    <Select
                      value={monthlyForm.convertKgYn}
                      onValueChange={(v) => setMonthlyForm({ ...monthlyForm, convertKgYn: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Y">Y</SelectItem>
                        <SelectItem value="N">N</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full rounded-xl" onClick={loadMonthly} disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="mr-2 h-4 w-4" />
                    )}
                    월별 시세 조회
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <StatCard title="최근월 가격" value={monthlySummary ? formatWon(monthlySummary.latest) : "-"} />
                  <StatCard title="월평균" value={monthlySummary ? formatWon(monthlySummary.avg) : "-"} />
                  <StatCard title="최저월" value={monthlySummary ? formatWon(monthlySummary.min) : "-"} />
                  <StatCard title="최고월" value={monthlySummary ? formatWon(monthlySummary.max) : "-"} />
                </div>

                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle>월별 가격 흐름</CardTitle>
                    <CardDescription>1월부터 12월까지 월간 평균 가격</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[320px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyRows}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(v) => formatWon(v)} />
                          <Line type="monotone" dataKey="price" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle>월별 데이터 테이블</CardTitle>
                    <CardDescription>월별 요약값 확인</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>월</TableHead>
                            <TableHead className="text-right">가격</TableHead>
                            <TableHead>상태</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {monthlyRows.map((row, idx) => (
                            <TableRow key={`${row.month}-${idx}`}>
                              <TableCell>{row.month}</TableCell>
                              <TableCell className="text-right font-medium">{formatWon(row.price)}</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="rounded-full">
                                  정상
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <KoreaPriceMap data={mapPriceData} productLabel={selectedProductLabel} />

        {loadingMap ? (
          <Alert className="border-slate-200 bg-slate-50">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>지도 로딩 중</AlertTitle>
            <AlertDescription>선택한 품목 기준 지역별 최신 가격을 수집하고 있습니다.</AlertDescription>
          </Alert>
        ) : null}

        <Card className="rounded-2xl border-dashed bg-white/70 shadow-sm">
          <CardHeader>
            <CardTitle>코드 이해 가이드</CardTitle>
            <CardDescription>KAMIS 코드 체계를 쉽게 보기 위한 설명입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <b>부류코드</b>는 큰 카테고리입니다. 예: 채소류, 수산물.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <b>품목코드</b>는 오징어, 고등어, 굴처럼 실제 품목입니다.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <b>품종코드</b>는 같은 품목 안의 세부 구분입니다. 없으면 보통 기본품종입니다.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <b>등급코드/등급값</b>은 상품·중품 같은 품질 구분입니다.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
