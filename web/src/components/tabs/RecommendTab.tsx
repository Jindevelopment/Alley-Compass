import { useState } from "react";
import { List, Map } from "lucide-react";
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
 * 지도의 원을 눈으로 오가며 비교할 수 있다. 좁은 화면에서는 목록과 지도를 전환한다. */

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
  const [view, setView] = useState<"list" | "map">("list");
  return (
    <div className="flex flex-col gap-6">
      <ResultSummary meta={meta} loading={loading} shown={visible.length} />
      <ConditionBar
        conditions={conditions}
        bizOptions={bizOptions}
        busy={loading}
        onChange={onChange}
        onReset={onReset}
      />

      <div className="flex gap-2 rounded-lg bg-surface-sunken p-1 lg:hidden" role="group" aria-label="추천 결과 보기 방식">
        {([{ id: "list", label: "목록으로 보기", icon: List }, { id: "map", label: "지도로 보기", icon: Map }] as const).map(({ id, label, icon: Icon }) => (
          <Button key={id} variant={view === id ? "solid" : "ghost"} aria-pressed={view === id} className="flex-1" onClick={() => setView(id)}>
            <Icon aria-hidden="true" className="size-4" />{label}
          </Button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)]">
        <div className={`${view === "list" ? "flex" : "hidden"} min-w-0 flex-col gap-4 lg:flex`}>
          <p className="px-1 text-sm text-fg-muted">궁금한 상권을 누르면 상세 분석을 볼 수 있어요.</p>
          <RankList
            ranking={visible}
            selectedCode={selectedCode}
            onSelect={onSelect}
            loading={loading}
          />

          {!loading && total > initialVisible ? (
            <Button variant="outline" size="lg" className="w-full" onClick={onToggleMore}>
              {visibleCount < total ? `더보기 (${total - visibleCount}곳 더)` : "접기"}
            </Button>
          ) : null}
        </div>

        <div className={`${view === "map" ? "block" : "hidden"} lg:sticky lg:top-24 lg:block lg:h-[calc(100dvh-7.5rem)]`}>
          <RankMap ranking={visible} selectedCode={selectedCode} onSelect={onSelect} />
        </div>
      </div>
    </div>
  );
}
