import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Do_Hyeon } from "next/font/google";
import "./globals.css";

const galmuri11 = localFont({
  src: [
    { path: "../fonts/Galmuri11.woff2", weight: "400" },
    { path: "../fonts/Galmuri11-Bold.woff2", weight: "700" },
  ],
  variable: "--font-chrome",
  display: "swap",
});

const galmuri14 = localFont({
  src: "../fonts/Galmuri14.woff2",
  variable: "--font-page",
  display: "swap",
});

// 굵은 한글 제목과 기관 관인 둘레 글씨
const seal = Do_Hyeon({
  weight: "400",
  subsets: ["latin"],
  preload: false,
  variable: "--font-seal",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "NODE 국가개발고용기구 · National Organization for Development & Employment",
  description:
    "은하간 실종천체 수색본부부터 인공지능 정서상담재단까지. 미래에 생길지도 모를 국가기관의 부서·직급·연봉을 무작위로 발령받아 보세요. 하루 5회 신청 가능.",
  keywords: ["NODE", "국가개발고용기구", "기관 이름 생성기", "미래 국가기관", "인사발령", "직업 뽑기", "연봉 뽑기"],
  openGraph: {
    title: "NODE 국가개발고용기구",
    description: "국가 고용 발전과 인재 개발을 총괄하는 NODE 국가개발고용기구. 오늘 당신은 어느 기관으로 발령될까요?",
    locale: "ko_KR",
    type: "website",
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#000080",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${galmuri11.variable} ${galmuri14.variable} ${seal.variable}`}>
      <body>{children}</body>
    </html>
  );
}
