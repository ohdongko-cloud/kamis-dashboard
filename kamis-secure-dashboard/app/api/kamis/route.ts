import { NextRequest, NextResponse } from "next/server";

const KAMIS_BASE_URL = "https://www.kamis.or.kr/service/price/xml.do";

export async function GET(req: NextRequest) {
  try {
    const certId = process.env.KAMIS_CERT_ID;
    const certKey = process.env.KAMIS_CERT_KEY;

    if (!certId || !certKey) {
      return NextResponse.json(
        {
          error: "KAMIS 환경변수가 설정되지 않았습니다.",
          missing: {
            KAMIS_CERT_ID: !certId,
            KAMIS_CERT_KEY: !certKey,
          },
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const upstream = new URL(KAMIS_BASE_URL);

    // 프론트에서 넘어온 일반 파라미터 복사
    searchParams.forEach((value, key) => {
      if (value !== "") {
        upstream.searchParams.set(key, value);
      }
    });

    // 서버 환경변수로 인증값 강제 주입
    upstream.searchParams.set("p_cert_id", certId);
    upstream.searchParams.set("p_cert_key", certKey);

    // 기본 응답타입 보정
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

      return NextResponse.json(
        {
          ...json,
          _debug: {
            requestedUrl: upstream.toString().replace(certKey, "****"),
            usedEnvCertId: true,
            usedEnvCertKey: true,
            upstreamStatus: response.status,
          },
        },
        { status: response.status }
      );
    } catch {
      return NextResponse.json(
        {
          error: "KAMIS 응답을 JSON으로 파싱하지 못했습니다.",
          upstreamStatus: response.status,
          raw: text,
          requestedUrl: upstream.toString().replace(certKey, "****"),
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
