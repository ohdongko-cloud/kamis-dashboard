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
import { Loader2, Search, BarChart3, CalendarDays, KeyRound, AlertCircle, Database, Fish, Info, CheckCircle2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const REGION_OPTIONS = [
  { label: "전체지역", value: "" },
  { label: "서울", value: "1101" },
  { label: "부산", value: "2100" },
  { label: "대구", value: "2200" },
  { label: "광주", value: "2401" },
  { label: "대전", value: "2501" },
];

const CATEGORY_LABELS = {
  "100": "식량작물",
  "200": "채소류",
  "300": "특용작물",
  "400": "과일류",
  "500": "축산물",
  "600": "수산물",
};

const WHOLESALE_RANK_LABELS = {
  "01": "상품",
  "02": "중품",
  "03": "하품",
  "04": "중품/기타",
};

const MONTHLY_GRADE_LABELS = {
  "1": "상품",
  "2": "중품",
  "3": "하품",
};

const PRODUCT_PRESETS = [
  {
    label: "쌀 · 일반계(중품)",
    itemCategoryCode: "100",
    itemCode: "111",
    kindCode: "01",
    productRankCode: "04",
    gradeRank: "2",
    description: "예시 프리셋 · 식량작물",
  },
  {
    label: "배추 · 상품",
    itemCategoryCode: "200",
    itemCode: "211",
    kindCode: "00",
    productRankCode: "01",
    gradeRank: "1",
    description: "예시 프리셋 · 채소류",
  },
  {
    label: "무 · 상품",
    itemCategoryCode: "200",
    itemCode: "231",
    kindCode: "00",
    productRankCode: "01",
    gradeRank: "1",
    description: "예시 프리셋 · 채소류",
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

function cleanNumber(value) {
  if (value === null || value === undefined) return null;
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function formatWon(value) {
  const n = cleanNumber(value);
  if (n === null) return "-";
  return `${n.toLocaleString("ko-KR")}원`;
}

function buildQuery(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      search.set(key, String(value));
    }
  });
  return search.toString();
}

function normalizeDailyResponse(json) {
  const root = json?.data ?? json?.price ?? json;
  const items = root?.item ?? root ?? [];
  const arr = Array.isArray(items) ? items : [items];
  return arr
    .filter(Boolean)
    .map((row) => ({
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

function normalizeMonthlyResponse(json) {
  const root = json?.price ?? json?.data ?? json;
  const items = root?.item ?? root ?? [];
  const arr = Array.isArray(items) ? items : [items];

  return arr.flatMap((row) => {
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

function normalizeProductInfoResponse(json) {
  const root = json?.price ?? json?.data ?? json;
  const items = root?.item ?? root ?? [];
  const arr = Array.isArray(items) ? items : [items];
  return arr
    .filter(Boolean)
    .map((row) => ({
      itemcategorycode: row.itemcategorycode ?? "",
      itemcategoryname: row.itemcategoryname ?? CATEGORY_LABELS[row.itemcategorycode] ?? "",
      itemcode: row.itemcode ?? "",
      itemname: row.itemname ?? "",
      kindcode: row.kindcode ?? "",
      kindname: row.kindname ?? "",
      wholesale_unit: row.wholesale_unit ?? "",
      wholesale_unitsize: row.wholesale_unitsize ?? "",
      whole_productrankcode: row.whole_productrankcode ?? "",
      retail_productrankcode: row.retail_productrankcode ?? "",
    }));
}

function getRegionLabel(value) {
  return REGION_OPTIONS.find((r) => r.value === value)?.label ?? "전체지역";
}

function CodeHint({ label, value }) {
  return (
    <div className="rounded-xl border bg-slate-50 px-3 py-2 text-sm text-slate-700">
      <span className="font-medium">{label}</span>
      <span className="ml-2">{value || "-"}</span>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-5">
        <div className="text-sm text-slate-500">{title}</div>
        <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
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
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("Mock 데이터가 켜져 있어서 현재는 예시 데이터를 보여주고 있습니다.");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [productKeyword, setProductKeyword] = useState("수산");
  const [productOptions, setProductOptions] = useState([]);

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

  const selectedProductInfo = useMemo(() => {
    return productOptions.find(
      (item) =>
        item.itemcategorycode === dailyForm.itemCategoryCode &&
        item.itemcode === dailyForm.itemCode &&
        item.kindcode === dailyForm.kindCode
    );
  }, [productOptions, dailyForm]);

  const dailySummary = useMemo(() => {
    const prices = dailyRows.map((d) => d.price).filter((v) => v !== null);
    if (!prices.length) return null;
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      latest: prices[prices.length - 1],
    };
  }, [dailyRows]);

  const monthlySummary = useMemo(() => {
    const prices = monthlyRows.map((d) => d.price).filter((v) => v !== null);
    if (!prices.length) return null;
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      latest: prices[prices.length - 1],
    };
  }, [monthlyRows]);

  function handleUnlock() {
    if (password === DASHBOARD_PASSWORD) {
      setIsUnlocked(true);
      setPasswordError("");
      return;
    }
    setPasswordError("비밀번호가 올바르지 않습니다.");
  }

  function applyPreset(label) {
    const preset = PRODUCT_PRESETS.find((p) => p.label === label);
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
    setStatusMessage(`${label} 프리셋을 적용했습니다. 아래 조회 버튼을 누르면 해당 조건으로 데이터를 다시 불러옵니다.`);
  }

  function applyProductSelection(value) {
    const selected = productOptions.find(
      (item) => `${item.itemcategorycode}|${item.itemcode}|${item.kindcode}` === value
    );
    if (!selected) return;
    setDailyForm((prev) => ({
      ...prev,
      itemCategoryCode: selected.itemcategorycode,
      itemCode: selected.itemcode,
      kindCode: selected.kindcode,
    }));
    setMonthlyForm((prev) => ({
      ...prev,
      itemCategoryCode: selected.itemcategorycode,
      itemCode: selected.itemcode,
      kindCode: selected.kindcode,
    }));
    setStatusMessage(`${selected.itemcategoryname} > ${selected.itemname} > ${selected.kindname} 코드를 적용했습니다.`);
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
      const filtered = normalized.filter((item) => {
        const haystack = `${item.itemcategoryname} ${item.itemname} ${item.kindname}`.toLowerCase();
        return keyword ? haystack.includes(keyword) : true;
      });
      setProductOptions(filtered.slice(0, 100));
      setStatusMessage(`품목 코드표에서 ${filtered.length}건을 찾았습니다. 목록에서 선택하면 코드가 자동으로 채워집니다.`);
    } catch (e) {
      setError(e instanceof Error ? `${e.message} — 품목 코드표 조회에 실패했습니다.` : "품목 코드표 조회 중 오류가 발생했습니다.");
    } finally {
      setLoadingProducts(false);
    }
  }

  async function loadDaily() {
    setLoading(true);
    setError("");
    try {
      if (useMock) {
        setDailyRows(DAILY_MOCK);
        setStatusMessage("일별 조회 버튼이 정상 작동했습니다. 현재는 Mock 모드라 예시 일별 데이터를 다시 불러왔습니다.");
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
      if (!normalized.length) throw new Error("조회 결과가 없습니다.");
      setDailyRows(normalized);
      setStatusMessage(`일별 도매 시세 ${normalized.length}건을 불러왔습니다.`);
    } catch (e) {
      setError(
        e instanceof Error
          ? `${e.message} — 일별 시세 조회에 실패했습니다. 인증값과 코드 조합을 확인해주세요.`
          : "조회 중 오류가 발생했습니다."
      );
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
      if (!normalized.length) throw new Error("조회 결과가 없습니다.");
      setMonthlyRows(normalized);
      setStatusMessage(`월별 시세 ${normalized.length}건을 불러왔습니다.`);
    } catch (e) {
      setError(
        e instanceof Error
          ? `${e.message} — 월별 시세 조회에 실패했습니다. 인증값과 코드 조합을 확인해주세요.`
          : "조회 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isUnlocked && productOptions.length === 0 && certKey && certId) {
      searchProducts();
    }
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
              <Button className="w-full rounded-xl" onClick={handleUnlock}>대시보드 열기</Button>
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
                KAMIS 인증키와 요청자 ID를 넣으면 일별 도매 가격과 월별 가격 흐름을 한 화면에서 볼 수 있습니다.
              </p>
            </div>
          </div>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><KeyRound className="h-5 w-5" /> API 연결 설정</CardTitle>
              <CardDescription>Mock이 켜져 있으면 버튼을 눌러도 예시 데이터만 다시 로드됩니다.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between rounded-xl border bg-slate-50 px-4 py-3">
                  <div>
                    <div className="font-medium">Mock 데이터 사용</div>
                    <div className="text-xs text-slate-500">켜져 있으면 인증값 없이도 미리보기 가능</div>
                  </div>
                  <Switch checked={useMock} onCheckedChange={(checked) => {
                    setUseMock(checked);
                    setStatusMessage(checked ? "Mock 모드가 켜졌습니다. 조회 버튼은 예시 데이터만 다시 불러옵니다." : "실제 KAMIS API 모드로 전환했습니다. 이제 조회 버튼이 실제 API를 호출합니다.");
                  }} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>p_cert_key</Label>
                <Input value={certKey} onChange={(e) => setCertKey(e.target.value)} placeholder="발급받은 인증Key" />
              </div>
              <div className="space-y-2">
                <Label>p_cert_id</Label>
                <Input value={certId} onChange={(e) => setCertId(e.target.value)} placeholder="발급받은 요청자ID" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>빠른 품목 선택</Label>
                <Select onValueChange={applyPreset}>
                  <SelectTrigger>
                    <SelectValue placeholder="샘플 프리셋 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_PRESETS.map((preset) => (
                      <SelectItem key={preset.label} value={preset.label}>{preset.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">현재 이 드롭다운은 예시 프리셋 3개만 넣어둔 상태입니다. 아래 “품목 코드 찾기”에서 수산물 포함 전체 품목을 검색할 수 있게 바꿨습니다.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Fish className="h-5 w-5" /> 품목 코드 찾기</CardTitle>
            <CardDescription>수산물, 오징어, 고등어, 김, 굴, 전복처럼 한글 키워드로 검색하면 코드 조합을 쉽게 찾을 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <Input value={productKeyword} onChange={(e) => setProductKeyword(e.target.value)} placeholder="예: 수산, 오징어, 고등어, 김, 굴, 전복" />
              <Button onClick={searchProducts} disabled={loadingProducts} className="rounded-xl">
                {loadingProducts ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />} 코드 찾기
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-2">
                <Label>검색 결과에서 선택</Label>
                <Select onValueChange={applyProductSelection}>
                  <SelectTrigger>
                    <SelectValue placeholder={productOptions.length ? "품목 선택" : "먼저 코드 찾기를 눌러주세요"} />
                  </SelectTrigger>
                  <SelectContent>
                    {productOptions.map((item) => (
                      <SelectItem
                        key={`${item.itemcategorycode}-${item.itemcode}-${item.kindcode}`}
                        value={`${item.itemcategorycode}|${item.itemcode}|${item.kindcode}`}
                      >
                        {`${item.itemcategoryname} > ${item.itemname} > ${item.kindname || "기본품종"}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <CodeHint label="부류코드 설명" value={`${dailyForm.itemCategoryCode} · ${CATEGORY_LABELS[dailyForm.itemCategoryCode] ?? (selectedProductInfo?.itemcategoryname || "미확인")}`} />
                <CodeHint label="품목코드 설명" value={`${dailyForm.itemCode} · ${selectedProductInfo?.itemname || "품목명 미확인"}`} />
                <CodeHint label="품종코드 설명" value={`${dailyForm.kindCode} · ${selectedProductInfo?.kindname || "품종명 미확인"}`} />
                <CodeHint label="지역코드 설명" value={`${dailyForm.countryCode || "전체"} · ${getRegionLabel(dailyForm.countryCode)}`} />
              </div>
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
            <TabsTrigger value="daily" className="rounded-xl"><CalendarDays className="mr-2 h-4 w-4" /> 일별 도매 시세</TabsTrigger>
            <TabsTrigger value="monthly" className="rounded-xl"><BarChart3 className="mr-2 h-4 w-4" /> 월별 시세 흐름</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>일별 조회 조건</CardTitle>
                  <CardDescription>신)일별 품목별 도매 가격자료 API 기준</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>시작일</Label><Input type="date" value={dailyForm.startDay} onChange={(e) => setDailyForm({ ...dailyForm, startDay: e.target.value })} /></div>
                    <div className="space-y-2"><Label>종료일</Label><Input type="date" value={dailyForm.endDay} onChange={(e) => setDailyForm({ ...dailyForm, endDay: e.target.value })} /></div>
                  </div>

                  <div className="space-y-2">
                    <Label>지역코드</Label>
                    <Select value={dailyForm.countryCode} onValueChange={(v) => setDailyForm({ ...dailyForm, countryCode: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {REGION_OPTIONS.map((r) => <SelectItem key={r.label + r.value} value={r.value}>{r.label || "전체지역"}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>부류코드</Label><Input value={dailyForm.itemCategoryCode} onChange={(e) => setDailyForm({ ...dailyForm, itemCategoryCode: e.target.value })} /></div>
                    <div className="space-y-2"><Label>품목코드</Label><Input value={dailyForm.itemCode} onChange={(e) => setDailyForm({ ...dailyForm, itemCode: e.target.value })} /></div>
                    <div className="space-y-2"><Label>품종코드</Label><Input value={dailyForm.kindCode} onChange={(e) => setDailyForm({ ...dailyForm, kindCode: e.target.value })} /></div>
                    <div className="space-y-2"><Label>등급코드</Label><Input value={dailyForm.productRankCode} onChange={(e) => setDailyForm({ ...dailyForm, productRankCode: e.target.value })} /></div>
                  </div>

                  <div className="grid gap-2">
                    <CodeHint label="부류코드 한글" value={CATEGORY_LABELS[dailyForm.itemCategoryCode] ?? (selectedProductInfo?.itemcategoryname || "미확인")} />
                    <CodeHint label="품목코드 한글" value={selectedProductInfo?.itemname || "미확인"} />
                    <CodeHint label="품종코드 한글" value={selectedProductInfo?.kindname || "미확인"} />
                    <CodeHint label="등급코드 한글" value={WHOLESALE_RANK_LABELS[dailyForm.productRankCode] || "직접 입력값"} />
                  </div>

                  <div className="space-y-2">
                    <Label>kg 환산 여부</Label>
                    <Select value={dailyForm.convertKgYn} onValueChange={(v) => setDailyForm({ ...dailyForm, convertKgYn: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Y">Y</SelectItem>
                        <SelectItem value="N">N</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full rounded-xl" onClick={loadDaily} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
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
                    <CardDescription>실무에서 바로 내려받기 전 확인하기 좋은 형태</CardDescription>
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
                  <CardDescription>월별 도소매가격정보 API 중 도매 활용용 샘플</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>기준연도</Label><Input value={monthlyForm.yyyy} onChange={(e) => setMonthlyForm({ ...monthlyForm, yyyy: e.target.value })} /></div>
                    <div className="space-y-2"><Label>조회기간(년)</Label><Input value={monthlyForm.period} onChange={(e) => setMonthlyForm({ ...monthlyForm, period: e.target.value })} /></div>
                  </div>

                  <div className="space-y-2">
                    <Label>지역코드</Label>
                    <Select value={monthlyForm.countyCode} onValueChange={(v) => setMonthlyForm({ ...monthlyForm, countyCode: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {REGION_OPTIONS.map((r) => <SelectItem key={r.label + r.value + "m"} value={r.value}>{r.label || "전체지역"}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>부류코드</Label><Input value={monthlyForm.itemCategoryCode} onChange={(e) => setMonthlyForm({ ...monthlyForm, itemCategoryCode: e.target.value })} /></div>
                    <div className="space-y-2"><Label>품목코드</Label><Input value={monthlyForm.itemCode} onChange={(e) => setMonthlyForm({ ...monthlyForm, itemCode: e.target.value })} /></div>
                    <div className="space-y-2"><Label>품종코드</Label><Input value={monthlyForm.kindCode} onChange={(e) => setMonthlyForm({ ...monthlyForm, kindCode: e.target.value })} /></div>
                    <div className="space-y-2"><Label>등급값</Label><Input value={monthlyForm.gradeRank} onChange={(e) => setMonthlyForm({ ...monthlyForm, gradeRank: e.target.value })} /></div>
                  </div>

                  <div className="grid gap-2">
                    <CodeHint label="부류코드 한글" value={CATEGORY_LABELS[monthlyForm.itemCategoryCode] ?? (selectedProductInfo?.itemcategoryname || "미확인")} />
                    <CodeHint label="품목코드 한글" value={selectedProductInfo?.itemname || "미확인"} />
                    <CodeHint label="품종코드 한글" value={selectedProductInfo?.kindname || "미확인"} />
                    <CodeHint label="등급값 한글" value={MONTHLY_GRADE_LABELS[monthlyForm.gradeRank] || "직접 입력값"} />
                  </div>

                  <div className="space-y-2">
                    <Label>kg 환산 여부</Label>
                    <Select value={monthlyForm.convertKgYn} onValueChange={(v) => setMonthlyForm({ ...monthlyForm, convertKgYn: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Y">Y</SelectItem>
                        <SelectItem value="N">N</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full rounded-xl" onClick={loadMonthly} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
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
                                <Badge variant="secondary" className="rounded-full">정상</Badge>
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

        <Card className="rounded-2xl border-dashed bg-white/70 shadow-sm">
          <CardHeader>
            <CardTitle>코드 이해 가이드</CardTitle>
            <CardDescription>KAMIS 코드 체계를 쉽게 보기 위한 설명입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div className="flex items-start gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0" /><span><b>부류코드</b>는 큰 카테고리입니다. 예: 채소류, 수산물.</span></div>
            <div className="flex items-start gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0" /><span><b>품목코드</b>는 배추, 오징어, 고등어처럼 실제 품목입니다.</span></div>
            <div className="flex items-start gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0" /><span><b>품종코드</b>는 같은 품목 안의 세부 구분입니다. 없으면 보통 00이 기본값입니다.</span></div>
            <div className="flex items-start gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0" /><span><b>등급코드/등급값</b>은 상품·중품 같은 품질 구분입니다.</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
