import { cn } from "@/lib/cn";

/* 로고의 별·링을 얇은 선으로 키운 장식. 항상 짙은 네이비 패널 위에 놓는다.
 * 스크린리더에는 숨긴다(장식). */

export function CompassArt({ className }: { className?: string }) {
  const s = 300;
  const c = s / 2;
  const star = (k: number, rotate = 0) => {
    const d = c * 0.95 * k;
    const w = d * 0.09;
    return (
      <path
        d={`M${c} ${c - d}L${c + w} ${c - w} ${c + d} ${c} ${c + w} ${c + w} ${c} ${c + d} ${c - w} ${c + w} ${c - d} ${c} ${c - w} ${c - w}Z`}
        transform={`rotate(${rotate} ${c} ${c})`}
        fill="none"
        strokeLinejoin="round"
        className="stroke-brand-gold"
        strokeOpacity={rotate ? 0.25 : 0.38}
        strokeWidth={rotate ? 0.45 : 0.6}
      />
    );
  };

  return (
    <svg
      viewBox={`0 0 ${s} ${s}`}
      aria-hidden="true"
      className={cn("pointer-events-none select-none", className)}
    >
      {[0.35, 0.6, 0.85].map((k) => (
        <circle
          key={k}
          cx={c}
          cy={c}
          r={c * k}
          fill="none"
          strokeWidth="0.4"
          strokeOpacity="0.3"
          className="stroke-brand-teal"
        />
      ))}
      {star(1)}
      {star(0.62, 45)}
    </svg>
  );
}
