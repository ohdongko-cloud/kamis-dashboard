import { NextRequest, NextResponse } from "next/server";

const KAMIS_BASE_URL = "https://www.kamis.or.kr/service/price/xml.do";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const upstream = new URL(KAMIS_BASE_URL);

    searchParams.forEach((value, key) => {
      if (value !== "") upstream.searchParams.set(key, value);
    });

    if (!upstream.searchParams.get("p_returntype")) {
      upstream.searchParams.set("p_returntype", "json");
    }

    const response = await fetch(upstream.toString(), {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });

    const text = await response.text();

    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, { status: response.status });
    } catch {
      return NextResponse.json(
        {
          error: "KAMIS 응답을 JSON으로 파싱하지 못했습니다.",
          status: response.status,
          raw: text,
          requestedUrl: upstream.toString(),
        },
        { status: 502 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
