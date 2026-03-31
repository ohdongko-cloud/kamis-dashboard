"use client";

import { useMemo, useState } from "react";
import { BarChart3, CalendarDays, Database, KeyRound, Search } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type DailyRow = {
  regday: string;
  price: number | null;
  itemname: string;
  kindname: string;
  countyname: string;
  marketname?: string;
};

type MonthlyRow = {
  month: string;
  price: number | null;
};

const REGION_OPTIONS = [
  { label: "전체지역", value: "" },
  { label: "서울", value: "1101" },
  { label: "부산", value: "2100" },
  { label: "대구", value: "2200" },
  { label: "광주", value: "2401" },
  { label: "대전", value: "2501" },
];

const PRODUCT_PRESETS = [
  { label: "쌀 · 일반계(중품)", itemCategoryCode: "100", itemCode: "111", kindCode: "01", productRankCode: "04", gradeRank: "2" },
  { label: "배추 · 상품", itemCategoryCode: "200", itemCode: "211", kindCode: "00", productRankCode: "01", gradeRank: "1" },
  { label: "무 · 상품", itemCategoryCode: "200", itemCode: "231", kindCode: "00", productRankCode: "01", gradeRank: "1" },
];

const DAILY_MOCK: DailyRow[] = [
  { regday: "2026-03-24", price: 4620, itemname: "쌀", kindname: "일반계", countyname: "서울" },
  { regday: "2026-03-25", price: 4680, itemname: "쌀", kindname: "일반계", countyname: "서울" },
  { regday: "2026-03-26", price: 4710, itemname: "쌀", kindname: "일반계", countyname: "서울" },
  { regday: "2026-03-27", price: 4690, itemname: "쌀", kindname: "일반계", countyname: "서울" },
  { regday: "2026-03-28", price: 4740, itemname: "쌀", kindname: "일반계", countyname: "서울" },
  { regday: "2026-03-29", price: 4760, itemname: "쌀", kindname: "일반계", countyname: "서울" },
  { regday: "2026-03-30", price: 4780, itemname: "쌀", kindname: "일반계", countyname: "서울" },
];

const MONTHLY_MOCK: MonthlyRow[] = [
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

function cleanNumber(value: unknown) {
  if (value === null || value === undefined) return null;
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function formatWon(value: number | null) {
  if (value === null || value === undefined) return "-";
  return `${value.toLocaleString("ko-KR")}원`;
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
    }))
    .filter((row: DailyRow) => row.regday || row.price !== null);
}

function normalizeMonthlyResponse(json: any): MonthlyRow[] {
  const root = json?.price ?? json?.data ?? json;
  const items = root?.item ?? root ?? [];
  const arr = Array.isArray(items) ? items : [items];
  return arr.flatMap((row: any) => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const idx = i + 1;
      return { month: `${idx}월`, price: cleanNumber(row[`m${idx}`]) };
    });
    return months.filter((m) => m.price !== null);
  });
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="card p-5">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

export default function Page() {
  const [mode, setMode] = useState<"daily" | "monthly">("daily");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [useMock, setUseMock] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [certKey, setCertKey] = useState("");
  const [certId, setCertId] = useState("");

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

  const [dailyRows, setDailyRows] = useState<DailyRow[]>(DAILY_MOCK);
  const [monthlyRows, setMonthlyRows] = useState<MonthlyRow[]>(MONTHLY_MOCK);

  const dailySummary = useMemo(() => {
    const prices = dailyRows.map((d) => d.price).filter((v): v is number => v !== null);
    if (!prices.length) return null;
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      latest: prices[prices.length - 1],
    };
  }, [dailyRows]);

  const monthlySummary = useMemo(() => {
    const prices = monthlyRows.map((d) => d.price).filter((v): v is number => v !== null);
    if (!prices.length) return null;
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      latest: prices[prices.length - 1],
    };
  }, [monthlyRows]);

  function applyPreset(label: string) {
    const preset = PRODUCT_PRESETS.find((p) => p.label === label);
    if (!preset) return;
    setDailyForm((prev) => ({ ...prev, itemCategoryCode: preset.itemCategoryCode, itemCode: preset.itemCode, kindCode: preset.kindCode, productRankCode: preset.productRankCode }));
    setMonthlyForm((prev) => ({ ...prev, itemCategoryCode: preset.itemCategoryCode, itemCode: preset.itemCode, kindCode: preset.kindCode, gradeRank: preset.gradeRank }));
  }

  function handleUnlock() {
    if (password === "kims6801!") {
      setIsUnlocked(true);
      setPasswordError("");
      return;
    }
    setPasswordError("비밀번호가 올바르지 않습니다.");
  }

  async function loadDaily() {
    setLoading(true);
    setError("");
    try {
      if (useMock) {
        setDailyRows(DAILY_MOCK);
        return;
      }
      const params = new URLSearchParams({
        type: "daily",
        p_cert_key: certKey,
        p_cert_id: certId,
        p_startday: dailyForm.startDay,
        p_endday: dailyForm.endDay,
        p_countrycode: dailyForm.countryCode,
        p_itemcategorycode: dailyForm.itemCategoryCode,
        p_itemcode: dailyForm.itemCode,
        p_kindcode: dailyForm.kindCode,
        p_productrankcode: dailyForm.productRankCode,
        p_convert_kg_yn: dailyForm.convertKgYn,
      });
      const response = await fetch(`/api/kamis?${params.toString()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      const normalized = normalizeDailyResponse(json);
      if (!normalized.length) throw new Error("조회 결과가 없습니다.");
      setDailyRows(normalized);
    } catch (e) {
      setError(e instanceof Error ? e.message : "일별 시세 조회 중 오류가 발생했습니다.");
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
        return;
      }
      const params = new URLSearchParams({
        type: "monthly",
        p_cert_key: certKey,
        p_cert_id: certId,
        p_yyyy: monthlyForm.yyyy,
        p_period: monthlyForm.period,
        p_countycode: monthlyForm.countyCode,
        p_itemcategorycode: monthlyForm.itemCategoryCode,
        p_itemcode: monthlyForm.itemCode,
        p_kindcode: monthlyForm.kindCode,
        p_graderank: monthlyForm.gradeRank,
        p_convert_kg_yn: monthlyForm.convertKgYn,
      });
      const response = await fetch(`/api/kamis?${params.toString()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      const normalized = normalizeMonthlyResponse(json);
      if (!normalized.length) throw new Error("조회 결과가 없습니다.");
      setMonthlyRows(normalized);
    } catch (e) {
      setError(e instanceof Error ? e.message : "월별 시세 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (!isUnlocked) {
    return (
      <main className="min-h-screen px-6 py-10">
        <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
          <section className="card w-full p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold">KAMIS 대시보드 접근</h1>
              <p className="mt-2 text-sm text-slate-600">비밀번호를 입력해야 대시보드를 확인할 수 있습니다.</p>
            </div>
            <div>
              <label className="label">비밀번호</label>
              <input
                className="field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUnlock();
                }}
                placeholder="비밀번호 입력"
              />
            </div>
            {passwordError ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{passwordError}</div> : null}
            <button className="button mt-4" onClick={handleUnlock}>대시보드 열기</button>
            <p className="mt-4 text-xs text-slate-500">참고: 이 비밀번호 잠금은 간단한 화면 접근 제어용이며, 정식 사용자 인증 보안 체계는 아닙니다.</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900">
          본 페이지는 보안이 확보되지 않았으니 내부 정보를 업로드하거나 가공하지 말고 대시보드 내용만 확인해주세요
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm shadow-sm">
              <Database size={16} />
              KAMIS 오픈 API 도매 시세 대시보드
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">일별 · 월별 도매 시세 조회 페이지</h1>
              <p className="mt-2 text-sm text-slate-600">KAMIS 인증키와 요청자 ID를 넣으면 일별 도매 가격과 월별 가격 흐름을 한 화면에서 볼 수 있도록 만든 샘플입니다.</p>
            </div>
          </div>

          <section className="card p-6">
            <div className="mb-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold"><KeyRound size={18} /> API 연결 설정</h2>
              <p className="mt-1 text-sm text-slate-600">처음에는 Mock 데이터로 화면을 확인하고, 준비되면 실제 KAMIS API로 전환하세요.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 rounded-xl border bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium">Mock 데이터 사용</div>
                    <div className="text-xs text-slate-500">켜져 있으면 인증값 없이도 미리보기 가능</div>
                  </div>
                  <input type="checkbox" checked={useMock} onChange={(e) => setUseMock(e.target.checked)} />
                </div>
              </div>
              <div>
                <label className="label">p_cert_key</label>
                <input className="field" value={certKey} onChange={(e) => setCertKey(e.target.value)} placeholder="발급받은 인증Key" />
              </div>
              <div>
                <label className="label">p_cert_id</label>
                <input className="field" value={certId} onChange={(e) => setCertId(e.target.value)} placeholder="발급받은 요청자ID" />
              </div>
              <div className="md:col-span-2">
                <label className="label">빠른 품목 선택</label>
                <select className="select" defaultValue="" onChange={(e) => applyPreset(e.target.value)}>
                  <option value="">자주 쓰는 품목 프리셋 선택</option>
                  {PRODUCT_PRESETS.map((preset) => <option key={preset.label} value={preset.label}>{preset.label}</option>)}
                </select>
              </div>
            </div>
          </section>
        </div>

        {error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">{error}</div> : null}

        <div className="flex gap-2">
          <button className={`button ${mode === "daily" ? "" : "secondary"}`} onClick={() => setMode("daily")}><CalendarDays size={16} className="mr-2 inline-block" />일별 도매 시세</button>
          <button className={`button ${mode === "monthly" ? "" : "secondary"}`} onClick={() => setMode("monthly")}><BarChart3 size={16} className="mr-2 inline-block" />월별 시세 흐름</button>
        </div>

        {mode === "daily" ? (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <section className="card p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">일별 조회 조건</h2>
                <p className="mt-1 text-sm text-slate-600">신 일별 품목별 도매 가격자료 API 기준</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">시작일</label><input className="field" type="date" value={dailyForm.startDay} onChange={(e) => setDailyForm({ ...dailyForm, startDay: e.target.value })} /></div>
                  <div><label className="label">종료일</label><input className="field" type="date" value={dailyForm.endDay} onChange={(e) => setDailyForm({ ...dailyForm, endDay: e.target.value })} /></div>
                </div>
                <div>
                  <label className="label">지역코드</label>
                  <select className="select" value={dailyForm.countryCode} onChange={(e) => setDailyForm({ ...dailyForm, countryCode: e.target.value })}>
                    {REGION_OPTIONS.map((r) => <option key={r.label + r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">부류코드</label><input className="field" value={dailyForm.itemCategoryCode} onChange={(e) => setDailyForm({ ...dailyForm, itemCategoryCode: e.target.value })} /></div>
                  <div><label className="label">품목코드</label><input className="field" value={dailyForm.itemCode} onChange={(e) => setDailyForm({ ...dailyForm, itemCode: e.target.value })} /></div>
                  <div><label className="label">품종코드</label><input className="field" value={dailyForm.kindCode} onChange={(e) => setDailyForm({ ...dailyForm, kindCode: e.target.value })} /></div>
                  <div><label className="label">등급코드</label><input className="field" value={dailyForm.productRankCode} onChange={(e) => setDailyForm({ ...dailyForm, productRankCode: e.target.value })} /></div>
                </div>
                <div>
                  <label className="label">kg 환산 여부</label>
                  <select className="select" value={dailyForm.convertKgYn} onChange={(e) => setDailyForm({ ...dailyForm, convertKgYn: e.target.value })}>
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                  </select>
                </div>
                <button className="button" onClick={loadDaily} disabled={loading}>{loading ? "로딩 중..." : <><Search size={16} className="mr-2 inline-block" />일별 시세 조회</>}</button>
              </div>
            </section>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <StatCard title="최신가" value={dailySummary ? formatWon(dailySummary.latest) : "-"} />
                <StatCard title="평균가" value={dailySummary ? formatWon(dailySummary.avg) : "-"} />
                <StatCard title="최저가" value={dailySummary ? formatWon(dailySummary.min) : "-"} />
                <StatCard title="최고가" value={dailySummary ? formatWon(dailySummary.max) : "-"} />
              </div>
              <section className="card p-6">
                <h2 className="text-lg font-semibold">일별 가격 추이</h2>
                <p className="mt-1 text-sm text-slate-600">조회 기간 내 도매가격 흐름</p>
                <div className="mt-4 h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyRows}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="regday" />
                      <YAxis />
                      <Tooltip formatter={(v) => formatWon(typeof v === "number" ? v : null)} />
                      <Line type="monotone" dataKey="price" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
              <section className="card p-6">
                <h2 className="text-lg font-semibold">일별 데이터 테이블</h2>
                <p className="mt-1 text-sm text-slate-600">실무에서 바로 내려받기 전 확인하기 좋은 형태</p>
                <div className="table-wrap mt-4">
                  <table>
                    <thead>
                      <tr><th>날짜</th><th>품목</th><th>품종</th><th>지역</th><th>가격</th></tr>
                    </thead>
                    <tbody>
                      {dailyRows.map((row, idx) => (
                        <tr key={`${row.regday}-${idx}`}>
                          <td>{row.regday}</td>
                          <td>{row.itemname || "-"}</td>
                          <td>{row.kindname || "-"}</td>
                          <td>{row.countyname || row.marketname || "-"}</td>
                          <td>{formatWon(row.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <section className="card p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">월별 조회 조건</h2>
                <p className="mt-1 text-sm text-slate-600">월별 도소매가격정보 API 중 도매 활용용 샘플</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">기준연도</label><input className="field" value={monthlyForm.yyyy} onChange={(e) => setMonthlyForm({ ...monthlyForm, yyyy: e.target.value })} /></div>
                  <div><label className="label">조회기간(년)</label><input className="field" value={monthlyForm.period} onChange={(e) => setMonthlyForm({ ...monthlyForm, period: e.target.value })} /></div>
                </div>
                <div>
                  <label className="label">지역코드</label>
                  <select className="select" value={monthlyForm.countyCode} onChange={(e) => setMonthlyForm({ ...monthlyForm, countyCode: e.target.value })}>
                    {REGION_OPTIONS.map((r) => <option key={r.label + r.value + "m"} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">부류코드</label><input className="field" value={monthlyForm.itemCategoryCode} onChange={(e) => setMonthlyForm({ ...monthlyForm, itemCategoryCode: e.target.value })} /></div>
                  <div><label className="label">품목코드</label><input className="field" value={monthlyForm.itemCode} onChange={(e) => setMonthlyForm({ ...monthlyForm, itemCode: e.target.value })} /></div>
                  <div><label className="label">품종코드</label><input className="field" value={monthlyForm.kindCode} onChange={(e) => setMonthlyForm({ ...monthlyForm, kindCode: e.target.value })} /></div>
                  <div><label className="label">등급값</label><input className="field" value={monthlyForm.gradeRank} onChange={(e) => setMonthlyForm({ ...monthlyForm, gradeRank: e.target.value })} /></div>
                </div>
                <div>
                  <label className="label">kg 환산 여부</label>
                  <select className="select" value={monthlyForm.convertKgYn} onChange={(e) => setMonthlyForm({ ...monthlyForm, convertKgYn: e.target.value })}>
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                  </select>
                </div>
                <button className="button" onClick={loadMonthly} disabled={loading}>{loading ? "로딩 중..." : <><Search size={16} className="mr-2 inline-block" />월별 시세 조회</>}</button>
              </div>
            </section>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <StatCard title="최근월 가격" value={monthlySummary ? formatWon(monthlySummary.latest) : "-"} />
                <StatCard title="월평균" value={monthlySummary ? formatWon(monthlySummary.avg) : "-"} />
                <StatCard title="최저월" value={monthlySummary ? formatWon(monthlySummary.min) : "-"} />
                <StatCard title="최고월" value={monthlySummary ? formatWon(monthlySummary.max) : "-"} />
              </div>
              <section className="card p-6">
                <h2 className="text-lg font-semibold">월별 가격 흐름</h2>
                <p className="mt-1 text-sm text-slate-600">1월부터 12월까지 월간 평균 가격</p>
                <div className="mt-4 h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyRows}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(v) => formatWon(typeof v === "number" ? v : null)} />
                      <Line type="monotone" dataKey="price" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
              <section className="card p-6">
                <h2 className="text-lg font-semibold">월별 데이터 테이블</h2>
                <p className="mt-1 text-sm text-slate-600">월별 요약값 확인</p>
                <div className="table-wrap mt-4">
                  <table>
                    <thead>
                      <tr><th>월</th><th>가격</th><th style={{textAlign: "left"}}>상태</th></tr>
                    </thead>
                    <tbody>
                      {monthlyRows.map((row, idx) => (
                        <tr key={`${row.month}-${idx}`}>
                          <td>{row.month}</td>
                          <td>{formatWon(row.price)}</td>
                          <td style={{textAlign: "left"}}><span className="badge">정상</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        )}

        <section className="card border-dashed p-6">
          <h2 className="text-lg font-semibold">실서비스 연결 메모</h2>
          <p className="mt-1 text-sm text-slate-600">브라우저 직접 호출이 막히지 않도록 내부 API Route로 KAMIS를 프록시합니다.</p>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <div>1. 프론트는 <code>/api/kamis</code>만 호출</div>
            <div>2. 서버 API Route가 KAMIS로 인증값 포함 요청 전송</div>
            <div>3. 서버가 응답 JSON을 프론트에 반환</div>
            <div>4. 인증키는 브라우저에 하드코딩하지 말고 환경변수로 관리</div>
          </div>
        </section>
      </div>
    </main>
  );
}
