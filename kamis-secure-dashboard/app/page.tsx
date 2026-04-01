'use client';

import React, { useState } from 'react';

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

const DAILY_MOCK: DailyRow[] = [
  {
    regday: "2026-03-24",
    price: 4620,
    itemname: "쌀",
    kindname: "일반계",
    countyname: "서울",
    marketname: "",
    yyyy: "2026",
  }
];

const MONTHLY_MOCK: MonthlyRow[] = [
  { month: "1월", price: 4350, yyyy: "2026", caption: "" }
];

export default function Page() {
  const [dailyRows] = useState<DailyRow[]>(DAILY_MOCK);
  const [monthlyRows] = useState<MonthlyRow[]>(MONTHLY_MOCK);

  return (
    <div style={{ padding: 20 }}>
      <h1>KAMIS Dashboard</h1>

      <h2>Daily</h2>
      {dailyRows.map((row, i) => (
        <div key={i}>
          {row.regday} - {row.price}
        </div>
      ))}

      <h2>Monthly</h2>
      {monthlyRows.map((row, i) => (
        <div key={i}>
          {row.month} - {row.price}
        </div>
      ))}
    </div>
  );
}
