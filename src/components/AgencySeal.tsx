// 기관 원형 관인. 바깥 고리 위쪽에 기관 이름, 아래쪽에 영어 문구, 가운데에 기관 그림.
// 잉크는 등급 색 한 가지. 화려함은 색이 아니라 세밀함(점묘 음영, 이중 고리, 점선 고리)으로 낸다.

import { SEAL_ICONS, type AgencyIcon } from "@/lib/seal-icons";

const GRID = 24;

function iconPath(rows: string[]) {
  let d = "";
  rows.forEach((row, y) => {
    let x = 0;
    while (x < GRID) {
      const inked = (cx: number) => row[cx] === "#" || (row[cx] === "+" && (cx + y) % 2 === 0);
      if (inked(x)) {
        let w = 1;
        while (x + w < GRID && inked(x + w)) w++;
        d += `M${x} ${y}h${w}v1h-${w}z`;
        x += w;
      } else {
        x++;
      }
    }
  });
  return d;
}

const SIZE = 128;
const C = SIZE / 2;
const NAME_R = 43; // 기관 이름 바닥선 반지름 (글자는 바깥쪽으로 선다)
const NAME_MAX = 184; // 아래쪽 영어 문구 자리를 남긴다
// 둘레 글씨는 도현. 픽셀 글꼴은 원을 따라 기울면 획이 뭉개져(통→동) 기울어도 또렷한 글꼴을 쓴다.
const NAME_SIZE = 14; // 기관 이름이 차지할 수 있는 최대 호 길이(px)
const ICON_SCALE = 2;
const EN_R = 52; // 영어 문구 바닥선 반지름 (글자는 안쪽으로 선다)
const EN_SIZE = 10;
const EN_MAX = 84; // 영어 문구가 차지할 수 있는 최대 호 길이(px)

export default function AgencySeal({
  name,
  en,
  icon,
  ink,
  className,
}: {
  name: string;
  en: string;
  icon: AgencyIcon;
  ink: string;
  className?: string;
}) {
  const nameId = `seal-name-${icon}`;
  // 이름: 아래에서 시작해 시계 방향 한 바퀴, 50% 지점이 꼭대기.
  const namePath = `M${C} ${C + NAME_R}A${NAME_R} ${NAME_R} 0 1 1 ${C} ${C - NAME_R}A${NAME_R} ${NAME_R} 0 1 1 ${C} ${C + NAME_R}`;
  // 긴 이름은 늘리지 않고 글자 크기를 줄여 정해진 둘레 안에 넣는다(한글 약 0.92em, 띄어쓰기 약 0.3em).
  const nameUnits = [...name].reduce((sum, ch) => sum + (ch === " " ? 0.3 : 0.92), 0);
  const nameSize = Math.min(NAME_SIZE, Math.floor((NAME_MAX / nameUnits) * 2) / 2);
  const enId = `seal-en-${icon}`;
  // 영어 문구: 꼭대기에서 시작해 반시계 방향 한 바퀴, 50% 지점이 바닥(글자가 똑바로 선다).
  const enPath = `M${C} ${C - EN_R}A${EN_R} ${EN_R} 0 1 0 ${C} ${C + EN_R}A${EN_R} ${EN_R} 0 1 0 ${C} ${C - EN_R}`;
  const enLabel = `· ${en} ·`;
  const enTooLong = enLabel.length * EN_SIZE * 0.62 > EN_MAX;
  const half = (GRID * ICON_SCALE) / 2;

  return (
    <svg className={className} width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
      <defs>
        <path id={nameId} d={namePath} />
        <path id={enId} d={enPath} />
      </defs>
      <circle cx={C} cy={C} r={C - 3} fill="none" stroke={ink} strokeWidth="4" />
      <circle cx={C} cy={C} r={C - 8} fill="none" stroke={ink} strokeWidth="1" />
      <circle cx={C} cy={C} r={38} fill="none" stroke={ink} strokeWidth="2" />
      <circle cx={C} cy={C} r={35} fill="none" stroke={ink} strokeWidth="2" strokeDasharray="2 3" />
      <text fill={ink} style={{ fontFamily: "var(--font-seal)", fontSize: nameSize }}>
        <textPath href={`#${nameId}`} startOffset="50%" textAnchor="middle">
          {name}
        </textPath>
      </text>
      <text fill={ink} style={{ fontFamily: "var(--font-seal)", fontSize: EN_SIZE, letterSpacing: 1 }}>
        <textPath
          href={`#${enId}`}
          startOffset="50%"
          textAnchor="middle"
          {...(enTooLong ? { textLength: EN_MAX, lengthAdjust: "spacingAndGlyphs" } : {})}
        >
          {enLabel}
        </textPath>
      </text>
      <path
        d={iconPath(SEAL_ICONS[icon])}
        fill={ink}
        shapeRendering="crispEdges"
        transform={`translate(${C - half} ${C - half}) scale(${ICON_SCALE})`}
      />
    </svg>
  );
}
