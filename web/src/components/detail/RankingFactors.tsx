import { AXIS_LABEL } from "@/data/businessTypes";
import type { ScoreBreakdown } from "@/types/api";
import { Meter } from "@/components/ui";

/* "왜 이 순위인가" — backend /rank 가 내려준 score_breakdown 을 그대로 그린다.
 *
 * 각 값은 서울 골목상권 분포 내 백분위(0~100)다. 데이터가 없어 랭킹에서
 * 제외된 축은 null 로 오는데, 0으로 그리면 "최하위"처럼 읽히므로 막대를
 * 그리지 않고 "데이터 부족"이라고 적는다. */

type AxisKey = keyof typeof AXIS_LABEL;

export function RankingFactors({ breakdown }: { breakdown: ScoreBreakdown }) {
  const entries = Object.entries(AXIS_LABEL) as [AxisKey, string][];

  return (
    <div className="flex flex-col gap-2.5">
      {entries.map(([key, label]) => {
        const value = breakdown[key];

        return (
          <div key={key} className="grid grid-cols-[minmax(0,1fr)_4rem] items-center gap-x-3 gap-y-2 sm:grid-cols-[11rem_minmax(0,1fr)_4rem]">
            <span className="col-span-2 text-xs text-fg-muted sm:col-span-1">{label}</span>

            {value === null || value === undefined ? (
              <>
                <span
                  aria-hidden="true"
                  className="h-1.5 rounded-full border border-dashed border-nodata-border"
                />
                <span className="text-right text-2xs text-fg-subtle">데이터 부족</span>
              </>
            ) : (
              <>
                <Meter value={value} tone="accent" label={`${label} 백분위 ${Math.round(value)}`} />
                <span className="text-right font-mono text-xs tabular-nums text-fg">
                  {Math.round(value)}
                </span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
