import type { AgeTarget, Conditions, MarketCharacter, Priority } from "@/types/domain";

/* 업종 목록은 더 이상 상수로 두지 않는다 — backend GET /business-types 가 실제로
 * 수집된 업종만 돌려주고, App 이 그것으로 드롭다운을 채운다. (ETL 로 "커피-음료"
 * 하나만 수집돼 있으면 드롭다운도 하나뿐이다. 버그가 아니라 데이터가 그만큼이라는
 * 뜻이므로, 없는 업종을 목록에 지어 넣지 않는다.)
 *
 * 이 파일에는 업종에 묶이지 않은 화면 문구용 라벨과 기본 조건만 남긴다. */

export const AGE_OPTIONS: ReadonlyArray<{ value: AgeTarget; label: string }> = [
  { value: "20", label: "20대" },
  { value: "30", label: "30대" },
  { value: "both", label: "20–30대" },
];

export const CHARACTER_OPTIONS: ReadonlyArray<{ value: MarketCharacter; label: string }> = [
  { value: "foot", label: "유동인구" },
  { value: "resident", label: "주거 배후" },
  { value: "worker", label: "직장 배후" },
  { value: "campus", label: "대학가" },
];

export const PRIORITY_OPTIONS: ReadonlyArray<{ value: Priority; label: string }> = [
  { value: "survival", label: "생존 안정성" },
  { value: "cost", label: "예산 적합성" },
  { value: "growth", label: "성장 가능성" },
];

export const AGE_LABEL: Record<AgeTarget, string> = {
  "20": "20대",
  "30": "30대",
  both: "20–30대",
};

export const CHARACTER_LABEL: Record<MarketCharacter, string> = {
  foot: "유동인구 중심",
  resident: "주거 배후",
  worker: "직장 배후",
  campus: "대학가",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  survival: "생존 안정성",
  cost: "예산 적합성",
  growth: "성장 가능성",
};

/** 랭킹 점수를 구성하는 5개 축 — backend 가 score_breakdown 으로 내려주는 키 */
export const AXIS_LABEL = {
  demand: "수요 (유동·상주·직장인구)",
  competition: "경쟁 여유 (점포당 배후수요)",
  performance: "매출 추세",
  access: "교통·집객 접근성",
  stability: "폐업 추세 안정성",
} as const;

/* 1순위 페르소나 A씨의 최초 조건 (PRD §6).
 * biz 는 빈 값으로 시작해 업종 목록을 받은 뒤 첫 번째 실제 업종으로 채운다. */
export const INITIAL_CONDITIONS: Conditions = {
  biz: "",
  budget: 5000,
  age: "both",
  character: "foot",
  priority: "survival",
};

export const BUDGET_RANGE = { min: 1000, max: 15000, step: 500 } as const;

/** 목록 배지처럼 좁은 자리용 짧은 이름 */
export const AXIS_SHORT = {
  demand: "수요",
  competition: "경쟁 여유",
  performance: "매출 추세",
  access: "접근성",
  stability: "폐업 안정성",
} as const;
