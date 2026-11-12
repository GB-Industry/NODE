// GA4 이벤트 기록. 측정 ID(NEXT_PUBLIC_GA_ID)가 없거나 광고 차단기로 막히면 아무 일도 하지 않는다.

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

type Gtag = (command: "event", name: string, params?: Record<string, string | number | boolean>) => void;

export function track(name: string, params?: Record<string, string | number | boolean>) {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag === "function") gtag("event", name, params);
}
