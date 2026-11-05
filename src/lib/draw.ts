import { AGENCIES, RANKS, SPECIAL_POSTS, SPECIAL_POST_CHANCE, TIERS, type Tier } from "./node-data";
import type { AgencyIcon } from "./seal-icons";

export type Allowance = { name: string; monthly: number /* 만원 */ };

export type Appointment = {
  code: string;
  docNumber: string;
  tier: Tier;
  agency: string;
  agencyIcon: AgencyIcon;
  agencyEn: string;
  department: string;
  rank: string;
  specialPost: string | null;
  salary: number; // 만원/년
  allowances: Allowance[];
};

// 결과는 시드 하나로 완전히 재현된다. 공유 링크는 이 시드(code)만 싣는다.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeighted<T extends { weight: number }>(items: T[], r: number): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let x = r * total;
  for (const item of items) {
    x -= item.weight;
    if (x < 0) return item;
  }
  return items[items.length - 1];
}

function pick<T>(items: T[], r: number): T {
  return items[Math.floor(r * items.length) % items.length];
}

export function newCode(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0].toString(36).padStart(7, "0");
}

export function isValidCode(code: string | undefined | null): code is string {
  if (!code || !/^[0-9a-z]{1,7}$/.test(code)) return false;
  return parseInt(code, 36) <= 0xffffffff;
}

export function appointmentFromCode(code: string): Appointment {
  const seed = parseInt(code, 36);
  const rand = mulberry32(seed);

  const tier = pickWeighted(TIERS, rand());
  const agency = pick(
    AGENCIES.filter((a) => a.tier === tier.id),
    rand(),
  );
  const department = pick(agency.departments, rand());
  const rank = pickWeighted(RANKS, rand());
  const isSpecial = rand() * 100 < SPECIAL_POST_CHANCE;
  const special = pick(SPECIAL_POSTS, rand());

  const swing = 0.92 + rand() * 0.16;
  let salary = rank.baseSalary * tier.salaryMultiplier * swing;
  if (isSpecial) salary *= 1.5;
  salary = Math.round(salary / 10) * 10;

  const allowanceCount = rand() < 0.45 ? 2 : 1;
  const pool = [...agency.allowances];
  const allowances: Allowance[] = [];
  for (let i = 0; i < allowanceCount && pool.length; i++) {
    const name = pool.splice(Math.floor(rand() * pool.length), 1)[0];
    const monthly = Math.max(1, Math.round((3 + rand() * 40) * tier.salaryMultiplier));
    allowances.push({ name, monthly });
  }
  if (isSpecial) {
    allowances.push({ name: special.allowance, monthly: Math.round(50 + rand() * 100) });
  }

  return {
    code,
    docNumber: `NODE-인사 제${String(seed % 100000).padStart(5, "0")}호`,
    tier,
    agency: agency.name,
    agencyIcon: agency.icon,
    agencyEn: agency.en,
    department,
    rank: rank.title,
    specialPost: isSpecial ? special.title : null,
    salary,
    allowances,
  };
}

export function formatManwon(manwon: number): string {
  const eok = Math.floor(manwon / 10000);
  const rest = manwon % 10000;
  if (eok && rest) return `${eok}억 ${rest.toLocaleString("ko-KR")}만원`;
  if (eok) return `${eok}억원`;
  return `${rest.toLocaleString("ko-KR")}만원`;
}
