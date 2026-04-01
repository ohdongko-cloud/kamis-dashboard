import { NextResponse } from "next/server";

const KAMIS_BASE_URL = "https://www.kamis.or.kr/service/price/xml.do";

type KamisRow = {
  itemcategorycode?: string;
  itemcategoryname?: string;
  itemcode?: string;
  itemname?: string;
  kindcode?: string;
  kindname?: string;
};

function normalizeRows(data: any): KamisRow[] {
  if (Array.isArray(data?.price)) return data.price;
  if (Array.isArray(data?.data?.item)) return data.data.item;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.item)) return data.item;
  if (Array.isArray(data?.condition)) return data.condition;
  if (Array.isArray(data?.data?.price)) return data.data.price;
  return [];
}

export async function GET() {
  try {
    const certId = process.env.KAMIS_CERT_ID;
    const certKey = process.env.KAMIS_CERT_KEY;

    if (!certId || !certKey) {
      return NextResponse.json(
        { error: "KAMIS 환경변수가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const upstream = new URL(KAMIS_BASE_URL);
    upstream.searchParams.set("action", "productInfo");
    upstream.searchParams.set("p_cert_id", certId);
    upstream.searchParams.set("p_cert_key", certKey);
    upstream.searchParams.set("p_returntype", "json");

    const response = await fetch(upstream.toString(), {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });

    const text = await response.text();
    const json = JSON.parse(text);
    const rows = normalizeRows(json);

    const map = new Map<string, { categoryCode: string; categoryName: string }>();

    for (const row of rows) {
      const categoryCode = String(row.itemcategorycode ?? "").trim();
      const categoryName = String(row.itemcategoryname ?? "").trim();

      if (!categoryCode || !categoryName) continue;

      if (!map.has(categoryCode)) {
        map.set(categoryCode, { categoryCode, categoryName });
      }
    }

    const categories = Array.from(map.values()).sort((a, b) =>
      a.categoryCode.localeCompare(b.categoryCode, "ko")
    );

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      count: categories.length,
      categories,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
