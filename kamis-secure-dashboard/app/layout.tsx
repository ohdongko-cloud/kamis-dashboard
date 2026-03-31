import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KAMIS 도매 시세 대시보드",
  description: "KAMIS Open API 기반 일별/월별 도매 시세 조회 대시보드",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
