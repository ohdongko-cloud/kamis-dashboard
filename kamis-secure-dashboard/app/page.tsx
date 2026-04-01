'use client';

import React, { useState } from "react";

/* ================= 타입 ================= */

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

/* ================= 유틸 ================= */

function cleanNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function normalizeDailyResponse(json: any): DailyRow[] {
  const items = json?.data?.item ?? json?.item ?? [];

  const arr = Array.isArray(items) ? items : [items];

  return arr.map((row: any) => ({
    regday: row.regday ?? "",
    price: cleanNumber(row.price),
    itemname: row.itemname ?? "",
    kindname: row.kindname ?? "",
    countyname: row.countyname ?? "",
    marketname: row.marketname ?? "",
    yyyy: row.yyyy ?? "",
  }));
}

function normalizeMonthlyResponse(json: any): MonthlyRow[] {
  const items = json?.data?.item ?? json?.item ?? [];
  const arr = Array.isArray(items) ? items : [items];

  return arr.flatMap((row: any) =>
    Array.from({ length: 12 }, (_, i) => ({
      month: `${i + 1}월`,
      price: cleanNumber(row[`m${i + 1}`]),
      yyyy: row.yyyy ?? "",
      caption: row.caption ?? "",
    }))
  );
}

/* ================= MOCK ================= */

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
  {
    regday: "2026-03-25",
    price: 4680,
    itemname: "쌀",
    kindname: "일반계",
    countyname: "서울",
    marketname: "",
    yyyy: "2026",
  },
];

const MONTHLY_MOCK: MonthlyRow[] = [
  { month: "1월", price: 4350, yyyy: "2026", caption: "" },
  { month: "2월", price: 4420, yyyy: "2026", caption: "" },
];

/* ================= 메인 ================= */

export default function Page() {
  const [dailyRows, setDailyRows] = useState<DailyRow[]>(DAILY_MOCK);
  const [monthlyRows, setMonthlyRows] = useState<MonthlyRow[]>(MONTHLY_MOCK);
  const [loading, setLoading] = useState(false);
  const [useMock, setUseMock] = useState(true);

  /* ================= API 호출 ================= */

  async function loadDaily() {
    setLoading(true);

    try {
      if (useMock) {
        setDailyRows(DAILY_MOCK);
        return;
      }

      const res = await fetch("/api/kamis");
      const json = await res.json();

      const normalized = normalizeDailyResponse(json);
      setDailyRows(normalized);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadMonthly() {
    setLoading(true);

    try {
      if (useMock) {
        setMonthlyRows(MONTHLY_MOCK);
        return;
      }

      const res = await fetch("/api/kamis");
      const json = await res.json();

      const normalized = normalizeMonthlyResponse(json);
      setMonthlyRows(normalized);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  return (
    <div style={{ padding: 30, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        KAMIS 수산물 시세 대시보드
      </h1>

      {/* 컨트롤 */}
      <div style={{ marginTop: 20 }}>
        <button onClick={loadDaily} style={btn}>
          일별 조회
        </button>

        <button onClick={loadMonthly} style={btn}>
          월별 조회
        </button>

        <button
          onClick={() => setUseMock(!useMock)}
          style={{ ...btn, background: useMock ? "#16a34a" : "#ef4444" }}
        >
          {useMock ? "Mock ON" : "Mock OFF"}
        </button>
      </div>

      {loading && <p style={{ marginTop: 20 }}>로딩중...</p>}

      {/* 일별 */}
      <div style={{ marginTop: 30 }}>
        <h2>일별 데이터</h2>
        {dailyRows.map((row, i) => (
          <div key={i} style={rowStyle}>
            {row.regday} | {row.itemname} | {row.price}원
          </div>
        ))}
      </div>

      {/* 월별 */}
      <div style={{ marginTop: 30 }}>
        <h2>월별 데이터</h2>
        {monthlyRows.map((row, i) => (
          <div key={i} style={rowStyle}>
            {row.month} | {row.price}원
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= 스타일 ================= */

const btn = {
  marginRight: 10,
  padding: "10px 16px",
  borderRadius: 8,
  background: "#111",
  color: "#fff",
  cursor: "pointer",
};

const rowStyle = {
  padding: 10,
  borderBottom: "1px solid #eee",
};
