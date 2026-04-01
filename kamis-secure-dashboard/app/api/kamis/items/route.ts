import { NextRequest, NextResponse } from "next/server";

const KAMIS_BASE_URL = "https://www.kamis.or.kr/service/price/xml.do";

type KamisRow = {
  itemcategorycode?: string;
  itemcategoryname?: string;
  itemcode?: string;
  itemname?: string;
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

export async function GET(req: NextRequest) {
  try {
    const certId = process.env.KAMIS_CERT_ID;
    const certKey = process.env.KAMIS_CERT_KEY;

    if (!certId || !certKey) {
      return NextResponse.json(
        { error: "KAMIS 환경변수가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const categoryCode = req.nextUrl.searchParams.get("categoryCode");

    if (!categoryCode) {
      return NextResponse.json(
        { error: "categoryCode가 필요합니다." },
        { status: 400 }
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

    const filtered = rows.filter(
      (row) => String(row.itemcategorycode ?? "").trim() === String(categoryCode).trim()
    );

    const map = new Map<string, { itemcode: string; itemname: string }>();

    for (const row of filtered) {
      const itemcode = String(row.itemcode ?? "").trim();
      const itemname = String(row.itemname ?? "").trim();

      if (!itemcode || !itemname) continue;

      if (!map.has(itemcode)) {
        map.set(itemcode, { itemcode, itemname });
      }
    }

    const items = Array.from(map.values()).sort((a, b) =>
      a.itemcode.localeCompare(b.itemcode, "ko")
    );

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      categoryCode,
      count: items.length,
      items,
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
