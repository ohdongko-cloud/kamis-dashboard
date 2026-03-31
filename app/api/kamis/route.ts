import { NextRequest, NextResponse } from "next/server";

function buildKamisUrl(searchParams: URLSearchParams) {
  const type = searchParams.get("type") || "daily";
  const action = type === "monthly" ? "monthlySalesList" : "periodWholesaleProductList";
  const certKey = searchParams.get("p_cert_key") || process.env.KAMIS_CERT_KEY || "";
  const certId = searchParams.get("p_cert_id") || process.env.KAMIS_CERT_ID || "";

  const params = new URLSearchParams({
    action,
    p_cert_key: certKey,
    p_cert_id: certId,
    p_returntype: "json",
  });

  searchParams.forEach((value, key) => {
    if (["type", "p_cert_key", "p_cert_id"].includes(key)) return;
    if (value !== "") params.set(key, value);
  });

  return `https://www.kamis.or.kr/service/price/xml.do?${params.toString()}`;
}

export async function GET(request: NextRequest) {
  try {
    const url = buildKamisUrl(request.nextUrl.searchParams);
    const response = await fetch(url, { cache: "no-store" });
    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json({ error: `KAMIS API 호출 실패: HTTP ${response.status}`, raw: text }, { status: response.status });
    }

    try {
      return NextResponse.json(JSON.parse(text));
    } catch {
      return NextResponse.json({ error: "KAMIS 응답을 JSON으로 파싱하지 못했습니다.", raw: text }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
