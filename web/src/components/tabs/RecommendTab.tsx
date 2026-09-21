import type { SelectOption } from "@/components/ui";
import { Button } from "@/components/ui";
import type { RankResponse } from "@/types/api";
import type { Conditions } from "@/types/domain";

import { ConditionBar } from "../ConditionBar";
import { RankList } from "../RankList";
import { RankMap } from "../RankMap";
import { ResultSummary } from "../ResultSummary";

/* 추천 탭 — 조건 바 아래를 "목록 + 지도"로 나눈다.
 * 넓은 화면에서는 왼쪽 목록을 스크롤해도 오른쪽 지도가 화면에 고정돼, 목록의 순위와
 * 지도의 원을 눈으로 오가며 비교할 수 있다. 좁은 화면에서는 지도가 위, 목록이 아래. */

export interface RecommendTabProps {
  conditions: Conditions;
  bizOptions: readonly SelectOption[];
  meta: RankResponse | null;
  loading: boolean;
  visible: RankResponse["results"];
  total: number;
  initialVisible: number;
  visibleCount: number;
  selectedCode: string | null;
  onSelect: (code: string) => void;
  onToggleMore: () => void;
  onChange: (patch: Partial<Conditions>) => void;
  onReset: () => void;
}

export function RecommendTab({
  conditions,
  bizOptions,
  meta,
  loading,
  visible,
  total,
  initialVisible,
  visibleCount,
  selectedCode,
  onSelect,
  onToggleMore,
  onChange,
  onReset,
}: RecommendTabProps) {
  return (
    <div className="flex flex-col gap-5">
      <ConditionBar
        conditions={conditions}
        bizOptions={bizOptions}
        busy={loading}
        onChange={onChange}
        onReset={onReset}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,31rem)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <ResultSummary meta={meta} loading={loading} shown={visible.length} />

          <RankList
            ranking={visible}
            selectedCode={selectedCode}
            onSelect={onSelect}
            loading={loading}
          />

          {!loading && total > initialVisible ? (
            <Button variant="outline" size="md" className="self-center" onClick={onToggleMore}>
              {visibleCount < total ? `더보기 (${total - visibleCount}곳 더)` : "접기"}
            </Button>
          ) : null}
        </div>

        <div className="order-first lg:sticky lg:top-24 lg:order-none lg:h-[calc(100dvh-7.5rem)]">
          <RankMap ranking={visible} selectedCode={selectedCode} onSelect={onSelect} />
        </div>
      </div>
    </div>
  );
}
