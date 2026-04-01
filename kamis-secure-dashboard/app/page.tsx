'use client';

import React, { useState, useEffect } from "react";

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
  itemname: string;
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
          { regday: "03-24", price: 4500, itemname: selected.itemname },
          { regday: "03-25", price: 4700, itemname: selected.itemname },
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
        itemname: r.itemname,
      }));

      setRows(parsed);
    } finally {
      setLoading(false);
    }
  }

  /* ================= 초기 실행 ================= */

  useEffect(() => {
    loadProducts();
  }, []);

  /* ================= UI ================= */

  return (
    <div style={{ padding: 30 }}>
      <h1>수산물 시세 대시보드 (실제 API 연결)</h1>

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

      {/* 결과 */}
      {loading && <p>로딩중...</p>}

      <div style={{ marginTop: 20 }}>
        {rows.map((r, i) => (
          <div key={i}>
            {r.regday} | {r.price}원
          </div>
        ))}
      </div>
    </div>
  );
}
