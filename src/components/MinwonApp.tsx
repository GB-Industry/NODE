"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { appointmentFromCode, formatManwon, newCode, type Appointment } from "@/lib/draw";
import { AGENCIES, DAILY_LIMIT, SPECIAL_POST_CHANCE, TIERS } from "@/lib/node-data";
import AgencySeal from "./AgencySeal";
import { Banner } from "./Banner";
import { IconBullet, IconFloppy, IconInfo, IconLink, IconNewDoc, IconOdds, Throbber } from "./PixelIcons";

type Phase = "idle" | "connecting" | "receiving" | "done";

type KakaoSdk = {
  isInitialized: () => boolean;
  init: (key: string) => void;
  Share: { sendDefault: (settings: Record<string, unknown>) => void };
};

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
const KAKAO_SDK = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";

let kakaoLoading: Promise<KakaoSdk> | null = null;

/** 공유 창을 처음 열 때만 카카오 SDK를 받아 온다. */
function loadKakao(): Promise<KakaoSdk> {
  if (!KAKAO_KEY) return Promise.reject(new Error("no kakao key"));
  if (!kakaoLoading) {
    kakaoLoading = new Promise((resolve, reject) => {
      const ready = () => {
        const k = window.Kakao;
        if (!k) return reject(new Error("kakao missing"));
        if (!k.isInitialized()) k.init(KAKAO_KEY);
        resolve(k);
      };
      if (window.Kakao) return ready();
      const el = document.createElement("script");
      el.src = KAKAO_SDK;
      el.async = true;
      el.crossOrigin = "anonymous";
      el.onload = ready;
      el.onerror = () => {
        kakaoLoading = null;
        reject(new Error("kakao load failed"));
      };
      document.head.appendChild(el);
    });
  }
  return kakaoLoading;
}

const STORAGE_KEY = "node.minwon.v1";
const ROW_COUNT = 8; // 발령 통지 표에서 차례로 수신되는 줄 수

function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function formatDate(d: Date) {
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}

/** 공유 링크의 발령일자(d=YYYYMMDD). 결과와 함께 날짜도 고정된다. */
function dateParam(d: Date) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function parseDateParam(v: string | null | undefined): Date | null {
  if (!v || !/^\d{8}$/.test(v)) return null;
  const d = new Date(Number(v.slice(0, 4)), Number(v.slice(4, 6)) - 1, Number(v.slice(6, 8)));
  return Number.isNaN(d.getTime()) ? null : d;
}

type Stored = { date: string; used: number; lastCode: string | null; lastDate?: string };

function readStored(): Stored {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Stored;
      if (parsed.date === todayKey()) return parsed;
      return { date: todayKey(), used: 0, lastCode: parsed.lastCode ?? null, lastDate: parsed.lastDate };
    }
  } catch {
    // 저장소를 쓸 수 없으면 이번 방문 동안만 센다.
  }
  return { date: todayKey(), used: 0, lastCode: null };
}

function writeStored(s: Stored) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // 무시
  }
}

/** 이 등급과 그보다 높은 등급을 합친 확률(%). 등급표 순서가 낮은 것부터 높은 것이다. */
function topShare(tierId: string) {
  const i = TIERS.findIndex((t) => t.id === tierId);
  return TIERS.slice(i).reduce((sum, t) => sum + t.weight, 0);
}

function untilMidnight(now: Date) {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  const s = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export default function MinwonApp({ sharedCode, sharedDate }: { sharedCode: string | null; sharedDate: string | null }) {
  const [phase, setPhase] = useState<Phase>(sharedCode ? "done" : "idle");
  const [appointment, setAppointment] = useState<Appointment | null>(() =>
    sharedCode ? appointmentFromCode(sharedCode) : null,
  );
  const [isShared, setIsShared] = useState(Boolean(sharedCode));
  const [rows, setRows] = useState(sharedCode ? ROW_COUNT : 0);
  const [progress, setProgress] = useState(0);
  const [stored, setStored] = useState<Stored>({ date: "", used: 0, lastCode: null });
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("완료");
  const [now, setNow] = useState<Date | null>(null);
  const [origin, setOrigin] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [stamped, setStamped] = useState(Boolean(sharedCode));
  const [shareOpen, setShareOpen] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [issuedOn, setIssuedOn] = useState<Date | null>(() => parseDateParam(sharedDate));
  const [live, setLive] = useState(false); // 이번 방문에서 직접 신청한 결과일 때만 수신·날인 동작을 재생한다

  const noticeRef = useRef<HTMLTableElement>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const sealRef = useRef<HTMLSpanElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const popupButtonRef = useRef<HTMLButtonElement>(null);
  const applyButtonRef = useRef<HTMLButtonElement>(null);
  const shareFirstRef = useRef<HTMLButtonElement>(null);
  const shareReturnRef = useRef<HTMLElement | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const s = readStored();
    setStored(s);
    setOrigin(window.location.origin);
    setNow(new Date());
    if (!sharedCode && s.lastCode) {
      setAppointment(appointmentFromCode(s.lastCode));
      setIssuedOn(parseDateParam(s.lastDate));
      setRows(ROW_COUNT);
      setStamped(true);
      setPhase("done");
    }
    setReady(true);
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [sharedCode]);

  // 자정이 지나면 횟수를 되돌린다.
  useEffect(() => {
    if (now && stored.date && stored.date !== todayKey(now)) {
      const reset = { ...stored, date: todayKey(now), used: 0 };
      setStored(reset);
      writeStored(reset);
    }
  }, [now, stored]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  useEffect(() => {
    if (popupOpen) popupButtonRef.current?.focus();
  }, [popupOpen]);

  const remaining = Math.max(0, DAILY_LIMIT - stored.used);
  const busy = phase === "connecting" || phase === "receiving";
  const exhausted = ready && remaining === 0;

  const shareUrl = appointment
    ? `${origin}/?r=${appointment.code}${issuedOn ? `&d=${dateParam(issuedOn)}` : ""}`
    : `${origin}/`;

  const apply = useCallback(() => {
    if (busy || remaining === 0) return;
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];

    const code = newCode();
    const next = appointmentFromCode(code);
    const today = new Date();
    const used = { date: todayKey(), used: stored.used + 1, lastCode: code, lastDate: dateParam(today) };
    setStored(used);
    writeStored(used);
    window.history.replaceState(null, "", "/");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connectMs = reduced ? 0 : 520;
    const rowMs = reduced ? 0 : 230;
    // 창 안의 페이지 영역이 수신 중인 줄(마지막엔 직인)을 따라 내려간다.
    const follow = (el: Element | null | undefined) =>
      window.setTimeout(() => {
        const vp = viewportRef.current;
        if (!el || !vp) return;
        const gap = el.getBoundingClientRect().bottom - vp.getBoundingClientRect().bottom + 16;
        if (gap > 0) vp.scrollBy({ top: gap });
      }, 0);

    setIsShared(false);
    setLive(true);
    setAppointment(next);
    setIssuedOn(today);
    setRows(0);
    setStamped(false);
    setProgress(0);
    setPhase("connecting");
    setStatus("node.local 민원 서버에 연결하는 중...");

    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

    at(connectMs, () => {
      setPhase("receiving");
    });
    for (let i = 1; i <= ROW_COUNT; i++) {
      at(connectMs + rowMs * i, () => {
        setRows(i);
        follow(rowRefs.current[i - 1]);
        const pct = Math.round((i / ROW_COUNT) * 100);
        setProgress(pct);
        setStatus(`발령 통지 문서 수신 중... (${pct}%)`);
      });
    }
    const end = connectMs + rowMs * ROW_COUNT + (reduced ? 0 : 260);
    at(end, () => {
      setStamped(true);
      setPhase("done");
      follow(sealRef.current?.closest("td"));
      setStatus(
        topShare(next.tier.id) <= 10
          ? `${next.tier.label} 기관 발령! 상위 ${topShare(next.tier.id)}%에 해당하는 발령입니다.`
          : "완료",
      );
      if (next.specialPost) setPopupOpen(true);
    });
  }, [busy, remaining, stored.used]);

  const saveImage = useCallback(async () => {
    if (!noticeRef.current || !appointment) return;
    setStatus("이미지로 저장하는 중...");
    try {
      const dataUrl = await toPng(noticeRef.current, { pixelRatio: 2, backgroundColor: "#ffffff" });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `NODE_발령통지_${appointment.code}.png`;
      a.click();
      setStatus("발령 통지서를 이미지로 저장했습니다.");
    } catch {
      setStatus("이미지를 만들지 못했습니다. 화면을 캡처해 공유해 주세요.");
    }
  }, [appointment]);

  const shareText = appointment
    ? `나는 ${appointment.agency} ${appointment.department} ${appointment.specialPost ?? appointment.rank}(으)로 발령받았습니다. 당신은 어느 기관으로?`
    : "";
  const ogImageUrl = appointment && origin ? `${shareUrl.replace(`${origin}/`, `${origin}/og`)}` : "";

  const openShare = useCallback(() => {
    if (!appointment) return;
    shareReturnRef.current = document.activeElement as HTMLElement | null;
    setShareOpen(true);
    loadKakao().catch(() => {});
  }, [appointment]);

  const closeShare = useCallback(() => {
    setShareOpen(false);
    shareReturnRef.current?.focus();
  }, []);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!shareOpen) return;
    shareFirstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeShare();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shareOpen, closeShare]);

  const openWindow = (url: string) => window.open(url, "_blank", "noopener,noreferrer,width=620,height=560");
  const enc = encodeURIComponent;

  const shareKakao = useCallback(async () => {
    if (!appointment) return;
    try {
      const kakao = await loadKakao();
      kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: `${appointment.agency} 발령 통지`,
          description: `${appointment.department} · ${appointment.specialPost ?? appointment.rank} · 연봉 ${formatManwon(appointment.salary)}`,
          imageUrl: ogImageUrl,
          imageWidth: 1200,
          imageHeight: 630,
          link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
        },
        buttons: [
          { title: "통지서 보기", link: { mobileWebUrl: shareUrl, webUrl: shareUrl } },
          { title: "나도 발령받기", link: { mobileWebUrl: origin, webUrl: origin } },
        ],
      });
      setStatus("카카오톡 공유 창을 열었습니다.");
    } catch {
      setStatus("카카오톡 공유를 불러오지 못했습니다. 링크 복사로 공유해 주세요.");
    }
  }, [appointment, ogImageUrl, origin, shareUrl]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setStatus("발령 통지 주소를 클립보드에 복사했습니다.");
    } catch {
      setStatus("복사하지 못했습니다. 주소창의 주소를 직접 복사해 주세요.");
    }
  }, [shareText, shareUrl]);

  /** 휴대폰 기본 공유 창: 통지서 이미지까지 함께 넘긴다(지원하지 않으면 링크만). */
  const shareNative = useCallback(async () => {
    if (!appointment) return;
    try {
      let files: File[] | undefined;
      if (noticeRef.current) {
        const dataUrl = await toPng(noticeRef.current, { pixelRatio: 2, backgroundColor: "#ffffff" });
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `NODE_발령통지_${appointment.code}.png`, { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) files = [file];
      }
      await navigator.share({ title: "NODE 인사발령 통지", text: shareText, url: shareUrl, ...(files ? { files } : {}) });
      setStatus("공유를 마쳤습니다.");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setStatus("공유하지 못했습니다. 링크 복사로 공유해 주세요.");
    }
  }, [appointment, shareText, shareUrl]);

  const tierStyle = useMemo(() => {
    if (!appointment || rows === 0) return undefined;
    return { background: appointment.tier.color, color: appointment.tier.ink };
  }, [appointment, rows]);

  const agencyCount = useMemo(
    () => Object.fromEntries(TIERS.map((t) => [t.id, AGENCIES.filter((a) => a.tier === t.id).length])),
    [],
  );

  const show = (i: number) => appointment !== null && rows >= i;
  const blank = <span className="blank">접수 대기</span>;

  return (
    <div className={`desktop${busy ? " is-busy" : ""}`}>
      <div className="window" aria-label="NODE 웹탐색기">
        <div className="titlebar">
          <span className="titlebar-text">NODE 국가개발고용기구 - 발령 민원실 - NODE 웹탐색기</span>
          <span className="titlebar-buttons" aria-hidden>
            <span className="tb-btn">
              <svg width="8" height="7" viewBox="0 0 8 7" shapeRendering="crispEdges">
                <path fill="#000" d="M1 5h6v2H1z" />
              </svg>
            </span>
            <span className="tb-btn">
              <svg width="9" height="9" viewBox="0 0 9 9" shapeRendering="crispEdges">
                <path fill="#000" d="M0 0h9v2H0zM0 2h1v7H0zM8 2h1v7H8zM1 8h7v1H1z" />
              </svg>
            </span>
            <span className="tb-btn">
              <svg width="8" height="7" viewBox="0 0 8 7" shapeRendering="crispEdges">
                <path fill="#000" d="M0 0h2v1h1v1h2V1h1V0h2v1H7v1H6v1H5v1h1v1h1v1h1v1H6V6H5V5H3v1H2v1H0V6h1V5h1V4h1V3H2V2H1V1H0z" />
              </svg>
            </span>
          </span>
        </div>

        <div className="menubar" aria-hidden>
          <span>
            <u>파</u>일(F)
          </span>
          <span>
            <u>편</u>집(E)
          </span>
          <span>
            <u>보</u>기(V)
          </span>
          <span>
            <u>즐</u>겨찾기(A)
          </span>
          <span>
            <u>도</u>구(T)
          </span>
          <span>
            <u>도</u>움말(H)
          </span>
        </div>

        <div className="toolbar">
          <div className="toolbar-buttons">
            <button type="button" className="tool" onClick={apply} disabled={busy || exhausted}>
              <IconNewDoc />
              <span>발령 신청</span>
            </button>
            <button type="button" className="tool" onClick={saveImage} disabled={!appointment || busy}>
              <IconFloppy />
              <span>이미지 저장</span>
            </button>
            <button type="button" className="tool" onClick={openShare} disabled={!appointment || busy}>
              <IconLink />
              <span>링크 공유</span>
            </button>
            <a className="tool" href="#odds">
              <IconOdds />
              <span>확률 공개</span>
            </a>
          </div>
          <Throbber busy={busy} />
        </div>

        <div className="addressbar">
          <label htmlFor="address">
            주소(<u>D</u>)
          </label>
          <input
            id="address"
            className="field"
            readOnly
            value={origin ? shareUrl : "http://"}
            onFocus={(e) => e.currentTarget.select()}
          />
        </div>

        <div ref={viewportRef} className="viewport" aria-busy={busy}>
          <div className="page">
            <Banner />

            <div className="marquee" aria-hidden>
              <div className="marquee-track">
                <span>
                  금일 민원실 정상 운영 중 | 발령은 무작위로 결정되며 이의신청은 받지 않습니다 | 1인 1일 {DAILY_LIMIT}회 신청 가능 | 특수보직 임용 시 별도 통보 | 본 기구 및 모든 소속 기관은 가상의 기관입니다 |&nbsp;
                </span>
                <span>
                  금일 민원실 정상 운영 중 | 발령은 무작위로 결정되며 이의신청은 받지 않습니다 | 1인 1일 {DAILY_LIMIT}회 신청 가능 | 특수보직 임용 시 별도 통보 | 본 기구 및 모든 소속 기관은 가상의 기관입니다 |&nbsp;
                </span>
              </div>
            </div>

            <div className="layout">
              <nav className="sidenav" aria-label="민원실 안내">
                <p className="sidenav-head">민원 메뉴</p>
                <ul>
                  <li>
                    <IconBullet />
                    <a href="#apply">발령 신청</a>
                  </li>
                  <li>
                    <IconBullet />
                    <a href="#odds">등급별 발령 확률</a>
                  </li>
                  <li>
                    <IconBullet />
                    <a href="#guide">민원 안내</a>
                  </li>
                </ul>
              </nav>

              <main className="content">
                <section id="apply" aria-labelledby="apply-title">
                  <h2 id="apply-title" className="section-title">
                    인사발령 통지
                  </h2>

                  {isShared && appointment && (
                    <p className="shared-note">
                      공유받은 발령 통지서를 열람하고 있습니다. 아래 단추로 본인의 발령을 신청할 수 있습니다.
                    </p>
                  )}

                  <div className="apply-row">
                    <button ref={applyButtonRef} type="button" className="big-button" onClick={apply} disabled={busy || exhausted}>
                      <IconNewDoc className="big-button-icon" />
                      {busy ? "심사중..." : exhausted ? "금일 업무 종료" : appointment && !isShared ? "다시 신청" : "발령 신청"}
                    </button>
                    <div className="stamps" aria-label={`금일 잔여 민원 ${remaining}회 / ${DAILY_LIMIT}회`}>
                      {Array.from({ length: DAILY_LIMIT }, (_, i) => (
                        <span key={i} className={`stamp${ready && i < remaining ? " is-left" : ""}`} aria-hidden />
                      ))}
                      <span className="stamps-label">
                        잔여 {ready ? remaining : "-"}/{DAILY_LIMIT}
                      </span>
                    </div>
                  </div>
                  {exhausted && now && (
                    <p className="closed-note" role="status">
                      금일 민원 접수가 마감되었습니다. 민원실은 자정에 다시 열립니다. (남은 시간 <span className="num">{untilMidnight(now)}</span>)
                    </p>
                  )}
                  <table ref={noticeRef} className="notice">
                    <thead>
                      <tr>
                        <th colSpan={2} className={`notice-head${tierStyle ? "" : " is-idle"}`} style={tierStyle}>
                          <span>인사발령 통지서</span>
                          <span className="notice-tier">
                            {appointment && rows > 0 ? appointment.tier.label : busy ? "심사중" : "접수대기"}
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr ref={(el) => { rowRefs.current[0] = el; }} className={live && show(1) ? "row-in" : undefined}>
                        <th scope="row">문서번호</th>
                        <td>{show(1) ? appointment!.docNumber : blank}</td>
                      </tr>
                      <tr ref={(el) => { rowRefs.current[1] = el; }} className={live && show(2) ? "row-in" : undefined}>
                        <th scope="row">발령일자</th>
                        <td>{show(2) ? (issuedOn ? formatDate(issuedOn) : "일자 미기재") : blank}</td>
                      </tr>
                      <tr ref={(el) => { rowRefs.current[2] = el; }} className={live && show(3) ? "row-in" : undefined}>
                        <th scope="row">소속기관</th>
                        <td className="cell-agency">{show(3) ? appointment!.agency : blank}</td>
                      </tr>
                      <tr ref={(el) => { rowRefs.current[3] = el; }} className={live && show(4) ? "row-in" : undefined}>
                        <th scope="row">부서</th>
                        <td>{show(4) ? appointment!.department : blank}</td>
                      </tr>
                      <tr ref={(el) => { rowRefs.current[4] = el; }} className={live && show(5) ? "row-in" : undefined}>
                        <th scope="row">직급</th>
                        <td className="cell-strong">
                          {show(5) ? (
                            appointment!.specialPost ? (
                              <>
                                <strong className="special">{appointment!.specialPost}</strong>{" "}
                                <span className="struck">{appointment!.rank}</span>
                              </>
                            ) : (
                              appointment!.rank
                            )
                          ) : (
                            blank
                          )}
                        </td>
                      </tr>
                      <tr ref={(el) => { rowRefs.current[5] = el; }} className={live && show(6) ? "row-in" : undefined}>
                        <th scope="row">연봉</th>
                        <td className="cell-money">{show(6) ? formatManwon(appointment!.salary) : blank}</td>
                      </tr>
                      <tr ref={(el) => { rowRefs.current[6] = el; }} className={live && show(7) ? "row-in" : undefined}>
                        <th scope="row">수당</th>
                        <td>
                          {show(7) ? (
                            <ul className="allowances">
                              {appointment!.allowances.map((a) => (
                                <li key={a.name}>
                                  {a.name} <span className="num">월 {a.monthly.toLocaleString("ko-KR")}만원</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            blank
                          )}
                        </td>
                      </tr>
                      <tr ref={(el) => { rowRefs.current[7] = el; }} className={live && show(8) ? "row-in" : undefined}>
                        <th scope="row">특수보직</th>
                        <td>
                          {show(8) ? (
                            appointment!.specialPost ? `임용 (확률 ${SPECIAL_POST_CHANCE}%)` : "해당 없음"
                          ) : (
                            blank
                          )}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={2} className="notice-foot">
                          <p>위 사람을 상기와 같이 발령함.</p>
                          <div className="seals">
                            {appointment && (
                              <AgencySeal
                                name={appointment.agency}
                                en={appointment.agencyEn}
                                icon={appointment.agencyIcon}
                                ink={appointment.tier.stamp}
                                className={`agency-seal${stamped ? " is-stamped" : ""}${live ? " is-live" : ""}`}
                              />
                            )}
                            <p className="signatory">
                              NODE 국가개발고용기구장
                              <span ref={sealRef} className={`seal${stamped && appointment ? " is-stamped" : ""}${live ? " is-live" : ""}`} aria-hidden>
                                기구
                                <br />
                                장인
                              </span>
                            </p>
                          </div>
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {appointment && phase === "done" && (
                    <p className="share-row">
                      <button type="button" className="link-button" onClick={saveImage}>
                        [발령 통지서 이미지로 저장]
                      </button>
                      <button type="button" className="link-button" onClick={openShare}>
                        [친구에게 발령 소식 알리기]
                      </button>
                    </p>
                  )}
                </section>

                <hr />

                <section id="odds" aria-labelledby="odds-title">
                  <h2 id="odds-title" className="section-title">
                    등급별 발령 확률 공개
                  </h2>
                  <table className="odds">
                    <caption>등급 명칭과 확률은 잠정치이며, 바뀌면 이 표에 바로 반영됩니다.</caption>
                    <thead>
                      <tr>
                        <th scope="col">등급</th>
                        <th scope="col">발령 확률</th>
                        <th scope="col">소속 기관 수</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TIERS.map((t) => (
                        <tr key={t.id}>
                          <th scope="row">
                            <span className="swatch" style={{ background: t.color }} aria-hidden />
                            {t.label}
                          </th>
                          <td className="num">{t.weight}%</td>
                          <td className="num">{agencyCount[t.id]}곳</td>
                        </tr>
                      ))}
                      <tr>
                        <th scope="row">
                          <span className="swatch swatch-special" aria-hidden />
                          특수보직
                        </th>
                        <td className="num">{SPECIAL_POST_CHANCE}%</td>
                        <td>등급과 별도 추첨</td>
                      </tr>
                    </tbody>
                  </table>
                </section>

                <hr />

                <section id="guide" aria-labelledby="guide-title">
                  <h2 id="guide-title" className="section-title">
                    민원 안내
                  </h2>
                  <ol className="guide">
                    <li>발령 신청은 1인 1일 {DAILY_LIMIT}회까지 가능하며, 매일 자정에 초기화됩니다.</li>
                    <li>소속 기관, 부서, 직급, 연봉은 전부 무작위로 결정되며 이의신청은 접수하지 않습니다.</li>
                    <li>특수보직은 등급과 관계없이 {SPECIAL_POST_CHANCE}% 확률로 임용되며, 임용 시 별도 통보됩니다.</li>
                    <li>NODE 및 모든 소속 기관은 실존하지 않는 가상의 기관이며, 실제 정부기관과 관계가 없습니다.</li>
                  </ol>
                </section>

                <footer className="footer">
                  <p>Copyright ⓒ 2026 NODE 국가개발고용기구. All rights reserved.</p>
                  <p>본 홈페이지는 800×600 해상도, NODE 웹탐색기 4.0 이상에 최적화되어 있습니다.</p>
                </footer>
              </main>
            </div>
          </div>
        </div>

        <div className="statusbar">
          <span className="status-cell status-main" role="status" aria-live="polite">
            {status}
          </span>
          <span className="status-cell status-progress" aria-hidden>
            <span className="progress">
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} className={`progress-block${busy && progress >= (i + 1) * 10 ? " is-on" : ""}`} />
              ))}
            </span>
          </span>
          <span className="status-cell">
            민원 {ready ? remaining : "-"}/{DAILY_LIMIT}
          </span>
          <span className="status-cell status-zone">인터넷</span>
        </div>
      </div>

      {popupOpen && appointment?.specialPost && (
        <div className="popup" role="alertdialog" aria-modal="false" aria-labelledby="popup-title" aria-describedby="popup-body">
          <div className="titlebar">
            <span id="popup-title" className="titlebar-text">
              NODE 알림
            </span>
          </div>
          <div className="popup-body">
            <IconInfo />
            <p id="popup-body">
              축하합니다!
              <br />
              귀하는 <strong>{appointment.agency}</strong>의
              <br />
              특수보직 <strong className="special">{appointment.specialPost}</strong>에 임용되었습니다.
            </p>
          </div>
          <div className="popup-actions">
            <button
              ref={popupButtonRef}
              type="button"
              className="big-button small"
              onClick={() => {
                setPopupOpen(false);
                applyButtonRef.current?.focus();
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {shareOpen && appointment && (
        <div className="popup share-popup" role="dialog" aria-modal="false" aria-labelledby="share-title">
          <div className="titlebar">
            <span id="share-title" className="titlebar-text">
              발령 소식 알리기
            </span>
            <button type="button" className="tb-btn tb-close" onClick={closeShare} aria-label="닫기">
              <svg width="8" height="7" viewBox="0 0 8 7" shapeRendering="crispEdges" aria-hidden>
                <path fill="#000" d="M0 0h2v1h1v1h2V1h1V0h2v1H7v1H6v1H5v1h1v1h1v1h1v1H6V6H5V5H3v1H2v1H0V6h1V5h1V4h1V3H2V2H1V1H0z" />
              </svg>
            </button>
          </div>
          <div className="share-body">
            <p className="share-lead">
              <strong>{appointment.agency}</strong> 발령 통지서를 어디로 보낼까요?
            </p>
            <div className="share-grid">
              {KAKAO_KEY && (
                <button ref={shareFirstRef} type="button" className="big-button small share-btn" onClick={shareKakao}>
                  카카오톡
                </button>
              )}
              <button
                ref={KAKAO_KEY ? undefined : shareFirstRef}
                type="button"
                className="big-button small share-btn"
                onClick={() => openWindow(`https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(shareUrl)}`)}
              >
                X (트위터)
              </button>
              <button
                type="button"
                className="big-button small share-btn"
                onClick={() => openWindow(`https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`)}
              >
                페이스북
              </button>
              <button
                type="button"
                className="big-button small share-btn"
                onClick={() => openWindow(`https://band.us/plugin/share?body=${enc(`${shareText}\n${shareUrl}`)}&route=${enc(origin)}`)}
              >
                네이버 밴드
              </button>
              <button type="button" className="big-button small share-btn" onClick={copyLink}>
                링크 복사
              </button>
              <button type="button" className="big-button small share-btn" onClick={saveImage}>
                이미지 저장
              </button>
              {canNativeShare && (
                <button type="button" className="big-button small share-btn share-wide" onClick={shareNative}>
                  다른 앱으로 보내기 (이미지 포함)
                </button>
              )}
            </div>
            <p className="share-note">인스타그램은 &lsquo;이미지 저장&rsquo; 후 스토리·게시물로 올려 주세요.</p>
          </div>
        </div>
      )}
    </div>
  );
}
