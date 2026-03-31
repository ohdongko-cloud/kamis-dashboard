# KAMIS 도매 시세 대시보드 (비밀번호 버전)

## 포함 기능
- 첫 화면 비밀번호 잠금
- 비밀번호 통과 후 상단 경고문 노출
- 일별 도매 시세 조회
- 월별 시세 조회
- Mock 데이터 미리보기
- Next.js API Route를 통한 KAMIS 서버 프록시 호출

## 현재 비밀번호
`kims6801!`

주의: 이 비밀번호 방식은 **간단한 화면 잠금**입니다. 브라우저에 코드가 포함되므로 정식 보안 인증 체계는 아닙니다. 민감한 데이터를 다루는 용도로는 적합하지 않습니다.

## 실행 방법
```bash
npm install
npm run dev
```

## 배포 방법 (Vercel)
1. GitHub에 업로드
2. Vercel에서 Import Project
3. 환경변수 설정
   - `KAMIS_CERT_KEY`
   - `KAMIS_CERT_ID`
4. Deploy

## 파일 구조
- `app/page.tsx` : 대시보드 UI 및 비밀번호 잠금
- `app/api/kamis/route.ts` : KAMIS API 프록시
- `.env.example` : 환경변수 예시

## 참고
실제 KAMIS 인증값이 없어도 Mock 모드로 먼저 화면을 볼 수 있습니다.
