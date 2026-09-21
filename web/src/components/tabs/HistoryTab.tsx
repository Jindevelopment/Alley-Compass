import { Clock } from "lucide-react";

import { AGE_LABEL, PRIORITY_LABEL } from "@/data/businessTypes";
import { ScoreRing } from "@/components/ScoreRing";
import { Badge, Button } from "@/components/ui";
import { fmt } from "@/lib/format";
import type { HistoryEntry } from "@/lib/historyStorage";

/* ──────────────────────────────────────────────────────────────
 * 기록 탭 — 내가 바꿔 본 조건과 그때의 1위 상권.
 *
 * 이 브라우저에 저장된 기록만 보여준다(historyStorage.ts). 그래서 화면에도
 * 그 사실을 밝힌다 — 다른 기기에서 열었을 때 기록이 없어도 오류가 아니다.
 * ────────────────────────────────────────────────────────────── */

const DATE = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export interface HistoryTabProps {
  entries: readonly HistoryEntry[];
  onOpen: (entry: HistoryEntry) => void;
  onClear: () => void;
  onGoRecommend: () => void;
}

export function HistoryTab({ entries, onOpen, onClear, onGoRecommend }: HistoryTabProps) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-fg">분석 기록</h1>
          <p className="mt-1.5 text-md text-fg-body">
            내가 찾아본 조건과 결과를 다시 볼 수 있어요.
          </p>
        </div>
        {entries.length > 0 ? (
          <Button variant="outline" size="sm" onClick={onClear}>
            기록 모두 지우기
          </Button>
        ) : null}
      </div>

      {entries.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-nodata-border bg-nodata-subtle px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-surface-sunken text-fg-muted">
            <Clock aria-hidden="true" className="size-7" />
          </span>
          <p className="mt-4 text-lg font-semibold text-fg">아직 기록이 없어요</p>
          <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-fg-muted">
            추천 탭에서 조건을 바꿔 보면 여기에 차곡차곡 쌓여요.
          </p>
          <Button variant="solid" size="md" className="mt-5" onClick={onGoRecommend}>
            추천 보러 가기
          </Button>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {entries.map((e) => (
            <li
              key={e.id}
              className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-border bg-surface p-5 shadow-xs"
            >
              <div className="min-w-0 flex-1 basis-64">
                <p className="text-sm text-fg-muted">{DATE.format(new Date(e.at))}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge tone="accent" size="md">
                    {e.businessName}
                  </Badge>
                  <span className="text-md font-medium text-fg">
                    {fmt(e.conditions.budget)}만원 이하 · {AGE_LABEL[e.conditions.age]} ·{" "}
                    {PRIORITY_LABEL[e.conditions.priority]}
                  </span>
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-3">
                {e.topScore !== null ? <ScoreRing score={e.topScore} size={48} stroke={5} /> : null}
                <div className="min-w-0">
                  <p className="text-xs text-fg-muted">1위 상권</p>
                  <p className="truncate text-md font-semibold text-fg">
                    {e.topName ?? "결과 없음"}
                  </p>
                </div>
              </div>

              <Button variant="outline" size="md" onClick={() => onOpen(e)}>
                다시 보기
              </Button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-5 text-center text-xs text-fg-muted">
        이 기록은 지금 쓰는 브라우저에만 저장돼요. 다른 기기에서는 보이지 않아요.
      </p>
    </div>
  );
}
