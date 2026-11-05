// 사이트 주소: 직접 지정한 값 → Vercel이 넣어 주는 운영 주소 → 개발 주소 순으로 쓴다.
// 링크 미리보기 이미지(og:image)가 절대 주소여야 해서 배포 환경에서 localhost가 되면 안 된다.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
