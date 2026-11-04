// NODE 로고 배너: 90년대 포털 스타일. 흰 바탕, 파랑 글자, 주황 점.

/** 이름 그대로의 '노드': 대각선으로 이어진 네 개의 점이 N자를 그린다. 16px 픽셀 격자. */
function NodeMark() {
  return (
    <svg className="banner-mark" width="64" height="64" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden>
      <path fill="#ff6600" d="M4 3h7v1H4zM3 4h1v8H3zM4 12h8v1H4zM12 5h1v7h-1zM5 5h1v1H5zM6 6h1v1H6zM7 7h1v1H7zM8 8h1v1H8zM9 9h1v1H9zM10 10h1v1h-1z" />
      <path fill="#0000ff" d="M1 1h4v4H1zM11 1h4v4h-4zM1 11h4v4H1zM11 11h4v4h-4z" />
    </svg>
  );
}

export function Banner() {
  return (
    <header className="banner">
      <NodeMark />
      <div className="banner-titles">
        <h1 className="wordmark">
          NODE<span className="wordmark-dot">.</span>
        </h1>
        {/* 머리글자가 곧 NODE: 파랑으로 짚어 준다 */}
        <p className="banner-line" lang="en">
          <b>N</b>ational <b>O</b>rganization for <b>D</b>evelopment &amp; <b>E</b>mployment
        </p>
        <p className="banner-sub">국가개발고용기구 · 국가 고용 발전과 인재 개발을 총괄하는 기구</p>
      </div>
    </header>
  );
}
