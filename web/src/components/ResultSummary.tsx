import { AlertTriangle, Info, Loader2 } from "lucide-react";

import { fmt } from "@/lib/format";
import type { RankResponse } from "@/types/api";

/* 결과 머리말 — "지금 무엇을, 무슨 기준으로 본 결과인가".
 * 조건을 바꾸면 이 줄이 먼저 바뀌므로 재계산이 일어났다는 신호도 겸한다.
 *
 * 보증금 안내는 항상 붙는다: 임차료 데이터가 없어 예산이 순위 계산에 들어가지
 * 않는데, 조건 바에 예산이 있으면 사용자는 당연히 반영된다고 읽는다. */

export interface ResultSummaryProps {
  meta: RankResponse | null;
  loading: boolean;
  shown: number;
}

export function ResultSummary({ meta, loading, shown }: ResultSummaryProps) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h1 className="font-display text-2xl font-bold tracking-[-0.035em] text-fg sm:text-3xl">
          {meta ? meta.business_name : "조건에 맞는"} 추천 상권{" "}
          {meta ? <span className="text-highlight-text">{shown}곳</span> : null}
        </h1>
        {loading ? (
          <span
            role="status"
            className="inline-flex items-center gap-1.5 text-sm text-accent-text"
          >
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            다시 찾는 중
          </span>
        ) : null}
      </div>

      <p className="mt-1.5 text-sm text-fg-muted">
        {meta ? (
          <>
            서울 골목상권 <b className="font-semibold text-fg-body">{fmt(meta.n_candidates)}곳</b>{" "}
            중 상위 순 · 데이터 기준 {meta.as_of}
          </>
        ) : (
          "조건에 맞는 상권을 찾는 중…"
        )}
      </p>

      <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-caution-subtle px-4 py-3 text-caution-text">
        <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <p className="text-sm font-medium leading-relaxed">
          보증금 예산은 아직 순위에 반영되지 않아요. 임차료 자료가 준비되면 반영할게요.
        </p>
      </div>

      {meta?.warnings.length ? (
        <ul className="mt-2 flex flex-col gap-2">
          {meta.warnings.map((warning) => (
            <li
              key={warning}
              className="flex items-start gap-2.5 rounded-lg bg-caution-subtle px-3.5 py-3 text-sm leading-relaxed text-caution-text"
            >
              <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <span>{warning}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
