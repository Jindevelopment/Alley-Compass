import { cn } from "@/lib/cn";

/* ──────────────────────────────────────────────────────────────
 * 골목 컴퍼스 로고 — 나침반 링(틸) + 별(골드) + A(네이비) + 화살표.
 *
 * 제공된 원본 로고를 단순화한 벡터다. 작은 크기(헤더 32px)에서도 읽히도록
 * 선 굵기와 세부를 줄였다. 원본 벡터(SVG)가 준비되면 이 파일만 교체한다.
 *
 * tone
 *   default  밝은/어두운 테마 위 — 색은 의미 토큰을 따라 테마와 함께 바뀐다
 *   onBrand  항상 짙은 네이비 패널 위 (로그인·로딩) — 테마와 무관하게 고정
 * ────────────────────────────────────────────────────────────── */

export function LogoMark({
  size = 34,
  tone = "default",
  className,
}: {
  size?: number;
  tone?: "default" | "onBrand";
  className?: string;
}) {
  const onBrand = tone === "onBrand";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <path
        d="M38.7 8.9A26 26 0 1 1 25.3 8.9"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        className={onBrand ? "stroke-brand-teal" : "stroke-highlight"}
      />
      <path
        d="M32 5.5L35.5 30.5 58 34 35.5 37.5 32 56 28.5 37.5 6 34 28.5 30.5Z"
        fill="none"
        strokeWidth="1.8"
        strokeLinejoin="round"
        className={onBrand ? "stroke-brand-gold" : "stroke-gold"}
      />
      <path
        d="M32 17L52 58H43.5L32 33.5 20.5 58H12Z"
        className={onBrand ? "fill-brand-fg" : "fill-accent"}
      />
      <path
        d="M21 50C31 50 37 44.5 46 34"
        fill="none"
        strokeWidth="4.5"
        strokeLinecap="round"
        className={onBrand ? "stroke-brand-teal" : "stroke-highlight"}
      />
      <path
        d="M42.5 30.5L53 27 50 38Z"
        className={onBrand ? "fill-brand-teal" : "fill-highlight"}
      />
    </svg>
  );
}

export function Wordmark({
  tone = "default",
  className,
}: {
  tone?: "default" | "onBrand";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-display font-bold tracking-[-0.01em]",
        tone === "onBrand" ? "text-brand-fg" : "text-fg",
        className,
      )}
    >
      골목 컴퍼스
    </span>
  );
}
