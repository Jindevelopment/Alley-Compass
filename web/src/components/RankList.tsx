import { AlertCircle, ChevronRight } from "lucide-react";

import { AXIS_SHORT } from "@/data/businessTypes";
import { cn } from "@/lib/cn";
import type { DistrictScore } from "@/types/api";
import { ScoreRing } from "@/components/ScoreRing";
import { Badge, Card } from "@/components/ui";

/* ──────────────────────────────────────────────────────────────
 * 상권 Ranking 목록 (F-06). backend POST /rank 결과를 그대로 그린다.
 *
 * 행에 붙는 요약은 근거 문장이 아니라 score_breakdown 중 가장 높은/낮은 축이다.
 * 근거 문장은 Claude 호출(과금)이라 목록에서 미리 만들 수 없다 — 상세를 열고
 * 사용자가 버튼을 눌러야 생성된다.
 *
 * 행 전체가 버튼이라 Tab 한 번에 하나씩 넘어가고 Enter 로 열린다.
 * ────────────────────────────────────────────────────────────── */

export interface RankListProps {
  ranking: readonly DistrictScore[];
  selectedCode: string | null;
  onSelect: (code: string) => void;
  loading?: boolean;
}

export function RankList({ ranking, selectedCode, onSelect, loading = false }: RankListProps) {
  if (!loading && ranking.length === 0) {
    return (
      <Card variant="nodata">
        <div className="flex items-start gap-2.5 px-4 py-5">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-fg-muted" />
          <div>
            <p className="text-md font-semibold text-fg">조건에 맞는 상권이 없어요</p>
            <p className="mt-1 text-sm text-fg-muted">
              업종이나 상권 성격을 바꿔서 다시 찾아보세요.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <ol
      className={`flex flex-col gap-3 transition-opacity duration-200 ${loading ? "opacity-50" : ""}`}
      aria-busy={loading}
    >
      {ranking.map((r) => (
        <li key={r.district_code}>
          <RankRow
            r={r}
            selected={selectedCode === r.district_code}
            onSelect={() => onSelect(r.district_code)}
          />
        </li>
      ))}
    </ol>
  );
}

type AxisKey = keyof typeof AXIS_SHORT;

/** 점수를 가장 많이 끌어올린 축과 가장 많이 끌어내린 축. 데이터 없는 축은 뺀다. */
function extremes(breakdown: DistrictScore["score_breakdown"]) {
  const entries = (Object.entries(breakdown) as [AxisKey, number | null][]).filter(
    (entry): entry is [AxisKey, number] => entry[1] !== null,
  );
  if (entries.length === 0) return { best: null, worst: null };

  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const best = sorted[0] ?? null;
  const worst = sorted.length > 1 ? (sorted[sorted.length - 1] ?? null) : null;
  return { best, worst };
}

function RankRow({
  r,
  selected,
  onSelect,
}: {
  r: DistrictScore;
  selected: boolean;
  onSelect: () => void;
}) {
  const score = Math.round(r.final_score);
  const { best, worst } = extremes(r.score_breakdown);
  const first = r.rank === 1;

  return (
    <Card
      as="button"
      interactive
      selected={selected}
      type="button"
      onClick={onSelect}
      aria-label={`${r.rank}위 ${r.district_name}, 생존 안정성 ${score}점. 상세 지표 열기`}
      className="group rounded-2xl px-4 py-4"
    >
      <div className="flex items-center gap-3.5">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold",
            first
              ? "bg-gradient-to-br from-brand-gold to-gold text-brand-abyss"
              : "bg-surface-sunken text-fg-body",
          )}
        >
          {r.rank}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold leading-snug tracking-[-0.01em] text-fg">
            {r.district_name}
          </p>
          {r.gu_name ? <p className="text-sm text-fg-muted">{r.gu_name}</p> : null}
        </div>

        <div className="flex shrink-0 flex-col items-center gap-0.5">
          <ScoreRing score={score} size={60} stroke={6} />
          <span className="text-2xs text-fg-muted">생존 안정성</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {best ? (
          <Badge tone="positive">
            {AXIS_SHORT[best[0]]} 상위 {Math.max(1, Math.round(100 - best[1]))}%
          </Badge>
        ) : null}
        {/* 가장 낮은 축도 50점이 넘으면 "약점"이 아니다 — 하위라고 쓰면 좋은 점수를 나쁘게 읽게 된다 */}
        {worst && worst[1] < 50 ? (
          <Badge tone="negative">
            {AXIS_SHORT[worst[0]]} 하위 {Math.max(1, Math.round(worst[1]))}%
          </Badge>
        ) : null}
        {!best ? <Badge tone="nodata">구성 지표 데이터 부족</Badge> : null}
        <span className="ml-auto inline-flex items-center gap-0.5 text-sm font-semibold text-accent-text">
          상세 보기
          <ChevronRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Card>
  );
}
