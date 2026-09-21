import { cn } from "@/lib/cn";
import type { Tone } from "@/types/ui";

/* ──────────────────────────────────────────────────────────────
 * Meter — 0~100 값을 막대 하나로. 점수·지수·기여도에 전부 쓴다.
 *
 * <progress> 대신 div 로 그리는 이유: 브라우저마다 기본 스타일이 크게
 * 달라 색을 토큰으로 통제할 수 없다. 대신 role="meter" 와 aria 값을
 * 직접 붙여 스크린리더에는 동일하게 읽히게 한다.
 * ────────────────────────────────────────────────────────────── */

const FILL: Record<Tone, string> = {
  neutral: "bg-fg-subtle",
  accent: "bg-accent",
  positive: "bg-positive",
  caution: "bg-caution",
  negative: "bg-negative",
  nodata: "bg-nodata",
};

export interface MeterProps {
  /** 0~100 */
  value: number;
  tone?: Tone;
  /** 스크린리더용 설명 — "생존 안정성 82점" 처럼 단위까지 넣는다 */
  label: string;
  size?: "sm" | "md";
  className?: string;
}

export function Meter({ value, tone = "accent", label, size = "md", className }: MeterProps) {
  const width = Math.max(0, Math.min(100, value));

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "w-full overflow-hidden rounded-full bg-border-subtle",
        size === "sm" ? "h-1.5" : "h-2",
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-300", FILL[tone])}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

/* ── 기여도 막대 ────────────────────────────────────────────────
 * 중앙 0 을 기준으로 좌우로 뻗는다. 예측 요인처럼 부호가 있는 값 전용.
 * 한쪽으로만 자라는 Meter 로 그리면 "+3 과 -3 중 뭐가 큰가"가 안 보인다. */

export interface DivergingBarProps {
  /** -100 ~ 100. 부호가 방향을 정한다. */
  value: number;
  /** 이 그룹에서 가장 큰 절대값 — 막대 길이를 서로 비교 가능하게 만든다 */
  max: number;
  label: string;
  className?: string;
}

export function DivergingBar({ value, max, label, className }: DivergingBarProps) {
  const ratio = max === 0 ? 0 : Math.min(1, Math.abs(value) / max);
  const positive = value >= 0;

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuenow={Math.round(value * 10) / 10}
      aria-valuemin={-max}
      aria-valuemax={max}
      className={cn("relative h-1.5 w-full rounded-full bg-border-subtle", className)}
    >
      {/* 0 기준선 */}
      <span aria-hidden="true" className="absolute inset-y-[-2px] left-1/2 w-px bg-border-strong" />
      <div
        className={cn(
          "absolute top-0 h-full rounded-full transition-[width] duration-300",
          positive ? "left-1/2 bg-positive" : "right-1/2 bg-negative",
        )}
        style={{ width: `${ratio * 50}%` }}
      />
    </div>
  );
}
