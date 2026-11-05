import { ImageResponse } from "next/og";
import { iconPath } from "@/components/AgencySeal";
import { appointmentFromCode, formatManwon, isValidCode } from "@/lib/draw";
import { SEAL_ICONS } from "@/lib/seal-icons";

// 공유 링크 미리보기 이미지(1200×630): 그 사람의 발령 통지서를 그대로 그린다.

const W = 1200;
const H = 630;

// 화면에 쓰는 글자만 담은 도현 글꼴 조각을 받아 온다(한글 전체 글꼴은 수 MB라 매번 읽기 무겁다).
async function loadFont(text: string) {
  const css = await (
    await fetch(`https://fonts.googleapis.com/css2?family=Do+Hyeon&text=${encodeURIComponent(text)}`)
  ).text();
  const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error("font url not found");
  return (await fetch(url)).arrayBuffer();
}

function dateLabel(d: string | null) {
  if (!d || !/^\d{8}$/.test(d)) return "";
  return `${d.slice(0, 4)}. ${Number(d.slice(4, 6))}. ${Number(d.slice(6, 8))}.`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const r = searchParams.get("r");
  const date = dateLabel(searchParams.get("d"));

  const a = isValidCode(r) ? appointmentFromCode(r) : null;
  const title = a ? a.agency : "오늘 당신은 어느 기관으로 발령될까요?";
  const rank = a ? (a.specialPost ?? a.rank) : "";
  const lines = {
    head: "인사발령 통지서",
    tier: a?.tier.label ?? "",
    title,
    dept: a?.department ?? "미래 국가기관 무작위 인사발령",
    rank,
    salary: a ? `연봉 ${formatManwon(a.salary)}` : "",
    special: a?.specialPost ? "특수보직 임용" : "",
    date: date ? `발령일자 ${date}` : "",
    foot: "NODE. National Organization for Development & Employment",
    en: a ? `· ${a.agencyEn} ·` : "",
    titlebar: "NODE 국가개발고용기구 - 발령 민원실",
  };
  const text = Array.from(new Set(Object.values(lines).join(""))).join("");

  let fonts: { name: string; data: ArrayBuffer; weight: 400; style: "normal" }[] = [];
  try {
    fonts = [{ name: "Do Hyeon", data: await loadFont(text), weight: 400, style: "normal" }];
  } catch {
    // 글꼴을 못 받아도 이미지는 만든다(한글은 대체 글꼴로).
  }

  const headBg = a?.tier.color ?? "#C0C0C0";
  const headInk = a?.tier.ink ?? "#000000";
  const ink = a?.tier.stamp ?? "#CC0000";

  return new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", background: "#008080", padding: 28, fontFamily: "Do Hyeon" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "#C0C0C0",
            padding: 5,
            borderTop: "3px solid #ffffff",
            borderLeft: "3px solid #ffffff",
            borderRight: "3px solid #000000",
            borderBottom: "3px solid #000000",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", height: 44, padding: "0 14px", background: "#000080", color: "#ffffff", fontSize: 26 }}>
            {lines.titlebar}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#ffffff", marginTop: 6, border: "2px solid #808080" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 28px",
                background: headBg,
                color: headInk,
                fontSize: 40,
              }}
            >
              <span>{lines.head}</span>
              {lines.tier && (
                <span style={{ display: "flex", padding: "4px 14px", background: "#ffffff", color: "#000000", border: "3px solid #000000", fontSize: 26 }}>
                  {lines.tier}
                </span>
              )}
            </div>
            <div style={{ flex: 1, display: "flex", padding: "26px 36px 20px" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "flex", fontSize: a ? 70 : 54, lineHeight: 1.1, color: "#000080" }}>{lines.title}</div>
                <div style={{ display: "flex", marginTop: 16, fontSize: 34, color: "#000000" }}>{lines.dept}</div>
                {rank && (
                  <div style={{ display: "flex", alignItems: "center", marginTop: 14, fontSize: 46 }}>
                    <span
                      style={
                        a?.specialPost
                          ? { display: "flex", padding: "2px 12px", background: "#000080", color: "#FF00FF" }
                          : { display: "flex", color: "#000000" }
                      }
                    >
                      {rank}
                    </span>
                    {lines.special && <span style={{ display: "flex", marginLeft: 16, fontSize: 28, color: "#000080" }}>{lines.special}</span>}
                  </div>
                )}
                {lines.salary && <div style={{ display: "flex", marginTop: 14, fontSize: 50, color: "#FF0000" }}>{lines.salary}</div>}
                {lines.date && <div style={{ display: "flex", marginTop: 14, fontSize: 24, color: "#666666" }}>{lines.date}</div>}
              </div>
              {a && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 300 }}>
                  <svg width="260" height="260" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r="61" fill="none" stroke={ink} strokeWidth="4" />
                    <circle cx="64" cy="64" r="56" fill="none" stroke={ink} strokeWidth="1" />
                    <circle cx="64" cy="64" r="38" fill="none" stroke={ink} strokeWidth="2" />
                    <path d={iconPath(SEAL_ICONS[a.agencyIcon])} fill={ink} transform="translate(40 40) scale(2)" />
                  </svg>
                  <div style={{ display: "flex", marginTop: 8, fontSize: 24, color: ink, letterSpacing: 2 }}>{lines.en}</div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", padding: "12px 28px", borderTop: "3px solid #FF6600", fontSize: 24, color: "#0000FF" }}>
              {lines.foot}
            </div>
          </div>
        </div>
      </div>
    ),
    { width: W, height: H, fonts },
  );
}
