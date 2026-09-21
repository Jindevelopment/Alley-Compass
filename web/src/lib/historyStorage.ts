import type { Conditions } from "@/types/domain";

/* ──────────────────────────────────────────────────────────────
 * 분석 기록 — 내가 바꿔 본 조건과 그때의 1위 상권.
 *
 * 서버가 search_sessions 에 기록을 남기지만 목록을 돌려주는 API 가 아직 없어서,
 * 화면에서는 이 브라우저에 저장한 것만 보여준다(다른 기기와 공유되지 않는다).
 * 서버 목록 API 가 생기면 이 파일만 fetch 로 바꾸면 된다.
 *
 * conditionsStorage.ts 와 같은 이유로 사용자별로 키를 나눈다. 저장하는 것은
 * 조건과 1위 상권 이름·점수뿐이다 — 개인정보처리방침의 "브라우저 저장" 범위 안이다.
 * ────────────────────────────────────────────────────────────── */

const KEY_PREFIX = "alleycompass:history:v1:";
const MAX_ENTRIES = 30;

export interface HistoryEntry {
  id: string;
  /** ISO 시각 */
  at: string;
  conditions: Conditions;
  businessName: string;
  topName: string | null;
  topScore: number | null;
}

function isEntry(v: unknown): v is HistoryEntry {
  if (!v || typeof v !== "object") return false;
  const e = v as Record<string, unknown>;
  const c = e.conditions as Record<string, unknown> | undefined;
  return (
    typeof e.id === "string" &&
    typeof e.at === "string" &&
    typeof e.businessName === "string" &&
    !!c &&
    typeof c.biz === "string" &&
    typeof c.budget === "number"
  );
}

export function loadHistory(userId: string): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + userId);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
  } catch {
    return [];
  }
}

/** 새 기록을 맨 앞에 넣고 돌려준다. 같은 조건이 직전에 이미 있으면 갱신만 한다. */
export function addHistory(userId: string, entry: HistoryEntry): HistoryEntry[] {
  const prev = loadHistory(userId);
  const same = (a: Conditions, b: Conditions) =>
    a.biz === b.biz &&
    a.budget === b.budget &&
    a.age === b.age &&
    a.character === b.character &&
    a.priority === b.priority;

  const head = prev[0];
  const rest = head && same(head.conditions, entry.conditions) ? prev.slice(1) : prev;
  const next = [entry, ...rest].slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(KEY_PREFIX + userId, JSON.stringify(next));
  } catch {
    // 저장이 막혀도 이번 세션에서는 메모리 state 로 보인다.
  }
  return next;
}

export function clearHistory(userId: string): void {
  try {
    localStorage.removeItem(KEY_PREFIX + userId);
  } catch {
    // 지울 수 없으면 그대로 둔다.
  }
}
