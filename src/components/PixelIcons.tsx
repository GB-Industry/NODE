// 16×16 픽셀 격자 아이콘. 모든 아이콘은 같은 격자·같은 2색(먹 + 강조) 규칙을 따른다.

type IconProps = { className?: string };

const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  shapeRendering: "crispEdges" as const,
  "aria-hidden": true,
};

export function IconNewDoc({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path fill="#000" d="M3 1h7v1H3zM2 2h1v13H2zM3 14h10v1H3zM13 5h1v10h-1zM10 2h1v1h-1zM11 3h1v1h-1zM12 4h1v1h-1zM9 2h1v4h-1zM10 5h3v1h-3z" />
      <path fill="#fff" d="M3 2h6v12H3zM9 6h4v8H9z" />
      <path fill="#f00" d="M5 8h5v1H5zM5 10h5v1H5zM5 12h3v1H5z" />
    </svg>
  );
}

export function IconFloppy({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path fill="#000" d="M1 1h13v1H1zM1 2h1v13H1zM2 14h13v1H2zM14 2h1v1h-1zM15 3h1v12h-1z" />
      <path fill="#0000ff" d="M2 2h12v1h1v11H2z" />
      <path fill="#c0c0c0" d="M4 2h7v5H4z" />
      <path fill="#000" d="M9 3h1v3H9z" />
      <path fill="#fff" d="M4 9h8v5H4z" />
      <path fill="#000" d="M5 10h6v1H5zM5 12h4v1H5z" />
    </svg>
  );
}

export function IconLink({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path fill="#000" d="M2 6h5v1H2zM1 7h1v3H1zM2 10h5v1H2zM7 7h1v1H7zM7 9h1v1H7zM9 6h5v1H9zM14 7h1v3h-1zM9 10h5v1H9zM8 7h1v1H8zM8 9h1v1H8z" />
      <path fill="#00ffff" d="M2 7h5v3H2zM9 7h5v3H9z" />
      <path fill="#000" d="M5 8h6v1H5z" />
    </svg>
  );
}

export function IconOdds({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path fill="#000" d="M1 14h14v1H1zM1 1h1v13H1z" />
      <path fill="#ff0000" d="M3 11h2v3H3z" />
      <path fill="#ffff00" d="M6 8h2v6H6z" />
      <path fill="#00ff00" d="M9 5h2v9H9z" />
      <path fill="#0000ff" d="M12 2h2v12h-2z" />
    </svg>
  );
}

export function IconBullet({ className }: IconProps) {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden className={className}>
      <path fill="#ff0000" d="M1 0h2v1h1v1h1v1h1v2H5v1H4v1H3v1H1z" />
    </svg>
  );
}

export function IconInfo({ className }: IconProps) {
  return (
    <svg width="32" height="32" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden className={className}>
      <path fill="#000" d="M5 0h6v1H5zM3 1h2v1H3zM11 1h2v1h-2zM2 2h1v1H2zM13 2h1v1h-1zM1 3h1v2H1zM14 3h1v2h-1zM0 5h1v6H0zM15 5h1v6h-1zM1 11h1v2H1zM14 11h1v2h-1zM2 13h1v1H2zM13 13h1v1h-1zM3 14h2v1H3zM11 14h2v1h-2zM5 15h6v1H5z" />
      <path fill="#ffff00" d="M5 1h6v1h2v1h1v2h1v6h-1v2h-1v1h-2v1H5v-1H3v-1H2v-2H1V5h1V3h1V2h2z" />
      <path fill="#ff0000" d="M7 3h2v2H7zM7 6h2v7H7z" />
    </svg>
  );
}

/** 툴바 오른쪽의 NODE 지구본. 수신 중에는 궤도 위 위성이 돈다. */
export function Throbber({ busy }: { busy: boolean }) {
  return (
    <svg width="36" height="36" viewBox="0 0 18 18" shapeRendering="crispEdges" aria-hidden className={busy ? "throbber is-busy" : "throbber"}>
      <rect width="18" height="18" fill="#000" />
      <path fill="#0000ff" d="M6 3h6v1h2v2h1v6h-1v2h-2v1H6v-1H4v-2H3V6h1V4h2z" />
      <path fill="#00ff00" d="M6 5h3v1h1v2H8v2H6V8H5V6h1zM11 9h2v2h-1v1h-1z" />
      <path fill="#ffffff" d="M6 3h2v1H6zM4 4h2v1H4z" />
      <g className="throbber-orbit">
        <rect x="14" y="2" width="2" height="2" fill="#ffff00" />
      </g>
    </svg>
  );
}
