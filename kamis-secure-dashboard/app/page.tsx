'use client';

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ================= 타입 ================= */

type Product = {
  itemcategorycode: string;
  itemcode: string;
  kindcode: string;
  itemname: string;
  kindname: string;
};

type DailyRow = {
  regday: string;
  price: number;
};

/* ================= 유틸 ================= */

function cleanNumber(v: any) {
  const n = Number(String(v).replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

/* ================= 메인 ================= */

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [rows, setRows] = useState<DailyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [useMock, setUseMock] = useState(true);

  /* ================= 품목 불러오기 ================= */

  async function loadProducts() {
    const res = await fetch("/api/kamis?action=productInfo");
    const json = await res.json();

    const items = json?.price?.item ?? [];
    const arr = Array.isArray(items) ? items : [items];

    const parsed = arr.map((i: any) => ({
      itemcategorycode: i.itemcategorycode,
      itemcode: i.itemcode,
      kindcode: i.kindcode,
      itemname: i.itemname,
      kindname: i.kindname,
    }));

    setProducts(parsed.slice(0, 200));
  }

  /* ================= 시세 조회 ================= */

  async function loadPrice() {
    if (!selected) return;

    setLoading(true);

    try {
      if (useMock) {
        setRows([
          { regday: "03-24", price: 4500 },
          { regday: "03-25", price: 4700 },
          { regday: "03-26", price: 4800 },
        ]);
        return;
      }

      const query = new URLSearchParams({
        action: "periodWholesaleProductList",
        p_startday: "20240301",
        p_endday: "20240310",
        p_itemcategorycode: selected.itemcategorycode,
        p_itemcode: selected.itemcode,
        p_kindcode: selected.kindcode,
      });

      const res = await fetch(`/api/kamis?${query}`);
      const json = await res.json();

      const items = json?.price?.item ?? [];
      const arr = Array.isArray(items) ? items : [items];

      const parsed = arr.map((r: any) => ({
        regday: r.regday,
        price: cleanNumber(r.price),
      }));

      setRows(parsed);
    } finally {
      setLoading(false);
    }
  }

  /* ================= 지도용 MOCK ================= */

  const regionData = [
    { name: "서울", value: 4500 },
    { name: "부산", value: 4200 },
    { name: "경기", value: 4300 },
    { name: "전남", value: 4100 },
    { name: "경남", value: 4400 },
  ];

  /* ================= 초기 실행 ================= */

  useEffect(() => {
    loadProducts();
  }, []);

  /* ================= UI ================= */

  return (
    <div style={{ padding: 30, maxWidth: 1100, margin: "0 auto" }}>
      <h1>수산물 시세 대시보드 (완성판)</h1>

      {/* 품목 선택 */}
      <select
        onChange={(e) => {
          const p = products.find((x) => x.itemcode === e.target.value);
          setSelected(p || null);
        }}
      >
        <option>품목 선택</option>
        {products.map((p) => (
          <option key={p.itemcode} value={p.itemcode}>
            {p.itemname} ({p.kindname})
          </option>
        ))}
      </select>

      {/* 버튼 */}
      <div style={{ marginTop: 20 }}>
        <button onClick={loadPrice}>조회</button>

        <button onClick={() => setUseMock(!useMock)}>
          {useMock ? "Mock ON" : "Mock OFF"}
        </button>
      </div>

      {loading && <p>로딩중...</p>}

      {/* ================= 차트 ================= */}
      <div style={{ height: 300, marginTop: 40 }}>
        <h3>가격 추이</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows}>
            <XAxis dataKey="regday" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="price" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ================= 지도 ================= */}
      <div style={{ marginTop: 40 }}>
        <h3>지역별 가격</h3>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {regionData.map((r, i) => (
            <div
              key={i}
              style={{
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 8,
                width: 100,
                textAlign: "center",
                background: "#f9fafb",
              }}
            >
              <div>{r.name}</div>
              <div>{r.value}원</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
