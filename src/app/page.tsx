import type { Metadata } from "next";
import MinwonApp from "@/components/MinwonApp";
import { appointmentFromCode, isValidCode } from "@/lib/draw";

type Props = { searchParams: Promise<{ r?: string; d?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { r } = await searchParams;
  if (!isValidCode(r)) return {};
  const a = appointmentFromCode(r);
  const title = `${a.agency} ${a.department} ${a.specialPost ?? a.rank} 발령 · NODE`;
  const description = `${a.tier.label} 기관, 연봉 ${a.salary.toLocaleString("ko-KR")}만원. 나도 NODE 국가개발고용기구에서 발령받아 보기.`;
  return {
    title,
    description,
    openGraph: { title, description, locale: "ko_KR", type: "website" },
    robots: { index: false, follow: true },
    alternates: { canonical: "/" },
  };
}

export default async function Page({ searchParams }: Props) {
  const { r, d } = await searchParams;
  const valid = isValidCode(r);
  return <MinwonApp sharedCode={valid ? r : null} sharedDate={valid && d && /^\d{8}$/.test(d) ? d : null} />;
}
