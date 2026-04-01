'use client';

import React, { useState, useMemo } from "react";

/* ================= 타입 ================= */

type DailyRow = {
  regday: string;
  price: number;
  itemname: string;
  kindname: string;
  countyname: string;
};

type MonthlyRow = {
  month: string;
  price: number;
};

/* ================= MOCK ================= */

const DAILY_MOCK: DailyRow[] = [
  { regday: "03-24", price: 4620, itemname: "오징어", kindname: "냉동", countyname: "서울" },
  { regday: "03-25", price: 4800, itemname: "오징어", kindname: "냉동", countyname: "서울" },
  { regday: "03-26", price: 4700, itemname: "오징어", kindname: "냉동", countyname: "서울" },
];

const MONTHLY_MOCK: MonthlyRow[] = [
  { month: "1월", price: 4200 },
  { month: "2월", price: 4400 },
  { month: "3월", price: 4700 },
];

/* ================= 유틸 ================= */

function cleanNumber(value: any) {
  const n = Number(String(value).replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

/* ================= 메인 ================= */

export default function Page() {
  const [dailyRows, setDailyRows] = useState<DailyRow[]>(DAILY_MOCK);
  const [monthlyRows, setMonthlyRows] = useState<MonthlyRow[]>(MONTHLY_MOCK);
  const [loading, setLoading] = useState(false);
  const [useMock, setUseMock] = useState(true);

  const [item, setItem] = useState("오징어");

  /* ================= API ================= */

  async function loadDaily() {
    setLoading(true);

    try {
      if (useMock) {
        setDailyRows(DAILY_MOCK);
        return;
      }

      const res = await fetch("/api/kamis");
      const json = await res.json();

      const data = (json?.data?.item ?? []).map((r: any) => ({
        regday: r.regday,
        price: cleanNumber(r.price),
        itemname: r.itemname,
        kindname: r.kindname,
        countyname: r.countyname,
      }));

      setDailyRows(data);
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

      const row = json?.data?.item?.[0] || {};

      const data = Array.from({ length: 12 }, (_, i) => ({
        month: `${i + 1}월`,
        price: cleanNumber(row[`m${i + 1}`]),
      }));

      setMonthlyRows(data);
    } finally {
      setLoading(false);
    }
  }

  /* ================= 분석 ================= */

  const avg = useMemo(() => {
    if (!dailyRows.length) return 0;
    return Math.round(dailyRows.reduce((a, b) => a + b.price, 0) / dailyRows.length);
  }, [dailyRows]);

  /* ================= UI ================= */

  return (
    <div style={{ padding: 30, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        수산물 시세 대시보드
      </h1>

      {/* 컨트롤 */}
      <div style={{ marginTop: 20 }}>
        <select value={item} onChange={(e) => setItem(e.target.value)}>
          <option>오징어</option>
          <option>낙지</option>
          <option>고등어</option>
        </select>

        <button onClick={loadDaily} style={btn}>일별 조회</button>
        <button onClick={loadMonthly} style={btn}>월별 조회</button>

        <button
          onClick={() => setUseMock(!useMock)}
          style={{ ...btn, background: useMock ? "green" : "red" }}
        >
          {useMock ? "Mock ON" : "Mock OFF"}
        </button>
      </div>

      {loading && <p>로딩중...</p>}

      {/* KPI */}
      <div style={{ marginTop: 20 }}>
        <b>평균 가격:</b> {avg}원
      </div>

      {/* 일별 */}
      <h2 style={{ marginTop: 30 }}>일별</h2>
      {dailyRows.map((d, i) => (
        <div key={i} style={row}>
          {d.regday} | {d.price}원 | {d.countyname}
        </div>
      ))}

      {/* 월별 */}
      <h2 style={{ marginTop: 30 }}>월별</h2>
      {monthlyRows.map((m, i) => (
        <div key={i} style={row}>
          {m.month} | {m.price}원
        </div>
      ))}
    </div>
  );
}

/* ================= 스타일 ================= */

const btn = {
  marginLeft: 10,
  padding: "8px 14px",
  background: "#111",
  color: "#fff",
  borderRadius: 6,
};

const row = {
  padding: 8,
  borderBottom: "1px solid #eee",
};
