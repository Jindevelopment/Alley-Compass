import { useId } from "react";

import { cn } from "@/lib/cn";

/* 점수(0~100)를 원형 게이지로. 색은 링이 아니라 가운데 숫자가 전달한다 —
 * 링이 안 보이는 환경(고대비 모드 등)에서도 정보가 남는다. */

export function ScoreRing({
  score,
  size = 60,
  stroke = 6,
  tone = "default",
  className,
}: {
  score: number;
  size?: number;
  stroke?: number;
  /** onBrand: 짙은 네이비 패널 위(로그인·상세 히어로) */
  tone?: "default" | "onBrand";
  className?: string;
}) {
  const gid = useId();
  const value = Math.max(0, Math.min(100, Math.round(score)));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const onBrand = tone === "onBrand";

  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        className="-rotate-90"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={onBrand ? "var(--brand-teal)" : "var(--highlight)"} />
            <stop offset="1" stopColor={onBrand ? "var(--brand-gold)" : "var(--accent)"} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className={onBrand ? "stroke-brand-fg/20" : "stroke-border"}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
        />
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center font-display font-bold tabular",
          onBrand ? "text-brand-fg" : "text-fg",
        )}
        style={{ fontSize: Math.round(size * 0.32) }}
      >
        {value}
      </span>
    </span>
  );
}
